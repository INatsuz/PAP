const express = require('express');
const bcrypt = require('bcryptjs');
const formidable = require('formidable');
let dbConn = require('./db');

const SESSION_TIMEOUT = 3600 * 1000;

let router = express.Router();
let backoffice_logins = [];

router.get('', function (req, res) {
    res.redirect("../backoffice/teachers");
});

router.get('/*', function (req, res, next) {
    if (req.session.ID !== undefined) {
        refreshSession(req);
    }

    let exceptions = ["/login", "/logout", "/register"];
    if (exceptions.indexOf(req.url) === -1) {
        req.session.lastURL = req.originalUrl;
    }
    next('route');
});

router.post('/login', function (req, res) {
    dbConn().query("SELECT * FROM users WHERE username = ?", req.body.username, function (err, result) {
        if (err) console.log(err);
        // bcrypt.hash(req.body.password, 10, function (err, hash) {
            // console.log(hash);
        // });

        if (result.length === 1) {
            bcrypt.compare(req.body.password, result[0].pass, function (err, is_equal) {
                if (is_equal) {
                    console.log("Passwords Match");
                    req.session.ID = result[0].ID;
                    req.session.username = result[0].username;
                    req.session.email = result[0].email;

                    // backoffice_logins.push({
                    //     id: req.session.id, timeout: setTimeout(function () {
                    //         for (let i = 0; i < backoffice_logins.length; i++) {
                    //             if (backoffice_logins[i].id === req.session.id) {
                    //                 backoffice_logins.splice(i, 1);
                    //                 console.log("Removed " + req.session.id);
                    //                 break;
                    //             }
                    //         }
                    //     }, SESSION_TIMEOUT)
                    // });

                    console.log("Login - Adding backoffice login");
                    console.log(backoffice_logins);
                    res.redirect(req.session.lastURL !== undefined ? req.session.lastURL : "./teachers");
                } else {
                    console.log("Passwords Do Not Match");
                    res.redirect(req.session.lastURL !== undefined ? req.session.lastURL : "./teachers");
                }
            });
        }
    });
});

router.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) {
            res.end("RIP");
        } else {
            dbConn().query("INSERT INTO users VALUES(NULL, ?, ?, ?)", [req.body.username, hash, req.body.email], function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });
        }
    });
    res.redirect(req.session.lastURL !== undefined ? req.session.lastURL : "./teachers");
});

router.get("/logout", function (req, res) {
    for (let i = 0; i < backoffice_logins.length; i++) {
        if (backoffice_logins[i].id === req.session.id) {
            clearTimeout(backoffice_logins[i].timeout);
            backoffice_logins.splice(i, 1);
            break;
        }
    }
    console.log("Logout - Removing backoffice login");
    console.log(backoffice_logins);

    let lastURL = req.session.lastURL;
    req.session.destroy();

    res.redirect(lastURL !== undefined ? lastURL : "./teachers");
});

router.get('/teachers', function (req, res) {
    dbConn().query("SELECT * FROM teachers", function (err, result) {
        if (err) throw err;

        // console.log(result);
        res.render("backoffice/teachers", {title: "Backoffice - Teachers", teachers: result, session: req.session});
    });
});

router.get('/students', function (req, res) {
    dbConn().query("SELECT s.ID, s.studentNumber, s.name, s.birthday, s.gender, s.email, CONCAT(sg.grade, sg.designation) class FROM students s INNER JOIN studentgroups sg on s.IDClass = sg.ID", function (err, students) {
        if (err) throw err;
        dbConn().query("SELECT * FROM studentgroups", function (err, studentgroups) {
            res.render("backoffice/students", {
                title: "Backoffice - Students",
                students: students,
                studentgroups: studentgroups,
                session: req.session
            });
        });
    });
});

router.get('/subjects', function (req, res) {
    dbConn().query("SELECT * FROM subjects", function (err, result) {
        if (err) throw err;

        res.render("backoffice/subjects", {title: "Backoffice - Subjects", subjects: result, session: req.session});
    });
});

router.get('/subjects_teachers', function (req, res) {
    dbConn().query("SELECT st.ID, s.subject, t.name teacher FROM subjects_teachers st INNER JOIN subjects s ON st.IDSubject = s.ID INNER JOIN teachers t ON st.IDTeacher = t.ID", function (err, result) {
        if (err) throw err;
        dbConn().query("SELECT * FROM subjects", function (err, subjects) {
            if (err) {
                console.log(err);
            } else {
                dbConn().query("SELECT * FROM teachers", function (err, teachers) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("backoffice/subjects_teachers", {
                            title: "Backoffice - Subjects/Teachers",
                            subjects_teachers: result,
                            subjects: subjects,
                            teachers: teachers,
                            session: req.session
                        });
                    }
                });
            }
        });
    });
});

