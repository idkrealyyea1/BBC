function authLogin(username, password) {
  if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
    return jsonResponse({
      success: true,
      role: 'admin',
      name: 'Administrator',
      username: username
    });
  }

  var students = getSheetData(CONFIG.SHEETS.STUDENTS);
  var student = students.find(function(s) {
    return s.Username === username && s.Password === password;
  });

  if (student) {
    if (student.Status === 'Inactive') {
      return jsonResponse({ success: false, error: 'Account is inactive. Contact administration.' });
    }
    return jsonResponse({
      success: true,
      role: 'student',
      studentId: student.StudentID,
      name: student.FullName,
      username: student.Username,
      email: student.Email,
      phone: student.Phone,
      enrolledCourses: student.EnrolledCourses,
      progress: student.Progress,
      joinDate: student.JoinDate,
      status: student.Status
    });
  }

  return jsonResponse({ success: false, error: 'Invalid username or password' });
}
