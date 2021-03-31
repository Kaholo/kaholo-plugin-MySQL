const { getConnection } = require("./helpers");
const fs = require("fs");

function executeQuery(action, settings) {
  const connection = getConnection(action, settings);
  return new Promise(function(resolve, reject) { 
    connection.connect(function(err) {
      if (err) return reject(new Error("Can't authenticate"));
      
      connection.query(action.params.QUERY, function(err, rows, fields) {
        connection.end();
        if (err) return reject(err);
        return resolve(rows);
      });
    });
  });
}

function executeSQLFile(action, settings) {
  const connection = getConnection(action, settings);
  return new Promise(function(resolve, reject) {
    connection.connect(function(err) {
      if (err) return reject(new Error("Can't authenticate"));

      fs.readFile(action.params.PATH, "utf8", function(err, queries) {
        if (err) return reject(err);
        connection.query(queries, function(err, results) {
          connection.end();
          if (err) return reject(err);
          return resolve(results);
        });
      });
    });
  });
}

module.exports = {
  executeQuery: executeQuery,
  executeSQLFile: executeSQLFile
};
