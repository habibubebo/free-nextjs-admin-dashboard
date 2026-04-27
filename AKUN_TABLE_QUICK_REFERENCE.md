# Akun Table Integration - Quick Reference

## 🎯 Ringkasan

Sistem autentikasi instruktur sekarang menggunakan tabel `akun` untuk menyimpan login info (username & password) dengan relasi ke tabel `instruktur` untuk data profil.

## 🗄️ Database

### Tabel Akun (Updated)
```sql
CREATE TABLE `akun` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `instructor_id` INT(11) DEFAULT NULL,  -- Foreign key
  `username` text UNIQUE,                 -- Login username
  `password` text,                        -- SHA256 hashed
  `nama` text,                            -- Instructor name
  PRIMARY KEY (`id`),
  FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

### Migration
```sql
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` 
FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_instructor_id` (`instructor_id`);
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_username` (`username`(100));
```

## 👨‍💼 Admin Operations

### Add Instructor
```
/admin/instructors → Add Instructor
├─ Name, Gender, Birth info, Email
├─ Username (required)
└─ Password (required)
→ Save → Account created in akun table
```

### Edit Instructor
```
/admin/instructors → Edit
├─ Update profile info
├─ Update Username (optional)
├─ Update Password (optional, leave empty to keep)
└─ Save → Account updated in akun table
```

### Delete Instructor
```
/admin/instructors → Delete
→ Instructor deleted
→ Account automatically deleted (cascade)
```

## 🔐 Instructor Login

```
/instructor-login
├─ Username (not email)
├─ Password
└─ Sign in → Redirect to dashboard
```

## 📊 Data Structure

```
akun table:
┌─────────────────────────────────────────┐
│ id=1, instructor_id=1, username=john_doe│
│ password=a1b2c3d4..., nama=John Doe    │
└─────────────────────────────────────────┘
         ↓ (Foreign Key)
instruktur table:
┌─────────────────────────────────────────┐
│ Id=1, NamaInstruktur=John Doe           │
│ Email=john@email.com, ...               │
└─────────────────────────────────────────┘
```

## 📍 URLs

| Page | URL |
|------|-----|
| Login | `/instructor-login` |
| Dashboard | `/instructor-dashboard` |
| Admin | `/admin/instructors` |

## ✨ Features

✅ Login dengan username dan password
✅ Admin edit username
✅ Admin edit password
✅ Username uniqueness
✅ Foreign key relationship
✅ Cascade delete
✅ SHA256 hashing
✅ Session management

## 🔐 Security

✅ SHA256 password hashing
✅ HTTP-only cookies
✅ Username unique constraint
✅ Foreign key constraint
✅ Cascade delete
✅ Input validation

## 📂 Files Modified

- `src/app/actions/authActions.ts` - Login logic
- `src/app/actions/instructorActions.ts` - CRUD operations
- `src/app/(admin)/instructors/InstructorClient.tsx` - Admin UI
- `src/app/instructor-login/InstructorLoginClient.tsx` - Login page
- `src/app/instructor-dashboard/InstructorDashboardClient.tsx` - Dashboard

## 📄 New Files

- `migrate_instructor_akun.sql` - Database migration
- `INSTRUCTOR_AKUN_INTEGRATION.md` - Full documentation

## 🧪 Quick Test

1. Run migration
2. Add instructor with username & password
3. Login with username
4. Edit instructor (change username/password)
5. Delete instructor (check akun deleted too)

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Username atau password salah" | Check username and password |
| "Username sudah terdaftar" | Use different username |
| Foreign key error | Run migration |
| Cannot delete | Check akun record exists |

## 📚 Documentation

- `INSTRUCTOR_AKUN_INTEGRATION.md` - Full documentation
- `INSTRUCTOR_AUTH_SETUP.md` - Setup guide
- `INSTRUCTOR_AUTH_ARCHITECTURE.md` - Architecture

---

**Status:** ✅ Complete and Ready
