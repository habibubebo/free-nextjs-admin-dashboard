-- Add new columns to existing profil table
-- Run these one by one:

ALTER TABLE profil ADD COLUMN Website VARCHAR(255) AFTER Email;
ALTER TABLE profil ADD COLUMN Logo VARCHAR(500) AFTER Website;
ALTER TABLE profil ADD COLUMN Warna_Primary VARCHAR(7) DEFAULT '#3C4D69' AFTER Logo;
ALTER TABLE profil ADD COLUMN Kepala VARCHAR(255) AFTER Warna_Primary;
ALTER TABLE profil ADD COLUMN NIP_Kepala VARCHAR(100) AFTER Kepala;
ALTER TABLE profil ADD COLUMN CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP AFTER NIP_Kepala;
ALTER TABLE profil ADD COLUMN UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER CreatedAt;

-- Update existing record with default data if needed
UPDATE profil SET
    Website = 'www.lpcutama.com',
    Warna_Primary = '#3C4D69'
WHERE id = 1;