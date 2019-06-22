const express = require('express');
const fs = require('fs');
const jwt = require('./jwt-manager');
const bcrypt = require('bcryptjs');
const dbConn = require('./db');

let router = express.Router();

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
	console.log("Token: " + token);
	jwt.verifyToken(token).then(decoded => {
		console.log("Token is valid");
		res.status(200).json({userID: decoded.id});
	}).catch(err => {
		console.log("Token is invalid");
		console.log(err);
		res.status(401).send("Invalid token");
	});
});

router.get("/get/:table", function (req, res) {
	if (isAuthenticated(req, res)) {
		let query = "SELECT * FROM " + dbConn().escapeId(req.params.table);
		dbConn().query(query, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				res.send(result);
			}
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
			console.log(req.body[keys[i]]);
			if (i !== 0) {
				sql += ", ";
				question_marks += ", ";
			}
			sql += keys[i];
			question_marks += "?";
		}
		sql += ") VALUES(" + question_marks + ")";
		console.log(sql);
		dbConn().query(sql, values, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				console.log("Inserted one row into the table teachers");
				sql = "SELECT * FROM " + dbConn().escapeId(req.params.table) + " ORDER BY ID DESC LIMIT 0, 1";
				console.log(sql);
				dbConn().query(sql, function (err, result) {
					console.log(result);
					if (req.params.table === "projects") {
						fs.copyFile("./public/imgs/projects/placeholder.png", `./public/imgs/projects/${result[0].ID}.png`, err => console.log(err));
					}
					res.send(result)
				});
			}
		});


	}
});

router.post("/delete/:table", function (req, res) {
	if (isAuthenticated(req, res)) {
		let sql = "DELETE FROM " + dbConn().escapeId(req.params.table) + " WHERE 0";
		let rows = JSON.parse(req.body['rows']);
		console.log(req.body);
		rows.forEach(function (row) {
			sql += " OR ID = " + dbConn().escape(row);
		});
		console.log(sql);
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

router.post("/edit/:table", function (req, res) {
	if (isAuthenticated(req, res)) {
		let keys = Object.keys(req.body);
		let sql = "UPDATE " + dbConn().escapeId(req.params.table) + " SET";
		keys.forEach(function (key, index) {
			if (index !== 0) {
				sql += ",";
			}
			sql += " " + dbConn().escapeId(key) + " = " + dbConn().escape(req.body[key]);
		});
		sql += " WHERE ID = " + dbConn().escape(req.body.ID);
		dbConn().query(sql, function (err, results) {
			if (err) {
				console.log(err);
			} else {
				console.log(results);
			}
		});

		res.send("Success");
	}
});


function isAuthenticated(req, res) {
	let token = req.headers.authorization;
	console.log("Is Authenticated: " + token);

	if (req.session.ID != null || jwt.isAuthenticated(token)) {
		console.log("I knew it!");
		return true;
	}

	res.status(401).send("Authentication Denied");
	return false;
}

module.exports.router = router;