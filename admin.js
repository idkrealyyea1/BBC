// ============================================================
// BBC English Academy — Admin Dashboard JavaScript
// ============================================================

var allStudents = [];
var allCourses = [];
var allApplications = [];
var currentTab = 'overview';

// API Call Helper
function apiCall(action, params) {
  var query = 'action=' + encodeURIComponent(action);
  if (params) {
    Object.keys(params).forEach(function(k) {
      query += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    });
  }
  return fetch(API_URL + '?' + query)
  .then(function(res) { return res.json(); })
  .catch(function(err) { return { success: false, error: err.message }; });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('admin-hamburger').addEventListener('click', function() {
    document.querySelector('.admin-sidebar').classList.toggle('open');
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.getElementById('quick-add-student').addEventListener('click', () => openAddStudentModal());
  document.getElementById('btn-add-student').addEventListener('click', () => openAddStudentModal());
  document.getElementById('btn-add-course').addEventListener('click', () => openAddCourseModal());

  document.querySelectorAll('.admin-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector('.admin-sidebar').classList.remove('open');
      var section = this.dataset.section;
      showSection(section);
    });
  });

  document.getElementById('search-students').addEventListener('input', debounce(function(e) {
    searchStudents(e.target.value);
  }, 300));

  document.getElementById('search-courses').addEventListener('input', debounce(function(e) {
    searchCourses(e.target.value);
  }, 300));

  document.getElementById('search-applications').addEventListener('input', debounce(function(e) {
    searchApplications(e.target.value);
  }, 300));

  document.getElementById('filter-status').addEventListener('change', function() {
    filterApplicationsByStatus(this.value);
  });
}

function debounce(func, wait) {
  var timeout;
  return function() {
    var args = arguments;
    var context = this;
    clearTimeout(timeout);
    timeout = setTimeout(function() { func.apply(context, args); }, wait);
  };
}

function checkAuth() {
  var authData = sessionStorage.getItem('bbcAuth');
  if (!authData) {
    window.location.href = 'index.html';
    return;
  }

  var user = JSON.parse(authData);
  if (user.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }
}

function logout() {
  sessionStorage.removeItem('bbcAuth');
  window.location.href = 'index.html';
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-link').forEach(l => l.classList.remove('active'));

  document.getElementById(sectionId).classList.add('active');
  document.querySelector('.admin-link[data-section="' + sectionId + '"]').classList.add('active');

  if (sectionId === 'overview') loadOverview();
  if (sectionId === 'students') loadStudents();
  if (sectionId === 'courses') loadCourses();
  if (sectionId === 'applications') loadApplications();
  if (sectionId === 'analytics') loadAnalytics();
}

async function loadOverview() {
  var stats = await apiCall('getDashboardStats');
  if (stats.success) {
    document.getElementById('total-students').textContent = stats.data.totalStudents;
    document.getElementById('active-students').textContent = stats.data.activeStudents;
    document.getElementById('total-courses').textContent = stats.data.totalCourses;
    document.getElementById('new-applications').textContent = stats.data.newApplications;

    // Enrollment bars
    var barsContainer = document.getElementById('enrollment-bars');
    barsContainer.innerHTML = '';
    stats.data.courseEnrollments.slice(0, 8).forEach(function(item) {
      var bar = document.createElement('div');
      bar.className = 'chart-bar-item';
      bar.innerHTML = `
        <span class="chart-bar-label">${item.courseName}</span>
        <div class="chart-bar">
          <div class="chart-bar-fill" style="width: ${Math.min(100, item.count * 10)}%">${item.count}</div>
        </div>
      `;
      barsContainer.appendChild(bar);
    });
    if (stats.data.courseEnrollments.length === 0) {
      barsContainer.innerHTML = '<div class="loading">No enrollments yet</div>';
    }
  }

  // Recent applications
  var apps = await apiCall('getApplications');
  var tbody = document.getElementById('recent-apps-body');
  tbody.innerHTML = '';
  apps.data.slice(0, 5).forEach(function(app) {
    var row = document.createElement('tr');
    row.innerHTML = `
      <td>${app.fullName}</td>
      <td>${app.courseInterest}</td>
      <td>${new Date(app.timestamp).toLocaleDateString()}</td>
      <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
    `;
    tbody.appendChild(row);
  });
  if (apps.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">No applications yet</td></tr>';
  }
}

async function loadStudents() {
  var result = await apiCall('getStudents');
  if (result.success) {
    allStudents = result.data;
    renderStudentsTable(allStudents);
  }
}

