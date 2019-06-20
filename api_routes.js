const express = require('express');
const fs = require('fs');
const dbConn = require('./db');
const backoffice_logins = require("./backoffice_routes").backoffice_logins;

let router = express.Router();

router.get("/get/:table", function (req, res) {
    if (isAuthenticated(req)) {
        let query = "SELECT * FROM " + dbConn().escapeId(req.params.table);
        dbConn().query(query, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
    } else {
        res.end("Authentication Denied");
    }
});

router.post("/insert/:table", function (req, res) {
    if (isAuthenticated(req)) {
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
                    if(req.params.table === "projects"){
                        fs.copyFile("./public/imgs/projects/placeholder.png", `./public/imgs/projects/${result[0].ID}.png`, err => console.log(err));
                    }
                    res.send(result)
                });
            }
        });


    } else {
        res.end("Authentication Denied");
    }
});

router.post("/delete/:table", function (req, res) {
    if (isAuthenticated(req)) {
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
    } else {
        res.end("Authentication Denied");
    }
});

router.post("/edit/:table", function (req, res) {
    if (isAuthenticated(req)) {
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
    } else {
        res.end("Authentication Denied");
    }
});


function isAuthenticated(req) {
    if(req.session.ID != null){
        console.log("I knew it!");
        return true;
    }
    // console.log(req.session.ID);
    // for (let i = 0; i < backoffice_logins.length; i++) {
    //     if (backoffice_logins[i].id === req.session.id) {
    //         return true;
    //     }
    // }
    return false;
}

module.exports.router = router;