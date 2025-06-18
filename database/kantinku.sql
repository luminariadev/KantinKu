-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3307
-- Generation Time: Jun 11, 2025 at 01:04 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kantinku`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int NOT NULL,
  `admin_id` int NOT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int NOT NULL,
  `details` text,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `details`, `timestamp`) VALUES
(1, 1, 'update', 'menu', 99, 'Mengubah menu: Es Teh Pocong', '2025-06-10 23:24:38'),
(2, 1, 'update', 'menu', 99, 'Mengubah menu: Es Teh Poci', '2025-06-10 23:24:55');

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id_admin` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nama_admin` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id_admin`, `username`, `password_hash`, `nama_admin`) VALUES
(1, 'admin', '$2b$10$Z66mtdjvQ2s5KGaJhQs0ruo/Rwd1z0nliHJyOV13jVaPUpYg3c6am', 'Administrator');

-- --------------------------------------------------------

--
-- Table structure for table `favorite_menu`
--

CREATE TABLE `favorite_menu` (
  `id_favorite` int NOT NULL,
  `id_user` int NOT NULL,
  `id_menu` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int NOT NULL,
  `nama_kategori` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Makanan'),
(2, 'Minuman'),
(3, 'Jajanan');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id_menu` int NOT NULL,
  `id_warung` int NOT NULL,
  `id_kategori` int NOT NULL,
  `nama_menu` varchar(100) NOT NULL,
  `harga` decimal(10,2) NOT NULL,
  `deskripsi` text,
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id_menu`, `id_warung`, `id_kategori`, `nama_menu`, `harga`, `deskripsi`, `foto`) VALUES
(1, 5, 2, 'Kopi Susu', 6000.00, NULL, NULL),
(2, 5, 2, 'Kopi Gula Aren', 7000.00, NULL, NULL),
(3, 5, 2, 'Kopi Nusantara', 7000.00, NULL, NULL),
(4, 5, 2, 'Caramel Macchiato', 7000.00, NULL, NULL),
(5, 5, 2, 'Americano', 6000.00, NULL, NULL),
(6, 5, 2, 'Mocha Latte', 6000.00, NULL, NULL),
(7, 5, 2, 'Jeruk Mojito', 5000.00, NULL, NULL),
(8, 5, 2, 'Melon Mojito', 5000.00, NULL, NULL),
(9, 5, 2, 'Leci Mojito', 5000.00, NULL, NULL),
(10, 5, 2, 'Strawberry Mojito', 5000.00, NULL, NULL),
(11, 5, 2, 'Sunset', 7000.00, NULL, NULL),
(12, 5, 2, 'Hawaiian', 7000.00, NULL, NULL),
(13, 5, 2, 'Tropical', 7000.00, NULL, NULL),
(14, 5, 2, 'Hanami', 7000.00, NULL, NULL),
(15, 5, 2, 'Coklat', 7000.00, NULL, NULL),
(16, 5, 2, 'Vanilla', 7000.00, NULL, NULL),
(17, 5, 2, 'Strawberry', 7000.00, NULL, NULL),
(18, 5, 2, 'Mocha', 7000.00, NULL, NULL),
(19, 5, 2, 'Hazelnut', 7000.00, NULL, NULL),
(20, 5, 2, 'Melon', 7000.00, NULL, NULL),
(21, 5, 2, 'Leci', 7000.00, NULL, NULL),
(22, 5, 2, 'Gula Aren', 7000.00, NULL, NULL),
(23, 5, 2, 'AMK Original', 5000.00, NULL, NULL),
(24, 5, 2, 'AMK Creamy', 6000.00, NULL, NULL),
(25, 5, 2, 'AMK Strawberry', 6000.00, NULL, NULL),
(26, 5, 2, 'AMK Leci', 6000.00, NULL, NULL),
(27, 5, 2, 'AMK Melon', 6000.00, NULL, NULL),
(28, 5, 2, 'AMK Jeruk', 6000.00, NULL, NULL),
(29, 5, 2, 'AMK Oreo', 7000.00, NULL, NULL),
(30, 5, 2, 'AMK Mocha', 7000.00, NULL, NULL),
(31, 5, 2, 'Hazelnut', 10000.00, NULL, NULL),
(32, 5, 2, 'Choco Almond', 10000.00, NULL, NULL),
(33, 5, 2, 'Chocomilk', 10000.00, NULL, NULL),
(34, 5, 2, 'Cookies and Cream', 10000.00, NULL, NULL),
(35, 5, 2, 'Crumble Crunch', 10000.00, NULL, NULL),
(36, 5, 2, 'Valentine', 10000.00, NULL, NULL),
(37, 5, 2, 'Orange Cream', 10000.00, NULL, NULL),
(38, 5, 2, 'Green Line', 10000.00, NULL, NULL),
(39, 2, 1, 'Ayam Kongkow', 15000.00, 'ayam krispi mini saus tiram', NULL),
(40, 2, 1, 'Ayam Ala Ricis', 15000.00, 'ayam krispi saus asam manis + saus keju', NULL),
(41, 2, 1, 'Ayam Popcorn Saus Asam Manis', 15000.00, 'ayam krispi mini saus asam manis', NULL),
(42, 2, 1, 'Chicken Crispy Kretek', 15000.00, 'ayam krispi sambal bawang (ayam geprek)', NULL),
(43, 3, 1, 'Nasi Goreng Biasa', 12000.00, 'nasi goreng + krupuk', NULL),
(44, 3, 1, 'Nasi Goreng Ayam', 14000.00, 'nasi goreng + ayam + krupuk', NULL),
(45, 3, 1, 'Nasi Goreng Baso', 14000.00, 'nasi goreng + baso + krupuk', NULL),
(46, 3, 1, 'Nasi Goreng Sosis', 14000.00, 'nasi goreng + sosis + krupuk', NULL),
(47, 3, 1, 'Nasi Goreng Ati ampela', 15000.00, 'nasi goreng + ati ampela + krupuk', NULL),
(48, 3, 1, 'Nasi Goreng Spesial', 17000.00, 'nasi goreng + ayam + baso + sosis + ati ampela + krupuk', NULL),
(49, 3, 1, 'Nasi Gila Biasa', 12000.00, 'nasi putih + telur + sayuran + krupuk', NULL),
(50, 3, 1, 'Nasi Gila Ayam', 14000.00, 'nasi putih + telur + ayam + sayuran + krupuk', NULL),
(51, 3, 1, 'Nasi Gila Baso', 14000.00, 'nasi putih + telur + baso + sayuran + krupuk', NULL),
(52, 3, 1, 'Nasi Gila Sosis', 14000.00, 'nasi putih + telur + sosis + sayuran + krupuk', NULL),
(53, 3, 1, 'Nasi Gila Ati ampela', 15000.00, 'nasi putih + telur + ati ampela + sayuran + krupuk', NULL),
(54, 3, 1, 'Nasi Gila Spesial', 17000.00, 'nasi putih + telur + ayam + baso + sosis + ati ampela + sayuran + krupuk', NULL),
(55, 3, 1, 'Kwetiau Biasa', 12000.00, 'kwetiau + krupuk', NULL),
(56, 3, 1, 'Kwetiau Ayam', 14000.00, 'kwetiau + ayam + krupuk', NULL),
(57, 3, 1, 'Kwetiau Baso', 14000.00, 'kwetiau + baso + krupuk', NULL),
(58, 3, 1, 'Kwetiau Sosis', 14000.00, 'kwetiau + sosis + krupuk', NULL),
(59, 3, 1, 'Kwetiau Ati ampela', 15000.00, 'kwetiau + ati ampela + krupuk', NULL),
(60, 3, 1, 'Kwetiau Spesial', 17000.00, 'kwetiau + ayam + baso + sosis + ati ampela + krupuk', NULL),
(61, 3, 1, 'Mie Tektek Biasa', 12000.00, 'mie + telur + sayuran + krupuk', NULL),
(62, 3, 1, 'Mie Tektek Ayam', 14000.00, 'mie + telur + ayam + sayuran + krupuk', NULL),
(63, 3, 1, 'Mie Tektek Baso', 14000.00, 'mie + telur + baso + sayuran + krupuk', NULL),
(64, 3, 1, 'Mie Tektek Sosis', 14000.00, 'mie + telur + sosis + sayuran + krupuk', NULL),
(65, 3, 1, 'Mie Tektek Ati ampela', 15000.00, 'mie + telur + ati ampela + sayuran + krupuk', NULL),
(66, 3, 1, 'Mie Tektek Spesial', 17000.00, 'mie + telur + ayam + baso + sosis + ati ampela + sayuran + krupuk', NULL),
(67, 3, 1, 'Nasi Goreng Mawud', 14000.00, 'nasi goreng + telur + sayuran + krupuk', NULL),
(68, 3, 1, 'Nasi Goreng Otokowok', 15000.00, 'nasi goreng + telur dadar + sayuran + krupuk', NULL),
(69, 4, 1, 'Ayam Bakar Madu / Ayam Bakar Pedas', 15000.00, 'nasi + ayam bakar + lalapan + 1 tahu 1 tempe dan pilihan aneka sambal (merah/hijau/terasi)', NULL),
(70, 4, 1, 'Ayam Kremes', 15000.00, 'nasi + ayam goreng kremes + lalapan + 1 tahu 1 tempe dan pilihan aneka sambal (merah/hijau/terasi)', NULL),
(71, 4, 1, 'Ayam Penyet', 15000.00, 'nasi + ayam goreng dipenyet + lalapan + 1 tahu 1 tempe dan pilihan aneka sambal (merah/hijau/terasi)', NULL),
(72, 4, 1, 'Ayam Bumbu Lada Hitam', 15000.00, 'nasi + bumbu lada hitam + lalapan', NULL),
(73, 4, 1, 'Ayam Katsu', 15000.00, 'nasi + ayam katsu + pilihan aneka sambal (merah/hijau/terasi)', NULL),
(80, 7, 1, 'NASDAR CUMI', 20000.00, 'nasi putih hangat + telur dadar kritiing + sambal lauk cumi + kremesan + jukut goreng', NULL),
(81, 7, 1, 'NASDAR AYAM', 19000.00, 'nasi putih hangat + telur dadar kritiing + sambal lauk ayam + kremesan + jukut goreng', NULL),
(82, 7, 1, 'NASDAR TONGKOL', 19000.00, 'nasi putih hangat + telur dadar kritiing + sambal lauk ikan tongkol + kremesan + jukut goreng', NULL),
(83, 7, 1, 'Nasi Dadar Sambal', 15000.00, 'nasi putih hangat + telur dadar kritiing + sambal + kremesan + jukut goreng', NULL),
(84, 7, 1, 'Nasi Dadar', 15000.00, 'nasi putih hangat + telur dadar kritiing + kremesan + jukut goreng', NULL),
(85, 7, 1, 'Sambal Cumi', 8000.00, '', NULL),
(86, 7, 1, 'Sambal Ayam', 6000.00, '', NULL),
(87, 7, 1, 'Sambal Ikan Tongkol', 6000.00, '', NULL),
(88, 7, 1, 'Nasi Putih', 4000.00, '', NULL),
(89, 7, 1, 'Kremesan', 4000.00, '', NULL),
(90, 7, 1, 'Jukut Goreng', 4000.00, '', NULL),
(91, 7, 2, 'Es Jeruk', 8000.00, '', NULL),
(92, 7, 2, 'Es Teh Manis', 5000.00, '', NULL),
(93, 7, 2, 'Air Mineral 600 Ml', 5000.00, '', NULL),
(94, 8, 2, 'Original Single Scoop Cone', 5000.00, 'ice cream cone sajah', NULL),
(95, 8, 2, 'Ice Cream Cone (2 scoops)', 11000.00, '2 scoops + 2 toppings', NULL),
(96, 8, 2, 'Ice Cream Cone (3 scoops)', 13000.00, '3 scoops + 3 toppings', NULL),
(97, 8, 2, 'Ice Cream Cup (2 scoops)', 10000.00, '2 scoops + 2 toppings', NULL),
(98, 8, 2, 'Ice Cream Cup (3 scoops)', 12000.00, '3 scoops + 3 toppings', NULL),
(99, 1, 2, 'Es Teh Poci', 5000.00, '', NULL),
(100, 1, 2, 'Es Kopi', 6000.00, '', NULL),
(101, 1, 2, 'Milk', 7000.00, '', NULL),
(102, 1, 2, 'Juice', 8000.00, '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id_review` int NOT NULL,
  `id_user` int NOT NULL,
  `id_warung` int NOT NULL,
  `id_menu` int NOT NULL,
  `rating` int NOT NULL,
  `komentar` text,
  `tanggal` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`id_review`, `id_user`, `id_warung`, `id_menu`, `rating`, `komentar`, `tanggal`) VALUES