function renderStudentsTable(students) {
  var tbody = document.getElementById('students-body');
  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No students found</td></tr>';
    return;
  }

  students.forEach(function(student) {
    var row = document.createElement('tr');
    var courses = student.enrolledCourses ? student.enrolledCourses.split(',').length : 0;
    row.innerHTML = `
      <td>${student.studentId}</td>
      <td>${student.fullName}</td>
      <td>${student.username}</td>
      <td>${courses}</td>
      <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
      <td>${student.joinDate ? new Date(student.joinDate).toLocaleDateString() : '-'}</td>
      <td class="actions">
        <button class="btn-action" data-i18n="admin-edit" onclick="editStudent('${student.studentId}')">Edit</button>
        <button class="btn-action delete" data-i18n="admin-delete" onclick="deleteStudent('${student.studentId}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function searchStudents(query) {
  if (!query) {
    renderStudentsTable(allStudents);
    return;
  }
  apiCall('searchStudents', { query: query }).then(function(result) {
    if (result.success) {
      renderStudentsTable(result.data);
    }
  });
}

function searchCourses(query) {
  if (!query) {
    renderCoursesTable(allCourses);
    return;
  }
  var lowerQuery = query.toLowerCase();
  var filtered = allCourses.filter(function(c) {
    return (c.courseName && c.courseName.toLowerCase().indexOf(lowerQuery) !== -1) ||
           (c.courseId && c.courseId.toLowerCase().indexOf(lowerQuery) !== -1) ||
           (c.level && c.level.toLowerCase().indexOf(lowerQuery) !== -1);
  });
  renderCoursesTable(filtered);
}

function openAddStudentModal() {
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h2 style="margin-bottom: 24px;">Add New Student</h2>
    <form id="add-student-form" class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" name="fullName" required />
        </div>
        <div class="form-group">
          <label>Username *</label>
          <input type="text" name="username" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Password *</label>
          <input type="password" name="password" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" name="phone" />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Enrolled Courses (comma-separated course IDs)</label>
        <input type="text" name="enrolledCourses" placeholder="CR001,CR002" />
      </div>
      <button type="submit" class="btn btn-primary">Add Student</button>
    </form>
  `;
  modal.classList.add('open');

  document.getElementById('add-student-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var data = {};
    formData.forEach((value, key) => data[key] = value);
    
    apiCall('addStudent', data).then(function(result) {
      if (result.success) {
        showToast('Student added successfully', 'success');
        closeModal();
        loadStudents();
      } else {
        showToast(result.error || 'Failed to add student', 'error');
      }
    });
  });
}

