-- Add role column to akun table
-- Role: 'superadmin' (akses semua fitur) atau 'instructor' (hanya attendance)
ALTER TABLE `akun` ADD COLUMN `role` VARCHAR(50) DEFAULT 'instructor' AFTER `instructor_id`;

-- Update existing accounts to superadmin (untuk backward compatibility)
UPDATE `akun` SET `role` = 'superadmin' WHERE `role` IS NULL OR `role` = '';
