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
) ENGINE=InnoDB AUTO_INCREMENT=263 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluationcriteria`
--

LOCK TABLES `evaluationcriteria` WRITE;
/*!40000 ALTER TABLE `evaluationcriteria` DISABLE KEYS */;
INSERT INTO `evaluationcriteria` VALUES (261,6,'>=',65,'Cánh tay bạn đang hơi cao, hãy hạ xuống!'),(262,24,'>=',50,'Bạn đang mở rộng tay quá mức, hãy khép lại!');
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (27,'Cuốn tạ đơn (tay phải)',15,100,0.1,1,'uploads/exercise/27/model.json'),(30,'Cuốn tạ đơn (tay trái)',15,100,0.1,0.9629629850387573,'uploads/exercise/30/model.json'),(33,'Hít đất',15,100,0.1,1,'uploads/exercise/33/model.json'),(34,'Squat',15,100,0.32,1,'uploads/exercise/34/model.json');
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
INSERT INTO `exerciselevel` VALUES (27,1,1,10),(27,2,2,20),(27,3,3,30),(30,1,1,10),(30,2,2,20),(30,3,3,30),(33,1,1,10),(33,2,2,20),(33,3,3,30),(34,1,1,10),(34,2,2,20),(34,3,3,30);
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
INSERT INTO `joint` VALUES (12,261,1),(12,262,1),(14,261,0),(14,262,0),(24,261,2),(24,262,2);
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
INSERT INTO `muscle` VALUES (0,27),(1,27),(5,27),(0,30),(1,30),(5,30),(0,33),(2,33),(7,33),(7,34),(8,34),(9,34),(10,34),(11,34),(12,34);
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
INSERT INTO `position` VALUES (4,27,'Đứng thẳng',0),(5,27,'Cuốn tới giữa',1),(6,27,'Cuốn cao',2),(13,30,'Đứng thẳng',0),(14,30,'Cuốn giữa',0),(15,30,'Cuốn cao',0),(22,33,'Chống sát đất',0),(23,33,'Chống giữa',1),(24,33,'Chống cao',2),(25,34,'Đứng thẳng',0),(26,34,'Squat giữa',1),(27,34,'Squat sát đất',2);
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (25,17,1,0),(26,17,2,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=649 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduledetail`
--

LOCK TABLES `scheduledetail` WRITE;
/*!40000 ALTER TABLE `scheduledetail` DISABLE KEYS */;
INSERT INTO `scheduledetail` VALUES (525,25,27,1,11,1,'2025-09-08'),(529,25,27,1,11,1,'2025-09-10'),(533,25,27,1,11,0,'2025-09-12'),(537,25,27,1,11,0,'2025-09-15'),(541,25,27,1,11,0,'2025-09-17'),(545,25,27,1,11,0,'2025-09-19'),(549,25,27,1,11,0,'2025-09-22'),(553,25,27,1,11,0,'2025-09-24'),(557,25,27,1,11,0,'2025-09-26'),(561,25,27,1,11,0,'2025-09-29'),(565,25,27,1,11,0,'2025-10-01'),(569,25,27,1,11,0,'2025-10-03'),(573,25,27,1,11,0,'2025-10-06'),(577,25,27,1,11,0,'2025-10-08'),(581,25,27,1,11,0,'2025-10-10'),(585,26,27,2,20,0,'2025-09-08'),(586,26,30,2,20,0,'2025-09-08'),(587,26,33,2,20,0,'2025-09-08'),(588,26,34,2,20,0,'2025-09-08'),(589,26,27,2,20,0,'2025-09-09'),(590,26,30,2,20,0,'2025-09-09'),(591,26,33,2,20,0,'2025-09-09'),(592,26,34,2,20,0,'2025-09-09'),(593,26,27,2,20,0,'2025-09-11'),(594,26,30,2,20,0,'2025-09-11'),(595,26,33,2,20,0,'2025-09-11'),(596,26,34,2,20,0,'2025-09-11'),(597,26,27,2,20,0,'2025-09-13'),(598,26,30,2,20,0,'2025-09-13'),(599,26,33,2,20,0,'2025-09-13'),(600,26,34,2,20,0,'2025-09-13'),(601,26,27,2,20,0,'2025-09-15'),(602,26,30,2,20,0,'2025-09-15'),(603,26,33,2,20,0,'2025-09-15'),(604,26,34,2,20,0,'2025-09-15'),(605,26,27,2,20,0,'2025-09-16'),(606,26,30,2,20,0,'2025-09-16'),(607,26,33,2,20,0,'2025-09-16'),(608,26,34,2,20,0,'2025-09-16'),(609,26,27,2,20,0,'2025-09-18'),(610,26,30,2,20,0,'2025-09-18'),(611,26,33,2,20,0,'2025-09-18'),(612,26,34,2,20,0,'2025-09-18'),(613,26,27,2,20,0,'2025-09-20'),(614,26,30,2,20,0,'2025-09-20'),(615,26,33,2,20,0,'2025-09-20'),(616,26,34,2,20,0,'2025-09-20'),(617,26,27,2,20,0,'2025-09-22'),(618,26,30,2,20,0,'2025-09-22'),(619,26,33,2,20,0,'2025-09-22'),(620,26,34,2,20,0,'2025-09-22'),(621,26,27,2,20,0,'2025-09-23'),(622,26,30,2,20,0,'2025-09-23'),(623,26,33,2,20,0,'2025-09-23'),(624,26,34,2,20,0,'2025-09-23'),(625,26,27,2,20,0,'2025-09-25'),(626,26,30,2,20,0,'2025-09-25'),(627,26,33,2,20,0,'2025-09-25'),(628,26,34,2,20,0,'2025-09-25'),(629,26,27,2,20,0,'2025-09-27'),(630,26,30,2,20,0,'2025-09-27'),(631,26,33,2,20,0,'2025-09-27'),(632,26,34,2,20,0,'2025-09-27'),(633,26,27,2,20,0,'2025-09-29'),(634,26,30,2,20,0,'2025-09-29'),(635,26,33,2,20,0,'2025-09-29'),(636,26,34,2,20,0,'2025-09-29'),(637,26,27,2,20,0,'2025-09-30'),(638,26,30,2,20,0,'2025-09-30'),(639,26,33,2,20,0,'2025-09-30'),(640,26,34,2,20,0,'2025-09-30'),(641,26,27,2,20,0,'2025-10-02'),(642,26,30,2,20,0,'2025-10-02'),(643,26,33,2,20,0,'2025-10-02'),(644,26,34,2,20,0,'2025-10-02'),(645,26,27,2,20,0,'2025-10-04'),(646,26,30,2,20,0,'2025-10-04'),(647,26,33,2,20,0,'2025-10-04'),(648,26,34,2,20,0,'2025-10-04');
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
INSERT INTO `trainee` VALUES (17,64,164);
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin',1,'2003-09-13',1,'admin@gmail.com','$2b$12$OQu8H/uYyXJ7zUh3xS4eI.g8QnPaMOSf8hHMEA.hhRQ3XfZlvojFu',NULL),(17,'Lê Phi Long',1,'2003-09-13',0,'21050066@student.bdu.edu.vn','$2b$12$AKdD.E8J7UZ5u9.NtCD.P.FqB9pu5OjrUKMC9NekyFGJqRC44gf5y','2025-09-01 23:01:21');
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

-- Dump completed on 2025-09-03 22:58:27