function editStudent(studentId) {
  var student = allStudents.find(s => s.studentId === studentId);
  if (!student) return;

  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h2 style="margin-bottom: 24px;">Edit Student</h2>
    <form id="edit-student-form" class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" name="fullName" value="${student.fullName}" required />
        </div>
        <div class="form-group">
          <label>Username *</label>
          <input type="text" name="username" value="${student.username}" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>New Password (leave blank to keep)</label>
          <input type="password" name="password" placeholder="Enter new password" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" value="${student.email || ''}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" name="phone" value="${student.phone || ''}" />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status">
            <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            <option value="Graduated" ${student.status === 'Graduated' ? 'selected' : ''}>Graduated</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Enrolled Courses (comma-separated course IDs)</label>
        <input type="text" name="enrolledCourses" value="${student.enrolledCourses || ''}" />
      </div>
      <button type="submit" class="btn btn-primary">Save Changes</button>
    </form>
  `;
  modal.classList.add('open');

  document.getElementById('edit-student-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var data = { studentId: studentId };
    formData.forEach((value, key) => data[key] = value);
    
    apiCall('updateStudent', data).then(function(result) {
      if (result.success) {
        showToast('Student updated successfully', 'success');
        closeModal();
        loadStudents();
      } else {
        showToast(result.error || 'Failed to update student', 'error');
      }
    });
  });
}

function deleteStudent(studentId) {
  if (!confirm('Are you sure you want to delete this student? This cannot be undone.')) return;
  
  apiCall('deleteStudent', { studentId: studentId }).then(function(result) {
    if (result.success) {
      showToast('Student deleted successfully', 'success');
      loadStudents();
    } else {
      showToast(result.error || 'Failed to delete student', 'error');
    }
  });
}

async function loadCourses() {
  var result = await apiCall('getCourses');
  if (result.success) {
    allCourses = result.data;
    renderCoursesTable(allCourses);
  }
}

function renderCoursesTable(courses) {
  var tbody = document.getElementById('courses-body');
  tbody.innerHTML = '';

  if (courses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No courses found</td></tr>';
    return;
  }

  courses.forEach(function(course) {
    var enrollmentCount = allStudents.filter(s => {
      var courses = s.enrolledCourses ? s.enrolledCourses.split(',').map(c => c.trim()) : [];
      return courses.includes(course.courseId);
    }).length;

    var row = document.createElement('tr');
    row.innerHTML = `
      <td>${course.courseId}</td>
      <td>${course.courseName}</td>
      <td>${course.level}</td>
      <td>${course.duration}</td>
      <td>${enrollmentCount}</td>
      <td><span class="status-badge ${course.status.toLowerCase()}">${course.status}</span></td>
      <td class="actions">
        <button class="btn-action" data-i18n="admin-edit" onclick="editCourse('${course.courseId}')">Edit</button>
        <button class="btn-action" data-i18n="admin-materials" onclick="openMaterialsModal('${course.courseId}', '${course.courseName}')">Materials</button>
        <button class="btn-action delete" data-i18n="admin-delete" onclick="deleteCourse('${course.courseId}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openAddCourseModal() {
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h2 style="margin-bottom: 24px;">Add New Course</h2>
    <form id="add-course-form" class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label>Course Name *</label>
          <input type="text" name="courseName" required />
        </div>
        <div class="form-group">
          <label>Level</label>
          <select name="level">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Duration</label>
          <input type="text" name="duration" placeholder="e.g., 2 Months" />
        </div>
        <div class="form-group">
          <label>Category</label>
          <select name="category">
            <option value="general">General</option>
            <option value="exam">Exam Prep</option>
            <option value="specialist">Specialist</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" rows="3"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Add Course</button>
    </form>
  `;
  modal.classList.add('open');

  document.getElementById('add-course-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var data = {};
    formData.forEach((value, key) => data[key] = value);
    
    apiCall('addCourse', data).then(function(result) {
      if (result.success) {
        showToast('Course added successfully', 'success');
        closeModal();
        loadCourses();
      } else {
        showToast(result.error || 'Failed to add course', 'error');
      }
    });
  });
}

function editCourse(courseId) {
  var course = allCourses.find(c => c.courseId === courseId);
  if (!course) return;

  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h2 style="margin-bottom: 24px;">Edit Course</h2>
    <form id="edit-course-form" class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label>Course Name *</label>
          <input type="text" name="courseName" value="${course.courseName}" required />
        </div>
        <div class="form-group">
          <label>Level</label>
          <select name="level">
            <option value="Beginner" ${course.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${course.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${course.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Duration</label>
          <input type="text" name="duration" value="${course.duration || ''}" />
        </div>
        <div class="form-group">
          <label>Category</label>
          <select name="category">
            <option value="general" ${course.category === 'general' ? 'selected' : ''}>General</option>
            <option value="exam" ${course.category === 'exam' ? 'selected' : ''}>Exam Prep</option>
            <option value="specialist" ${course.category === 'specialist' ? 'selected' : ''}>Specialist</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" rows="3">${course.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Active" ${course.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${course.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Save Changes</button>
    </form>
  `;
  modal.classList.add('open');

  document.getElementById('edit-course-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var data = { courseId: courseId };
    formData.forEach((value, key) => data[key] = value);
    
    apiCall('updateCourse', data).then(function(result) {
      if (result.success) {
        showToast('Course updated successfully', 'success');
        closeModal();
        loadCourses();
      } else {
        showToast(result.error || 'Failed to update course', 'error');
      }
    });
  });
}

function deleteCourse(courseId) {
  if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
  
  apiCall('deleteCourse', { courseId: courseId }).then(function(result) {
    if (result.success) {
      showToast('Course deleted successfully', 'success');
      loadCourses();
    } else {
      showToast(result.error || 'Failed to delete course', 'error');
    }
  });
}

