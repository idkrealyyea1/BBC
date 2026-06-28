# BBC English Academy — Complete Setup Guide

This is the complete documentation for setting up, configuring, and deploying the BBC English Academy website with student and admin dashboards.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Google Sheets Setup](#1-google-sheets-setup)
3. [Google Apps Script Setup](#2-google-apps-script-setup)
4. [Configuration](#3-configuration)
5. [Deploying to GitHub Pages](#4-deploying-to-github-pages)
6. [Admin Dashboard Usage](#5-admin-dashboard-usage)
7. [Student Dashboard Usage](#6-student-dashboard-usage)
8. [Adding Courses & Materials](#7-adding-courses--materials)
9. [Managing Applications](#8-managing-applications)
10. [Troubleshooting](#9-troubleshooting)

---

## Overview

The BBC English Academy website is a complete learning management system with:
- **Public landing page** with courses, teachers, pricing, and contact form
- **Student dashboard** for enrolled students to access their courses
- **Admin dashboard** for managing students, courses, materials, and applications
- **Google Sheets backend** for data storage
- **Google Apps Script** as the API layer

### Files Structure

```
/
├── index.html              # Main landing page
├── style.css               # Main styles
├── script.js               # Main JavaScript (login, form handling)
├── dashboard.html          # Student dashboard
├── dashboard.css           # Dashboard styles
├── dashboard.js            # Student dashboard logic
├── admin.html              # Admin dashboard
├── admin.css               # Admin styles
├── admin.js                # Admin logic
├── google-apps-script/     # Backend API code
│   ├── code.gs             # Main dispatcher
│   ├── auth.gs             # Authentication
│   ├── students.gs         # Student CRUD
│   ├── courses.gs          # Course CRUD
│   ├── materials.gs        # Materials CRUD
│   ├── applications.gs     # Form submissions
│   └── admin.gs            # Analytics & search
└── README.md               # This file
```

---

## 1. Google Sheets Setup

### Step 1: Create a New Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+"** to create a new blank spreadsheet
3. Name it something like "BBC English Academy Database"

### Step 2: Get the Spreadsheet ID

The Spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
```
Copy the ID (the long random string between `/d/` and `/edit`).

### Step 3: Create the Sheets (Tabs)

Create **4 tabs** at the bottom of the spreadsheet:

#### Tab 1: `Students`

**Row 1 (Headers):**
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| StudentID | FullName | Username | Password | Email | Phone | EnrolledCourses | Progress | JoinDate | Status |

**Example Data (Row 2):**
| STU001 | John Doe | john123 | pass123 | john@email.com | +1234567890 | CR001,CR002 | CR001:50%,CR002:20% | 2025-01-15 | Active |

#### Tab 2: `Courses`

**Row 1 (Headers):**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| CourseID | CourseName | Description | Level | Duration | Category | Status |

**Example Data (Row 2):**
| CR001 | IELTS Preparation | Targeted exam techniques... | Exam | 2 Months | exam | Active |

#### Tab 3: `CourseMaterials`

**Row 1 (Headers):**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| CourseID | MaterialID | Title | Type | URL | OrderIndex |

**Example Data (Row 2):**
| CR001 | MAT001 | Introduction to IELTS | video | https://drive.google.com/... | 1 |

#### Tab 4: `Applications`

**Row 1 (Headers):**
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ApplicationID | Timestamp | FullName | Email | Phone | CourseInterest | CurrentLevel | HearAboutUs | Goal | PreferredSchedule | Message | Status |

**Example Data (Row 2):**
| APP001 | 2025-06-28T10:30:00Z | Jane Smith | jane@email.com | +9876543210 | IELTS Preparation | Intermediate | Social Media | Academic Studies | Evening | I want to improve my English... | New |

---

## 2. Google Apps Script Setup

### Step 1: Create a New Apps Script Project

1. Open your Google Spreadsheet
2. Go to **Extensions** → **Apps Script**
3. A new tab will open with the Apps Script editor

### Step 2: Create the Script Files

Delete the default `Code.gs` file and create the following files:

#### File: `code.gs`
```javascript
// Paste the entire content from google-apps-script/code.gs
```

#### File: `auth.gs`
```javascript
// Paste the entire content from google-apps-script/auth.gs
```

#### File: `students.gs`
```javascript
// Paste the entire content from google-apps-script/students.gs
```

#### File: `courses.gs`
```javascript
// Paste the entire content from google-apps-script/courses.gs
```

#### File: `materials.gs`
```javascript
// Paste the entire content from google-apps-script/materials.gs
```

#### File: `applications.gs`
```javascript
// Paste the entire content from google-apps-script/applications.gs
```

#### File: `admin.gs`
```javascript
// Paste the entire content from google-apps-script/admin.gs
```

### Step 3: Update Configuration

In `code.gs`, update the `CONFIG` object at the top:

```javascript
var CONFIG = {
  SHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',  // ← Paste your spreadsheet ID
  ADMIN_USERNAME: 'admin',                // ← Admin login username
  ADMIN_PASSWORD: 'admin123',             // ← Admin login password (CHANGE THIS!)
  ADMISSIONS_EMAIL: 'admissions@bbcenglishacademy.com',  // ← Your email
  SHEETS: {
    STUDENTS: 'Students',
    COURSES: 'Courses',
    MATERIALS: 'CourseMaterials',
    APPLICATIONS: 'Applications'
  }
};
```

### Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon → **Web app**
3. Fill in:
   - **Description**: BBC English Academy API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the script when prompted
6. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/.../exec`)

---

## 3. Configuration

### Update the JavaScript Files

In the following files, update `API_URL` to your Apps Script Web App URL:

#### `script.js` (line ~10)
```javascript
var API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_URL_HERE/exec';
```

#### `dashboard.js` (at the bottom)
```javascript
var API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_URL_HERE/exec';
```

#### `admin.js` (at the bottom)
```javascript
var API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_URL_HERE/exec';
```

---

## 4. Deploying to GitHub Pages

### Step 1: Push to GitHub

```bash
# Navigate to your project folder
cd /path/to/BBC

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with dashboards"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/idkrealyyea1/BBC.git

# Push
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your GitHub repo: https://github.com/idkrealyyea1/BBC
2. Click **Settings** → **Pages**
3. Under **Source**, select **main** branch
4. Click **Save**
5. Your site will be live at: `https://idkrealyyea1.github.io/BBC/`

---

## 5. Admin Dashboard Usage

### Logging In

1. Click **Student Login** in the navbar
2. Enter admin credentials:
   - Username: `admin` (or what you set in `CONFIG.ADMIN_USERNAME`)
   - Password: `admin123` (or what you set in `CONFIG.ADMIN_PASSWORD`)
3. You'll be redirected to `admin.html`

### Admin Features

#### Overview Tab
- View total students, active students, courses, new applications
- See course enrollment breakdown
- View recent applications

#### Students Tab
- **Search**: Type in the search bar to find students
- **Add Student**: Click "+ Add Student" to create a new account
- **Edit Student**: Click "Edit" to modify name, password, courses, status
- **Delete Student**: Click "Delete" to remove a student
- **Enrolled Courses**: Enter course IDs separated by commas (e.g., `CR001,CR003`)

#### Courses Tab
- **Add Course**: Create new courses with name, level, duration, category
- **Edit Course**: Modify course details
- **Materials**: Click "Materials" to add/edit/delete course content
- **Delete Course**: Soft delete (marks as "Deleted")

#### Applications Tab
- View all form submissions
- **Contacted**: Mark as contacted
- **Enroll**: Convert to enrolled student (creates account)
- **Reject**: Mark as rejected

#### Analytics Tab
- View conversion rates
- See top courses by enrollment
- Track active vs graduated students

---

## 6. Student Dashboard Usage

### Logging In

1. Click **Student Login** in the navbar
2. Enter student credentials (created by admin)
3. Redirected to `dashboard.html`

### Student Features

#### Overview
- See enrolled courses count
- View overall progress
- Continue learning section

#### My Courses
- View all enrolled courses
- Click a course to see materials
- Track progress per course

#### My Profile
- Update name, email, phone
- Change password
- Avatar shows first letter of name

#### Announcements
- View latest updates from the academy

---

## 7. Adding Courses & Materials

### Adding a Course (via Admin Dashboard)

1. Go to **Courses** tab
2. Click **+ Add Course**
3. Fill in:
   - Course Name: e.g., "IELTS Preparation"
   - Level: Beginner / Intermediate / Advanced
   - Duration: e.g., "2 Months"
   - Category: General / Exam Prep / Specialist
   - Description: Course description
4. Click **Add Course**
5. Note the generated Course ID (e.g., `CR001`)

### Adding Materials (via Admin Dashboard)

1. In **Courses** tab, click **Materials** for a course
2. Click **+ Add Material**
3. Fill in:
   - Title: e.g., "Introduction to IELTS"
   - Type: Video / PDF / Link
   - URL: Telegram link, Google Drive link, etc.
4. Click **Save**

### Adding Materials (via Google Sheets)

In the `CourseMaterials` sheet:

| CourseID | MaterialID | Title | Type | URL | OrderIndex |
|----------|------------|-------|------|-----|------------|
| CR001 | MAT001 | Intro to IELTS | video | https://drive.google.com/... | 1 |
| CR001 | MAT002 | Reading Tips | pdf | https://drive.google.com/... | 2 |

---

## 8. Managing Applications

### Form Submission Flow

1. Visitor fills out the contact form on the landing page
2. Data is sent to Apps Script
3. Apps Script:
   - Writes to `Applications` sheet
   - Sends email notification to admissions email
4. Admin can view applications in **Applications** tab
5. Admin can:
   - Mark as **Contacted**
   - **Enroll** (creates student account)
   - **Reject**

### Enrolling a Student from Application

1. Go to **Applications** tab
2. Find the application
3. Click **Enroll**
4. Manually create a student account with the same details
5. Assign appropriate courses

---

## 9. Troubleshooting

### "Invalid username or password" on login

- Check that `CONFIG.ADMIN_USERNAME` and `CONFIG.ADMIN_PASSWORD` are correct in `code.gs`
- For students, verify the username/password exist in the `Students` sheet

### Form submission not working

1. Check `API_URL` in `script.js` is correct
2. Verify Apps Script is deployed and accessible
3. Check browser console for errors
4. Ensure "Who has access" is set to "Anyone" in deployment

### Dashboard shows "Loading..." forever

- Check `API_URL` in `dashboard.js` or `admin.js`
- Verify the spreadsheet ID in `code.gs` is correct
- Check Apps Script logs for errors (in Apps Script editor: **View** → **Logs**)

### Email not sending

- Verify `ADMISSIONS_EMAIL` in `code.gs` is correct
- Apps Script email quota: 100 emails/day for free accounts
- Check Apps Script execution logs

### CORS errors

- Make sure Apps Script deployment has "Who has access: Anyone"
- The URL should end with `/exec`, not `/dev`

### Students can't see their courses

- Check the `EnrolledCourses` field in the `Students` sheet
- Format: comma-separated course IDs (e.g., `CR001,CR002`)
- Course IDs must match exactly with the `Courses` sheet

---

## Quick Reference: Sheet Column Names

### Students Sheet
```
StudentID, FullName, Username, Password, Email, Phone, EnrolledCourses, Progress, JoinDate, Status
```

### Courses Sheet
```
CourseID, CourseName, Description, Level, Duration, Category, Status
```

### CourseMaterials Sheet
```
CourseID, MaterialID, Title, Type, URL, OrderIndex
```

### Applications Sheet
```
ApplicationID, Timestamp, FullName, Email, Phone, CourseInterest, CurrentLevel, HearAboutUs, Goal, PreferredSchedule, Message, Status
```

---

## Security Notes

1. **Change default admin credentials** in `code.gs`
2. **Use strong passwords** for student accounts
3. **Never commit** sensitive data to GitHub
4. **Regularly backup** your Google Sheet
5. **Monitor Apps Script logs** for suspicious activity

---

## Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review Apps Script execution logs
3. Verify all configuration values are correct

---

**Enjoy your BBC English Academy website! 🎓**