router.get("/partners", function (req, res) {
    dbConn().query("SELECT p.ID, p.name, p.description, c.country FROM partners p INNER JOIN countries c ON p.IDCountry = c.ID", function (err, result) {
        if (err) throw err;
        dbConn().query("SELECT * FROM countries", function (err, countries) {
            if (err) throw  err;
            res.render("backoffice/partners", {
                title: "Backoffice - Partners",
                partners: result,
                countries: countries,
                session: req.session
            });
        });
    });
});

router.get("/partners_projects", function (req, res) {
    dbConn().query("SELECT pp.ID, pr.name project, pa.name partner FROM partners_projects pp INNER JOIN mobilities pr ON pp.IDProject = pr.ID INNER JOIN partners pa ON pp.IDPartner = pa.ID", function (err, result) {
        if (err) {
            console.log(err);
        } else {
            dbConn().query("SELECT * FROM partners", function (err, partners) {
                dbConn().query("SELECT * FROM mobilities", function (err, projects) {
                    res.render("backoffice/partners_projects", {
                        title: "Backoffice - Partners/Projects",
                        partners_projects: result,
                        partners: partners,
                        projects: projects,
                        session: req.session
                    });
                });
            });
        }
    });
});

router.get("/projects_teachers", function (req, res) {
    dbConn().query("SELECT pt.ID, p.name project, t.name teacher FROM projects_teachers pt INNER JOIN mobilities p ON pt.IDProject = p.ID INNER JOIN teachers t ON pt.IDTeacher = t.ID", function (err, result) {
        if (err) {
            console.log(err);
        } else {
            dbConn().query("SELECT * FROM mobilities", function (err, projects) {
                dbConn().query("SELECT * FROM teachers", function (err, teachers) {
                    res.render("backoffice/projects_teachers", {
                        title: "Backoffice - Projects/Teachers",
                        projects_teachers: result,
                        projects: projects,
                        teachers: teachers,
                        session: req.session
                    });
                });
            });
        }
    });
});

router.get("/mobilities", function (req, res) {
    console.log(req.query);
    console.log("SELECT m.ID, m.origin, pa1.name originPartner, m.target, pa2.name targetPartner, m.departureDate, m.arrivalDate, p.name project FROM mobilities m INNER JOIN projects p ON m.IDProject = p.ID INNER JOIN partners pa1 ON pa1.ID = m.IDOriginPartner INNER JOIN partners pa2 ON pa2.ID = m.IDTargetPartner" + (req.query.projectID !== undefined ? " WHERE p.ID = " + req.query.projectID : "") + " ORDER BY m.departureDate DESC");
    dbConn().query("SELECT m.ID, m.origin, pa1.name originPartner, m.target, pa2.name targetPartner, m.departureDate, m.arrivalDate, p.name project FROM mobilities m INNER JOIN projects p ON m.IDProject = p.ID INNER JOIN partners pa1 ON pa1.ID = m.IDOriginPartner INNER JOIN partners pa2 ON pa2.ID = m.IDTargetPartner" + (req.query.projectID !== undefined ? " WHERE p.ID = " + req.query.projectID : "") + " ORDER BY m.departureDate DESC", function (err, result) {
        if (err) throw err;
        dbConn().query("SELECT * FROM mobilities", function (err, projects) {
            if (err) throw err;
            dbConn().query("SELECT * FROM partners", function (err, partners) {
                if (err) throw err;
                res.render("backoffice/mobilities", {
                    title: "Backoffice - Mobilities",
                    mobilities: result,
                    projects: projects,
                    partners: partners,
                    session: req.session
                });
            });
        });
    });
});

