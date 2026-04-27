# Instructor Authentication Setup Guide

## Overview
This guide explains the new instructor login and authentication system that has been implemented.

## Database Changes

### Migration Script
Run the migration script to add password column to the instruktur table:

```sql
-- File: migrate_instructor_auth.sql
ALTER TABLE `instruktur` ADD COLUMN `Password` VARCHAR(255) DEFAULT NULL AFTER `Email`;
ALTER TABLE `instruktur` ADD UNIQUE INDEX `Email_unique` (`Email`(100));
```

**Steps:**
1. Open your database management tool (phpMyAdmin, MySQL Workbench, etc.)
2. Execute the SQL commands from `migrate_instructor_auth.sql`
3. This adds a `Password` column and creates a unique index on `Email`

## Features Implemented

### 1. Instructor Login Page
- **URL:** `/instructor-login`
- **Features:**
  - Email and password login
  - Error handling and validation
  - Responsive design
  - Redirects to dashboard on successful login

### 2. Instructor Dashboard / Profile Page
- **URL:** `/instructor-dashboard`
- **Features:**
  - Displays logged-in instructor's profile information
  - Shows: Name, Email, Gender, Birth Place, Birth Date, Mother's Name, Address
  - Quick stats showing status and ID
  - Change password functionality
  - Logout button

### 3. Instructor Management (Admin)
- **Location:** `/admin/instructors`
- **Updates:**
  - Added password field to the Add/Edit modal
  - When adding: Password is required
  - When editing: Password field is optional (leave empty to keep current password)
  - Passwords are hashed using SHA256 before storing

### 4. Authentication System
- **Session Management:**
  - Uses HTTP-only cookies for security
  - Session expires after 7 days
  - Automatic redirect to login if session expires

- **Password Security:**
  - Passwords are hashed using SHA256
  - Never stored in plain text
  - Unique email constraint prevents duplicate accounts

## File Structure

```
src/
├── app/
│   ├── actions/
│   │   ├── authActions.ts          # Authentication functions
│   │   └── instructorActions.ts    # Updated with password handling
│   ├── instructor-login/
│   │   ├── page.tsx
│   │   └── InstructorLoginClient.tsx
│   ├── instructor-dashboard/
│   │   ├── page.tsx
│   │   └── InstructorDashboardClient.tsx
│   └── (admin)/
│       └── instructors/
│           └── InstructorClient.tsx # Updated with password field
├── middleware.ts                    # Route protection
└── lib/
    └── db.ts                        # Database connection
```

## Usage Instructions

### For Administrators

#### Adding a New Instructor with Login Credentials
1. Go to `/admin/instructors`
2. Click "Add Instructor"
3. Fill in all fields including:
   - Name
   - Gender
   - Birth Place & Date
   - Mother's Name
   - Address
   - **Email** (must be unique)
   - **Password** (required for new instructors)
4. Click "Save"

#### Editing Instructor Information
1. Go to `/admin/instructors`
2. Click "Edit" on the instructor
3. Update any fields
4. To change password: Enter new password in the Password field
5. To keep current password: Leave Password field empty
6. Click "Save"

### For Instructors

#### First Time Login
1. Go to `/instructor-login`
2. Enter your email
3. Enter your password (provided by administrator)
4. Click "Login"
5. You'll be redirected to your dashboard

#### Accessing Your Profile
1. After login, you're automatically on the dashboard
2. Your profile information is displayed
3. Click "Ubah Password" to change your password

#### Changing Your Password
1. On the dashboard, click "Ubah Password"
2. Enter your new password
3. Confirm the new password
4. Click "Simpan"
5. Password will be updated immediately

#### Logout
1. Click "Logout" button on the dashboard
2. You'll be redirected to the login page

## Security Notes

1. **Password Hashing:** All passwords are hashed using SHA256 before storage
2. **Session Security:** Sessions use HTTP-only cookies and are secure in production
3. **Email Uniqueness:** Each instructor must have a unique email address
4. **Route Protection:** Dashboard routes are protected by middleware
5. **HTTPS:** In production, ensure HTTPS is enabled for secure transmission

## API Endpoints (Server Actions)

### Authentication Actions (`src/app/actions/authActions.ts`)

```typescript
// Login
loginInstructor(email: string, password: string)
// Returns: { success: boolean, instructor?: InstructorSession, error?: string }

// Logout
logoutInstructor()
// Returns: { success: boolean }

// Get Current Session
getCurrentSession()
// Returns: InstructorSession | null

// Update Password
updateInstructorPassword(instructorId: number, newPassword: string)
// Returns: { success: boolean, error?: string }

// Check Email Exists
checkEmailExists(email: string, excludeId?: number)
// Returns: boolean
```

### Instructor Actions (`src/app/actions/instructorActions.ts`)

```typescript
// Add Instructor (with password)
addInstructor(data: Omit<Instructor, "Id">)

// Update Instructor (password optional)
updateInstructor(id: number, data: Omit<Instructor, "Id">)

// Delete Instructor
deleteInstructor(id: number)

// Get All Instructors
getInstructors()
```

## Troubleshooting

### "Email atau password salah" error
- Verify the email is correct
- Check that the password is correct
- Ensure the instructor account exists in the database

### "Email sudah terdaftar" error (when adding)
- The email is already used by another instructor
- Use a different email address

### Session expires
- Sessions expire after 7 days
- User will be redirected to login page
- Login again to create a new session

### Password not updating
- Ensure new password is at least 6 characters
- Confirm password must match new password
- Check database permissions

## Future Enhancements

Possible improvements:
1. Email verification for new accounts
2. Password reset via email
3. Two-factor authentication
4. Login history/audit log
5. Account lockout after failed attempts
6. Password strength requirements
7. Session management (view active sessions)
8. Remember me functionality

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the database migration script
3. Verify all files are in correct locations
4. Check browser console for error messages
5. Review server logs for detailed errors
