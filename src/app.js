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

var functions = {
    executeQuery: executeQuery,
    executeSQLFile: executeSQLFile
};

function main(argv) {
    if (argv.length < 3) {
        console.log('{err: "not enough parameters"}');
        // Invalid Argument
        // Either an unknown option was specified, or an option requiring a value was provided without a value.
        process.exit(9);
    }
    var action = JSON.parse(argv[2]);
    functions[action.method.name](action)
        .then(function (res) {
            console.log(res);
            process.exit(0); // Success
        })
        .fail(function (err) {
            console.log("an error occured", err);
            // Uncaught Fatal Exception
            // There was an uncaught exception, and it was not handled by a domain or an 'uncaughtException' event handler.
            process.exit(1); // Failure
        });
}

main(process.argv);
