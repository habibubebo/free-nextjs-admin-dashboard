# Migration Steps - Akun Table (FIXED)

## ⚠️ Error yang Terjadi

```
SQL Error [1064] [42000]: You have an error in your SQL syntax
```

## 🔧 Penyebab

Perintah SQL dijalankan sekaligus tanpa separator yang benar. MariaDB memerlukan setiap perintah dijalankan terpisah.

## ✅ Solusi: Jalankan SATU PER SATU

### Step 1: Add Column instructor_id

```sql
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;
```

**Jalankan ini terlebih dahulu, tunggu selesai.**

### Step 2: Add Foreign Key

```sql
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` 
FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;
```

**Jalankan ini setelah Step 1 selesai.**

### Step 3: Add Unique Key untuk instructor_id

```sql
ALTER TABLE `akun` ADD UNIQUE KEY `unique_instructor_id` (`instructor_id`);
```

**Jalankan ini setelah Step 2 selesai.**

### Step 4: Add Unique Key untuk username

```sql
ALTER TABLE `akun` ADD UNIQUE KEY `unique_username` (`username`(100));
```

**Jalankan ini setelah Step 3 selesai.**

## 📍 Cara Menjalankan di phpMyAdmin

1. Buka phpMyAdmin
2. Pilih database `db_lkp`
3. Klik tab "SQL"
4. **Untuk setiap step:**
   - Hapus query sebelumnya
   - Paste query baru
   - Klik "Go"
   - Tunggu sampai selesai (lihat pesan sukses)
   - Lanjut ke step berikutnya

## ✅ Verifikasi Setiap Step

Setelah setiap step, jalankan:

```sql
DESCRIBE akun;
```

**Setelah Step 1:** Seharusnya ada kolom `instructor_id`
**Setelah Step 2:** Foreign key sudah terbuat
**Setelah Step 3:** Unique key untuk `instructor_id` sudah terbuat
**Setelah Step 4:** Unique key untuk `username` sudah terbuat

## 🎯 Hasil Akhir

Setelah semua 4 step selesai, struktur tabel `akun` seharusnya:

```
Field           | Type        | Null | Key | Default | Extra
id              | int(5)      | NO   | PRI | NULL    | auto_increment
instructor_id   | int(11)     | YES  | UNI | NULL    |
username        | text        | YES  | UNI | NULL    |
password        | text        | YES  |     | NULL    |
nama            | text        | YES  |     | NULL    |
```

## 🎉 Setelah Migration Selesai

1. Refresh aplikasi
2. Buka `/admin/instructors`
3. Data instruktur akan ditampilkan dengan benar
4. Dapat menambah, edit, dan delete instruktur
5. Dapat login dengan username dan password

---

**Penting:** Jalankan setiap perintah SQL SATU PER SATU, jangan sekaligus!
