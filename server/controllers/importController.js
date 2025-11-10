const multer = require('multer');
const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const Group = require('../models/Group');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { parseXLSX, parseCSV } = require('../utils/export');

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый формат файла. Используйте XLSX или CSV'));
    }
  }
}).single('file');

/**
 * Middleware для загрузки файла
 */
exports.uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        error: 'FileUploadError',
        message: 'Ошибка загрузки файла: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        error: 'FileUploadError',
        message: err.message
      });
    }
    next();
  });
};

/**
 * Валидировать данные расписания
 * POST /api/import/schedule/validate
 */
exports.validateSchedule = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'NoFile',
      message: 'Файл не был загружен'
    });
  }

  // Парсинг файла
  let data;
  if (req.file.mimetype === 'text/csv') {
    data = parseCSV(req.file.buffer.toString());
  } else {
    data = parseXLSX(req.file.buffer);
  }

  if (!data || data.length === 0) {
    return res.status(400).json({
      error: 'EmptyFile',
      message: 'Файл пуст или имеет неверный формат'
    });
  }

  const validation = {
    valid: true,
    totalRecords: data.length,
    newRecords: 0,
    updatedRecords: 0,
    errors: [],
    warnings: []
  };

  // Валидация каждой записи
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // +2 потому что строка 1 - заголовки, индекс с 0

    // Проверка обязательных полей
    if (!row.subject_name || !row.group_name || !row.teacher_name) {
      validation.errors.push({
        row: rowNum,
        message: 'Отсутствуют обязательные поля (дисциплина, группа, преподаватель)',
        type: 'required_fields'
      });
      validation.valid = false;
      continue;
    }

    if (!row.day_of_week || !row.time_start || !row.time_end) {
      validation.errors.push({
        row: rowNum,
        message: 'Отсутствуют данные о времени или дне недели',
        type: 'required_fields'
      });
      validation.valid = false;
      continue;
    }

    // Предупреждения
    if (!row.room) {
      validation.warnings.push({
        row: rowNum,
        message: 'Не указана аудитория',
        type: 'missing_room'
      });
    }

    if (!row.lesson_type) {
      validation.warnings.push({
        row: rowNum,
        message: 'Не указан тип занятия, будет установлен по умолчанию "lecture"',
        type: 'missing_type'
      });
    }

    validation.newRecords++;
  }

  res.json(validation);
});

/**
 * Импортировать расписание
 * POST /api/import/schedule
 */
exports.importSchedule = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'NoFile',
      message: 'Файл не был загружен'
    });
  }

  // Парсинг файла
  let data;
  if (req.file.mimetype === 'text/csv') {
    data = parseCSV(req.file.buffer.toString());
  } else {
    data = parseXLSX(req.file.buffer);
  }

  if (!data || data.length === 0) {
    return res.status(400).json({
      error: 'EmptyFile',
      message: 'Файл пуст или имеет неверный формат'
    });
  }

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  // Кэш для поиска сущностей
  const subjectsCache = {};
  const groupsCache = {};
  const teachersCache = {};

  // Импорт каждой записи
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2;

    try {
      // Поиск или создание дисциплины
      let subject = subjectsCache[row.subject_name];
      if (!subject) {
        const subjects = await Subject.findAll({ search: row.subject_name });
        subject = subjects.find(s => s.name === row.subject_name);
        
        if (!subject) {
          subject = await Subject.create({
            name: row.subject_name,
            type: row.subject_type || 'Лекция',
            hours: row.hours || 40
          });
        }
        subjectsCache[row.subject_name] = subject;
      }

      // Поиск группы
      let group = groupsCache[row.group_name];
      if (!group) {
        const groups = await Group.findAll({ search: row.group_name });
        group = groups.find(g => g.name === row.group_name);
        
        if (!group) {
          results.errors.push({
            row: rowNum,
            message: `Группа "${row.group_name}" не найдена`
          });
          results.failed++;
          continue;
        }
        groupsCache[row.group_name] = group;
      }

      // Поиск преподавателя
      let teacher = teachersCache[row.teacher_name];
      if (!teacher) {
        const teachers = await User.findAll({ role: 'teacher', search: row.teacher_name });
        teacher = teachers.find(t => 
          `${t.first_name} ${t.last_name}` === row.teacher_name ||
          `${t.last_name} ${t.first_name}` === row.teacher_name
        );
        
        if (!teacher) {
          results.errors.push({
            row: rowNum,
            message: `Преподаватель "${row.teacher_name}" не найден`
          });
          results.failed++;
          continue;
        }
        teachersCache[row.teacher_name] = teacher;
      }

      // Проверка конфликтов
      const conflicts = await Schedule.checkConflicts({
        teacher_id: teacher.id,
        group_id: group.id,
        day_of_week: parseInt(row.day_of_week),
        time_start: row.time_start,
        time_end: row.time_end,
        room: row.room
      });

      if (conflicts.length > 0) {
        results.errors.push({
          row: rowNum,
          message: `Конфликт расписания: ${conflicts[0].conflict_type}`,
          conflicts: conflicts
        });
        results.failed++;
        continue;
      }

      // Создание пары
      await Schedule.create({
        subject_id: subject.id,
        group_id: group.id,
        teacher_id: teacher.id,
        day_of_week: parseInt(row.day_of_week),
        time_start: row.time_start,
        time_end: row.time_end,
        room: row.room || null,
        week_number: parseInt(row.week_number) || 1,
        lesson_type: row.lesson_type || 'lecture'
      });

      results.success++;
    } catch (error) {
      results.errors.push({
        row: rowNum,
        message: error.message
      });
      results.failed++;
    }
  }

  res.json({
    success: results.success > 0,
    imported: results.success,
    failed: results.failed,
    total: data.length,
    errors: results.errors,
    message: `Успешно импортировано: ${results.success}, Ошибок: ${results.failed}`
  });
});

module.exports = exports;