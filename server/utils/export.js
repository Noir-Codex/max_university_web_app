const XLSX = require('xlsx');

/**
 * Экспорт данных в CSV формат
 * @param {Array} data - данные для экспорта
 * @param {Array} columns - массив колонок [{key, label}]
 * @returns {string} - CSV строка
 */
function exportToCSV(data, columns) {
  if (!data || data.length === 0) {
    return '';
  }

  // Создаем заголовки
  const headers = columns.map(col => col.label || col.key);
  const csvRows = [headers.join(',')];

  // Добавляем данные
  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col.key];
      // Экранируем значения с запятыми или кавычками
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Экспорт данных в XLSX формат
 * @param {Array} data - данные для экспорта
 * @param {Array} columns - массив колонок [{key, label}]
 * @param {string} sheetName - название листа
 * @returns {Buffer} - XLSX буфер
 */
function exportToXLSX(data, columns, sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    // Создаем пустой workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['Нет данных']]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  // Преобразуем данные в формат для XLSX
  const worksheetData = data.map(row => {
    const rowData = {};
    columns.forEach(col => {
      rowData[col.label || col.key] = row[col.key];
    });
    return rowData;
  });

  // Создаем workbook и worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(worksheetData);

  // Настраиваем ширину колонок
  const colWidths = columns.map(col => ({
    wch: Math.max(
      (col.label || col.key).length,
      ...data.map(row => String(row[col.key] || '').length)
    ) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Экспорт отчета о посещаемости
 * @param {Array} data - данные посещаемости
 * @param {string} format - формат (csv или xlsx)
 * @returns {Buffer|string} - файл в выбранном формате
 */
function exportAttendanceReport(data, format = 'xlsx') {
  const columns = [
    { key: 'student_name', label: 'ФИО студента' },
    { key: 'group_name', label: 'Группа' },
    { key: 'subject_name', label: 'Дисциплина' },
    { key: 'date', label: 'Дата' },
    { key: 'status', label: 'Статус' },
    { key: 'notes', label: 'Примечание' }
  ];

  if (format === 'csv') {
    return exportToCSV(data, columns);
  } else {
    return exportToXLSX(data, columns, 'Посещаемость');
  }
}

/**
 * Экспорт статистики посещаемости по группам
 * @param {Array} data - данные статистики
 * @param {string} format - формат (csv или xlsx)
 * @returns {Buffer|string} - файл в выбранном формате
 */
function exportAttendanceStats(data, format = 'xlsx') {
  const columns = [
    { key: 'group_name', label: 'Группа' },
    { key: 'total_students', label: 'Всего студентов' },
    { key: 'total_lessons', label: 'Всего занятий' },
    { key: 'present_count', label: 'Присутствовало' },
    { key: 'absent_count', label: 'Отсутствовало' },
    { key: 'attendance_rate', label: 'Процент посещаемости' }
  ];

  if (format === 'csv') {
    return exportToCSV(data, columns);
  } else {
    return exportToXLSX(data, columns, 'Статистика');
  }
}

/**
 * Экспорт расписания
 * @param {Array} data - данные расписания
 * @param {string} format - формат (csv или xlsx)
 * @returns {Buffer|string} - файл в выбранном формате
 */
function exportSchedule(data, format = 'xlsx') {
  const columns = [
    { key: 'day_name', label: 'День недели' },
    { key: 'time_start', label: 'Начало' },
    { key: 'time_end', label: 'Окончание' },
    { key: 'subject_name', label: 'Дисциплина' },
    { key: 'group_name', label: 'Группа' },
    { key: 'teacher_name', label: 'Преподаватель' },
    { key: 'room', label: 'Аудитория' },
    { key: 'lesson_type', label: 'Тип занятия' }
  ];

  if (format === 'csv') {
    return exportToCSV(data, columns);
  } else {
    return exportToXLSX(data, columns, 'Расписание');
  }
}

/**
 * Парсинг XLSX файла
 * @param {Buffer} buffer - содержимое файла
 * @returns {Array} - массив объектов с данными
 */
function parseXLSX(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Конвертируем в JSON
  const data = XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: null
  });
  
  return data;
}

/**
 * Парсинг CSV файла
 * @param {string} csvString - CSV строка
 * @returns {Array} - массив объектов с данными
 */
function parseCSV(csvString) {
  const lines = csvString.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    data.push(row);
  }

  return data;
}

module.exports = {
  exportToCSV,
  exportToXLSX,
  exportAttendanceReport,
  exportAttendanceStats,
  exportSchedule,
  parseXLSX,
  parseCSV
};