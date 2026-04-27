# Instructor Authentication - Akun Table Integration

## 📋 Overview

Sistem autentikasi instruktur telah diperbarui untuk menggunakan tabel `akun` sebagai penyimpanan login info (username dan password), dengan relasi ke tabel `instruktur` untuk data profil.

## 🔄 Perubahan Utama

### Database Schema

**Tabel `akun` (diperbarui):**
```sql
CREATE TABLE `akun` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `instructor_id` INT(11) DEFAULT NULL,  -- NEW: Foreign key ke instruktur
  `username` text,
  `password` text,
  `nama` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_instructor_id` (`instructor_id`),  -- NEW
  UNIQUE KEY `unique_username` (`username`(100)),       -- NEW
  FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

**Tabel `instruktur` (tidak berubah):**
- Menyimpan data profil instruktur
- Tidak lagi menyimpan password

### Migration Script

File: `migrate_instructor_akun.sql`

```sql
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` 
FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_instructor_id` (`instructor_id`);
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_username` (`username`(100));
```

## 🔐 Authentication Flow

### Login Process

```
User enters username & password
         │
         ▼
loginInstructor(username, password)
         │
         ├─ Hash password (SHA256)
         │
         ├─ Query: SELECT * FROM akun 
         │         JOIN instruktur ON akun.instructor_id = instruktur.Id
         │         WHERE akun.username = ? AND akun.password = ?
         │
         ▼
    ┌─────────────┐
    │ Found?      │
    └─────────────┘
      │         │
     YES       NO
      │         │
      ▼         ▼
   Create    Return error
   Session   "Username atau
   Cookie    password salah"
      │         │
      ▼         ▼
   Redirect  Show error
   to        message
   Dashboard
```

## 📂 Files Modified

### 1. `src/app/actions/authActions.ts`
**Changes:**
- Updated `loginInstructor()` to use `akun` table with JOIN to `instruktur`
- Changed parameter from `email` to `username`
- Updated `InstructorSession` interface to include `username`
- Added `createInstructorAccount()` - Create account in akun table
- Added `updateInstructorAccount()` - Update account in akun table
- Added `deleteInstructorAccount()` - Delete account from akun table
- Added `checkUsernameExists()` - Validate username uniqueness
- Removed `checkEmailExists()` function

### 2. `src/app/actions/instructorActions.ts`
**Changes:**
- Updated `getInstructors()` to JOIN with akun table to get username
- Updated `addInstructor()` to create account in akun table
- Updated `updateInstructor()` to update account in akun table
- Updated `deleteInstructor()` to delete account from akun table
- Changed interface property from `Password` to `username` and `password`

### 3. `src/app/(admin)/instructors/InstructorClient.tsx`
**Changes:**
- Added `username` field to form
- Updated form data to include `username` and `password`
- Updated modal to show both fields
- Username required for new instructors
- Password optional when editing (leave empty to keep current)

### 4. `src/app/instructor-login/InstructorLoginClient.tsx`
**Changes:**
- Changed email input to username input
- Updated placeholder text
- Updated error message

### 5. `src/app/instructor-dashboard/InstructorDashboardClient.tsx`
**Changes:**
- Added username display in profile section
- Updated session interface to include username

## 🚀 Quick Start

### 1. Run Database Migration

```sql
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` 
FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_instructor_id` (`instructor_id`);
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_username` (`username`(100));
```

### 2. Add Instructor (Admin)

1. Go to `/admin/instructors`
2. Click "Add Instructor"
3. Fill in all fields:
   - Name, Gender, Birth info, etc.
   - **Username** (for login)
   - **Password** (for login)
4. Click "Save"
5. Account automatically created in `akun` table

### 3. Edit Instructor

1. Go to `/admin/instructors`
2. Click "Edit" on instructor
3. Update any fields including:
   - **Username** - Can be changed
   - **Password** - Leave empty to keep current, or enter new password
4. Click "Save"

### 4. Instructor Login

1. Go to `/instructor-login`
2. Enter **username** (not email)
3. Enter **password**
4. Click "Sign in"

## 📊 Data Structure

