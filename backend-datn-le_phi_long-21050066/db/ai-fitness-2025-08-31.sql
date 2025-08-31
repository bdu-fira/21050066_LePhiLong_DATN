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
) ENGINE=InnoDB AUTO_INCREMENT=238 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluationcriteria`
--

LOCK TABLES `evaluationcriteria` WRITE;
/*!40000 ALTER TABLE `evaluationcriteria` DISABLE KEYS */;
INSERT INTO `evaluationcriteria` VALUES (56,22,'<',1,'2'),(237,6,'>=',65,'Cánh tay bạn đang hơi cao, hãy hạ xuống!');
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (27,'Cuốn tạ đơn (tay phải)',15,100,0.1,1,'uploads/exercise/27/model.json'),(30,'Cuốn tạ đơn (tay trái)',15,100,0.1,1,'uploads/exercise/30/model.json'),(33,'Hít đất',15,100,0.1,NULL,NULL),(34,'Squat',15,100,0.32,NULL,NULL);
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
INSERT INTO `joint` VALUES (12,56),(14,56),(16,56),(12,237),(14,237),(24,237);
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
INSERT INTO `jointlist` VALUES (12,1),(14,1),(24,1);
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
  PRIMARY KEY (`id`),
  KEY `fk_position_exercise1_idx` (`exerciseID`),
  CONSTRAINT `fk_position_exercise1` FOREIGN KEY (`exerciseID`) REFERENCES `exercise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
INSERT INTO `position` VALUES (4,27,'Đứng thẳng'),(5,27,'Cuốn tới giữa'),(6,27,'Cuốn cao'),(13,30,'Standing'),(14,30,'Mid'),(15,30,'Peak'),(22,33,'Label 01'),(23,33,'Label 02'),(24,33,'Label 03'),(25,34,'Label 01'),(26,34,'Label 02'),(27,34,'Label 03');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `result`
--

