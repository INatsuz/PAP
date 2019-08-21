const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const session = require('express-session');
const fetch = require('node-fetch');

const backoffice_router = require("./backoffice_routes");
const api_router = require("./api_routes");
const frontoffice_router = require("./frontoffice_routes");

let app = express();
let port = 80;

const IP_LOCATION_API_KEY = '4795b8a7ced4e823553f38b05f82b62d';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: "NDoAIRkgmzYPGVn7",
    saveUninitialized: false,
    resave: true,
    rolling: true,
    cookie: {maxAge: backoffice_router.SESSION_TIMEOUT}
}));
app.use(favicon(path.join(__dirname, 'public', 'imgs', 'favicon.ico')));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, '/public')));

// app.use('/robots.txt', function (req, res, next) {
//     res.type('text/plain');
//     res.send("User-agent: *\nDisallow: /");
// });

// app.use(function (req, res, next) {
//     console.log(req.url);
//     let ip = req.headers['x-forwarded-for'] ||
//         req.connection.remoteAddress ||
//         req.socket.remoteAddress ||
//         (req.connection.socket ? req.connection.socket.remoteAddress : null);
//     if (ip !== null) {
//         ip = ip.substring(7);
//         console.log(ip);
//     }
//     fetch(`http://ip-to-geolocation.com/api/json/${ip}?key=${IP_LOCATION_API_KEY}`).then(function (res) {
//         res.json().then(function (json) {
//             // console.log(json);
//             console.log("Country: " + json.country);
//             console.log("Region: " + json.regionName);
//             console.log("-----------------------");
//         });
//     });
//
//     next("route");
// });

app.use(function (req, res, next) {
    console.log(req.url);

    next("route");
});

app.use("/old_backoffice", backoffice_router.router);
app.use("/backoffice/", function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/backoffice/index.html"));
});
app.use("/api", api_router.router);
app.use("/", frontoffice_router.router);

app.use("/404", function (req, res) {
    res.render("err");
});
app.use(function (req, res) {
    res.render("err404");
});

app.listen(port);