# Akun Table - Clarification

## 📋 Penjelasan Struktur

Tabel `akun` **HANYA** untuk menyimpan kredensial login (username dan password), **BUKAN** untuk menyimpan data instruktur.

## 🗄️ Database Structure

### Tabel Instruktur (Data Profil)
```sql
CREATE TABLE `instruktur` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `NamaInstruktur` text,           -- Nama instruktur
  `Kelamin` text,                  -- Jenis kelamin
  `Tempatlahir` text,              -- Tempat lahir
  `Tanggallahir` text,             -- Tanggal lahir
  `Namaibu` text,                  -- Nama ibu
  `Alamat` text,                   -- Alamat
  `Email` text,                    -- Email
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

### Tabel Akun (Kredensial Login SAJA)
```sql
CREATE TABLE `akun` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `instructor_id` INT(11) DEFAULT NULL,  -- Foreign key ke instruktur
  `username` text,                       -- Username untuk login
  `password` text,                       -- Password (SHA256 hashed)
  `nama` text,                           -- Nama (copy dari instruktur)
  PRIMARY KEY (`id`),
  FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

## 📊 Relationship

```
instruktur table (Data Profil)
┌─────────────────────────────────────┐
│ Id=1                                │
│ NamaInstruktur=John Doe             │
│ Kelamin=Laki-laki                   │
│ Tempatlahir=Jakarta                 │
│ Tanggallahir=1990-01-01             │
│ Namaibu=Jane Doe                    │
│ Alamat=Jl. Merdeka 123              │
│ Email=john@email.com                │
└─────────────────────────────────────┘
         ↓ (Foreign Key)
akun table (Kredensial Login)
┌─────────────────────────────────────┐
│ id=1                                │
│ instructor_id=1                     │
│ username=john_doe                   │
│ password=a1b2c3d4... (hashed)       │
│ nama=John Doe                       │
└─────────────────────────────────────┘
```

## 🔄 Data Flow

### Add Instructor
```
Admin Form
├─ Nama, Kelamin, Tempat Lahir, dll
├─ Username (untuk login)
└─ Password (untuk login)
    ↓
1. INSERT INTO instruktur (Nama, Kelamin, ...)
   → Get instructor_id
2. INSERT INTO akun (instructor_id, username, password, nama)
```

### Edit Instructor
```
Admin Form
├─ Update Nama, Kelamin, Tempat Lahir, dll
├─ Update Username (optional)
└─ Update Password (optional)
    ↓
1. UPDATE instruktur SET Nama=?, Kelamin=?, ...
2. UPDATE akun SET username=?, password=?, nama=?
   (WHERE instructor_id = ?)
```

### Delete Instructor
```
Admin Delete
    ↓
1. DELETE FROM akun WHERE instructor_id = ?
   (Cascade delete)
2. DELETE FROM instruktur WHERE Id = ?
```

### Login
```
Username + Password
    ↓
SELECT * FROM akun 
JOIN instruktur ON akun.instructor_id = instruktur.Id
WHERE akun.username = ? AND akun.password = ?
    ↓
Get instructor data + session
```

## 📍 Query untuk Menampilkan Data Instruktur

```sql
-- Menampilkan semua instruktur dengan username (jika ada)
SELECT i.Id, i.NamaInstruktur, i.Kelamin, i.Tempatlahir, i.Tanggallahir, 
       i.Namaibu, i.Alamat, i.Email, a.username
FROM instruktur i
LEFT JOIN akun a ON i.Id = a.instructor_id
ORDER BY i.NamaInstruktur ASC;
```

**Penjelasan:**
- `LEFT JOIN` digunakan agar instruktur tanpa akun tetap ditampilkan
- `a.username` akan NULL jika instruktur belum memiliki akun login
- Data profil instruktur selalu ditampilkan dari tabel `instruktur`

## ✨ Fitur

### Instruktur Tanpa Akun Login
- Instruktur dapat ditambahkan tanpa username/password
- Data profil tetap tersimpan di tabel `instruktur`
- Tidak bisa login sampai akun dibuat

### Instruktur Dengan Akun Login
- Instruktur memiliki username dan password di tabel `akun`
- Dapat login ke sistem
- Data profil tetap di tabel `instruktur`

### Edit Instruktur
- Edit profil: Update tabel `instruktur`
- Edit username/password: Update tabel `akun`
- Keduanya dapat dilakukan secara terpisah

