-- Migration script to fix presensi table structure
-- Run this on your database to update the Jeniskursus column type

ALTER TABLE `presensi` MODIFY COLUMN `Jeniskursus` INT(11) DEFAULT NULL;
