-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 01, 2026 at 09:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_surfmate`
--

-- --------------------------------------------------------


CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `google_sub` varchar(64) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
INSERT INTO `admin` (`id_admin`, `nama`, `email`, `password`) VALUES
(1, 'admin', 'minwedi@surfmate.com', '$2y$10$JDYq50j2Tu5mf8CK9YBuyuHonvOaBZDU6IqDKq6RGX6yF7OKFM3CK');

-- --------------------------------------------------------
--

CREATE TABLE `paket` (
  `id_paket` int(11) NOT NULL,
  `nama_paket` varchar(255) DEFAULT NULL,
  `harga` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
INSERT INTO `paket` (`id_paket`, `nama_paket`, `harga`) VALUES
(1, 'Beginner (1 jam + papan)', 200000.00),
(2, 'Beginner+ (2 jam + papan)', 300000.00);

-- --------------------------------------------------------

--
-- Table structure for table `reservasi`
--

CREATE TABLE `reservasi` (
  `id_reservasi` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `id_paket` int(11) NOT NULL,
  `tanggal_reservasi` date NOT NULL,
  `no_hp` varchar(20) NOT NULL,
  `harga` decimal(10,2) NOT NULL,
  `status` enum('pending','complete') DEFAULT 'pending',
  `id_surfer` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservasi`
--

INSERT INTO `reservasi` (`id_reservasi`, `nama_lengkap`, `id_paket`, `tanggal_reservasi`, `no_hp`, `harga`, `status`, `id_surfer`) VALUES
(1, 'Test User', 1, '2026-01-02', '08123456789', 200000.00, 'pending', NULL),
(2, 'naufal', 1, '2026-02-02', '08123456789', 200000.00, 'pending', NULL),
(3, 'sehat', 2, '2026-01-03', '08121234567', 300000.00, 'pending', NULL),
(4, 'orang', 2, '2026-01-01', '08123452345', 300000.00, 'complete', NULL),
(5, 'Naufal Luthfi Maulana', 1, '2026-01-05', '08123456789', 200000.00, 'complete', 5),
(6, 'orang bernama naufal', 2, '2026-01-01', '08123456789', 300000.00, 'pending', 5),
(7, 'naufal', 1, '2026-01-01', '081', 200000.00, 'pending', 5);

-- --------------------------------------------------------

--
-- Table structure for table `surfer`
--

CREATE TABLE `surfer` (
  `id_surfer` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `google_sub` varchar(64) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `surfer`
--

INSERT INTO `surfer` (`id_surfer`, `name`, `email`, `password`) VALUES
(5, 'Naufal Luthfi Maulana', 'naufal@mail.com', '$2y$10$JcBPvUkPFdWFbfmWsnY1nuddlO/q2y9/ADTx36T1FDdrNKhzCRXRq');

-- --------------------------------------------------------

--
-- Table structure for table `ulasan`
--

CREATE TABLE `ulasan` (
  `id_ulasan` int(11) NOT NULL,
  `id_surfer` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `tgl_ulasan` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ulasan`
--

INSERT INTO `ulasan` (`id_ulasan`, `id_surfer`, `comment`, `tgl_ulasan`) VALUES
(3, 5, 'Halo, senang sekali bisa ikut dan belajar surfing di pantai wediombo', '2025-12-30 18:03:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `paket`
--
ALTER TABLE `paket`
  ADD PRIMARY KEY (`id_paket`);

--
-- Indexes for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD PRIMARY KEY (`id_reservasi`),
  ADD KEY `id_paket` (`id_paket`),
  ADD KEY `id_surfer` (`id_surfer`);

--
-- Indexes for table `surfer`
--
ALTER TABLE `surfer`
  ADD PRIMARY KEY (`id_surfer`);

--
-- Indexes for table `ulasan`
--
ALTER TABLE `ulasan`
  ADD PRIMARY KEY (`id_ulasan`),
  ADD KEY `id_surfer` (`id_surfer`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `paket`
--
ALTER TABLE `paket`
  MODIFY `id_paket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reservasi`
--
ALTER TABLE `reservasi`
  MODIFY `id_reservasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `surfer`
--
ALTER TABLE `surfer`
  MODIFY `id_surfer` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ulasan`
--
ALTER TABLE `ulasan`
  MODIFY `id_ulasan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD CONSTRAINT `reservasi_ibfk_1` FOREIGN KEY (`id_paket`) REFERENCES `paket` (`id_paket`),
  ADD CONSTRAINT `reservasi_ibfk_2` FOREIGN KEY (`id_surfer`) REFERENCES `surfer` (`id_surfer`);

--
-- Constraints for table `ulasan`
--
ALTER TABLE `ulasan`
  ADD CONSTRAINT `ulasan_ibfk_1` FOREIGN KEY (`id_surfer`) REFERENCES `surfer` (`id_surfer`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
