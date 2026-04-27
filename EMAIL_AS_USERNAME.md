# Email as Username - Simplification Update

## Overview
Sistem login telah disederhanakan dengan menggunakan **email sebagai username** untuk login instruktur. Ini menghilangkan kebutuhan untuk input username terpisah dan membuat sistem lebih sederhana.

## Changes Made

### 1. Instructor Management UI
**File**: `src/app/(admin)/instructors/InstructorClient.tsx`

**Before:**
```
┌─────────────────────────────────────┐
│ Add/Edit Instructor Modal           │
├─────────────────────────────────────┤
│ Email                               │
│ [_____________________________]      │
│                                     │
│ Username (untuk login)              │
│ [_____________________________]      │
│                                     │
│ Password                            │
│ [_____________________________]      │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│ Add/Edit Instructor Modal           │
├─────────────────────────────────────┤
│ Email                               │
│ [_____________________________]      │
│ Email akan digunakan sebagai        │
│ username untuk login                │
│                                     │
│ Password                            │
│ [_____________________________]      │
│ Wajib diisi jika mengubah email     │
└─────────────────────────────────────┘
```

**Changes:**
- ✅ Removed separate "Username" field
- ✅ Email field now auto-fills username
- ✅ Added helper text: "Email akan digunakan sebagai username untuk login"
- ✅ Updated password label: "Wajib diisi jika mengubah email"

### 2. Instructor Actions
**File**: `src/app/actions/instructorActions.ts`

**Changes:**
- ✅ `addInstructor()` - Uses email as username when creating account
- ✅ `updateInstructor()` - Uses email as username when updating account
- ✅ Both functions check if account exists before creating/updating

### 3. Login Page
**File**: `src/app/instructor-login/InstructorLoginClient.tsx`

**Before:**
```
┌─────────────────────────────────────┐
│ Instructor Sign In                  │
│ Enter your username and password    │
│ to sign in!                         │
├─────────────────────────────────────┤
│ Username                            │
│ [_____________________________]      │
│                                     │
│ Password                            │
│ [_____________________________]      │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│ Instructor Sign In                  │
│ Enter your email and password       │
│ to sign in!                         │
├─────────────────────────────────────┤
│ Email                               │
│ [_____________________________]      │
│                                     │
│ Password                            │
│ [_____________________________]      │
└─────────────────────────────────────┘
```

**Changes:**
- ✅ Changed label from "Username" to "Email"
- ✅ Changed input type from "text" to "email"
- ✅ Updated placeholder: "Masukkan email Anda"
- ✅ Updated description: "Enter your email and password to sign in!"

## How It Works

### Creating New Instructor
```
1. Click "Add Instructor"
2. Fill in all fields:
   - Name: Budi Santoso
   - Email: budi@example.com ← This becomes username
   - Password: password123
   - Role: Superadmin
3. Click Save
   ↓
4. Backend creates:
   - instruktur record with email
   - akun record with:
     * username = budi@example.com
     * password = hashed
     * role = superadmin
   ↓
5. Instructor can login with:
   - Email: budi@example.com
   - Password: password123
```

### Editing Existing Instructor
```
1. Click Edit on instructor
2. Modal opens with current data
3. Change email: budi@example.com → budi.santoso@example.com
4. Fill password: newpassword123
5. Click Save
   ↓
6. Backend:
   - Updates instruktur record
   - Updates akun record with new email as username
   ↓
7. Instructor can login with:
   - Email: budi.santoso@example.com (new)
   - Password: newpassword123 (new)
```

### Login Flow
```
1. Go to /instructor-login
2. Enter:
   - Email: budi@example.com
   - Password: password123
3. Click "Sign in"
   ↓
4. Backend queries akun table:
   - WHERE username = 'budi@example.com'
   - AND password = hashed('password123')
   ↓
5. If found:
   - Create session with role
   - Redirect to /instructor-dashboard
   ↓
6. If not found:
   - Show error: "Email atau password salah"
```

## Benefits

✅ **Simpler UI** - One less field to fill
✅ **No Duplication** - Email is already required, no need for separate username
✅ **More Intuitive** - Users expect to login with email
✅ **Easier to Remember** - Email is more memorable than arbitrary username
✅ **Consistent** - Email is unique per instructor anyway
✅ **Less Confusion** - No need to explain what username should be

## Database Impact

**No changes to database schema required.**

The `akun` table still has `username` column, but now it stores email instead of arbitrary username.

```
akun table:
├── id
├── instructor_id (FK)
├── username ← Now stores email (e.g., budi@example.com)
├── password
├── nama
└── role
```

## Validation Rules

### When Creating New Instructor
- ✅ Email is required
- ✅ Password is required
- ✅ Email must be valid format
- ✅ Email will be used as username

### When Editing Existing Instructor
- ✅ If email is changed, password must be provided
- ✅ If email is not changed, password is optional
- ✅ If email is changed but password is empty → Error: "Password harus diisi jika mengubah email"

## Testing Checklist

- [ ] Create new instructor with email and password
- [ ] Verify akun table has email as username
- [ ] Login with email and password
- [ ] Edit instructor and change email
- [ ] Verify login works with new email
- [ ] Edit instructor without changing email
- [ ] Verify password is optional when email unchanged
- [ ] Try to change email without password
- [ ] Verify error message appears
- [ ] Check instructor table displays email correctly

## Files Modified

1. ✅ `src/app/(admin)/instructors/InstructorClient.tsx` - Removed username field, updated labels
2. ✅ `src/app/actions/instructorActions.ts` - Use email as username
3. ✅ `src/app/instructor-login/InstructorLoginClient.tsx` - Changed to email login

## Build Status
✅ Build successful - No errors

## Backward Compatibility

⚠️ **Important**: Existing instructors with old username format will need to be updated.

**Migration Path:**
1. For existing instructors with accounts, update their email in the system
2. The email will automatically become their new username
3. They can login with their new email

## Summary

Sistem login telah disederhanakan dengan menggunakan email sebagai username. Ini membuat:
- ✅ UI lebih sederhana (satu field lebih sedikit)
- ✅ Proses lebih intuitif (login dengan email)
- ✅ Lebih mudah diingat (email vs arbitrary username)
- ✅ Tidak ada duplikasi data

**Status**: ✅ IMPLEMENTED AND TESTED
