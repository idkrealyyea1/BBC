function getStudents() {
  var data = getSheetData(CONFIG.SHEETS.STUDENTS);
  return data.map(function(row) {
    return {
      studentId: row.StudentID,
      fullName: row.FullName,
      username: row.Username,
      email: row.Email || '',
      phone: row.Phone || '',
      enrolledCourses: row.EnrolledCourses || '',
      progress: row.Progress || '',
      joinDate: row.JoinDate || '',
      status: row.Status || 'Active'
    };
  });
}

function getStudent(studentId) {
  var student = findRowByValue(CONFIG.SHEETS.STUDENTS, 'StudentID', studentId);
  if (!student) return null;
  return {
    studentId: student.StudentID,
    fullName: student.FullName,
    username: student.Username,
    email: student.Email || '',
    phone: student.Phone || '',
    enrolledCourses: student.EnrolledCourses || '',
    progress: student.Progress || '',
    joinDate: student.JoinDate || '',
    status: student.Status || 'Active'
  };
}

function addStudent(params) {
  var newId = generateId('STU', CONFIG.SHEETS.STUDENTS);
  var rowData = {
    StudentID: newId,
    FullName: params.fullName || '',
    Username: params.username || '',
    Password: params.password || '',
    Email: params.email || '',
    Phone: params.phone || '',
    EnrolledCourses: params.enrolledCourses || '',
    Progress: params.progress || '',
    JoinDate: params.joinDate || new Date().toISOString().split('T')[0],
    Status: params.status || 'Active'
  };

  var existing = findRowByValue(CONFIG.SHEETS.STUDENTS, 'Username', params.username);
  if (existing) {
    return { success: false, error: 'Username already exists' };
  }

  addRow(CONFIG.SHEETS.STUDENTS, rowData);
  return { success: true, studentId: newId };
}

function updateStudent(params) {
  var updates = {};
  if (params.fullName) updates.FullName = params.fullName;
  if (params.username) updates.Username = params.username;
  if (params.password) updates.Password = params.password;
  if (params.email) updates.Email = params.email;
  if (params.phone) updates.Phone = params.phone;
  if (params.enrolledCourses !== undefined) updates.EnrolledCourses = params.enrolledCourses;
  if (params.progress !== undefined) updates.Progress = params.progress;
  if (params.status) updates.Status = params.status;

  var result = updateRowByStudentId(CONFIG.SHEETS.STUDENTS, params.studentId, updates);
  return { success: result };
}

function deleteStudent(studentId) {
  var result = deleteRowByValue(CONFIG.SHEETS.STUDENTS, 'StudentID', studentId);
  return { success: result };
}

function updateProgress(studentId, courseId, percentage) {
  var student = findRowByValue(CONFIG.SHEETS.STUDENTS, 'StudentID', studentId);
  if (!student) return { success: false, error: 'Student not found' };

  var progressStr = student.Progress || '';
  var progressMap = {};

  if (progressStr) {
    progressStr.split(',').forEach(function(pair) {
      var parts = pair.split(':');
      if (parts.length === 2) {
        progressMap[parts[0].trim()] = parts[1].trim();
      }
    });
  }

  progressMap[courseId] = percentage + '%';

  var newProgress = Object.keys(progressMap).map(function(key) {
    return key + ':' + progressMap[key];
  }).join(',');

  updateRowByStudentId(CONFIG.SHEETS.STUDENTS, studentId, { Progress: newProgress });
  return { success: true };
}
