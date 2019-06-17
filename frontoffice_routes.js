const express = require('express');
let dbConn = require('./db');

let router = express.Router();

router.get("/", function (req, res) {
	dbConn().query("SELECT m.ID, m.origin, m.originLat, m.originLng, m.IDOriginPartner, m.departureDate, m.arrivalDate, pa1.name originPartner, pa1.description originPartnerDesc, m.IDTargetPartner, pa2.name targetPartner, pa2.description targetPartnerDesc, m.target, m.targetLat, m.targetLng, m.IDProject, p.ID IDProject, p.name project, p.description FROM mobilities m INNER JOIN projects p ON m.IDProject = p.ID INNER JOIN partners pa1 ON pa1.ID = m.IDOriginPartner INNER JOIN partners pa2 ON pa2.ID = m.IDTargetPartner", function (err, mobilities) {
		dbConn().query("SELECT * FROM projects ORDER BY projectCode DESC", function (err, projects) {
			dbConn().query("SELECT ms.ID, ms.IDMobility, m.IDProject, p.name project, m.target, s.name FROM mobilities_students ms INNER JOIN students s ON ms.IDStudent = s.ID INNER JOIN mobilities m ON m.ID = ms.IDMobility INNER JOIN projects p ON p.ID = m.IDProject UNION SELECT mt.ID, mt.IDMobility, m.IDProject, p.name project, m.target, t.name FROM mobilities_teachers mt INNER JOIN teachers t ON mt.IDTeacher = t.ID INNER JOIN mobilities m ON m.ID = mt.IDMobility INNER JOIN projects p ON p.ID = m.IDProject ORDER BY IDProject", function (err, participants) {
				dbConn().query("SELECT ms.ID, ms.IDMobility, s.name student FROM mobilities_students ms INNER JOIN students s ON ms.IDStudent = s.ID", function (err, mobilities_students) {
					dbConn().query("SELECT mt.ID, mt.IDMobility, t.name teacher FROM mobilities_teachers mt INNER JOIN teachers t ON mt.IDTeacher = t.ID", function (err, mobilities_teachers) {
						dbConn().query("SELECT pp.ID, p.name partner, pr.ID IDProject, pr.name project FROM partners_projects pp INNER JOIN partners p ON p.ID = pp.IDPartner INNER JOIN projects pr ON pr.ID = pp.IDProject", function (err, partners_projects) {
							res.render("home", {
								title: "Erasmus Mobilities - ESL",
								session: req.session,
								projects: projects,
								partners_projects: partners_projects,
								participants: participants,
								mobilities: mobilities,
								mobilities_students: mobilities_students,
								mobilities_teachers: mobilities_teachers
							});
						});
					});
				});
			});
		});
	});
});

module.exports.router = router;