(33, 2, 1, 99, 5, 'Enak Pisan!', '2025-06-11 19:04:35');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nama` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `username`, `email`, `password_hash`, `nama`) VALUES
(1, 'testuser', 'test@example.com', '$2b$10$yougV9RxhyY.WQkhzm6Aj.Cm.xLpiq47dQjhG2TTjcKFDzrk4WoBa', 'Test User'),
(2, 'rizkianuari', 'rizkianuari88@gmail.com', '$2b$10$VRj.e.nf0cxHcxPb5reiveI9PfdaRI/.vP9BMPhON5v4VXjB4pSui', 'Rizkia Nuari Fujiana'),
(3, 'jaed', 'jaidunqoimun19@gmail.com', '$2a$10$tXVh0DG4X7M5LNyU9jZJkuaz0jlvi5ueMxhM/8M.eQ5F4LHUND9I2', 'Mang Jaed'),
(4, 'johndoe', 'john@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'John Doe'),
(5, 'janedoe', 'jane@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Jane Doe'),
(6, 'bobsmith', 'bob@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Bob Smith'),
(7, 'alicegreen', 'alice@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Alice Green'),
(8, 'mikebrown', 'mike@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Mike Brown'),
(9, 'johndoe', 'john@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'John Doe'),
(10, 'janedoe', 'jane@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Jane Doe'),
(11, 'bobsmith', 'bob@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Bob Smith'),
(12, 'alicegreen', 'alice@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Alice Green'),
(13, 'mikebrown', 'mike@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Mike Brown'),
(14, 'johndoe', 'john@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'John Doe'),
(15, 'janedoe', 'jane@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Jane Doe'),
(16, 'bobsmith', 'bob@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Bob Smith'),
(17, 'alicegreen', 'alice@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Alice Green'),
(18, 'mikebrown', 'mike@example.com', '$2a$10$XFxsAyYJ1xOC5Wz.R3Lsv.8MIpyyRsA0QUALrwQN9Vl7j0tCdBPSK', 'Mike Brown');

-- --------------------------------------------------------

--
-- Table structure for table `warung`
--

CREATE TABLE `warung` (
  `id_warung` int NOT NULL,
  `nama_warung` varchar(100) NOT NULL,
  `lokasi` varchar(100) NOT NULL,
  `deskripsi` text,
  `kontak` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `warung`
--

INSERT INTO `warung` (`id_warung`, `nama_warung`, `lokasi`, `deskripsi`, `kontak`, `foto`) VALUES
(1, 'Teh Poci', 'Kantin merah', 'Minuman panas dan dingin, capcin', '', NULL),
(2, 'Kantin Teh Teke', 'Kantin merah', 'Spesialis ayam krispi', '082125356692', NULL),
(3, 'Patuanan', 'Kantin merah', 'Spesialis Nasi goreng Otokowok', '08994133177', NULL),
(4, 'Mbak Annisa', 'Kantin merah', 'Makanan berat dan sambal juara', '08989548348', NULL),
(5, 'Ice Cube', 'Kantin merah', 'Spesialis es krim dan minuman segar', '08989548348', NULL),
(6, 'Bunda Gorowok', 'Kantin merah', 'Spesialis gorengan murah meriah', '08989548348', NULL),
(7, 'Barokah', 'Kantin merah', 'Menyediakan makanan berat dan ringan', '08989548348', NULL),
(8, 'Gera Ice Cream', 'Kantin merah', 'Spesialis ice cream berbagai rasa', '', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`);

