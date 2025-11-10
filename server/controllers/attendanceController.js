const Attendance = require('../models/Attendance');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Получить посещаемость
 * GET /api/attendance
 */
exports.getAttendance = asyncHandler(async (req, res) => {
  const { lesson_id, student_id, group_id, date_from, date_to, status } = req.query;
  
  const attendance = await Attendance.findAll({
    lesson_id,
    student_id,
    group_id,
    date_from,
    date_to,
    status
  });
  
  res.json(attendance);
});

/**
 * Получить посещаемость для конкретной пары
 * GET /api/attendance/lesson/:lessonId
 */
exports.getAttendanceByLesson = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const currentDate = date || new Date().toISOString().split('T')[0];
  
  const attendance = await Attendance.findByLesson(req.params.lessonId, currentDate);
  
  res.json(attendance);
});

/**
 * Сохранить посещаемость
 * POST /api/attendance
 */
exports.saveAttendance = asyncHandler(async (req, res) => {
  const { lesson_id, student_id, status, notes, date } = req.body;
  
  const currentDate = date || new Date().toISOString().split('T')[0];
  
  const attendance = await Attendance.create({
    lesson_id,
    student_id,
    status,
    notes,
    date: currentDate
  });
  
  console.log('✅ Created attendance:', attendance.id, 'Lesson:', lesson_id, 'Student:', student_id, 'Status:', status);
  
  res.status(201).json(attendance);
});

/**
 * Массовое сохранение посещаемости
 * POST /api/attendance/bulk
 */
exports.saveBulkAttendance = asyncHandler(async (req, res) => {
  const { lesson_id, attendance, date } = req.body;
  
  const currentDate = date || new Date().toISOString().split('T')[0];
  
  const results = await Attendance.bulkUpsert(lesson_id, currentDate, attendance);
  
  console.log('✅ Saved bulk attendance:', 'Lesson:', lesson_id, 'Date:', currentDate, 'Records:', results.length);
  
  res.json({
    success: true,
    message: 'Посещаемость успешно сохранена',
    count: results.length
  });
});

/**
 * Обновить запись о посещаемости
 * PUT /api/attendance/:id
 */
exports.updateAttendance = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    return res.status(404).json({
      error: 'AttendanceNotFound',
      message: 'Запись о посещаемости не найдена'
    });
  }
  
  const updated = await Attendance.update(req.params.id, { status, notes });
  
  res.json(updated);
});

/**
 * Удалить запись о посещаемости
 * DELETE /api/attendance/:id
 */
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    return res.status(404).json({
      error: 'AttendanceNotFound',
      message: 'Запись о посещаемости не найдена'
    });
  }
  
  await Attendance.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Запись о посещаемости удалена'
  });
});

/**
 * Получить статистику посещаемости студента
 * GET /api/attendance/stats/student/:studentId
 */
exports.getStudentStats = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  
  const stats = await Attendance.getStudentStats(req.params.studentId, {
    date_from,
    date_to
  });
  
  res.json(stats);
});

/**
 * Получить статистику посещаемости по группе
 * GET /api/attendance/stats/group/:groupId
 */
exports.getGroupStats = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  
  const stats = await Attendance.getGroupStats(req.params.groupId, {
    date_from,
    date_to
  });
  
  res.json(stats);
});

/**
 * Получить статистику посещаемости по дисциплине
 * GET /api/attendance/stats/subject/:subjectId
 */
exports.getSubjectStats = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  
  const stats = await Attendance.getSubjectStats(req.params.subjectId, {
    date_from,
    date_to
  });
  
  res.json(stats);
});

/**
 * Получить общую статистику посещаемости
 * GET /api/attendance/stats/overall
 */
exports.getOverallStats = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  
  const stats = await Attendance.getOverallStats({ date_from, date_to });
  
  res.json(stats);
});