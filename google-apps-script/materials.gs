function getMaterials(courseId) {
  var data = getSheetData(CONFIG.SHEETS.MATERIALS);
  return data
    .filter(function(row) { return row.CourseID === courseId; })
    .sort(function(a, b) { return (a.OrderIndex || 0) - (b.OrderIndex || 0); })
    .map(function(row) {
      return {
        materialId: row.MaterialID,
        courseId: row.CourseID,
        title: row.Title,
        type: row.Type,
        url: row.URL,
        orderIndex: row.OrderIndex || 0
      };
    });
}

function addMaterial(params) {
  var data = getSheetData(CONFIG.SHEETS.MATERIALS);
  var maxNum = 0;
  data.forEach(function(row) {
    var id = row.MaterialID;
    if (id && id.toString().indexOf('MAT') === 0) {
      var num = parseInt(id.toString().replace('MAT', ''), 10);
      if (num > maxNum) maxNum = num;
    }
  });
  var newId = 'MAT' + String(maxNum + 1).padStart(3, '0');

  var maxOrder = 0;
  data.filter(function(r) { return r.CourseID === params.courseId; })
    .forEach(function(r) {
      if ((r.OrderIndex || 0) > maxOrder) maxOrder = r.OrderIndex;
    });

  var rowData = {
    CourseID: params.courseId,
    MaterialID: newId,
    Title: params.title || '',
    Type: params.type || 'link',
    URL: params.url || '',
    OrderIndex: params.orderIndex || (maxOrder + 1)
  };

  addRow(CONFIG.SHEETS.MATERIALS, rowData);
  return { success: true, materialId: newId };
}

function updateMaterial(params) {
  var sheet = getSheet(CONFIG.SHEETS.MATERIALS);
  var headers = getHeaders(CONFIG.SHEETS.MATERIALS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === params.materialId) {
      var updates = {};
      if (params.title) updates.Title = params.title;
      if (params.type) updates.Type = params.type;
      if (params.url) updates.URL = params.url;
      if (params.orderIndex !== undefined) updates.OrderIndex = parseInt(params.orderIndex, 10);
      if (params.courseId) updates.CourseID = params.courseId;

      for (var key in updates) {
        var colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updates[key]);
        }
      }
      return { success: true };
    }
  }
  return { success: false, error: 'Material not found' };
}

function deleteMaterial(materialId) {
  var sheet = getSheet(CONFIG.SHEETS.MATERIALS);
  var headers = getHeaders(CONFIG.SHEETS.MATERIALS);
  var data = sheet.getDataRange().getValues();
  var colIdx = headers.indexOf('MaterialID');

  for (var i = 1; i < data.length; i++) {
    if (data[i][colIdx] === materialId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Material not found' };
}
