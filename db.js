const mysql = require("mysql");

let dbConfig = {
    host: "localhost",
    user: "user",
    password: "password",
    database: "erasmus"
};

let dbConn;

function handleConnection() {
    dbConn = mysql.createConnection(dbConfig);

    dbConn.connect(function (err) {
        if (err) {
            console.log('Error connecting to the database:', err);
            setTimeout(handleConnection, 2000);
        } else {
            console.log("Successfully connected to database");
        }
    });

    dbConn.on('error', function (err) {
        console.log('DB Error - ', err);

        handleConnection();
    });
}

handleConnection();

function getConn(){
    return dbConn;
}

module.exports = getConn;