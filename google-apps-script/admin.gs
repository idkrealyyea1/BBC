function getDashboardStats() {
  var students = getSheetData(CONFIG.SHEETS.STUDENTS);
  var courses = getCourses();
  var applications = getApplications();

  var totalStudents = students.filter(function(s) { return s.Status !== 'Deleted'; }).length;
  var activeStudents = students.filter(function(s) { return s.Status === 'Active'; }).length;
  var graduates = students.filter(function(s) { return s.Status === 'Graduated'; }).length;

  var courseEnrollments = {};
  courses.forEach(function(c) { courseEnrollments[c.courseId] = 0; });
  students.forEach(function(s) {
    if (s.EnrolledCourses) {
      s.EnrolledCourses.split(',').forEach(function(cid) {
        cid = cid.trim();
        if (courseEnrollments.hasOwnProperty(cid)) {
          courseEnrollments[cid]++;
        }
      });
    }
  });

  var newApplications = applications.filter(function(a) { return a.status === 'New'; }).length;
  var contactedApplications = applications.filter(function(a) { return a.status === 'Contacted'; }).length;
  var enrolledApplications = applications.filter(function(a) { return a.status === 'Enrolled'; }).length;

  var courseEnrollmentList = Object.keys(courseEnrollments).map(function(cid) {
    var course = courses.find(function(c) { return c.courseId === cid; });
    return {
      courseId: cid,
      courseName: course ? course.courseName : 'Unknown',
      count: courseEnrollments[cid]
    };
  }).sort(function(a, b) { return b.count - a.count; });

  return {
    totalStudents: totalStudents,
    activeStudents: activeStudents,
    graduates: graduates,
    totalCourses: courses.length,
    totalApplications: applications.length,
    newApplications: newApplications,
    contactedApplications: contactedApplications,
    enrolledApplications: enrolledApplications,
    courseEnrollments: courseEnrollmentList
  };
}

function searchStudents(query) {
  var students = getStudents();
  var lowerQuery = query.toLowerCase();
  return students.filter(function(s) {
    return (s.fullName && s.fullName.toLowerCase().indexOf(lowerQuery) !== -1) ||
           (s.studentId && s.studentId.toLowerCase().indexOf(lowerQuery) !== -1) ||
           (s.username && s.username.toLowerCase().indexOf(lowerQuery) !== -1) ||
           (s.email && s.email.toLowerCase().indexOf(lowerQuery) !== -1) ||
           (s.phone && s.phone.toLowerCase().indexOf(lowerQuery) !== -1);
  });
}