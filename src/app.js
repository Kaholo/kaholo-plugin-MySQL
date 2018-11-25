#!/usr/bin/env node

var q = require('q');
var mysql = require('mysql');
var fs = require('fs');


function executeQuery(action) {
    var deferred = q.defer();
    var connection = mysql.createConnection({
        host: action.params.HOST,
        port: action.params.PORT,
        user: action.params.USER,
        password: action.params.PASSWORD,
        database: action.params.DB
    });
    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            throw new Error("Can't authenticate");
        }
    });

    connection.query(action.params.QUERY, function (err, rows, fields) {
        if (err) {
            return deferred.resolve({ "error": err });
        }
        return deferred.resolve({ "res": JSON.stringify(rows) });
    });

    connection.end();

    return deferred.promise;
}

function executeSQLFile(action) {
    var deferred = q.defer();

    var connection = mysql.createConnection({
        host: action.params.HOST,
        port: action.params.PORT,
        user: action.params.USER,
        password: action.params.PASSWORD,
        database: action.params.DB,
        multipleStatements: true
    });

    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            throw new Error("Can't authenticate");
        }
    });

    fs.readFile(action.params.PATH, 'utf8', function (err, queries) {
        if (err) {
            return deferred.resolve({ "error": JSON.stringify(err) });
        }

        connection.query(queries, function (err, results) {
            if (err) {
                return deferred.resolve({ "error": JSON.stringify(err) });
            }
            return deferred.resolve({ "res": JSON.stringify(results) });
        });

        connection.end();
    });

    return deferred.promise;
}

module.exports = {
    executeQuery: executeQuery,
    executeSQLFile: executeSQLFile
};