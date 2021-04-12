var mysql = require("mysql");
const fs = require("fs");

async function executeQuery(action, settings) {
  const conStr = (action.params.conStr || settings.conStr || "").trim();
  const query = (action.params.query || "").trim();
  if (!conStr || !query){
    throw "Not given one of required parameters!";
  }
  const connection = mysql.createConnection(conStr);
  return new Promise(function(resolve, reject) { 
    connection.connect(function(err) {
      if (err) return reject(new Error("Can't authenticate"));
      connection.query(query, function(err, result) {
        connection.end();
        if (err) return reject(err);
        return resolve(result);
      });
    });
  });
}

async function executeSQLFile(action, settings) {
  const path = (action.params.path || "").trim();
  if (!path){
    throw "Not given path to SQL file!";
  }
  action.params["query"] = fs.readFileSync(path, {encoding: "utf8"});
  return executeQuery(action, settings);
}

module.exports = {
  executeQuery: executeQuery,
  executeSQLFile: executeSQLFile
};
