-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: Jigsaw_Jam
-- ------------------------------------------------------
-- Server version	10.11.6-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Puzzles`
--

DROP TABLE IF EXISTS `Puzzles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Puzzles` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Tags` text NOT NULL,
  `Src` text NOT NULL,
  `Sizes` text NOT NULL,
  `Alt` text DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Puzzles`
--

LOCK TABLES `Puzzles` WRITE;
/*!40000 ALTER TABLE `Puzzles` DISABLE KEYS */;
INSERT INTO `Puzzles` VALUES
(1,'[\"animals\"]','cat-1.jpg','[\"6x8\", \"9x12\", \"12x16\"]',''),
(2,'[\"animals\"]','cat-2.jpg','[\"8x5\", \"12x8\", \"16x10\"]',''),
(3,'[\"space\"]','Space-6.jpg','[\"9x7\", \"14x11\", \"18x14\"]',''),
(4,'[\"space\"]','Space-5.jpg','[\"5x2\", \"10x4\", \"20x8\"]',''),
(5,'[\"space\"]','Space-4.jpg','[\"5x3\", \"10x6\", \"15x9\"]',''),
(6,'[\"space\"]','Space-3.jpg','[\"5x5\", \"7x7\", \"10x10\"]',''),
(7,'[\"space\"]','Space-2.jpg','[\"5x5\", \"7x7\", \"10x10\"]',''),
(8,'[\"nature\"]','Mountain-2.jpg','[\"6x4\", \"9x6\", \"12x8\"]',''),
(9,'[\"nature\"]','Mountain-3.jpg','[\"6x4\", \"9x6\", \"12x8\"]',''),
(10,'[\"nature\"]','Mountain-4.jpg','[\"6x4\", \"9x6\", \"12x8\"]',''),
(11,'[\"space\"]','Space-1.jpg','[\"8x4\", \"12x6\", \"16x8\"]',''),
(12,'[\"nature\"]','Mountain-1.jpg','[\"6x4\", \"9x6\", \"12x8\"]',''),
(13,'[\"animals\"]','Cat-3.jpg','[\"6x4\", \"9x6\", \"12x8\"]',''),
(14,'[\"animals\"]','Cat-4.jpg','[\"8x4\", \"12x6\", \"16x8\"]',''),
(15,'[\"food\"]','food-1.jpg','[\"5x5\", \"7x7\", \"10x10\"]',''),
(16,'[\"food\"]','food-7.jpg','[\"6x4\", \"9x5\", \"12x7\"]',''),
(17,'[\"food\"]','food-6.jpg','[\"6x4\", \"9x6\", \"12x8\"]',''),
(18,'[\"food\"]','food-5.jpg','[\"6x4\", \"9x5\", \"12x7\"]',''),
(19,'[\"food\"]','food-4.jpg','[\"7x11\", \"11x17\", \"14x22\"]',''),
(20,'[\"food\"]','food-3.jpg','[\"5x7\", \"10x14\", \"15x21\"]',''),
(21,'[\"food\"]','food-2.jpg','[\"4x6\", \"6x9\", \"8x12\"]','');
/*!40000 ALTER TABLE `Puzzles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` text NOT NULL,
  `Password` text NOT NULL,
  `Settings` text DEFAULT NULL,
  `SaveData` longtext DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES
(1,'username','password','','[{\"id\":1,\"width\":6,\"height\":8,\"saved\":true,\"completed\":true,\"completionData\":[{\"aX\":0,\"aY\":0,\"bX\":0,\"bY\":0},{\"aX\":1,\"aY\":0,\"bX\":1,\"bY\":0},{\"aX\":2,\"aY\":0,\"bX\":2,\"bY\":0}]},{\"id\":2,\"width\":12,\"height\":8,\"saved\":false,\"completed\":false,\"completionData\":[{\"aX\":0,\"aY\":1,\"bX\":1,\"bY\":1},{\"aX\":1,\"aY\":1,\"bX\":2,\"bY\":2},{\"aX\":2,\"aY\":1,\"bX\":3,\"bY\":3}]}]'),
(2,'ashley','lawton','','[{\"id\":1,\"width\":6,\"height\":8,\"saved\":true,\"completed\":true,\"completionData\":[{\"aX\":0,\"aY\":0,\"bX\":0,\"bY\":0},{\"aX\":1,\"aY\":0,\"bX\":1,\"bY\":0},{\"aX\":2,\"aY\":0,\"bX\":2,\"bY\":0}]},{\"id\":2,\"width\":12,\"height\":8,\"saved\":false,\"completed\":false,\"completionData\":[{\"aX\":0,\"aY\":1,\"bX\":1,\"bY\":1},{\"aX\":1,\"aY\":1,\"bX\":2,\"bY\":2},{\"aX\":2,\"aY\":1,\"bX\":3,\"bY\":3}]}]'),
(3,'jose','velazquez','','[{\"id\":1,\"width\":9,\"height\":12,\"saved\":true,\"completed\":true,\"completionData\":[{\"aX\":0,\"aY\":0,\"bX\":0,\"bY\":0},{\"aX\":1,\"aY\":0,\"bX\":1,\"bY\":0},{\"aX\":2,\"aY\":0,\"bX\":2,\"bY\":0}]},{\"id\":2,\"width\":8,\"height\":5,\"saved\":false,\"completed\":false,\"completionData\":[{\"aX\":0,\"aY\":1,\"bX\":1,\"bY\":1},{\"aX\":1,\"aY\":1,\"bX\":2,\"bY\":2},{\"aX\":2,\"aY\":1,\"bX\":3,\"bY\":3}]}]'),
(4,'jose','velazquez','','[{\"id\":1,\"width\":9,\"height\":12,\"saved\":true,\"completed\":true,\"completionData\":[{\"aX\":0,\"aY\":0,\"bX\":0,\"bY\":0},{\"aX\":1,\"aY\":0,\"bX\":1,\"bY\":0},{\"aX\":2,\"aY\":0,\"bX\":2,\"bY\":0}]},{\"id\":2,\"width\":8,\"height\":5,\"saved\":false,\"completed\":false,\"completionData\":[{\"aX\":0,\"aY\":1,\"bX\":1,\"bY\":1},{\"aX\":1,\"aY\":1,\"bX\":2,\"bY\":2},{\"aX\":2,\"aY\":1,\"bX\":3,\"bY\":3}]}]'),
(5,'jose','velazquez','','[{\"id\":1,\"width\":9,\"height\":12,\"saved\":true,\"completed\":true,\"completionData\":[{\"aX\":0,\"aY\":0,\"bX\":0,\"bY\":0},{\"aX\":1,\"aY\":0,\"bX\":1,\"bY\":0},{\"aX\":2,\"aY\":0,\"bX\":2,\"bY\":0}]},{\"id\":2,\"width\":8,\"height\":5,\"saved\":false,\"completed\":false,\"completionData\":[{\"aX\":0,\"aY\":1,\"bX\":1,\"bY\":1},{\"aX\":1,\"aY\":1,\"bX\":2,\"bY\":2},{\"aX\":2,\"aY\":1,\"bX\":3,\"bY\":3}]}]');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'Jigsaw_Jam'
--

--
-- Dumping routines for database 'Jigsaw_Jam'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-12 11:59:30
