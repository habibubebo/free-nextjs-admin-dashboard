# Role-Based Access Control - Quick Start Guide

## What's New?

Your instructor system now has **two roles**:

### 🔴 Superadmin
- Access to ALL features
- Can manage instructors, students, attendance, reports, etc.
- Full system control

### 🔵 Instructor  
- Access to ONLY attendance page
- Can record attendance for students
- Cannot access admin features

## How to Use

### 1. Run the Database Migration

Copy and paste this command in phpMyAdmin SQL tab:

```sql
ALTER TABLE `akun` ADD COLUMN `role` VARCHAR(50) DEFAULT 'instructor' AFTER `instructor_id`;
```

**Important**: Run it ONE TIME only.

### 2. Create Instructors with Roles

Go to **Instructors** menu:

1. Click **"Add Instructor"**
2. Fill in all fields (Name, Gender, Email, etc.)
3. Enter **Username** and **Password** for login
4. Select **Role**:
   - Choose "Instructor" for regular instructors (default)
   - Choose "Superadmin" for admin users
5. Click **Save**

### 3. Edit Instructor Role

1. Go to **Instructors** menu
2. Click **Edit** on any instructor
3. Change the **Role** dropdown
4. Click **Save**

The instructor will have the new role on next login.

### 4. Login and Test

**For Superadmin:**
- Login with superadmin credentials
- See all menu items (Instructors, Students, Attendance, Reports, etc.)
- Dashboard shows "Superadmin" in Role card

**For Instructor:**
- Login with instructor credentials
- See ONLY "Attendance" menu item
- Dashboard shows "Instructor" in Role card
- Trying to access other pages redirects to dashboard

## What Changed in the Code

### Instructor Table
- New **Role** column showing instructor's role
- Color-coded badges (Red=Superadmin, Blue=Instructor)

### Instructor Modal
- New **Role** dropdown field
- Default: "Instructor"
- Options: "Instructor", "Superadmin"

### Dashboard
- **Role** card shows actual role (was showing "Penuh" before)
- Red text for Superadmin
- Green text for Instructor

### Database
- `akun` table now has `role` column
- Stores: 'superadmin' or 'instructor'
- Default: 'instructor'

## Access Control Rules

| Feature | Superadmin | Instructor |
|---------|-----------|-----------|
| Instructors | ✅ | ❌ |
| Students | ✅ | ❌ |
| Attendance | ✅ | ✅ |
| Attendance Report | ✅ | ❌ |
| Rombel | ✅ | ❌ |
| Sapras | ✅ | ❌ |
| Unit Kompetensi | ✅ | ❌ |
| Dashboard | ✅ | ✅ |

## Troubleshooting

**Q: I see "Unknown column 'role'" error**
A: Run the migration script in phpMyAdmin

**Q: Instructor can access admin pages**
A: 
1. Check if migration was run
2. Verify role is set in instructor modal
3. Clear browser cookies and login again

**Q: Role doesn't show in table**
A: Refresh the page or clear browser cache

**Q: Can't change role**
A: Make sure you're logged in as superadmin

## Files Changed

- `src/app/actions/authActions.ts` - Role in login
- `src/app/actions/instructorActions.ts` - Role in instructor management
- `src/app/(admin)/instructors/InstructorClient.tsx` - Role field in UI
- `src/app/instructor-dashboard/InstructorDashboardClient.tsx` - Role display
- `migrate_add_role.sql` - Database migration

## Next Steps

1. ✅ Run migration script
2. ✅ Create test instructors with different roles
3. ✅ Test login with each role
4. ✅ Verify access control works
5. ✅ Update existing instructors' roles as needed

---

**Need Help?** Check `RBAC_IMPLEMENTATION_COMPLETE.md` for detailed documentation.
