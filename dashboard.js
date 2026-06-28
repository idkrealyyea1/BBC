// ============================================================
// BBC English Academy — Student Dashboard JavaScript
// ============================================================

var currentUser = null;
var allCourses = [];
var currentCourse = null;

// API Call Helper
function apiCall(action, params) {
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: action, ...params })
  })
  .then(res => res.json())
  .catch(err => ({ success: false, error: err.message }));
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('btn-back-courses').addEventListener('click', function() {
    showSection('courses');
  });
  document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var section = this.dataset.section;
      showSection(section);
    });
  });
}

function checkAuth() {
  var authData = sessionStorage.getItem('bbcAuth');
  if (!authData) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = JSON.parse(authData);
  if (currentUser.role !== 'student') {
    window.location.href = 'admin.html';
    return;
  }

  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('dashboard-name').textContent = currentUser.name;
  document.getElementById('profile-name').value = currentUser.name;
  document.getElementById('profile-username').value = currentUser.username;
  document.getElementById('profile-email').value = currentUser.email || '';
  document.getElementById('profile-phone').value = currentUser.phone || '';
  document.getElementById('profile-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

  loadDashboardData();
}

function logout() {
  sessionStorage.removeItem('bbcAuth');
  window.location.href = 'index.html';
}

async function loadDashboardData() {
  await loadCourses();
  updateStats();
}

async function loadCourses() {
  var result = await apiCall('getCourses');
  if (result.success) {
    allCourses = result.data;
    renderCourses();
  }
}

function renderCourses() {
  var enrolledIds = currentUser.enrolledCourses ? currentUser.enrolledCourses.split(',').map(s => s.trim()) : [];
  var enrolledCourses = allCourses.filter(c => enrolledIds.includes(c.courseId));

  var grid = document.getElementById('courses-grid');
  grid.innerHTML = '';

  if (enrolledCourses.length === 0) {
    grid.innerHTML = '<div class="loading">You are not enrolled in any courses yet. Contact administration to get access.</div>';
    return;
  }

  enrolledCourses.forEach(course => {
    var progress = getCourseProgress(course.courseId);
    var card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-card-img"></div>
      <div class="course-card-info">
        <h3>${course.courseName}</h3>
        <p>${course.description.substring(0, 80)}${course.description.length > 80 ? '...' : ''}</p>
        <div class="course-progress">
          <div class="course-progress-fill" style="width: ${progress}%"></div>
        </div>
        <small style="color: var(--gray-dim); margin-top: 6px; display: block;">${progress}% complete</small>
      </div>
    `;
    card.addEventListener('click', () => showCourseDetail(course));
    grid.appendChild(card);
  });

  // Recent courses
  var recentList = document.getElementById('recent-course-list');
  recentList.innerHTML = '';
  enrolledCourses.slice(0, 3).forEach(course => {
    var progress = getCourseProgress(course.courseId);
    var item = document.createElement('div');
    item.className = 'course-card';
    item.innerHTML = `
      <div class="course-card-img"></div>
      <div class="course-card-info">
        <h3>${course.courseName}</h3>
        <div class="course-progress">
          <div class="course-progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
    item.addEventListener('click', () => showCourseDetail(course));
    recentList.appendChild(item);
  });
}

function getCourseProgress(courseId) {
  if (!currentUser.progress) return 0;
  var progressMap = {};
  currentUser.progress.split(',').forEach(function(pair) {
    var parts = pair.split(':');
    if (parts.length === 2) {
      progressMap[parts[0].trim()] = parseInt(parts[1].trim());
    }
  });
  return progressMap[courseId] || 0;
}

function updateStats() {
  var enrolledIds = currentUser.enrolledCourses ? currentUser.enrolledCourses.split(',').map(s => s.trim()) : [];
  document.getElementById('stat-enrolled').textContent = enrolledIds.length;

  var completed = 0;
  var totalProgress = 0;
  enrolledIds.forEach(function(id) {
    var prog = getCourseProgress(id);
    totalProgress += prog;
    if (prog >= 100) completed++;
  });

  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-progress').textContent = enrolledIds.length ? Math.round(totalProgress / enrolledIds.length) + '%' : '0%';

  var joinDate = currentUser.joinDate ? new Date(currentUser.joinDate) : new Date();
  var days = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
  document.getElementById('stat-days').textContent = Math.max(1, days);
}

async function showCourseDetail(course) {
  currentCourse = course;
  showSection('course-detail');

  document.getElementById('detail-title').textContent = course.courseName;
  document.getElementById('detail-level').textContent = course.level;
  document.getElementById('detail-duration').textContent = course.duration;
  document.getElementById('detail-description').textContent = course.description;

  var progress = getCourseProgress(course.courseId);
  document.getElementById('detail-progress').textContent = progress + '%';
  document.getElementById('detail-progress-fill').style.width = progress + '%';

  var result = await apiCall('getMaterials', { courseId: course.courseId });
  var materialsList = document.getElementById('materials-list');

  if (result.success && result.data.length > 0) {
    materialsList.innerHTML = '';
    result.data.forEach(function(mat) {
      var item = document.createElement('div');
      item.className = 'material-item';
      var icon = mat.type === 'video' ? '🎬' : mat.type === 'pdf' ? '📄' : '🔗';
      item.innerHTML = `
        <div class="material-info">
          <span class="material-icon">${icon}</span>
          <div class="material-details">
            <h4>${mat.title}</h4>
            <span>${mat.type}</span>
          </div>
        </div>
        <a href="${mat.url}" target="_blank" rel="noopener" class="material-link">
          View Material →
        </a>
      `;
      materialsList.appendChild(item);
    });
  } else {
    materialsList.innerHTML = '<div class="loading">No materials available for this course yet.</div>';
  }
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  if (sectionId === 'course-detail') {
    document.getElementById('course-detail').classList.add('active');
  } else {
    document.getElementById(sectionId).classList.add('active');
    var link = document.querySelector('.sidebar-link[data-section="' + sectionId + '"]');
    if (link) link.classList.add('active');
  }
}

function handleProfileUpdate(e) {
  e.preventDefault();
  var name = document.getElementById('profile-name').value;
  var email = document.getElementById('profile-email').value;
  var phone = document.getElementById('profile-phone').value;
  var password = document.getElementById('profile-password').value;
  var passwordConfirm = document.getElementById('profile-password-confirm').value;

  if (password && password !== passwordConfirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  var updates = {
    studentId: currentUser.studentId,
    fullName: name,
    email: email,
    phone: phone
  };
  if (password) updates.password = password;

  apiCall('updateStudent', updates).then(function(result) {
    if (result.success) {
      currentUser.name = name;
      currentUser.email = email;
      currentUser.phone = phone;
      sessionStorage.setItem('bbcAuth', JSON.stringify(currentUser));
      showToast('Profile updated successfully', 'success');
      document.getElementById('profile-avatar').textContent = name.charAt(0).toUpperCase();
    } else {
      showToast(result.error || 'Failed to update profile', 'error');
    }
  });
}

function updateProgress(percentage) {
  if (!currentCourse) return;
  apiCall('updateProgress', {
    studentId: currentUser.studentId,
    courseId: currentCourse.courseId,
    percentage: percentage
  }).then(function(result) {
    if (result.success) {
      currentUser.progress = currentUser.progress || '';
      var progressMap = {};
      currentUser.progress.split(',').forEach(function(pair) {
        var parts = pair.split(':');
        if (parts.length === 2) progressMap[parts[0].trim()] = parts[1].trim();
      });
      progressMap[currentCourse.courseId] = percentage + '%';
      currentUser.progress = Object.keys(progressMap).map(function(k) { return k + ':' + progressMap[k]; }).join(',');
      sessionStorage.setItem('bbcAuth', JSON.stringify(currentUser));
      showToast('Progress updated to ' + percentage + '%', 'success');
      renderCourses();
      showCourseDetail(currentCourse);
    } else {
      showToast(result.error || 'Failed to update progress', 'error');
    }
  });
}

function showToast(message, type) {
  var toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(function() {
    toast.classList.remove('show');
  }, 3000);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}