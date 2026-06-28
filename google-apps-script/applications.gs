function submitApplication(params) {
  var sheet = getSheet(CONFIG.SHEETS.APPLICATIONS);
  var data = sheet.getDataRange().getValues();
  var maxNum = 0;
  if (data.length > 1) {
    data.slice(1).forEach(function(row) {
      var id = row[0];
      if (id && id.toString().indexOf('APP') === 0) {
        var num = parseInt(id.toString().replace('APP', ''), 10);
        if (num > maxNum) maxNum = num;
      }
    });
  }
  var newId = 'APP' + String(maxNum + 1).padStart(3, '0');

  var rowData = {
    ApplicationID: newId,
    Timestamp: new Date().toISOString(),
    FullName: params.fullName || '',
    Email: params.email || '',
    Phone: params.phone || '',
    CourseInterest: params.courseInterest || '',
    CurrentLevel: params.currentLevel || '',
    HearAboutUs: params.hearAboutUs || '',
    Goal: params.goal || '',
    Message: params.message || '',
    PreferredSchedule: params.preferredSchedule || '',
    Status: 'New'
  };

  addRow(CONFIG.SHEETS.APPLICATIONS, rowData);

  try {
    var emailBody = 'New Application Received!\n\n' +
      'Name: ' + rowData.FullName + '\n' +
      'Email: ' + rowData.Email + '\n' +
      'Phone: ' + rowData.Phone + '\n' +
      'Course Interest: ' + rowData.CourseInterest + '\n' +
      'Current Level: ' + rowData.CurrentLevel + '\n' +
      'Heard About Us: ' + rowData.HearAboutUs + '\n' +
      'Goal: ' + rowData.Goal + '\n' +
      'Preferred Schedule: ' + rowData.PreferredSchedule + '\n' +
      'Message: ' + rowData.Message + '\n\n' +
      'Application ID: ' + newId;

    MailApp.sendEmail({
      to: CONFIG.ADMISSIONS_EMAIL,
      subject: 'New Application - ' + rowData.FullName + ' (' + rowData.CourseInterest + ')',
      body: emailBody
    });
  } catch (emailErr) {
    Logger.log('Email failed: ' + emailErr.message);
  }

  return jsonResponse({ success: true, applicationId: newId });
}

function getApplications() {
  var data = getSheetData(CONFIG.SHEETS.APPLICATIONS);
  return data.map(function(row) {
    return {
      appId: row.ApplicationID,
      timestamp: row.Timestamp || '',
      fullName: row.FullName || '',
      email: row.Email || '',
      phone: row.Phone || '',
      courseInterest: row.CourseInterest || '',
      currentLevel: row.CurrentLevel || '',
      hearAboutUs: row.HearAboutUs || '',
      goal: row.Goal || '',
      message: row.Message || '',
      preferredSchedule: row.PreferredSchedule || '',
      status: row.Status || 'New'
    };
  }).reverse();
}

function updateApplicationStatus(appId, status) {
  var sheet = getSheet(CONFIG.SHEETS.APPLICATIONS);
  var headers = getHeaders(CONFIG.SHEETS.APPLICATIONS);
  var data = sheet.getDataRange().getValues();
  var colIdx = headers.indexOf('Status');
  var idColIdx = headers.indexOf('ApplicationID');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idColIdx] === appId) {
      sheet.getRange(i + 1, colIdx + 1).setValue(status);
      return { success: true };
    }
  }
  return { success: false, error: 'Application not found' };
}
