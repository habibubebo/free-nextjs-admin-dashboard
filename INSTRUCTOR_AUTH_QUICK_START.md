# Instructor Authentication - Quick Start Guide

## 🚀 Setup Steps

### Step 1: Run Database Migration
Execute this SQL in your database:

```sql
ALTER TABLE `instruktur` ADD COLUMN `Password` VARCHAR(255) DEFAULT NULL AFTER `Email`;
ALTER TABLE `instruktur` ADD UNIQUE INDEX `Email_unique` (`Email`(100));
```

Or run the migration file: `migrate_instructor_auth.sql`

### Step 2: Add Instructors with Passwords (Admin)
1. Go to `/admin/instructors`
2. Click "Add Instructor"
3. Fill in all fields including Email and Password
4. Click "Save"

### Step 3: Instructors Can Now Login
1. Go to `/instructor-login`
2. Enter email and password
3. Access dashboard at `/instructor-dashboard`

---

## 📍 URLs

| Page | URL | Purpose |
|------|-----|---------|
| Instructor Login | `/instructor-login` | Login page for instructors |
| Instructor Dashboard | `/instructor-dashboard` | Profile and account management |
| Admin Instructors | `/admin/instructors` | Manage instructors (add/edit/delete) |

---

## 🔐 Features

### Login Page
- Email and password authentication
- Error messages for invalid credentials
- Responsive design
- Automatic redirect to dashboard on success

### Dashboard / Profile Page
- View all profile information
- Change password functionality
- Logout button
- Quick stats (Status, ID, Access level)

### Admin Management
- Add instructor with password
- Edit instructor (optional password change)
- Delete instructor
- Email uniqueness validation

---

## 📝 Password Management

### For Admins
- **Adding:** Password is required
- **Editing:** Leave password field empty to keep current password, or enter new password to change it

### For Instructors
- **First Login:** Use password provided by admin
- **Change Password:** Click "Ubah Password" on dashboard
- **Requirements:** Minimum 6 characters

---

## 🔒 Security

- Passwords are hashed using SHA256
- Sessions stored in HTTP-only cookies
- Session expires after 7 days
- Email must be unique per instructor
- Routes are protected by middleware

---

## 🛠️ Files Created/Modified

### New Files
- `src/app/actions/authActions.ts` - Authentication logic
- `src/app/instructor-login/page.tsx` - Login page
- `src/app/instructor-login/InstructorLoginClient.tsx` - Login component
- `src/app/instructor-dashboard/page.tsx` - Dashboard page
- `src/app/instructor-dashboard/InstructorDashboardClient.tsx` - Dashboard component
- `src/middleware.ts` - Route protection
- `migrate_instructor_auth.sql` - Database migration

### Modified Files
- `src/app/actions/instructorActions.ts` - Added password handling
- `src/app/(admin)/instructors/InstructorClient.tsx` - Added password field to modal

---

## ✅ Testing Checklist

- [ ] Database migration executed successfully
- [ ] Can add instructor with email and password
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong credentials
- [ ] Dashboard shows correct profile information
- [ ] Can change password from dashboard
- [ ] Can logout and return to login page
- [ ] Session persists after page refresh
- [ ] Session expires after 7 days
- [ ] Cannot access dashboard without login

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Email atau password salah" | Check email and password are correct |
| Cannot add instructor | Ensure email is unique and password is provided |
| Dashboard shows blank | Check browser console for errors |
| Cannot change password | Ensure new password is 6+ characters |
| Session keeps expiring | Clear cookies and login again |

---

## 📞 Support

For detailed information, see `INSTRUCTOR_AUTH_SETUP.md`
