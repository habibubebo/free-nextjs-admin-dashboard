-- --------------------------------------------------------
-- Host:                         192.168.192.168
-- Server version:               10.2.30-MariaDB-log - mariadb.org binary distribution
-- Server OS:                    Win32
-- HeidiSQL Version:             12.17.1.1
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table db_lkp_test.akun
CREATE TABLE IF NOT EXISTS `akun` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `instructor_id` int(11) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'instructor',
  `password` text DEFAULT NULL,
  `nama` text DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_instructor_id` (`instructor_id`),
  UNIQUE KEY `unique_username` (`username`),
  CONSTRAINT `fk_akun_instruktur` FOREIGN KEY (`instructor_id`) REFERENCES `instruktur` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.instruktur
CREATE TABLE IF NOT EXISTS `instruktur` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `NamaInstruktur` text DEFAULT NULL,
  `Kelamin` text DEFAULT NULL,
  `Tempatlahir` text DEFAULT NULL,
  `Tanggallahir` text DEFAULT NULL,
  `Namaibu` text DEFAULT NULL,
  `Alamat` text DEFAULT NULL,
  `Email` text DEFAULT NULL,
  `Id_ins` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.log
CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.lulusan
CREATE TABLE IF NOT EXISTS `lulusan` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nipd` int(6) DEFAULT NULL,
  `Tgllulus` date DEFAULT NULL,
  `Tglcetak` date DEFAULT NULL,
  `Instruktur` int(11) DEFAULT NULL,
  `n1` text DEFAULT NULL,
  `n2` text DEFAULT NULL,
  `n3` text DEFAULT NULL,
  `n4` text DEFAULT NULL,
  `n5` text DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.notes
CREATE TABLE IF NOT EXISTS `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jenis` varchar(50) NOT NULL DEFAULT '',
  `data` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.pegawai
CREATE TABLE IF NOT EXISTS `pegawai` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nipg` int(11) unsigned DEFAULT NULL,
  `NamaPegawai` varchar(50) NOT NULL,
  `Kelamin` varchar(50) NOT NULL,
  `TempatLahir` varchar(50) NOT NULL,
  `TanggalLahir` date NOT NULL,
  `Alamat` varchar(50) NOT NULL,
  `Email` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.peserta
CREATE TABLE IF NOT EXISTS `peserta` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nama` text DEFAULT NULL,
  `Kelamin` text DEFAULT NULL,
  `Nipd` int(6) DEFAULT NULL,
  `Nik` text DEFAULT NULL,
  `Nokk` text DEFAULT NULL,
  `Jeniskursus` int(11) DEFAULT NULL,
  `Kelas` text DEFAULT NULL,
  `Tglmasuk` date DEFAULT NULL,
  `Ttl` varchar(50) DEFAULT NULL,
  `Status` int(1) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Nipd` (`Nipd`)
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.presensi
CREATE TABLE IF NOT EXISTS `presensi` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Tgl` datetime NOT NULL,
  `Nipd` int(11) NOT NULL,
  `Peserta` int(11) DEFAULT NULL,
  `Jeniskursus` int(11) DEFAULT 0,
  `Instruktur` int(11) NOT NULL DEFAULT 0,
  `Materi` varchar(50) NOT NULL DEFAULT '',
  `Pegawai` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_presensi_peserta` (`Peserta`),
  CONSTRAINT `FK_presensi_peserta` FOREIGN KEY (`Peserta`) REFERENCES `peserta` (`Nipd`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3672 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.profil
CREATE TABLE IF NOT EXISTS `profil` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Namalkp` text NOT NULL,
  `Alamat` text DEFAULT NULL,
  `Kelurahan` text DEFAULT NULL,
  `Kecamatan` text DEFAULT NULL,
  `Kota` text DEFAULT NULL,
  `Provinsi` text DEFAULT NULL,
  `Rt` text DEFAULT NULL,
  `Rw` text DEFAULT NULL,
  `Kodepos` text DEFAULT NULL,
  `Namayayasan` text DEFAULT NULL,
  `Telepon` text DEFAULT NULL,
  `Nofax` text DEFAULT NULL,
  `Email` text DEFAULT NULL,
  `Website` varchar(255) DEFAULT NULL,
  `Logo` varchar(500) DEFAULT NULL,
  `Warna_Primary` varchar(7) DEFAULT '#3C4D69',
  `Kepala` varchar(255) DEFAULT NULL,
  `NIP_Kepala` varchar(100) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Npsn` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.rombel
CREATE TABLE IF NOT EXISTS `rombel` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Namarombel` text DEFAULT NULL,
  `Kelas` text DEFAULT NULL,
  `Jumlahpeserta` text DEFAULT NULL,
  `Ruangan` text DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.sapras
CREATE TABLE IF NOT EXISTS `sapras` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Jenissarana` text NOT NULL,
  `Namaprasarana` text NOT NULL,
  `Nosertifikat` text NOT NULL,
  `Panjang` text NOT NULL,
  `Lebar` text NOT NULL,
  `Luaslahan` text NOT NULL,
  `kondisi` text NOT NULL,
  `Banyaknya` text NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table db_lkp_test.unitkompetensi
CREATE TABLE IF NOT EXISTS `unitkompetensi` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Rombel` int(11) NOT NULL,
  `Uk1` text NOT NULL,
  `Uk2` text NOT NULL,
  `Uk3` text NOT NULL,
  `Uk4` text NOT NULL,
  `Uk5` text NOT NULL,
  `Jp1` text NOT NULL,
  `Jp2` text NOT NULL,
  `Jp3` text NOT NULL,
  `Jp4` text NOT NULL,
  `Jp5` text NOT NULL,
  `Jptotal` text NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
