const express = require('express');
const NodeGeocoder = require('node-geocoder');
const fs = require('fs');
const formidable = require('formidable');
const jwt = require('./jwt-manager');
const bcrypt = require('bcryptjs');
const dbConn = require('./db');

let router = express.Router();
let geocoder = NodeGeocoder({
	provider: "google",
	apiKey: "AIzaSyBUnqjJiIN-nXdXiPVrnIyDqQ7fLUTtolk",
	formatter: null
});

router.post("/login", function (req, res) {
	if (req.body.username !== undefined) {
		dbConn().query("SELECT * FROM users WHERE username = ?", req.body.username, function (err, result) {
			if (err) {
				res.status(401).send("Wrong Credentials");
			} else if (result.length === 1) {
				bcrypt.compare(req.body.password, result[0].pass).then(is_equal => {
					if (is_equal) {
						res.status(200).send({auth: true, token: jwt.generateToken({id: result[0].ID})});
					} else {
						res.status(401).send("Wrong Credentials");
					}
				});
			} else {
				res.status(401).send("Wrong Credentials");
			}
		});
	}
});

router.get("/logincheck", function (req, res) {
	let token = req.headers.authorization;

	jwt.verifyToken(token).then(decoded => {
		res.status(200).json({userID: decoded.id});
	}).catch(err => {
		console.log(err);
		res.status(401).send("Invalid token");
	});
});

router.get("/get/project_partners", function (req, res) {
	if (isAuthenticated(req, res)) {
		let query = "SELECT partners_projects.ID, partners.ID IDPartner, projects.ID IDProject, partners.name, partners.description, countries.country, projects.name projectName, IF(partners_projects.ID, 'true', 'false') isPartner FROM partners LEFT JOIN partners_projects ON partners.ID = partners_projects.IDPartner AND partners_projects.IDProject = " + dbConn().escape(req.query.IDProject) + " INNER JOIN projects ON projects.ID = " + dbConn().escape(req.query.IDProject) + " INNER JOIN countries on countries.ID = partners.IDCountry ORDER BY partners.name";
		console.log(query);
		dbConn().query(query, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				res.status(200).send(result);
			}
		});
	}
});

router.get("/get/mobility_students", function (req, res) {
	if (isAuthenticated(req, res)) {
		let query = "SELECT mobilities_students.ID, students.ID IDStudent, mobilities.ID IDMobility, students.name, students.studentNumber, students.birthday, students.gender, students.email, CONCAT(mobilities.origin, ' → ', mobilities.target) mobility, IF(mobilities_students.ID, 'true', 'false') isParticipating FROM students LEFT JOIN mobilities_students ON mobilities_students.IDStudent = students.ID AND mobilities_students.IDMobility = " + dbConn().escape(req.query.IDMobility) + " INNER JOIN mobilities ON mobilities.ID = " + dbConn().escape(req.query.IDMobility) + " ORDER BY students.name";
		console.log(query);
		dbConn().query(query, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				res.status(200).send(result);
			}
		});
	}
});

router.get("/get/mobility_teachers", function (req, res) {
	if (isAuthenticated(req, res)) {
		let query = "SELECT mobilities_teachers.ID, teachers.ID IDTeacher, mobilities.ID IDMobility, teachers.name, teachers.teacherNumber, teachers.gender, teachers.birthday, teachers.email, CONCAT(mobilities.origin, ' → ', mobilities.target) mobility, IF(mobilities_teachers.ID, 'true', 'false') isParticipating FROM teachers LEFT JOIN mobilities_teachers ON mobilities_teachers.IDTeacher = teachers.ID AND mobilities_teachers.IDMobility = " + dbConn().escape(req.query.IDMobility) + " INNER JOIN mobilities ON mobilities.ID = " + dbConn().escape(req.query.IDMobility) + " ORDER BY teachers.name";
		console.log(query);
		dbConn().query(query, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				res.status(200).send(result);
			}
		});
	}
});

router.get("/get/partners", function (req, res) {
	if (isAuthenticated(req, res)) {
		let query = `SELECT p.*, c.country FROM partners p INNER JOIN countries c ON p.IDCountry = c.ID ORDER BY p.name`;

		if (req.query != null) {
			let keys = Object.keys(req.query);
			if (keys.length > 0) {
				query += " WHERE ";
			}
			for (let i = 0; i < keys.length; i++) {
				if (i !== 0) {
					query += "AND ";
				}
				query += `${dbConn().escapeId(keys[i])} = ${dbConn().escape(req.query[keys[i]])}`;
			}
		}

		dbConn().query(query, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				res.send(result);
			}
		});
	}
});

router.get("/get/:table", function (req, res) {
	if (isAuthenticated(req, res)) {
		let query = `SELECT * FROM ${dbConn().escapeId(req.params.table)}`;

		if (req.query != null) {
			let keys = Object.keys(req.query);
			if (keys.length > 0) {
				query += " WHERE ";
			}
			for (let i = 0; i < keys.length; i++) {
				if (i !== 0) {
					query += "AND ";
				}
				query += `${dbConn().escapeId(keys[i])} = ${dbConn().escape(req.query[keys[i]])}`;
			}
		}

		dbConn().query(query, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				res.send(result);
			}
		});
	}
});

