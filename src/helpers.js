var mysql = require("mysql");

function getConnection(action, settings){
    return mysql.createConnection({
        host: action.params.HOST || settings.host,
        port: action.params.PORT || settings.port,
        user: action.params.USER || settings.username,
        password: action.params.PASSWORD || settings.password,
        database: action.params.DB || settings.db
    });
}

module.exports = {
    getConnection
};