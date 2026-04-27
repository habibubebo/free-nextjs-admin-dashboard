# Migration Instructions - Akun Table

## ⚠️ Error

```
Unknown column 'a.instructor_id' in 'on clause'
```

## 🔧 Solusi Cepat

Jalankan SQL berikut di database Anda:

```sql
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_instructor_id` (`instructor_id`);
ALTER TABLE `akun` ADD UNIQUE INDEX `unique_username` (`username`(100));
```

## 📍 Cara Menjalankan

### Option 1: phpMyAdmin
1. Buka phpMyAdmin
2. Pilih database `db_lkp`
3. Klik tab "SQL"
4. Paste SQL di atas
5. Klik "Go"

### Option 2: MySQL Command Line
```bash
mysql -u root -p db_lkp < migrate_instructor_akun.sql
```

### Option 3: MySQL Workbench
1. Buka MySQL Workbench
2. Buat query baru
3. Paste SQL di atas
4. Klik "Execute"

## ✅ Verifikasi

Setelah migration, jalankan:

```sql
DESCRIBE akun;
```

Seharusnya ada kolom `instructor_id`.

## 🎯 Selesai

Setelah migration berhasil:
1. Refresh aplikasi
2. Buka `/admin/instructors`
3. Data instruktur akan ditampilkan

---

**Dokumentasi lengkap:** `FIX_AKUN_TABLE_MIGRATION.md`