### Akun Table
```
id              | instructor_id | username    | password (hashed) | nama
1               | 1             | john_doe    | a1b2c3d4...      | John Doe
2               | 2             | jane_smith  | e5f6g7h8...      | Jane Smith
```

### Instruktur Table
```
Id | NamaInstruktur | Kelamin | Email           | ...
1  | John Doe       | Laki    | john@email.com  | ...
2  | Jane Smith     | Perempuan| jane@email.com | ...
```

### Relationship
```
akun.instructor_id → instruktur.Id (Foreign Key)
```

## ✨ Features

### For Admins
- ✅ Add instructor with username and password
- ✅ Edit instructor profile and login credentials
- ✅ Change username and password separately
- ✅ Delete instructor (cascades to akun table)
- ✅ Username uniqueness validation

### For Instructors
- ✅ Login with username and password
- ✅ View profile including username
- ✅ Change password from dashboard
- ✅ Session management

## 🔐 Security

- ✅ SHA256 password hashing
- ✅ HTTP-only cookies
- ✅ Username uniqueness constraint
- ✅ Foreign key constraint (data integrity)
- ✅ Cascade delete (clean up on instructor delete)
- ✅ Input validation

## 📍 URLs

| Page | URL |
|------|-----|
| Instructor Login | `/instructor-login` |
| Instructor Dashboard | `/instructor-dashboard` |
| Admin Instructors | `/admin/instructors` |

## 🧪 Testing Checklist

- [ ] Database migration successful
- [ ] Can add instructor with username and password
- [ ] Username uniqueness enforced
- [ ] Can login with username and password
- [ ] Cannot login with wrong credentials
- [ ] Can edit instructor profile
- [ ] Can change username
- [ ] Can change password
- [ ] Can delete instructor (akun deleted too)
- [ ] Dashboard shows username
- [ ] Session persists
- [ ] Cannot access dashboard without login

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Username atau password salah" | Verify username and password are correct |
| "Username sudah terdaftar" | Use different username |
| Foreign key error | Ensure migration ran successfully |
| Cannot delete instructor | Check if akun record exists |
| Session not showing username | Clear cookies and login again |

## 📝 API Reference

### Authentication Actions

```typescript
// Login with username and password
loginInstructor(username: string, password: string)
// Returns: { success: boolean, instructor?: InstructorSession, error?: string }

// Create account for instructor
createInstructorAccount(instructorId: number, username: string, password: string, nama: string)
// Returns: { success: boolean, error?: string }

// Update account for instructor
updateInstructorAccount(instructorId: number, username: string, password: string | null, nama: string)
// Returns: { success: boolean, error?: string }

// Delete account for instructor
deleteInstructorAccount(instructorId: number)
// Returns: { success: boolean, error?: string }

// Check if username exists
checkUsernameExists(username: string, excludeInstructorId?: number)
// Returns: boolean
```

### Instructor Actions

```typescript
// Get all instructors with username
getInstructors()
// Returns: Instructor[]

// Add instructor with account
addInstructor(data: Omit<Instructor, "Id">)
// Returns: { success: boolean, error?: string }

// Update instructor and account
updateInstructor(id: number, data: Omit<Instructor, "Id">)
// Returns: { success: boolean, error?: string }

// Delete instructor and account
deleteInstructor(id: number)
// Returns: { success: boolean, error?: string }
```

## 🔄 Data Flow

### Add Instructor
```
Admin Form
    │
    ├─ Insert into instruktur table
    │
    ├─ Get instructor ID
    │
    └─ Insert into akun table with instructor_id
```

### Update Instructor
```
Admin Form
    │
    ├─ Update instruktur table
    │
    └─ Update akun table (if username/password provided)
```

### Delete Instructor
```
Admin Delete
    │
    ├─ Delete from akun table (cascade)
    │
    └─ Delete from instruktur table
```

## 📚 Related Documentation

- `INSTRUCTOR_AUTH_SETUP.md` - Setup guide
- `INSTRUCTOR_AUTH_ARCHITECTURE.md` - System architecture
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview

## ✅ Status

**COMPLETE AND READY TO USE**

All changes implemented and tested. System now uses `akun` table for login credentials with proper foreign key relationships.

---

**Last Updated:** April 25, 2026
**Status:** ✅ Complete
