-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ai_fitness
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL,
  `lastLoginIP` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_admin_user1` FOREIGN KEY (`id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'192.168.1.2');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluationcriteria`
--

DROP TABLE IF EXISTS `evaluationcriteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluationcriteria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `positionID` int NOT NULL,
  `operator` varchar(2) DEFAULT NULL,
  `angle` int DEFAULT NULL,
  `errorMessage` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_evaluationCriteria_position1_idx` (`positionID`),
  CONSTRAINT `fk_evaluationCriteria_position1` FOREIGN KEY (`positionID`) REFERENCES `position` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluationcriteria`
--

LOCK TABLES `evaluationcriteria` WRITE;
/*!40000 ALTER TABLE `evaluationcriteria` DISABLE KEYS */;
INSERT INTO `evaluationcriteria` VALUES (261,6,'>=',65,'Cánh tay bạn đang hơi cao, hãy hạ xuống!'),(266,46,'>=',35,'Bạn đang ngồi quá sâu!'),(267,46,'>=',135,'Bạn đang ngồi quá sâu!');
/*!40000 ALTER TABLE `evaluationcriteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise`
--

DROP TABLE IF EXISTS `exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `minAge` int NOT NULL,
  `maxAge` int NOT NULL,
  `calo` double NOT NULL,
  `lastTrainResult` double DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (27,'Cuốn tạ đơn (tay phải)',15,100,0.1,1,'uploads/exercise/27/model.json'),(30,'Cuốn tạ đơn (tay trái)',15,100,0.1,0.9629629850387573,'uploads/exercise/30/model.json'),(43,'Hít đất',15,100,0.1,0.9230770468711853,'uploads/exercise/43/model.json'),(44,'Squat',15,100,0.1,1,'uploads/exercise/44/model.json');
/*!40000 ALTER TABLE `exercise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exerciselevel`
--

DROP TABLE IF EXISTS `exerciselevel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exerciselevel` (
  `exerciseID` int NOT NULL,
  `level` int NOT NULL,
  `set` int NOT NULL,
  `rep` int NOT NULL,
  PRIMARY KEY (`exerciseID`,`level`),
  CONSTRAINT `fk_exerciseLevel_exercise1` FOREIGN KEY (`exerciseID`) REFERENCES `exercise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exerciselevel`
--

LOCK TABLES `exerciselevel` WRITE;
/*!40000 ALTER TABLE `exerciselevel` DISABLE KEYS */;
INSERT INTO `exerciselevel` VALUES (27,1,1,10),(27,2,2,20),(27,3,3,30),(30,1,1,10),(30,2,2,20),(30,3,3,30),(43,1,1,10),(43,2,2,20),(43,3,3,30),(44,1,1,10),(44,2,2,20),(44,3,3,30);
/*!40000 ALTER TABLE `exerciselevel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `joint`
--

DROP TABLE IF EXISTS `joint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `joint` (
  `id` int NOT NULL,
  `evaluationCriteriaID` int NOT NULL,
  `order` int NOT NULL,
  PRIMARY KEY (`id`,`evaluationCriteriaID`),
  KEY `fk_joint_evaluationCriteria1_idx` (`evaluationCriteriaID`),
  CONSTRAINT `fk_joint_evaluationCriteria1` FOREIGN KEY (`evaluationCriteriaID`) REFERENCES `evaluationcriteria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `joint`
--

LOCK TABLES `joint` WRITE;
/*!40000 ALTER TABLE `joint` DISABLE KEYS */;
INSERT INTO `joint` VALUES (12,261,1),(14,261,0),(23,266,0),(24,261,2),(24,267,0),(25,266,1),(26,267,1),(27,266,2),(28,267,2);
/*!40000 ALTER TABLE `joint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jointlist`
--

DROP TABLE IF EXISTS `jointlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jointlist` (
  `id` int NOT NULL,
  `resultID` int NOT NULL,
  `order` int NOT NULL,
  PRIMARY KEY (`id`,`resultID`),
  KEY `fk_jointList_result1_idx` (`resultID`),
  CONSTRAINT `fk_jointList_result1` FOREIGN KEY (`resultID`) REFERENCES `result` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jointlist`
--

LOCK TABLES `jointlist` WRITE;
/*!40000 ALTER TABLE `jointlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `jointlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `muscle`
--

DROP TABLE IF EXISTS `muscle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `muscle` (
  `id` int NOT NULL,
  `exerciseID` int NOT NULL,
  PRIMARY KEY (`id`,`exerciseID`),
  KEY `fk_muscle_exercise1_idx` (`exerciseID`),
  CONSTRAINT `fk_muscle_exercise1` FOREIGN KEY (`exerciseID`) REFERENCES `exercise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `muscle`
--

LOCK TABLES `muscle` WRITE;
/*!40000 ALTER TABLE `muscle` DISABLE KEYS */;
INSERT INTO `muscle` VALUES (0,27),(1,27),(5,27),(0,30),(1,30),(5,30),(0,43),(1,43),(2,43),(7,43),(7,44),(8,44),(9,44),(10,44),(11,44);
/*!40000 ALTER TABLE `muscle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `position` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exerciseID` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `order` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_position_exercise1_idx` (`exerciseID`),
  CONSTRAINT `fk_position_exercise1` FOREIGN KEY (`exerciseID`) REFERENCES `exercise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
INSERT INTO `position` VALUES (4,27,'Đứng thẳng',0),(5,27,'Cuốn tới giữa',1),(6,27,'Cuốn cao',2),(13,30,'Đứng thẳng',0),(14,30,'Cuốn giữa',0),(15,30,'Cuốn cao',0),(41,43,'Chống cao',0),(42,43,'Chống giữa',1),(43,43,'Chống sát đất',2),(44,44,'Đứng thẳng',0),(45,44,'Squat giữa',1),(46,44,'Squat ngồi',2);
/*!40000 ALTER TABLE `position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `result` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scheduleDetailID` int NOT NULL,
  `set` int NOT NULL,
  `rep` int NOT NULL,
  `positionName` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `actualAngle` int NOT NULL,
  `errorMessage` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_result_scheduleDetail1_idx` (`scheduleDetailID`),
  CONSTRAINT `fk_result_scheduleDetail1` FOREIGN KEY (`scheduleDetailID`) REFERENCES `scheduledetail` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `result`
--

LOCK TABLES `result` WRITE;
/*!40000 ALTER TABLE `result` DISABLE KEYS */;
/*!40000 ALTER TABLE `result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `traineeID` int NOT NULL,
  `level` int NOT NULL,
  `isTraining` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_schedule_trainee1_idx` (`traineeID`),
  CONSTRAINT `fk_schedule_trainee1` FOREIGN KEY (`traineeID`) REFERENCES `trainee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (46,17,3,1),(47,19,2,0),(48,19,1,0),(49,19,1,0),(50,19,1,0),(51,19,1,0),(52,19,1,0),(53,19,1,0),(54,19,2,1);
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduledetail`
--

DROP TABLE IF EXISTS `scheduledetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduledetail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scheduleID` int NOT NULL,
  `exerciseID` int NOT NULL,
  `set` int NOT NULL,
  `rep` int NOT NULL,
  `isTrained` int NOT NULL DEFAULT '0',
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_exercise_has_schedule_schedule1_idx` (`scheduleID`),
  KEY `fk_exercise_has_schedule_exercise1_idx` (`exerciseID`),
  CONSTRAINT `fk_exercise_has_schedule_exercise1` FOREIGN KEY (`exerciseID`) REFERENCES `exercise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exercise_has_schedule_schedule1` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1954 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduledetail`
--

LOCK TABLES `scheduledetail` WRITE;
/*!40000 ALTER TABLE `scheduledetail` DISABLE KEYS */;
INSERT INTO `scheduledetail` VALUES (1462,46,27,4,32,0,'2025-09-08'),(1463,46,30,4,32,0,'2025-09-08'),(1465,46,27,4,32,0,'2025-09-10'),(1466,46,30,4,32,0,'2025-09-10'),(1468,46,27,4,32,0,'2025-09-12'),(1469,46,30,4,32,0,'2025-09-12'),(1471,46,27,4,32,0,'2025-09-15'),(1472,46,30,4,32,0,'2025-09-15'),(1474,46,27,4,32,0,'2025-09-17'),(1475,46,30,4,32,0,'2025-09-17'),(1477,46,27,4,32,0,'2025-09-19'),(1478,46,30,4,32,0,'2025-09-19'),(1480,46,27,4,32,0,'2025-09-22'),(1481,46,30,4,32,0,'2025-09-22'),(1483,46,27,4,32,0,'2025-09-24'),(1484,46,30,4,32,0,'2025-09-24'),(1486,46,27,4,32,0,'2025-09-26'),(1487,46,30,4,32,0,'2025-09-26'),(1489,46,27,4,32,0,'2025-09-29'),(1490,46,30,4,32,0,'2025-09-29'),(1492,46,27,4,32,0,'2025-10-01'),(1493,46,30,4,32,0,'2025-10-01'),(1495,46,27,4,32,0,'2025-10-03'),(1496,46,30,4,32,0,'2025-10-03'),(1498,46,27,4,32,0,'2025-10-06'),(1499,46,30,4,32,0,'2025-10-06'),(1501,46,27,4,32,0,'2025-10-08'),(1502,46,30,4,32,0,'2025-10-08'),(1504,46,27,4,32,0,'2025-10-10'),(1505,46,30,4,32,0,'2025-10-10'),(1507,46,27,4,32,0,'2025-10-13'),(1508,46,30,4,32,0,'2025-10-13'),(1510,46,27,4,32,0,'2025-10-15'),(1511,46,30,4,32,0,'2025-10-15'),(1513,46,27,4,32,0,'2025-10-17'),(1514,46,30,4,32,0,'2025-10-17'),(1516,47,27,1,12,0,'2025-09-08'),(1517,47,30,1,12,0,'2025-09-08'),(1519,47,27,1,12,0,'2025-09-10'),(1520,47,30,1,12,0,'2025-09-10'),(1522,47,27,1,12,0,'2025-09-12'),(1523,47,30,1,12,0,'2025-09-12'),(1525,47,27,1,12,0,'2025-09-15'),(1526,47,30,1,12,0,'2025-09-15'),(1528,47,27,1,12,0,'2025-09-17'),(1529,47,30,1,12,0,'2025-09-17'),(1531,47,27,1,12,0,'2025-09-19'),(1532,47,30,1,12,0,'2025-09-19'),(1534,47,27,1,12,0,'2025-09-22'),(1535,47,30,1,12,0,'2025-09-22'),(1537,47,27,1,12,0,'2025-09-24'),(1538,47,30,1,12,0,'2025-09-24'),(1540,47,27,1,12,0,'2025-09-26'),(1541,47,30,1,12,0,'2025-09-26'),(1543,47,27,1,12,0,'2025-09-29'),(1544,47,30,1,12,0,'2025-09-29'),(1546,47,27,1,12,0,'2025-10-01'),(1547,47,30,1,12,0,'2025-10-01'),(1549,47,27,1,12,0,'2025-10-03'),(1550,47,30,1,12,0,'2025-10-03'),(1552,47,27,1,12,0,'2025-10-06'),(1553,47,30,1,12,0,'2025-10-06'),(1555,47,27,1,12,0,'2025-10-08'),(1556,47,30,1,12,0,'2025-10-08'),(1558,47,27,1,12,0,'2025-10-10'),(1559,47,30,1,12,0,'2025-10-10'),(1561,48,27,1,11,0,'2025-09-08'),(1562,48,30,1,11,0,'2025-09-08'),(1564,48,27,1,11,0,'2025-09-10'),(1565,48,30,1,11,0,'2025-09-10'),(1567,48,27,1,11,0,'2025-09-12'),(1568,48,30,1,11,0,'2025-09-12'),(1570,48,27,1,11,0,'2025-09-15'),(1571,48,30,1,11,0,'2025-09-15'),(1573,48,27,1,11,0,'2025-09-17'),(1574,48,30,1,11,0,'2025-09-17'),(1576,48,27,1,11,0,'2025-09-19'),(1577,48,30,1,11,0,'2025-09-19'),(1579,48,27,1,11,0,'2025-09-22'),(1580,48,30,1,11,0,'2025-09-22'),(1582,48,27,1,11,0,'2025-09-24'),(1583,48,30,1,11,0,'2025-09-24'),(1585,48,27,1,11,0,'2025-09-26'),(1586,48,30,1,11,0,'2025-09-26'),(1588,48,27,1,11,0,'2025-09-29'),(1589,48,30,1,11,0,'2025-09-29'),(1591,48,27,1,11,0,'2025-10-01'),(1592,48,30,1,11,0,'2025-10-01'),(1594,48,27,1,11,0,'2025-10-03'),(1595,48,30,1,11,0,'2025-10-03'),(1597,48,27,1,11,0,'2025-10-06'),(1598,48,30,1,11,0,'2025-10-06'),(1600,48,27,1,11,0,'2025-10-08'),(1601,48,30,1,11,0,'2025-10-08'),(1603,48,27,1,11,0,'2025-10-10'),(1604,48,30,1,11,0,'2025-10-10'),(1606,49,27,1,11,0,'2025-09-08'),(1607,49,30,1,11,0,'2025-09-08'),(1610,49,27,1,11,0,'2025-09-10'),(1611,49,30,1,11,0,'2025-09-10'),(1614,49,27,1,11,0,'2025-09-12'),(1615,49,30,1,11,0,'2025-09-12'),(1618,49,27,1,11,0,'2025-09-15'),(1619,49,30,1,11,0,'2025-09-15'),(1622,49,27,1,11,0,'2025-09-17'),(1623,49,30,1,11,0,'2025-09-17'),(1626,49,27,1,11,0,'2025-09-19'),(1627,49,30,1,11,0,'2025-09-19'),(1630,49,27,1,11,0,'2025-09-22'),(1631,49,30,1,11,0,'2025-09-22'),(1634,49,27,1,11,0,'2025-09-24'),(1635,49,30,1,11,0,'2025-09-24'),(1638,49,27,1,11,0,'2025-09-26'),(1639,49,30,1,11,0,'2025-09-26'),(1642,49,27,1,11,0,'2025-09-29'),(1643,49,30,1,11,0,'2025-09-29'),(1646,49,27,1,11,0,'2025-10-01'),(1647,49,30,1,11,0,'2025-10-01'),(1650,49,27,1,11,0,'2025-10-03'),(1651,49,30,1,11,0,'2025-10-03'),(1654,49,27,1,11,0,'2025-10-06'),(1655,49,30,1,11,0,'2025-10-06'),(1658,49,27,1,11,0,'2025-10-08'),(1659,49,30,1,11,0,'2025-10-08'),(1662,49,27,1,11,0,'2025-10-10'),(1663,49,30,1,11,0,'2025-10-10'),(1666,50,27,1,11,1,'2025-09-08'),(1667,50,30,1,11,1,'2025-09-08'),(1669,50,43,1,11,1,'2025-09-08'),(1670,50,27,1,11,0,'2025-09-10'),(1671,50,30,1,11,0,'2025-09-10'),(1673,50,43,1,11,0,'2025-09-10'),(1674,50,27,1,11,0,'2025-09-12'),(1675,50,30,1,11,0,'2025-09-12'),(1677,50,43,1,11,0,'2025-09-12'),(1678,50,27,1,11,0,'2025-09-15'),(1679,50,30,1,11,0,'2025-09-15'),(1681,50,43,1,11,0,'2025-09-15'),(1682,50,27,1,11,0,'2025-09-17'),(1683,50,30,1,11,0,'2025-09-17'),(1685,50,43,1,11,0,'2025-09-17'),(1686,50,27,1,11,0,'2025-09-19'),(1687,50,30,1,11,0,'2025-09-19'),(1689,50,43,1,11,0,'2025-09-19'),(1690,50,27,1,11,0,'2025-09-22'),(1691,50,30,1,11,0,'2025-09-22'),(1693,50,43,1,11,0,'2025-09-22'),(1694,50,27,1,11,0,'2025-09-24'),(1695,50,30,1,11,0,'2025-09-24'),(1697,50,43,1,11,0,'2025-09-24'),(1698,50,27,1,11,0,'2025-09-26'),(1699,50,30,1,11,0,'2025-09-26'),(1701,50,43,1,11,0,'2025-09-26'),(1702,50,27,1,11,0,'2025-09-29'),(1703,50,30,1,11,0,'2025-09-29'),(1705,50,43,1,11,0,'2025-09-29'),(1706,50,27,1,11,0,'2025-10-01'),(1707,50,30,1,11,0,'2025-10-01'),(1709,50,43,1,11,0,'2025-10-01'),(1710,50,27,1,11,0,'2025-10-03'),(1711,50,30,1,11,0,'2025-10-03'),(1713,50,43,1,11,0,'2025-10-03'),(1714,50,27,1,11,0,'2025-10-06'),(1715,50,30,1,11,0,'2025-10-06'),(1717,50,43,1,11,0,'2025-10-06'),(1718,50,27,1,11,0,'2025-10-08'),(1719,50,30,1,11,0,'2025-10-08'),(1721,50,43,1,11,0,'2025-10-08'),(1722,50,27,1,11,0,'2025-10-10'),(1723,50,30,1,11,0,'2025-10-10'),(1725,50,43,1,11,0,'2025-10-10'),(1726,51,27,1,11,0,'2025-09-08'),(1727,51,30,1,11,0,'2025-09-08'),(1728,51,43,1,11,0,'2025-09-08'),(1730,51,27,1,11,0,'2025-09-10'),(1731,51,30,1,11,0,'2025-09-10'),(1732,51,43,1,11,0,'2025-09-10'),(1734,51,27,1,11,0,'2025-09-12'),(1735,51,30,1,11,0,'2025-09-12'),(1736,51,43,1,11,0,'2025-09-12'),(1738,51,27,1,11,0,'2025-09-15'),(1739,51,30,1,11,0,'2025-09-15'),(1740,51,43,1,11,0,'2025-09-15'),(1742,51,27,1,11,0,'2025-09-17'),(1743,51,30,1,11,0,'2025-09-17'),(1744,51,43,1,11,0,'2025-09-17'),(1746,51,27,1,11,0,'2025-09-19'),(1747,51,30,1,11,0,'2025-09-19'),(1748,51,43,1,11,0,'2025-09-19'),(1750,51,27,1,11,0,'2025-09-22'),(1751,51,30,1,11,0,'2025-09-22'),(1752,51,43,1,11,0,'2025-09-22'),(1754,51,27,1,11,0,'2025-09-24'),(1755,51,30,1,11,0,'2025-09-24'),(1756,51,43,1,11,0,'2025-09-24'),(1758,51,27,1,11,0,'2025-09-26'),(1759,51,30,1,11,0,'2025-09-26'),(1760,51,43,1,11,0,'2025-09-26'),(1762,51,27,1,11,0,'2025-09-29'),(1763,51,30,1,11,0,'2025-09-29'),(1764,51,43,1,11,0,'2025-09-29'),(1766,51,27,1,11,0,'2025-10-01'),(1767,51,30,1,11,0,'2025-10-01'),(1768,51,43,1,11,0,'2025-10-01'),(1770,51,27,1,11,0,'2025-10-03'),(1771,51,30,1,11,0,'2025-10-03'),(1772,51,43,1,11,0,'2025-10-03'),(1774,51,27,1,11,0,'2025-10-06'),(1775,51,30,1,11,0,'2025-10-06'),(1776,51,43,1,11,0,'2025-10-06'),(1778,51,27,1,11,0,'2025-10-08'),(1779,51,30,1,11,0,'2025-10-08'),(1780,51,43,1,11,0,'2025-10-08'),(1782,51,27,1,11,0,'2025-10-10'),(1783,51,30,1,11,0,'2025-10-10'),(1784,51,43,1,11,0,'2025-10-10'),(1786,52,27,1,11,0,'2025-09-08'),(1787,52,30,1,11,0,'2025-09-08'),(1789,52,43,1,11,0,'2025-09-08'),(1790,52,27,1,11,0,'2025-09-10'),(1791,52,30,1,11,0,'2025-09-10'),(1793,52,43,1,11,0,'2025-09-10'),(1794,52,27,1,11,0,'2025-09-12'),(1795,52,30,1,11,0,'2025-09-12'),(1797,52,43,1,11,0,'2025-09-12'),(1798,52,27,1,11,0,'2025-09-15'),(1799,52,30,1,11,0,'2025-09-15'),(1801,52,43,1,11,0,'2025-09-15'),(1802,52,27,1,11,0,'2025-09-17'),(1803,52,30,1,11,0,'2025-09-17'),(1805,52,43,1,11,0,'2025-09-17'),(1806,52,27,1,11,0,'2025-09-19'),(1807,52,30,1,11,0,'2025-09-19'),(1809,52,43,1,11,0,'2025-09-19'),(1810,52,27,1,11,0,'2025-09-22'),(1811,52,30,1,11,0,'2025-09-22'),(1813,52,43,1,11,0,'2025-09-22'),(1814,52,27,1,11,0,'2025-09-24'),(1815,52,30,1,11,0,'2025-09-24'),(1817,52,43,1,11,0,'2025-09-24'),(1818,52,27,1,11,0,'2025-09-26'),(1819,52,30,1,11,0,'2025-09-26'),(1821,52,43,1,11,0,'2025-09-26'),(1822,52,27,1,11,0,'2025-09-29'),(1823,52,30,1,11,0,'2025-09-29'),(1825,52,43,1,11,0,'2025-09-29'),(1826,52,27,1,11,0,'2025-10-01'),(1827,52,30,1,11,0,'2025-10-01'),(1829,52,43,1,11,0,'2025-10-01'),(1830,52,27,1,11,0,'2025-10-03'),(1831,52,30,1,11,0,'2025-10-03'),(1833,52,43,1,11,0,'2025-10-03'),(1834,52,27,1,11,0,'2025-10-06'),(1835,52,30,1,11,0,'2025-10-06'),(1837,52,43,1,11,0,'2025-10-06'),(1838,52,27,1,11,0,'2025-10-08'),(1839,52,30,1,11,0,'2025-10-08'),(1841,52,43,1,11,0,'2025-10-08'),(1842,52,27,1,11,0,'2025-10-10'),(1843,52,30,1,11,0,'2025-10-10'),(1845,52,43,1,11,0,'2025-10-10'),(1846,53,27,1,11,0,'2025-09-08'),(1847,53,30,1,11,0,'2025-09-08'),(1848,53,43,1,11,0,'2025-09-08'),(1850,53,27,1,11,0,'2025-09-10'),(1851,53,30,1,11,0,'2025-09-10'),(1852,53,43,1,11,0,'2025-09-10'),(1854,53,27,1,11,0,'2025-09-12'),(1855,53,30,1,11,0,'2025-09-12'),(1856,53,43,1,11,0,'2025-09-12'),(1858,53,27,1,11,0,'2025-09-15'),(1859,53,30,1,11,0,'2025-09-15'),(1860,53,43,1,11,0,'2025-09-15'),(1862,53,27,1,11,0,'2025-09-17'),(1863,53,30,1,11,0,'2025-09-17'),(1864,53,43,1,11,0,'2025-09-17'),(1866,53,27,1,11,0,'2025-09-19'),(1867,53,30,1,11,0,'2025-09-19'),(1868,53,43,1,11,0,'2025-09-19'),(1870,53,27,1,11,0,'2025-09-22'),(1871,53,30,1,11,0,'2025-09-22'),(1872,53,43,1,11,0,'2025-09-22'),(1874,53,27,1,11,0,'2025-09-24'),(1875,53,30,1,11,0,'2025-09-24'),(1876,53,43,1,11,0,'2025-09-24'),(1878,53,27,1,11,0,'2025-09-26'),(1879,53,30,1,11,0,'2025-09-26'),(1880,53,43,1,11,0,'2025-09-26'),(1882,53,27,1,11,0,'2025-09-29'),(1883,53,30,1,11,0,'2025-09-29'),(1884,53,43,1,11,0,'2025-09-29'),(1886,53,27,1,11,0,'2025-10-01'),(1887,53,30,1,11,0,'2025-10-01'),(1888,53,43,1,11,0,'2025-10-01'),(1890,53,27,1,11,0,'2025-10-03'),(1891,53,30,1,11,0,'2025-10-03'),(1892,53,43,1,11,0,'2025-10-03'),(1894,53,27,1,11,0,'2025-10-06'),(1895,53,30,1,11,0,'2025-10-06'),(1896,53,43,1,11,0,'2025-10-06'),(1898,53,27,1,11,0,'2025-10-08'),(1899,53,30,1,11,0,'2025-10-08'),(1900,53,43,1,11,0,'2025-10-08'),(1902,53,27,1,11,0,'2025-10-10'),(1903,53,30,1,11,0,'2025-10-10'),(1904,53,43,1,11,0,'2025-10-10'),(1906,54,27,1,20,0,'2025-09-22'),(1907,54,30,1,20,0,'2025-09-22'),(1908,54,43,1,20,0,'2025-09-22'),(1910,54,27,1,20,0,'2025-09-24'),(1911,54,30,1,20,0,'2025-09-24'),(1912,54,43,1,20,0,'2025-09-24'),(1914,54,27,1,20,0,'2025-09-26'),(1915,54,30,1,20,0,'2025-09-26'),(1916,54,43,1,20,0,'2025-09-26'),(1918,54,27,1,20,0,'2025-09-29'),(1919,54,30,1,20,0,'2025-09-29'),(1920,54,43,1,20,0,'2025-09-29'),(1922,54,27,1,20,0,'2025-10-01'),(1923,54,30,1,20,0,'2025-10-01'),(1924,54,43,1,20,0,'2025-10-01'),(1926,54,27,1,20,0,'2025-10-03'),(1927,54,30,1,20,0,'2025-10-03'),(1928,54,43,1,20,0,'2025-10-03'),(1930,54,27,1,20,0,'2025-10-06'),(1931,54,30,1,20,0,'2025-10-06'),(1932,54,43,1,20,0,'2025-10-06'),(1934,54,27,1,20,0,'2025-10-08'),(1935,54,30,1,20,0,'2025-10-08'),(1936,54,43,1,20,0,'2025-10-08'),(1938,54,27,1,20,0,'2025-10-10'),(1939,54,30,1,20,0,'2025-10-10'),(1940,54,43,1,20,0,'2025-10-10'),(1942,54,27,1,20,0,'2025-10-13'),(1943,54,30,1,20,0,'2025-10-13'),(1944,54,43,1,20,0,'2025-10-13'),(1946,54,27,1,20,0,'2025-10-15'),(1947,54,30,1,20,0,'2025-10-15'),(1948,54,43,1,20,0,'2025-10-15'),(1950,54,27,1,20,0,'2025-10-17'),(1951,54,30,1,20,0,'2025-10-17'),(1952,54,43,1,20,0,'2025-10-17');
/*!40000 ALTER TABLE `scheduledetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainee`
--

DROP TABLE IF EXISTS `trainee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainee` (
  `id` int NOT NULL,
  `weight` int DEFAULT '0',
  `height` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_trainee_user_idx` (`id`),
  CONSTRAINT `fk_trainee_user` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainee`
--

LOCK TABLES `trainee` WRITE;
/*!40000 ALTER TABLE `trainee` DISABLE KEYS */;
INSERT INTO `trainee` VALUES (17,64,164),(19,64,164);
/*!40000 ALTER TABLE `trainee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `gender` int NOT NULL,
  `dateOfBirth` date NOT NULL,
  `isAdmin` int NOT NULL DEFAULT '0',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `lastReset` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin',1,'2003-09-13',1,'admin@gmail.com','$2b$12$OQu8H/uYyXJ7zUh3xS4eI.g8QnPaMOSf8hHMEA.hhRQ3XfZlvojFu',NULL),(17,'Lê Phi Long',1,'2003-09-13',0,'21050066@student.bdu.edu.vn','$2b$12$g4YhDfuIjS26OFfx4FjxcOgZmpKy4IFBs9N01hNWeTkr2LQNqQrSK','2025-09-07 20:38:39'),(19,'Nguyễn Văn A',1,'2003-09-13',0,'long.brt.itservice@gmail.com','$2b$12$O1MB01XGIzbnmlRnfHLEw.upwA3AY4xzyfJ7fEjnA5IvwKCZ8b2i2',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-20 21:01:11