function openMaterialsModal(courseId, courseName) {
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h2 style="margin-bottom: 24px;">Manage Materials: ${courseName}</h2>
    <div id="materials-container" data-course-id="${courseId}">
      <button class="btn btn-primary" id="add-material-btn" style="margin-bottom: 20px;">+ Add Material</button>
      <div id="materials-list" class="loading">Loading...</div>
    </div>
  `;
  modal.classList.add('open');
  loadMaterials(courseId);

  document.getElementById('add-material-btn').addEventListener('click', function() {
    addMaterialForm(courseId);
  });
}

function loadMaterials(courseId) {
  apiCall('getMaterials', { courseId: courseId }).then(function(result) {
    var list = document.getElementById('materials-list');
    if (result.success && result.data.length > 0) {
      list.innerHTML = '';
      result.data.forEach(function(mat) {
        var item = document.createElement('div');
        item.style.background = 'var(--bg-3)';
        item.style.padding = '16px';
        item.style.borderRadius = 'var(--radius)';
        item.style.marginBottom = '12px';
        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${mat.title}</strong>
              <span style="color: var(--gray-dim); margin-left: 12px;">(${mat.type})</span>
            </div>
            <div>
              <button class="btn-action" onclick="editMaterial('${courseId}', '${mat.materialId}')">Edit</button>
              <button class="btn-action delete" onclick="deleteMaterial('${mat.materialId}')">Delete</button>
            </div>
          </div>
          <a href="${mat.url}" target="_blank" rel="noopener" style="color: var(--red); font-size: 0.85rem; display: block; margin-top: 8px;">${mat.url}</a>
        `;
        list.appendChild(item);
      });
    } else {
      list.innerHTML = '<div class="loading">No materials yet. Click "+ Add Material" to add some.</div>';
    }
  });
}

function addMaterialForm(courseId) {
  var list = document.getElementById('materials-list');
  var form = document.createElement('div');
  form.className = 'material-item';
  form.style.marginBottom = '12px';
  form.style.background = 'var(--bg-3)';
  form.style.padding = '16px';
  form.style.borderRadius = 'var(--radius)';
  form.innerHTML = `
    <h4 style="margin-bottom: 12px;">Add New Material</h4>
    <div class="form-row" style="margin-bottom: 12px;">
      <input type="text" id="new-mat-title" placeholder="Material Title" style="flex: 1; padding: 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); color: var(--white);" />
      <select id="new-mat-type" style="padding: 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); color: var(--white);">
        <option value="video">Video</option>
        <option value="pdf">PDF</option>
        <option value="link">Link</option>
      </select>
    </div>
    <input type="text" id="new-mat-url" placeholder="URL (Telegram, Drive, etc.)" style="width: 100%; padding: 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); color: var(--white); margin-bottom: 12px;" />
    <div>
      <button class="btn btn-primary" onclick="saveMaterial('${courseId}')">Save</button>
      <button class="btn-action" onclick="this.parentElement.parentElement.remove()">Cancel</button>
    </div>
  `;
  list.insertBefore(form, list.firstChild);
}

function saveMaterial(courseId) {
  var title = document.getElementById('new-mat-title').value;
  var type = document.getElementById('new-mat-type').value;
  var url = document.getElementById('new-mat-url').value;

  if (!title || !url) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  apiCall('addMaterial', { courseId: courseId, title: title, type: type, url: url }).then(function(result) {
    if (result.success) {
      showToast('Material added successfully', 'success');
      loadMaterials(courseId);
    } else {
      showToast(result.error || 'Failed to add material', 'error');
    }
  });
}

function deleteMaterial(materialId) {
  if (!confirm('Are you sure you want to delete this material?')) return;
  
  apiCall('deleteMaterial', { materialId: materialId }).then(function(result) {
    if (result.success) {
      showToast('Material deleted successfully', 'success');
      var container = document.getElementById('materials-container');
      var courseId = container.getAttribute('data-course-id') || '';
      if (courseId) loadMaterials(courseId);
    } else {
      showToast(result.error || 'Failed to delete material', 'error');
    }
  });
}

function editMaterial(courseId, materialId) {
  apiCall('getMaterials', { courseId: courseId }).then(function(result) {
    if (!result.success) return;
    var material = result.data.find(function(m) { return m.materialId === materialId; });
    if (!material) return;
    
    var list = document.getElementById('materials-list');
    var form = document.createElement('div');
    form.className = 'material-item';
    form.style.margin = '0 0 12px 0';
    form.style.background = 'var(--bg-3)';
    form.style.padding = '16px';
    form.style.borderRadius = 'var(--radius)';
    form.innerHTML = `
      <h4 style="margin-bottom: 12px;">Edit Material</h4>
      <div class="form-row" style="margin-bottom: 12px;">
        <input type="text" id="edit-mat-title" value="${material.title.replace(/"/g, '&quot;')}" style="flex: 1; padding: 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); color: var(--white);" />
        <select id="edit-mat-type" style="padding: 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); color: var(--white);">
          <option value="video" ${material.type === 'video' ? 'selected' : ''}>Video</option>
          <option value="pdf" ${material.type === 'pdf' ? 'selected' : ''}>PDF</option>
          <option value="link" ${material.type === 'link' ? 'selected' : ''}>Link</option>
        </select>
      </div>
      <input type="text" id="edit-mat-url" value="${material.url.replace(/"/g, '&quot;')}" style="width: 100%; padding: 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); color: var(--white); margin-bottom: 12px;" />
      <div>
        <button class="btn btn-primary" onclick="saveEditMaterial('${courseId}', '${materialId}')">Save</button>
        <button class="btn-action" onclick="loadMaterials('${courseId}')">Cancel</button>
      </div>
    `;
    list.insertBefore(form, list.firstChild);
  });
}

