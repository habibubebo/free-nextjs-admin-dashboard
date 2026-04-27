-- Add instructor_id column to akun table to link with instruktur table
ALTER TABLE `akun` ADD COLUMN `instructor_id` INT(11) DEFAULT NULL AFTER `id`;

-- Add foreign key constraint
ALTER TABLE `akun` ADD CONSTRAINT `fk_akun_instruktur` 
FOREIGN KEY (`instructor_id`) REFERENCES `instruktur`(`Id`) ON DELETE CASCADE;

-- Add unique constraint on instructor_id to ensure one account per instructor
ALTER TABLE `akun` ADD UNIQUE KEY `unique_instructor_id` (`instructor_id`);

-- Add unique constraint on username
ALTER TABLE `akun` ADD UNIQUE KEY `unique_username` (`username`(100));
