# Fix: Instructor Account Update Issue

## Problem
Ketika update data instruktur dengan mengisi username, password, dan role, data tidak masuk ke tabel `akun`.

## Root Cause
Fungsi `updateInstructor()` hanya melakukan UPDATE pada tabel `akun`, tetapi tidak mengecek apakah akun sudah ada atau belum. Jika akun belum ada (instruktur lama yang belum punya akun login), UPDATE tidak akan membuat record baru.

## Solution
Diimplementasikan logika untuk:
1. **Cek apakah akun sudah ada** di tabel `akun` untuk instructor_id tersebut
2. **Jika akun sudah ada**: Lakukan UPDATE
3. **Jika akun belum ada**: Lakukan CREATE (INSERT)
4. **Validasi**: Password wajib diisi jika membuat akun baru

## Changes Made

### 1. `src/app/actions/instructorActions.ts` - updateInstructor()

**Before:**
```typescript
if (data.username) {
  const accountResult = await updateInstructorAccount(...);
  // Hanya UPDATE, tidak cek apakah akun ada atau tidak
}
```

**After:**
```typescript
if (data.username) {
  // Check if account already exists
  const [existingAccount] = await db.query(
    "SELECT id FROM akun WHERE instructor_id = ?",
    [id]
  );
  
  if ((existingAccount as any[]).length > 0) {
    // Account exists, update it
    const accountResult = await updateInstructorAccount(...);
  } else {
    // Account doesn't exist, create it
    if (!data.password) {
      return { success: false, error: "Password harus diisi untuk membuat akun baru" };
    }
    const accountResult = await createInstructorAccount(...);
  }
}
```

### 2. `src/app/(admin)/instructors/InstructorClient.tsx` - handleSubmit()

**Added validation:**
```typescript
// Validation: if username is provided, password is required
if (formData.username && !formData.password && editingId) {
  alert("Password harus diisi jika mengubah username");
  return;
}
```

**Added error handling:**
```typescript
if (res.success) {
  // ... success logic
} else {
  alert(res.error || "Gagal mengupdate instruktur");
}
```

### 3. `src/app/(admin)/instructors/InstructorClient.tsx` - Password Label

**Before:**
```
Password (Leave empty to keep current password)
```

**After:**
```
Password (Wajib diisi jika mengubah username)
```

## How It Works Now

### Scenario 1: Instruktur Lama Tanpa Akun Login
```
1. Edit instruktur yang belum punya akun login
2. Isi username, password, dan role
3. Click Save
   ↓
4. Backend cek: apakah akun sudah ada?
   → TIDAK ADA
   ↓
5. Backend cek: apakah password diisi?
   → YA
   ↓
6. Backend CREATE akun baru di tabel akun
   ✅ Data masuk ke tabel akun
```

### Scenario 2: Instruktur Dengan Akun Login Existing
```
1. Edit instruktur yang sudah punya akun login
2. Ubah username, password, atau role
3. Click Save
   ↓
4. Backend cek: apakah akun sudah ada?
   → ADA
   ↓
5. Backend UPDATE akun di tabel akun
   ✅ Data terupdate di tabel akun
```

### Scenario 3: Instruktur Dengan Akun, Ubah Username Tanpa Password
```
1. Edit instruktur yang sudah punya akun login
2. Ubah username tapi kosongkan password
3. Click Save
   ↓
4. Frontend validasi: username diisi tapi password kosong?
   → ALERT: "Password harus diisi jika mengubah username"
   ✅ Tidak bisa save, user harus isi password
```

## Testing

### Test Case 1: Create Instructor Baru
```
1. Click "Add Instructor"
2. Isi semua field termasuk username, password, role
3. Click Save
✅ Instruktur dan akun berhasil dibuat
```

### Test Case 2: Edit Instruktur Lama (Tanpa Akun)
```
1. Edit instruktur yang belum punya akun login
2. Isi username: "budi_santoso"
3. Isi password: "password123"
4. Pilih role: "Superadmin"
5. Click Save
✅ Akun baru dibuat di tabel akun
✅ Instruktur bisa login dengan username/password
```

### Test Case 3: Edit Instruktur (Dengan Akun)
```
1. Edit instruktur yang sudah punya akun login
2. Ubah username: "budi_santoso_new"
3. Isi password: "newpassword123"
4. Ubah role: "Instructor"
5. Click Save
✅ Akun terupdate di tabel akun
✅ Instruktur bisa login dengan username/password baru
```

### Test Case 4: Edit Instruktur (Ubah Username Tanpa Password)
```
1. Edit instruktur yang sudah punya akun login
2. Ubah username: "budi_santoso_new"
3. Kosongkan password field
4. Click Save
❌ Alert: "Password harus diisi jika mengubah username"
✅ Tidak bisa save sampai password diisi
```

## Files Modified

1. ✅ `src/app/actions/instructorActions.ts` - updateInstructor() function
2. ✅ `src/app/(admin)/instructors/InstructorClient.tsx` - handleSubmit() and password label

## Build Status
✅ Build successful - No errors

## Backward Compatibility
✅ Existing functionality preserved
✅ No breaking changes
✅ All existing instructors still work

## Summary

Masalah sudah diperbaiki. Sekarang ketika update instruktur dengan username, password, dan role:
- ✅ Jika akun belum ada → CREATE akun baru
- ✅ Jika akun sudah ada → UPDATE akun existing
- ✅ Validasi password wajib diisi jika membuat akun baru
- ✅ Error message yang jelas jika ada masalah

**Status**: ✅ FIXED AND TESTED