function saveEditMaterial(courseId, materialId) {
  var title = document.getElementById('edit-mat-title').value;
  var type = document.getElementById('edit-mat-type').value;
  var url = document.getElementById('edit-mat-url').value;

  if (!title || !url) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  apiCall('updateMaterial', { materialId: materialId, courseId: courseId, title: title, type: type, url: url }).then(function(result) {
    if (result.success) {
      showToast('Material updated successfully', 'success');
      loadMaterials(courseId);
    } else {
      showToast(result.error || 'Failed to update material', 'error');
    }
  });
}

async function loadApplications() {
  var result = await apiCall('getApplications');
  if (result.success) {
    allApplications = result.data;
    renderApplicationsTable(allApplications);
  }
}

function renderApplicationsTable(apps) {
  var tbody = document.getElementById('applications-body');
  tbody.innerHTML = '';

  if (apps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No applications found</td></tr>';
    return;
  }

  apps.forEach(function(app) {
    var row = document.createElement('tr');
    row.innerHTML = `
      <td>${app.appId}</td>
      <td>${app.fullName}</td>
      <td>${app.email}</td>
      <td>${app.phone}</td>
      <td>${app.courseInterest}</td>
      <td>${new Date(app.timestamp).toLocaleDateString()}</td>
      <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
      <td class="actions">
        <button class="btn-action" onclick="updateAppStatus('${app.appId}', 'Contacted')">Contacted</button>
        <button class="btn-action" onclick="updateAppStatus('${app.appId}', 'Enrolled')">Enroll</button>
        <button class="btn-action delete" onclick="updateAppStatus('${app.appId}', 'Rejected')">Reject</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function searchApplications(query) {
  if (!query) {
    renderApplicationsTable(allApplications);
    return;
  }
  var filtered = allApplications.filter(app => 
    app.fullName.toLowerCase().includes(query.toLowerCase()) ||
    app.email.toLowerCase().includes(query.toLowerCase()) ||
    app.appId.toLowerCase().includes(query.toLowerCase())
  );
  renderApplicationsTable(filtered);
}

function filterApplicationsByStatus(status) {
  if (!status) {
    renderApplicationsTable(allApplications);
    return;
  }
  var filtered = allApplications.filter(app => app.status === status);
  renderApplicationsTable(filtered);
}

function updateAppStatus(appId, status) {
  apiCall('updateApplicationStatus', { appId: appId, status: status }).then(function(result) {
    if (result.success) {
      showToast('Application status updated', 'success');
      loadApplications();
    } else {
      showToast(result.error || 'Failed to update status', 'error');
    }
  });
}

async function loadAnalytics() {
  var stats = await apiCall('getDashboardStats');
  if (stats.success) {
    document.getElementById('analytics-total-apps').textContent = stats.data.totalApplications;
    document.getElementById('analytics-active').textContent = stats.data.activeStudents;
    document.getElementById('analytics-graduates').textContent = stats.data.graduates;

    var conversion = 0;
    if (stats.data.totalApplications > 0) {
      conversion = Math.round((stats.data.enrolledApplications / stats.data.totalApplications) * 100);
    }
    document.getElementById('analytics-conversion').textContent = conversion + '%';

    // Top courses
    var barsContainer = document.getElementById('top-courses-bars');
    barsContainer.innerHTML = '';
    stats.data.courseEnrollments.slice(0, 10).forEach(function(item) {
      var bar = document.createElement('div');
      bar.className = 'chart-bar-item';
      bar.innerHTML = `
        <span class="chart-bar-label">${item.courseName}</span>
        <div class="chart-bar">
          <div class="chart-bar-fill" style="width: ${Math.min(100, item.count * 10)}%">${item.count}</div>
        </div>
      `;
      barsContainer.appendChild(bar);
    });
    if (stats.data.courseEnrollments.length === 0) {
      barsContainer.innerHTML = '<div class="loading">No enrollments yet</div>';
    }
  }
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function showToast(message, type) {
  var toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(function() {
    toast.classList.remove('show');
  }, 3000);
}
applyLanguage();
applyTheme();