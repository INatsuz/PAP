const mysql = require("mysql");

let dbConn;

let dbConfig = {
    host: "localhost",
    user: "user",
    password: "password",
    database: "erasmus",
    timezone: "Z"
};

function handleConnection() {
    dbConn = mysql.createConnection(dbConfig);

    dbConn.on('error', function (err) {
        console.log('DB Error - ', err);

        handleConnection();
    });

    dbConn.connect(function (err) {
        if (err) {
            console.log('Error connecting to the database:', err);
            setTimeout(handleConnection, 2000);
        } else {
            console.log("Successfully connected to database");
        }
    });
}

function getConn(){
    return dbConn;
}

handleConnection();

module.exports = getConn;