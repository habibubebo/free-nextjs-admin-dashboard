-- Add email and password columns to instruktur table if they don't exist
ALTER TABLE `instruktur` ADD COLUMN `Password` VARCHAR(255) DEFAULT NULL AFTER `Email`;

-- Create index on Email for faster login queries
ALTER TABLE `instruktur` ADD UNIQUE INDEX `Email_unique` (`Email`(100));