router.get("/mobilities_students", function (req, res) {
    dbConn().query("SELECT ms.ID, CONCAT(p.name, CONCAT(\" - \", m.target)) mobility, s.name student FROM mobilities_students ms INNER JOIN mobilities m ON ms.IDMobility = m.ID INNER JOIN mobilities p ON m.IDProject = p.ID INNER JOIN students s ON ms.IDStudent = s.ID", function (err, result) {
        if (err) throw err;
        dbConn().query("SELECT m.ID, CONCAT(p.name, CONCAT(\" - \", m.target)) mobility FROM mobilities m INNER JOIN mobilities p ON m.IDProject = p.ID", function (err, mobilities) {
            if (err) throw err;
            dbConn().query("SELECT * FROM students", function (err, students) {
                if (err) throw err;
                res.render("backoffice/mobilities_students", {
                    title: "Backoffice - Mobilities/Students",
                    mobilities_students: result,
                    mobilities: mobilities,
                    students: students,
                    session: req.session
                });
            });
        });
    });
});

router.get("/mobilities_teachers", function (req, res) {
    dbConn().query("SELECT mt.ID, CONCAT(p.name, CONCAT(\" - \", m.target)) mobility, t.name teacher FROM mobilities_teachers mt INNER JOIN mobilities m ON mt.IDMobility = m.ID INNER JOIN mobilities p ON m.IDProject = p.ID INNER JOIN teachers t ON mt.IDTeacher = t.ID", function (err, result) {
        if (err) throw err;

        dbConn().query("SELECT m.ID, CONCAT(p.name, CONCAT(\" - \", m.target)) mobility FROM mobilities m INNER JOIN mobilities p ON m.IDProject = p.ID", function (err, mobilities) {
            if (err) throw err;
            dbConn().query("SELECT * FROM teachers", function (err, teachers) {
                if (err) throw err;
                res.render("backoffice/mobilities_teachers", {
                    title: "Backoffice - Mobilities/Teachers",
                    mobilities_teachers: result,
                    mobilities: mobilities,
                    teachers: teachers,
                    session: req.session
                });
            });
        });
    });
});

router.get('/mobilities', function (req, res) {
    dbConn().query("SELECT p.ID, p.projectCode, p.name, p.description FROM mobilities p ORDER BY projectCode DESC", function (err, result) {
        if (err) throw err;
        res.render("backoffice/mobilities", {
            title: "Backoffice - Projects",
            projects: result,
            session: req.session
        });
    });
});

router.get('/courses', function (req, res) {
    dbConn().query("SELECT * FROM courses", function (err, result) {
        if (err) throw err;
        res.render("backoffice/courses", {
            title: "Backoffice - Courses",
            courses: result,
            session: req.session
        });
    });
});

router.get('/countries', function (req, res) {
    dbConn().query("SELECT * FROM countries", function (err, result) {
        if (err) throw err;

        res.render("backoffice/countries", {
            title: "Backoffice - Countries",
            countries: result,
            session: req.session
        });
    });
});

router.get('/studentgroups', function (req, res) {
    dbConn().query("SELECT sg.ID, sg.grade, sg.designation, c.course FROM studentgroups sg INNER JOIN courses c ON sg.IDCourse = c.ID", function (err, result) {
        if (err) throw err;
        dbConn().query("SELECT * FROM courses", function (err, courses) {
            res.render("backoffice/studentgroups", {
                title: "Backoffice - Student Groups",
                studentgroups: result,
                courses: courses,
                session: req.session
            });
        });

    });
});

router.get("/projects_logos", function (req, res) {
    dbConn().query("SELECT mobilities.ID, mobilities.projectCode, mobilities.name FROM mobilities", function (err, result) {
        if (err) throw err;
        res.render("backoffice/projects_logos", {
            title: "Backoffice - Projects Logos",
            projects: result,
            session: req.session
        });
    });
});

router.post("/upload_project_logo", function (req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(fields);
    }).on('fileBegin', (name, file) => {
        file.path = __dirname + "/public/imgs/projects/" + name + ".png";
    });
    res.redirect("/backoffice/projects_logos");
});

function refreshSession(req) {
    console.log("Session Refreshed");
    backoffice_logins.forEach(function (element) {
        if (element.id === req.session.id) {
            clearTimeout(element.timeout);
            console.log("Timeout Cleared");
            element.timeout = setTimeout(function () {
                for (let i = 0; i < backoffice_logins.length; i++) {
                    if (backoffice_logins[i].id === req.session.id) {
                        backoffice_logins.splice(i, 1);
                        console.log("Removed " + req.session.id);
                        break;
                    }
                }
                console.log(backoffice_logins);
            }, SESSION_TIMEOUT);
        }
    });
}

module.exports.router = router;
module.exports.SESSION_TIMEOUT = SESSION_TIMEOUT;
module.exports.backoffice_logins = backoffice_logins;