LOCK TABLES `result` WRITE;
/*!40000 ALTER TABLE `result` DISABLE KEYS */;
INSERT INTO `result` VALUES (1,281,2,30,'Đứng thẳng',71,'Cánh tay bạn đang hơi cao, hãy hạ xuống!');
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (21,17,3,0),(22,17,3,0),(23,17,2,0),(24,17,2,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=525 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduledetail`
--

LOCK TABLES `scheduledetail` WRITE;
/*!40000 ALTER TABLE `scheduledetail` DISABLE KEYS */;
INSERT INTO `scheduledetail` VALUES (261,21,27,1,19,0,'2025-08-25'),(262,21,30,1,19,0,'2025-08-25'),(265,21,27,1,19,0,'2025-08-26'),(266,21,30,1,19,0,'2025-08-26'),(269,21,27,1,19,0,'2025-08-27'),(270,21,30,1,19,0,'2025-08-27'),(273,21,27,1,19,0,'2025-08-28'),(274,21,30,1,19,0,'2025-08-28'),(277,21,27,1,19,0,'2025-08-29'),(278,21,30,1,19,0,'2025-08-29'),(281,21,27,1,19,1,'2025-09-01'),(282,21,30,1,19,0,'2025-09-01'),(285,21,27,1,19,0,'2025-09-02'),(286,21,30,1,19,0,'2025-09-02'),(289,21,27,1,19,0,'2025-09-03'),(290,21,30,1,19,0,'2025-09-03'),(293,21,27,1,19,0,'2025-09-04'),(294,21,30,1,19,0,'2025-09-04'),(297,21,27,1,19,0,'2025-09-05'),(298,21,30,1,19,0,'2025-09-05'),(301,21,27,1,19,0,'2025-09-08'),(302,21,30,1,19,0,'2025-09-08'),(305,21,27,1,19,0,'2025-09-09'),(306,21,30,1,19,0,'2025-09-09'),(309,21,27,1,19,0,'2025-09-10'),(310,21,30,1,19,0,'2025-09-10'),(313,21,27,1,19,0,'2025-09-11'),(314,21,30,1,19,0,'2025-09-11'),(317,21,27,1,19,0,'2025-09-12'),(318,21,30,1,19,0,'2025-09-12'),(321,21,27,1,19,0,'2025-09-15'),(322,21,30,1,19,0,'2025-09-15'),(325,21,27,1,19,0,'2025-09-16'),(326,21,30,1,19,0,'2025-09-16'),(329,21,27,1,19,0,'2025-09-17'),(330,21,30,1,19,0,'2025-09-17'),(333,21,27,1,19,0,'2025-09-18'),(334,21,30,1,19,0,'2025-09-18'),(337,21,27,1,19,0,'2025-09-19'),(338,21,30,1,19,0,'2025-09-19'),(341,22,27,4,32,0,'2025-09-01'),(342,22,30,4,32,0,'2025-09-01'),(345,22,27,4,32,0,'2025-09-03'),(346,22,30,4,32,0,'2025-09-03'),(349,22,27,4,32,0,'2025-09-05'),(350,22,30,4,32,0,'2025-09-05'),(353,22,27,4,32,0,'2025-09-08'),(354,22,30,4,32,0,'2025-09-08'),(357,22,27,4,32,0,'2025-09-10'),(358,22,30,4,32,0,'2025-09-10'),(361,22,27,4,32,0,'2025-09-12'),(362,22,30,4,32,0,'2025-09-12'),(365,22,27,4,32,0,'2025-09-15'),(366,22,30,4,32,0,'2025-09-15'),(369,22,27,4,32,0,'2025-09-17'),(370,22,30,4,32,0,'2025-09-17'),(373,22,27,4,32,0,'2025-09-19'),(374,22,30,4,32,0,'2025-09-19'),(377,22,27,4,32,0,'2025-09-22'),(378,22,30,4,32,0,'2025-09-22'),(381,22,27,4,32,0,'2025-09-24'),(382,22,30,4,32,0,'2025-09-24'),(385,22,27,4,32,0,'2025-09-26'),(386,22,30,4,32,0,'2025-09-26'),(389,22,27,4,32,0,'2025-09-29'),(390,22,30,4,32,0,'2025-09-29'),(393,22,27,4,32,0,'2025-10-01'),(394,22,30,4,32,0,'2025-10-01'),(397,22,27,4,32,0,'2025-10-03'),(398,22,30,4,32,0,'2025-10-03'),(401,22,27,4,32,0,'2025-10-06'),(402,22,30,4,32,0,'2025-10-06'),(405,22,27,4,32,0,'2025-10-08'),(406,22,30,4,32,0,'2025-10-08'),(409,22,27,4,32,0,'2025-10-10'),(410,22,30,4,32,0,'2025-10-10'),(413,23,27,2,20,0,'2025-09-01'),(414,23,30,2,20,0,'2025-09-01'),(417,23,27,2,20,0,'2025-09-03'),(418,23,30,2,20,0,'2025-09-03'),(421,23,27,2,20,0,'2025-09-05'),(422,23,30,2,20,0,'2025-09-05'),(425,23,27,2,20,0,'2025-09-08'),(426,23,30,2,20,0,'2025-09-08'),(429,23,27,2,20,0,'2025-09-10'),(430,23,30,2,20,0,'2025-09-10'),(433,23,27,2,20,0,'2025-09-12'),(434,23,30,2,20,0,'2025-09-12'),(437,23,27,2,20,0,'2025-09-15'),(438,23,30,2,20,0,'2025-09-15'),(441,23,27,2,20,0,'2025-09-17'),(442,23,30,2,20,0,'2025-09-17'),(445,23,27,2,20,0,'2025-09-19'),(446,23,30,2,20,0,'2025-09-19'),(449,23,27,2,20,0,'2025-09-22'),(450,23,30,2,20,0,'2025-09-22'),(453,23,27,2,20,0,'2025-09-24'),(454,23,30,2,20,0,'2025-09-24'),(457,23,27,2,20,0,'2025-09-26'),(458,23,30,2,20,0,'2025-09-26'),(461,24,27,2,20,0,'2025-09-01'),(462,24,30,2,20,0,'2025-09-01'),(465,24,27,2,20,0,'2025-09-02'),(466,24,30,2,20,0,'2025-09-02'),(469,24,27,2,20,0,'2025-09-04'),(470,24,30,2,20,0,'2025-09-04'),(473,24,27,2,20,0,'2025-09-06'),(474,24,30,2,20,0,'2025-09-06'),(477,24,27,2,20,0,'2025-09-08'),(478,24,30,2,20,0,'2025-09-08'),(481,24,27,2,20,0,'2025-09-09'),(482,24,30,2,20,0,'2025-09-09'),(485,24,27,2,20,0,'2025-09-11'),(486,24,30,2,20,0,'2025-09-11'),(489,24,27,2,20,0,'2025-09-13'),(490,24,30,2,20,0,'2025-09-13'),(493,24,27,2,20,0,'2025-09-15'),(494,24,30,2,20,0,'2025-09-15'),(497,24,27,2,20,0,'2025-09-16'),(498,24,30,2,20,0,'2025-09-16'),(501,24,27,2,20,0,'2025-09-18'),(502,24,30,2,20,0,'2025-09-18'),(505,24,27,2,20,0,'2025-09-20'),(506,24,30,2,20,0,'2025-09-20'),(509,24,27,2,20,0,'2025-09-22'),(510,24,30,2,20,0,'2025-09-22'),(513,24,27,2,20,0,'2025-09-23'),(514,24,30,2,20,0,'2025-09-23'),(517,24,27,2,20,0,'2025-09-25'),(518,24,30,2,20,0,'2025-09-25'),(521,24,27,2,20,0,'2025-09-27'),(522,24,30,2,20,0,'2025-09-27');
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
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_user1_idx` (`user_id`),
  CONSTRAINT `fk_user_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (17,'Lê Phi Long',1,'2003-09-13',0,'21050066@student.bdu.edu.vn','$2b$12$OQu8H/uYyXJ7zUh3xS4eI.g8QnPaMOSf8hHMEA.hhRQ3XfZlvojFu',NULL,0);
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

-- Dump completed on 2025-08-31 14:06:03