## 🔐 Security

- Username dan password hanya di tabel `akun`
- Data profil di tabel `instruktur` tidak terenkripsi
- Foreign key menjaga integritas data
- Cascade delete otomatis menghapus akun saat instruktur dihapus

## 📂 Code Implementation

### getInstructors() - Menampilkan Data Instruktur
```typescript
export async function getInstructors(): Promise<Instructor[]> {
  try {
    const [rows] = await db.query(
      `SELECT i.Id, i.NamaInstruktur, i.Kelamin, i.Tempatlahir, i.Tanggallahir, 
              i.Namaibu, i.Alamat, i.Email, a.username
       FROM instruktur i
       LEFT JOIN akun a ON i.Id = a.instructor_id
       ORDER BY i.NamaInstruktur ASC`
    );
    return rows as Instructor[];
  } catch (error) {
    console.error(error);
    return [];
  }
}
```

### addInstructor() - Tambah Instruktur
```typescript
export async function addInstructor(data: Omit<Instructor, "Id">) {
  try {
    // 1. Insert ke tabel instruktur (data profil)
    const [result] = await db.query(
      "INSERT INTO instruktur (NamaInstruktur, Kelamin, ...) VALUES (...)",
      [data.NamaInstruktur, data.Kelamin, ...]
    );
    
    const instructorId = (result as any).insertId;
    
    // 2. Insert ke tabel akun (kredensial login) - OPTIONAL
    if (data.username && data.password) {
      await createInstructorAccount(instructorId, data.username, data.password, data.NamaInstruktur);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### updateInstructor() - Edit Instruktur
```typescript
export async function updateInstructor(id: number, data: Omit<Instructor, "Id">) {
  try {
    // 1. Update tabel instruktur (data profil)
    await db.query(
      "UPDATE instruktur SET NamaInstruktur=?, Kelamin=?, ... WHERE Id=?",
      [data.NamaInstruktur, data.Kelamin, ..., id]
    );
    
    // 2. Update tabel akun (kredensial login) - OPTIONAL
    if (data.username) {
      await updateInstructorAccount(id, data.username, data.password || null, data.NamaInstruktur);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### deleteInstructor() - Hapus Instruktur
```typescript
export async function deleteInstructor(id: number) {
  try {
    // 1. Delete dari tabel akun (cascade delete)
    await deleteInstructorAccount(id);
    
    // 2. Delete dari tabel instruktur
    await db.query("DELETE FROM instruktur WHERE Id=?", [id]);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

## 🧪 Testing

### Test 1: Tambah Instruktur Tanpa Akun
```
1. Go to /admin/instructors
2. Click Add Instructor
3. Fill: Name, Gender, Birth info, Email
4. Leave Username dan Password kosong
5. Click Save
6. Instruktur ditampilkan di list (tanpa username)
```

### Test 2: Tambah Instruktur Dengan Akun
```
1. Go to /admin/instructors
2. Click Add Instructor
3. Fill: Name, Gender, Birth info, Email, Username, Password
4. Click Save
5. Instruktur ditampilkan di list (dengan username)
6. Dapat login dengan username/password
```

### Test 3: Edit Instruktur
```
1. Go to /admin/instructors
2. Click Edit pada instruktur
3. Update: Name, Gender, atau Username/Password
4. Click Save
5. Data terupdate di tabel instruktur dan/atau akun
```

### Test 4: Delete Instruktur
```
1. Go to /admin/instructors
2. Click Delete pada instruktur
3. Instruktur dihapus dari list
4. Akun login juga dihapus (cascade delete)
```

## ✅ Checklist

- [x] Tabel `instruktur` menyimpan data profil
- [x] Tabel `akun` menyimpan kredensial login SAJA
- [x] Foreign key relationship bekerja
- [x] LEFT JOIN menampilkan semua instruktur
- [x] Instruktur tanpa akun tetap ditampilkan
- [x] Instruktur dengan akun dapat login
- [x] Edit profil dan edit akun terpisah
- [x] Delete instruktur cascade delete akun
- [x] Menu instruktur menampilkan data dengan benar

## 📚 Related Files

- `src/app/actions/instructorActions.ts` - CRUD operations
- `src/app/actions/authActions.ts` - Authentication
- `src/app/(admin)/instructors/InstructorClient.tsx` - Admin UI
- `migrate_instructor_akun.sql` - Database migration

---

**Status:** ✅ Clarified and Fixed
