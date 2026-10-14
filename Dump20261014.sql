-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: studentsahayak_cms
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Draft',
  `content_json` json DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `featured_image_url` varchar(255) DEFAULT NULL,
  `published_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (2,'test','testarticle','news',1,1,'Published','{\"html\": \"<ol><li>test <strong>test <u>test </u><em><u>test</u></em></strong> </li><li>test</li><li>test</li></ol><ul><li>test</li></ul><blockquote>test</blockquote>\"}','test','test testarticle','',NULL,'2026-10-11 19:50:55','2026-10-11 19:50:55'),(3,'uffffff','rr','exam-corner',1,1,'Published','{\"html\": \"<p>ishhhhhh</p>\"}','uffffff','rr','',NULL,'2026-10-11 19:53:16','2026-10-11 21:04:58'),(4,'fff','ffff','study-tips',5,1,'Draft','{\"html\": \"<p>fffff</p>\"}','fff','ffff','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBB4LQTn0vRq4ydPLp-uTj_lEUHOHYWUU18JlCq5KuMw&s=10',NULL,'2026-10-13 18:07:30','2026-10-13 18:07:30');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `target_table` varchar(50) DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 19:36:24'),(2,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 19:49:34'),(3,1,'Created Article','articles',2,NULL,'2026-10-11 19:50:55'),(4,1,'Created Article','articles',3,NULL,'2026-10-11 19:53:16'),(5,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 20:05:29'),(6,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 20:19:11'),(7,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 20:32:11'),(8,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 20:44:21'),(9,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 20:54:48'),(10,1,'Created Chapter','chapters',1,NULL,'2026-10-11 20:55:44'),(11,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 21:04:31'),(12,1,'Updated Article','articles',3,NULL,'2026-10-11 21:04:58'),(13,1,'Deleted Article','articles',1,NULL,'2026-10-11 21:05:13'),(14,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 21:10:05'),(15,1,'Deleted Chapter','chapters',1,NULL,'2026-10-11 21:10:25'),(16,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-11 21:34:45'),(17,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 14:02:48'),(18,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 14:11:25'),(19,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 14:23:34'),(20,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 14:38:31'),(21,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 14:44:40'),(22,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 14:54:31'),(23,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 15:10:29'),(24,1,'User Login','users',NULL,'{\"ip\": \"::1\"}','2026-10-12 15:26:35'),(25,1,'Created new employee: manager1@studentsahyak.online','users',3,NULL,'2026-10-12 16:47:15'),(26,3,'Created new employee: aw@studentsahayak.online','users',4,NULL,'2026-10-12 16:51:14'),(27,1,'Created new employee: her@studentsahayak.com','users',5,NULL,'2026-10-13 18:02:52'),(28,5,'Created Article as Draft','articles',4,NULL,'2026-10-13 18:07:30'),(29,1,'Created new employee: him@gmail.com','users',6,NULL,'2026-10-13 18:08:39');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boards`
--

DROP TABLE IF EXISTS `boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boards`
--

LOCK TABLES `boards` WRITE;
/*!40000 ALTER TABLE `boards` DISABLE KEYS */;
INSERT INTO `boards` VALUES (2,'CBSE'),(1,'SEBA');
/*!40000 ALTER TABLE `boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  `subject_id` int DEFAULT NULL,
  `chapter_number` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content_json` json DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Draft',
  `seo_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `board_id` (`board_id`),
  KEY `class_id` (`class_id`),
  KEY `subject_id` (`subject_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`),
  CONSTRAINT `chapters_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `chapters_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `chapters_ibfk_4` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'Class 10'),(2,'Class 12');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'CEO / SUPER ADMIN','2026-10-11 19:19:53');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `media_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_assets`
--

DROP TABLE IF EXISTS `media_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uploader_id` int DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploader_id` (`uploader_id`),
  CONSTRAINT `media_assets_ibfk_1` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_assets`
--

LOCK TABLES `media_assets` WRITE;
/*!40000 ALTER TABLE `media_assets` DISABLE KEYS */;
INSERT INTO `media_assets` VALUES (1,1,'trade walpaper.jpg','/uploads/trade-walpaper-jpg-1791751483008-26699319.jpg','image/jpeg',25774,'2026-10-11 20:44:43');
/*!40000 ALTER TABLE `media_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `can_publish` tinyint(1) DEFAULT '0',
  `can_approve` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Super Admin',1,1),(2,'CEO',1,1),(3,'Manager',0,1),(4,'Content Manager & Editor',0,1),(5,'Proofreader',0,1),(6,'Article Writer',0,0),(7,'Educational Content Writer',0,0);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'English'),(2,'Physics');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `department_id` int DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Hafijul','Islam','admin@studentsahayak.online','$2b$10$/qgwpOADinEZp2hcEKjateu.dmjGxjNgghkuPQi9mosxq1ZIHYKdC',1,2,1,'2026-10-11 19:19:53'),(3,'Begum Nurjahan ','Mehbuba','manager1@studentsahyak.online','$2b$10$RWIpj8Le.x5gQTNRFWCZQu84C4WUL.3O7KyGn1FefVQCcZCaWWGQy',1,3,1,'2026-10-12 16:47:15'),(4,'aw','test','aw@studentsahayak.online','$2b$10$5aFC94NuvRZ8ZLMPzSpUOeXfiwQzw.BdCRo2EqvUzT.Bs/qRCkLAS',1,6,1,'2026-10-12 16:51:14'),(5,'Begum','Mehbuba','her@studentsahayak.com','$2b$10$AxHkswuqusBP.y30rYRl3Op36WMuxrAZpstFOt5ZgxA8MF33HUThm',1,6,1,'2026-10-13 18:02:52'),(6,'him','him','him@gmail.com','$2b$10$w9wAe41vgsmkyUImv.gDJOBS/f8VPxUmkJAQD8Ze9MLVk9i5iB3Oy',1,5,1,'2026-10-13 18:08:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-14  0:24:15
