var CONFIG = {
  SHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'admin123',
  ADMISSIONS_EMAIL: 'admissions@bbcenglishacademy.com',
  SHEETS: {
    STUDENTS: 'Students',
    COURSES: 'Courses',
    MATERIALS: 'CourseMaterials',
    APPLICATIONS: 'Applications'
  }
};

function getSheet(name) {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  return ss.getSheetByName(name);
}

function getSheetData(name) {
  var sheet = getSheet(name);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row, idx) {
    var obj = { _row: idx + 2 };
    headers.forEach(function(h, i) {
      obj[h] = row[i];
    });
    return obj;
  });
}

function getHeaders(name) {
  var sheet = getSheet(name);
  var data = sheet.getDataRange().getValues();
  return data.length > 0 ? data[0] : [];
}

function findRowByValue(sheetName, colName, value) {
  var data = getSheetData(sheetName);
  return data.find(function(row) {
    return row[colName] && row[colName].toString().toLowerCase() === value.toString().toLowerCase();
  });
}

function findRowsByValue(sheetName, colName, value) {
  var data = getSheetData(sheetName);
  return data.filter(function(row) {
    return row[colName] && row[colName].toString().toLowerCase() === value.toString().toLowerCase();
  });
}

function updateRowByStudentId(sheetName, studentId, updates) {
  var sheet = getSheet(sheetName);
  var headers = getHeaders(sheetName);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === studentId) {
      for (var key in updates) {
        var colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updates[key]);
        }
      }
      return true;
    }
  }
  return false;
}

function deleteRowByValue(sheetName, colName, value) {
  var sheet = getSheet(sheetName);
  var headers = getHeaders(sheetName);
  var colIdx = headers.indexOf(colName);
  if (colIdx === -1) return false;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][colIdx].toString().toLowerCase() === value.toString().toLowerCase()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function addRow(sheetName, rowData) {
  var sheet = getSheet(sheetName);
  var headers = getHeaders(sheetName);
  var row = headers.map(function(h) {
    return rowData[h] || '';
  });
  sheet.appendRow(row);
}

function generateId(prefix, sheetName) {
  var data = getSheetData(sheetName);
  var maxNum = 0;
  data.forEach(function(row) {
    var id = row[Object.keys(row)[1]];
    if (id && id.toString().indexOf(prefix) === 0) {
      var num = parseInt(id.toString().replace(prefix, ''), 10);
      if (num > maxNum) maxNum = num;
    }
  });
  return prefix + String(maxNum + 1).padStart(3, '0');
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest(e) {
  var params = e.parameter;
  var action = params.action;

  if (!action) {
    return jsonResponse({ success: false, error: 'No action specified' });
  }

  try {
    switch (action) {
      case 'login':
        return authLogin(params.username, params.password);

      case 'getStudents':
        return jsonResponse({ success: true, data: getStudents() });
      case 'getStudent':
        return jsonResponse({ success: true, data: getStudent(params.studentId) });
      case 'addStudent':
        return jsonResponse({ success: true, data: addStudent(params) });
      case 'updateStudent':
        return jsonResponse({ success: true, data: updateStudent(params) });
      case 'deleteStudent':
        return jsonResponse({ success: true, data: deleteStudent(params.studentId) });
      case 'updateProgress':
        return jsonResponse({ success: true, data: updateProgress(params.studentId, params.courseId, params.percentage) });

      case 'getCourses':
        return jsonResponse({ success: true, data: getCourses() });
      case 'getCourse':
        return jsonResponse({ success: true, data: getCourse(params.courseId) });
      case 'addCourse':
        return jsonResponse({ success: true, data: addCourse(params) });
      case 'updateCourse':
        return jsonResponse({ success: true, data: updateCourse(params) });
      case 'deleteCourse':
        return jsonResponse({ success: true, data: deleteCourse(params.courseId) });

      case 'getMaterials':
        return jsonResponse({ success: true, data: getMaterials(params.courseId) });
      case 'addMaterial':
        return jsonResponse({ success: true, data: addMaterial(params) });
      case 'updateMaterial':
        return jsonResponse({ success: true, data: updateMaterial(params) });
      case 'deleteMaterial':
        return jsonResponse({ success: true, data: deleteMaterial(params.materialId) });

      case 'submitApplication':
        return submitApplication(params);
      case 'getApplications':
        return jsonResponse({ success: true, data: getApplications() });
      case 'updateApplicationStatus':
        return jsonResponse({ success: true, data: updateApplicationStatus(params.appId, params.status) });

      case 'getDashboardStats':
        return jsonResponse({ success: true, data: getDashboardStats() });
      case 'searchStudents':
        return jsonResponse({ success: true, data: searchStudents(params.query) });

      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  var params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    params = e.parameter;
  }
  if (!params.action && e.parameter.action) {
    params = e.parameter;
  }
  var fakeEvent = { parameter: params };
  return handleRequest(fakeEvent);
}