router.post("/insert/mobilities", function (req, res) {
	if (isAuthenticated(req, res)) {
		let origin;
		let target;

		geocoder.geocode(req.body.origin).then(origin_res => {
			geocoder.geocode(req.body.target).then(target_res => {

				origin = {
					address: req.body.origin,
					lat: origin_res[0].latitude,
					lng: origin_res[0].longitude
				};
				target = {
					address: req.body.target,
					lat: target_res[0].latitude,
					lng: target_res[0].longitude
				};

				let sql = "INSERT INTO mobilities VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
				dbConn().query(sql, [origin.address, origin.lat, origin.lng, req.body.IDOriginPartner, target.address, target.lat, target.lng, req.body.IDTargetPartner, req.body.departureDate, req.body.arrivalDate, req.body.IDProject], function (err, results) {
					if (err) {
						console.log(err);
					}

					res.status(200).send("Successfully added mobility");
				});
			});
		});
	}
});

router.post("/insert/:table", function (req, res) {
	if (isAuthenticated(req, res)) {
		let keys = Object.keys(req.body);
		let sql = "INSERT INTO " + dbConn().escapeId(req.params.table) + "(";
		let question_marks = "";
		let values = [];
		for (let i = 0; i < keys.length; i++) {
			values.push(req.body[keys[i]]);
			if (i !== 0) {
				sql += ", ";
				question_marks += ", ";
			}
			sql += keys[i];
			question_marks += "?";
		}
		sql += ") VALUES(" + question_marks + ")";
		dbConn().query(sql, values, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				sql = "SELECT * FROM " + dbConn().escapeId(req.params.table);
				dbConn().query(sql, function (err, result) {
					let ID = result[result.length - 1].ID;
					if (req.params.table === "projects") {
						fs.copyFile("./public/imgs/projects/placeholder.png", `./public/imgs/projects/${ID}.png`, err => {
							if (err) console.log(err);
						});
					}
					res.status(200).send(result);
				});
			}
		});


	}
});

router.delete("/delete/:table", function (req, res) {
	if (isAuthenticated(req, res)) {
		let sql = "DELETE FROM " + dbConn().escapeId(req.params.table) + " WHERE 0";
		let rows = req.body['rows'];
		rows.forEach(function (row) {
			sql += " OR ID = " + dbConn().escape(row);
		});
		dbConn().query(sql, function (err, results) {
			if (err) {
				console.log(err);
				res.send("Error occurred");
			} else {
				res.send("Successfully deleted ids");
			}
		});
	}
});

router.put("/edit/mobilities", function (req, res) {
	if (isAuthenticated(req, res)) {
		let origin;
		let target;

		geocoder.geocode(req.body.origin).then(origin_res => {
			geocoder.geocode(req.body.target).then(target_res => {

				origin = {
					address: req.body.origin,
					lat: origin_res[0].latitude,
					lng: origin_res[0].longitude
				};
				target = {
					address: req.body.target,
					lat: target_res[0].latitude,
					lng: target_res[0].longitude
				};

				let sql = "UPDATE mobilities SET origin = ?, originLat = ?, originLng = ?, IDOriginPartner = ?, target = ?, targetLat = ?, targetLng = ?, IDTargetPartner = ?, departureDate = ?, arrivalDate = ? WHERE ID = ?";
				dbConn().query(sql, [origin.address, origin.lat, origin.lng, req.body.IDOriginPartner, target.address, target.lat, target.lng, req.body.IDTargetPartner, req.body.departureDate, req.body.arrivalDate, req.body.ID], function (err, results) {
					if (err) {
						console.log(err);
					}

					res.status(200).send("Successfully edited mobility");
				});
			});
		});
	}
});

router.put("/edit/project_logo", function (req, res) {
	if (isAuthenticated(req, res)) {
		let form = new formidable.IncomingForm();
		form.parse(req);

		form.on('fileBegin', (name, file) => {
			console.log("Name: " + name);
			file.path = __dirname + "/public/imgs/projects/" + name + ".png";
		});

		form.on('end', function () {
			res.status(200).send("Successfully updated project logo");
		});
		form.on('error', function (err) {
			res.status(400).send("There was an error trying to edit the project logo");
		});
	}
});

router.put("/edit/:table", function (req, res) {
	if (isAuthenticated(req, res)) {
		let keys = Object.keys(req.body);
		let sql = "UPDATE " + dbConn().escapeId(req.params.table) + " SET";
		keys.forEach(function (key, index) {
			if (index !== 0) {
				sql += ",";
			}
			sql += `${dbConn().escapeId(key)} = ${dbConn().escape(req.body[key])}`;
		});
		sql += " WHERE ID = " + dbConn().escape(req.body.ID);
		dbConn().query(sql, function (err, results) {
			if (err) {
				console.log(err);
			}
		});

		res.status(200).send("Successfully edited row");
	}
});


function isAuthenticated(req, res) {
	let token = req.headers.authorization;

	if (req.session.ID != null || jwt.isAuthenticated(token)) {
		return true;
	}

	res.status(401).send("Authentication Denied");
	return false;
}

module.exports.router = router;