--
-- Indexes for table `favorite_menu`
--
ALTER TABLE `favorite_menu`
  ADD PRIMARY KEY (`id_favorite`),
  ADD UNIQUE KEY `id_user` (`id_user`,`id_menu`),
  ADD KEY `id_menu` (`id_menu`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id_menu`),
  ADD KEY `id_warung` (`id_warung`),
  ADD KEY `id_kategori` (`id_kategori`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id_review`),
  ADD UNIQUE KEY `id_user` (`id_user`,`id_warung`),
  ADD KEY `id_warung` (`id_warung`),
  ADD KEY `fk_review_menu` (`id_menu`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`);

--
-- Indexes for table `warung`
--
ALTER TABLE `warung`
  ADD PRIMARY KEY (`id_warung`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `favorite_menu`
--
ALTER TABLE `favorite_menu`
  MODIFY `id_favorite` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id_menu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `id_review` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `warung`
--
ALTER TABLE `warung`
  MODIFY `id_warung` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id_admin`);

--
-- Constraints for table `favorite_menu`
--
ALTER TABLE `favorite_menu`
  ADD CONSTRAINT `favorite_menu_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `favorite_menu_ibfk_2` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`);

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`id_warung`) REFERENCES `warung` (`id_warung`),
  ADD CONSTRAINT `menu_ibfk_2` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`);

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `fk_review_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`),
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `review_ibfk_2` FOREIGN KEY (`id_warung`) REFERENCES `warung` (`id_warung`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
