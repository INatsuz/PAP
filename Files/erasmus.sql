-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 19, 2019 at 04:34 PM
-- Server version: 10.1.28-MariaDB
-- PHP Version: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `erasmus`
--

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `ID` int(11) NOT NULL,
  `country` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`ID`, `country`) VALUES
(1, 'Portugal');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `ID` int(11) NOT NULL,
  `course` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`ID`, `course`) VALUES
(1, 'Curso Profissional de Técnico de Gestão e Programação de Sistemas Informáticos');

-- --------------------------------------------------------

--
-- Table structure for table `mobilities`
--

CREATE TABLE `mobilities` (
  `ID` int(11) NOT NULL,
  `origin` varchar(50) NOT NULL,
  `target` varchar(50) NOT NULL,
  `departureDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `arrivalDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IDProject` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `mobilities`
--

INSERT INTO `mobilities` (`ID`, `origin`, `target`, `departureDate`, `arrivalDate`, `IDProject`) VALUES
(1, 'Portugal', 'Estonia', '2018-01-26 00:00:00', '2018-02-02 00:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `mobilities_students`
--

CREATE TABLE `mobilities_students` (
  `ID` int(11) NOT NULL,
  `IDMobility` int(11) NOT NULL,
  `IDStudent` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `mobilities_students`
--

INSERT INTO `mobilities_students` (`ID`, `IDMobility`, `IDStudent`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `mobilities_teachers`
--

CREATE TABLE `mobilities_teachers` (
  `ID` int(11) NOT NULL,
  `IDMobility` int(11) NOT NULL,
  `IDTeacher` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `mobilities_teachers`
--

INSERT INTO `mobilities_teachers` (`ID`, `IDMobility`, `IDTeacher`) VALUES
(1, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `ID` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `IDCountry` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`ID`, `name`, `IDCountry`) VALUES
(1, 'Escola Secundária de Loulé', 1);

-- --------------------------------------------------------

--
-- Table structure for table `partners_projects`
--

CREATE TABLE `partners_projects` (
  `ID` int(11) NOT NULL,
  `IDPartner` int(11) NOT NULL,
  `IDProject` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `partners_projects`
--

INSERT INTO `partners_projects` (`ID`, `IDPartner`, `IDProject`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `ID` int(11) NOT NULL,
  `projectCode` varchar(32) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(250) NOT NULL,
  `IDCoordinator` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`ID`, `projectCode`, `name`, `description`, `IDCoordinator`) VALUES
(1, '2016-1-FRO1-KA219-0244127', 'Trails2Education', 'A project focused on promoting tourism in European Union member countries by providing cultural paths made specifically to show the best a country has to offer', 2);

-- --------------------------------------------------------

--
-- Table structure for table `studentgroups`
--

CREATE TABLE `studentgroups` (
  `ID` int(11) NOT NULL,
  `grade` int(11) NOT NULL,
  `designation` varchar(10) NOT NULL,
  `IDCourse` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `studentgroups`
--

INSERT INTO `studentgroups` (`ID`, `grade`, `designation`, `IDCourse`) VALUES
(1, 12, 'Zi', 1);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `ID` int(11) NOT NULL,
  `studentNumber` varchar(16) NOT NULL,
  `name` varchar(100) NOT NULL,
  `birthday` date NOT NULL,
  `gender` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `IDClass` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`ID`, `studentNumber`, `name`, `birthday`, `gender`, `email`, `IDClass`) VALUES
(1, 'a701617004', 'Vasco Raminhos', '1999-09-25', 'Male', 'vascoraminhos@hotmail.com', 1),
(2, 'a701617743', 'Fábio Andrade Mendes', '1998-02-13', 'Male', 'drikmyk@gmail.com', 1),
(3, 'a701617752', 'Rúben Miguel Batista Santos', '1999-12-24', 'Male', 'rubensantos898@hotmail.com', 1);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `ID` int(11) NOT NULL,
  `subject` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`ID`, `subject`) VALUES
(1, 'Programação de Sistemas Informáticos');

-- --------------------------------------------------------

--
-- Table structure for table `subjects_teachers`
--

CREATE TABLE `subjects_teachers` (
  `ID` int(11) NOT NULL,
  `IDSubject` int(11) NOT NULL,
  `IDTeacher` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subjects_teachers`
--

INSERT INTO `subjects_teachers` (`ID`, `IDSubject`, `IDTeacher`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `ID` int(11) NOT NULL,
  `teacherNumber` varchar(16) NOT NULL,
  `name` varchar(100) NOT NULL,
  `birthday` date NOT NULL,
  `gender` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`ID`, `teacherNumber`, `name`, `birthday`, `gender`, `email`) VALUES
(1, 'p700000001', 'Eugénia Narciso', '1981-02-03', 'Female', 'enarciso@es-loule.edu.pt'),
(2, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(3, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(4, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(5, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(6, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(7, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(8, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(9, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(10, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(11, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(12, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(13, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(14, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(15, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(16, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(17, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(18, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(19, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(20, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(21, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(22, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(23, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(24, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(25, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(26, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(27, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(28, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(29, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(30, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(31, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(32, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(33, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(34, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(35, 'p700000002', 'Duarte José Duarte', '1973-06-15', 'Male', 'duarte.djduarte@gmail.com'),
(36, 'p700000003', 'Jorge Salgadinho', '1973-03-03', 'Male', 'jorgesalgadinho@gmail.com'),
(37, 'p700000004', 'Elisabete Dias', '1982-05-05', 'Female', 'edias@es-loule.edu.pt'),
(38, 'p700000005', 'Paula Almeida', '1969-01-01', 'Female', 'palmeida@es-loule.edu.pt'),
(40, 'p700000006', 'Professor Teste', '1890-01-01', 'Other', 'test@gmail.com'),
(41, 'p700000007', 'James Bond', '2007-01-01', 'Male', 'double07@gmail.com'),
(42, 'p700000008', 'Hachibi', '0004-05-04', 'Male', 'test@gmail.com'),
(43, 'p700000009', 'Kyuubi', '1115-05-04', 'Male', 'test3@gmail.com'),
(44, 'Test Professor #', 'IDK Teacher Here', '1967-12-04', 'Other', 'idk@gmail.com'),
(45, 'p700001111', 'Tiago Gonçalves', '1999-05-14', 'Female', 'lilas@gmail.com'),
(46, 'p700000009', 'Junior Senior', '1994-05-15', 'Male', 'juniorsenior@gmail.com'),
(47, 'p7000111113', 'James Bond', '1231-03-12', 'Male', '123123@gmail.com'),
(48, 'p123123123', 'Alberto Einsténio', '2019-01-17', 'Male', 'einstenio@es-loule.edu.pt'),
(49, 'p898989765', 'Tom Marvolo Riddle', '1926-12-31', 'Male', 'iamlordvoldemort@gmail.com'),
(50, 'p1239i8611', 'Tom Riddle', '1925-04-15', 'Male', '123@gmail.com'),
(51, 'p700000007', '123123', '1955-03-12', 'Male', '123123@gmail.com'),
(52, 'p700000007', 'James Bond', '1955-12-12', 'Male', '123@gmail.com'),
(53, 'p700000007', 'James Bond', '1956-12-12', 'Male', 'double07@gmail.com'),
(54, 'p700000007', '123', '1987-03-12', 'Male', 'double07@gmail.com'),
(55, 'p700000007', 'James Bond', '1953-01-01', 'Male', 'double07@gmail.com'),
(56, 'p700000007', 'Mr. Bean', '1955-01-06', 'Male', 'mrbean@gmail.com'),
(57, '99', 'Dinis', '1972-11-08', 'aaa', 'dinisdpereira@gmail.com'),
(58, 'p70000100', 'Celina Inácio', '1980-12-11', 'Female', 'celina@es-loule.edu.pt'),
(59, 'Test#', 'Vasco Raminhos', '1999-09-25', 'Male', 'vascoraminhos@hotmail.com'),
(60, 'a701617305', 'Gonçalo Afonso Neto Moreira Ribeiro da Silva', '1999-11-25', 'Male', 'a701617305@es-loule.edu.pt'),
(61, 'a701romba', 'David Romba', '2001-05-29', 'Male', 'romba@gmail.com'),
(62, 'p701617565', 'Rúben Vieira', '2000-02-12', 'Outro', 'ruben@gmail.com'),
(63, 'asd123123', 'asdasd', '1990-03-12', 'Male', 'vascoraminhos@hotmail.com'),
(64, 'asd123123', 'asdasd', '1990-03-12', 'Male', 'vascoraminhos@hotmail.com'),
(65, 'g123123', 'asdasd', '1963-03-12', 'Male', 'test@gmail.com'),
(66, 'asdfeees', 'INatsuz', '1999-09-25', 'Male', 'inatsuzdragneel@hotmail.com'),
(67, '54541010', 'Fag got ', '2019-01-18', 'Male', ''),
(68, '54541010', 'Fag got ', '2019-01-18', 'Washinmach', ''),
(69, 'Sexual physicati', 'Fat ass', '0000-00-00', 'helicopter', ''),
(70, 'Sexual physicati', 'Fat ass', '0000-00-00', 'helicopter', ''),
(71, '213123123', 'asdasdasd', '1987-03-23', 'Male', 'test'),
(72, 'asd', 'asd', '1958-02-01', 'asd', 'asd'),
(73, '', '', '0000-00-00', '', ''),
(74, 'kool', 'Kool', '2000-01-01', 'School', 'school@kool.com'),
(75, 'oopppp', 'poiiiis', '2012-12-12', 'Female', 'vascoraminhos@gmail.com'),
(76, 'lol', '123123', '1912-12-12', 'Male', 'vasco'),
(77, 'test', 'test', '2012-12-12', '12', '12'),
(78, 'asd', 'asd', '2001-01-01', '1', '1'),
(79, '592071947', 'I hate you ', '2019-01-19', 'Washing ma', 'jsosbro'),
(80, '', '', '0000-00-00', '', ''),
(81, '', '', '0000-00-00', '', ''),
(82, '', '', '0000-00-00', '', ''),
(83, '', '', '0000-00-00', '', ''),
(84, '', '', '0000-00-00', '', ''),
(85, '', '', '0000-00-00', '', ''),
(86, 'p700000007', 'Cenas', '2001-01-01', '1', '1'),
(87, '234', '312', '1987-02-01', '`12', '23'),
(88, 'Cenas', 'Vasco Nuno e Silva', '1999-09-25', 'Male', 'vascoraminhos@hotmail.com'),
(89, 'Vasc', 'Vasco Raminhos', '1976-01-01', 'asd', 'asd'),
(90, 'Test#1', 'Test Professor', '1994-02-15', 'Male', 'testprofessor@es-loule.edu.pt'),
(91, 'Test Professor #', 'Eugénia', '1981-02-03', 'Female', 'enarciso@es-loule.edu.pt'),
(92, '123', '456', '1987-02-01', '123', '123');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `username` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `pass` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `email` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `username`, `pass`, `email`) VALUES
(1, 'INatsuz', '$2a$10$uF90gHBPgd8ca4fj1ZyObuxBz9EbNJs1/88hjqfOKFCOG3WsbToU6', 'vascoraminhos@hotmail.com');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `mobilities`
--
ALTER TABLE `mobilities`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_mobilities_IDProject` (`IDProject`);

--
-- Indexes for table `mobilities_students`
--
ALTER TABLE `mobilities_students`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_mobilitiesstudents_IDMobility` (`IDMobility`),
  ADD KEY `relation_mobilitiesstudents_IDStudent` (`IDStudent`);

--
-- Indexes for table `mobilities_teachers`
--
ALTER TABLE `mobilities_teachers`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_mobilitiesteachers_IDMobility` (`IDMobility`),
  ADD KEY `relation_mobilitiesteachers_IDTeacher` (`IDTeacher`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_partners_IDCountry` (`IDCountry`);

--
-- Indexes for table `partners_projects`
--
ALTER TABLE `partners_projects`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_partnersprojects_IDPartner` (`IDPartner`),
  ADD KEY `relation_partnersprojects_IDProject` (`IDProject`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_projects_idcoordinator` (`IDCoordinator`);

--
-- Indexes for table `studentgroups`
--
ALTER TABLE `studentgroups`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_classes_IDCourse` (`IDCourse`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_students_IDClass` (`IDClass`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `subjects_teachers`
--
ALTER TABLE `subjects_teachers`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `relation_subjectsteachers_IDSubject` (`IDSubject`),
  ADD KEY `relation_subjectsteachers_IDTeacher` (`IDTeacher`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `mobilities`
--
ALTER TABLE `mobilities`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `mobilities_students`
--
ALTER TABLE `mobilities_students`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `mobilities_teachers`
--
ALTER TABLE `mobilities_teachers`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `partners_projects`
--
ALTER TABLE `partners_projects`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `studentgroups`
--
ALTER TABLE `studentgroups`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subjects_teachers`
--
ALTER TABLE `subjects_teachers`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `mobilities`
--
ALTER TABLE `mobilities`
  ADD CONSTRAINT `relation_mobilities_IDProject` FOREIGN KEY (`IDProject`) REFERENCES `projects` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mobilities_students`
--
ALTER TABLE `mobilities_students`
  ADD CONSTRAINT `relation_mobilitiesstudents_IDMobility` FOREIGN KEY (`IDMobility`) REFERENCES `mobilities` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `relation_mobilitiesstudents_IDStudent` FOREIGN KEY (`IDStudent`) REFERENCES `students` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mobilities_teachers`
--
ALTER TABLE `mobilities_teachers`
  ADD CONSTRAINT `relation_mobilitiesteachers_IDMobility` FOREIGN KEY (`IDMobility`) REFERENCES `mobilities` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `relation_mobilitiesteachers_IDTeacher` FOREIGN KEY (`IDTeacher`) REFERENCES `teachers` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `partners`
--
ALTER TABLE `partners`
  ADD CONSTRAINT `relation_partners_IDCountry` FOREIGN KEY (`IDCountry`) REFERENCES `countries` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `partners_projects`
--
ALTER TABLE `partners_projects`
  ADD CONSTRAINT `relation_partnersprojects_IDPartner` FOREIGN KEY (`IDPartner`) REFERENCES `partners` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `relation_partnersprojects_IDProject` FOREIGN KEY (`IDProject`) REFERENCES `projects` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `relation_projects_idcoordinator` FOREIGN KEY (`IDCoordinator`) REFERENCES `teachers` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `studentgroups`
--
ALTER TABLE `studentgroups`
  ADD CONSTRAINT `relation_classes_IDCourse` FOREIGN KEY (`IDCourse`) REFERENCES `courses` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `relation_students_IDClass` FOREIGN KEY (`IDClass`) REFERENCES `studentgroups` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subjects_teachers`
--
ALTER TABLE `subjects_teachers`
  ADD CONSTRAINT `relation_subjectsteachers_IDSubject` FOREIGN KEY (`IDSubject`) REFERENCES `subjects` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `relation_subjectsteachers_IDTeacher` FOREIGN KEY (`IDTeacher`) REFERENCES `teachers` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
