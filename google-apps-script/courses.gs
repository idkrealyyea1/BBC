function getCourses() {
  var data = getSheetData(CONFIG.SHEETS.COURSES);
  return data
    .filter(function(row) { return row.Status !== 'Deleted'; })
    .map(function(row) {
      return {
        courseId: row.CourseID,
        courseName: row.CourseName,
        description: row.Description || '',
        level: row.Level || '',
        duration: row.Duration || '',
        category: row.Category || '',
        status: row.Status || 'Active'
      };
    });
}

function getCourse(courseId) {
  var course = findRowByValue(CONFIG.SHEETS.COURSES, 'CourseID', courseId);
  if (!course) return null;
  return {
    courseId: course.CourseID,
    courseName: course.CourseName,
    description: course.Description || '',
    level: course.Level || '',
    duration: course.Duration || '',
    category: course.Category || '',
    status: course.Status || 'Active'
  };
}

function addCourse(params) {
  var newId = generateId('CR', CONFIG.SHEETS.COURSES);
  var rowData = {
    CourseID: newId,
    CourseName: params.courseName || '',
    Description: params.description || '',
    Level: params.level || '',
    Duration: params.duration || '',
    Category: params.category || '',
    Status: params.status || 'Active'
  };

  addRow(CONFIG.SHEETS.COURSES, rowData);
  return { success: true, courseId: newId };
}

function updateCourse(params) {
  var sheet = getSheet(CONFIG.SHEETS.COURSES);
  var headers = getHeaders(CONFIG.SHEETS.COURSES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === params.courseId) {
      var updates = {};
      if (params.courseName) updates.CourseName = params.courseName;
      if (params.description !== undefined) updates.Description = params.description;
      if (params.level) updates.Level = params.level;
      if (params.duration) updates.Duration = params.duration;
      if (params.category) updates.Category = params.category;
      if (params.status) updates.Status = params.status;

      for (var key in updates) {
        var colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updates[key]);
        }
      }
      return { success: true };
    }
  }
  return { success: false, error: 'Course not found' };
}

function deleteCourse(courseId) {
  var sheet = getSheet(CONFIG.SHEETS.COURSES);
  var headers = getHeaders(CONFIG.SHEETS.COURSES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === courseId) {
      var statusIdx = headers.indexOf('Status');
      if (statusIdx !== -1) {
        sheet.getRange(i + 1, statusIdx + 1).setValue('Deleted');
      } else {
        sheet.deleteRow(i + 1);
      }
      return { success: true };
    }
  }
  return { success: false, error: 'Course not found' };
}
