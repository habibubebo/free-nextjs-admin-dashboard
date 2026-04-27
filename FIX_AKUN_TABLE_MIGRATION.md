# Fix: Akun Table Migration

## ⚠️ Error

```
Unknown column 'a.instructor_id' in 'on clause'
```

## 🔧 Penyebab

Kolom `instructor_id` belum ditambahkan ke tabel `akun`. Anda perlu menjalankan migration script.

## ✅ Solusi

### Step 1: Jalankan Migration Script

Buka database management tool Anda (phpMyAdmin, MySQL Workbench, atau command line) dan jalankan perintah berikut:

```sql
-- Add instructor_id column to akun table
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;

-- Add foreign key constraint
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` 
FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;

-- Add unique constraint on instructor_id
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_instructor_id` (`instructor_id`);

-- Add unique constraint on username
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_username` (`username`(100));
```

### Step 2: Verifikasi Struktur Tabel

Setelah migration, verifikasi struktur tabel `akun`:

```sql
DESCRIBE akun;
```

Output yang diharapkan:
```
Field           | Type        | Null | Key | Default | Extra
id              | int(5)      | NO   | PRI | NULL    | auto_increment
instructor_id   | int(11)     | YES  | UNI | NULL    |
username        | text        | YES  | UNI | NULL    |
password        | text        | YES  |     | NULL    |
nama            | text        | YES  |     | NULL    |
```

### Step 3: Refresh Aplikasi

Setelah migration berhasil, refresh aplikasi Anda:

1. Buka `/admin/instructors`
2. Data instruktur sekarang akan ditampilkan dengan benar

## 📝 Penjelasan Setiap Perintah

### 1. Add Column
```sql
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;
```
- Menambahkan kolom `instructor_id` ke tabel `akun`
- Tipe: INT(11)
- Default: NULL (instruktur dapat ditambahkan tanpa akun)
- Posisi: Setelah kolom `id`

### 2. Add Foreign Key
```sql
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` 
FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;
```
- Membuat relasi antara `akun.instructor_id` dan `instruktur.Id`
- `ON DELETE CASCADE`: Saat instruktur dihapus, akun otomatis dihapus

### 3. Add Unique Index on instructor_id
```sql
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_instructor_id` (`instructor_id`);
```
- Memastikan satu instruktur hanya memiliki satu akun
- Mencegah duplikasi

### 4. Add Unique Index on username
```sql
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_username` (`username`(100));
```
- Memastikan username unik
- Mencegah dua instruktur memiliki username yang sama

## 🗄️ Struktur Tabel Setelah Migration

### Tabel akun
```
┌─────────────────────────────────────────┐
│ id (PK)                                 │
│ instructor_id (FK, UNIQUE)              │
│ username (UNIQUE)                       │
│ password                                │
│ nama                                    │
└─────────────────────────────────────────┘
```

### Tabel instruktur
```
┌─────────────────────────────────────────┐
│ Id (PK)                                 │
│ NamaInstruktur                          │
│ Kelamin                                 │
│ Tempatlahir                             │
│ Tanggallahir                            │
│ Namaibu                                 │
│ Alamat                                  │
│ Email                                   │
└─────────────────────────────────────────┘
```

## 🔄 Relationship Setelah Migration

```
instruktur (1) ←→ (1) akun
  ↓
  instruktur.Id = akun.instructor_id
```

## 📍 Query yang Akan Bekerja

Setelah migration, query ini akan bekerja dengan benar:

```sql
SELECT i.Id, i.NamaInstruktur, i.Kelamin, i.Tempatlahir, i.Tanggallahir, 
       i.Namaibu, i.Alamat, i.Email, a.username
FROM instruktur i
LEFT JOIN akun a ON i.Id = a.instructor_id
ORDER BY i.NamaInstruktur ASC;
```

## ✅ Checklist

- [ ] Buka database management tool
- [ ] Jalankan migration script
- [ ] Verifikasi struktur tabel `akun`
- [ ] Refresh aplikasi
- [ ] Cek `/admin/instructors` - data ditampilkan
- [ ] Coba tambah instruktur
- [ ] Coba edit instruktur
- [ ] Coba delete instruktur

## 🧪 Testing Setelah Migration

### Test 1: Lihat Data Instruktur
```
1. Go to /admin/instructors
2. Lihat list instruktur
3. Seharusnya menampilkan semua instruktur
```

### Test 2: Tambah Instruktur
```
1. Click Add Instructor
2. Fill: Name, Gender, Birth info, Email, Username, Password
3. Click Save
4. Instruktur ditampilkan di list
5. Akun dibuat di tabel akun
```

### Test 3: Edit Instruktur
```
1. Click Edit pada instruktur
2. Update: Name atau Username/Password
3. Click Save
4. Data terupdate
```

### Test 4: Login
```
1. Go to /instructor-login
2. Enter username dan password
3. Click Sign in
4. Redirect ke dashboard
```

## 🐛 Troubleshooting

### Error: "Unknown column 'instructor_id'"
- Migration belum dijalankan
- Jalankan migration script di atas

### Error: "Duplicate entry for key 'unique_instructor_id'"
- Ada instruktur dengan multiple akun
- Bersihkan data duplikat terlebih dahulu

### Error: "Cannot add foreign key constraint"
- Tabel `instruktur` tidak ada atau struktur berbeda
- Pastikan tabel `instruktur` sudah ada dengan kolom `Id`

## 📚 Related Files

- `migrate_instructor_akun.sql` - Migration script
- `AKUN_TABLE_CLARIFICATION.md` - Penjelasan struktur
- `src/app/actions/instructorActions.ts` - Query yang menggunakan migration

---

**Status:** ⚠️ Pending Migration

Jalankan migration script di atas untuk menyelesaikan setup.
