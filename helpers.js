const { ConnectionString } = require("connection-string");

function createConnectionDetails({ connectionString, password}, { showQuery }) {
  const connectionDetails = new ConnectionString(connectionString);
  const connectionDetailsAugmented = {
    host: connectionDetails.hosts[0].name,
    ...connectionDetails,
  };
  if (password) {
    connectionDetailsAugmented.password = password;
  }
  // plugin setting is type string because of bug KAH-6258
  if (showQuery === "YES") {
    connectionDetailsAugmented.showQuery = true;
  }
  return connectionDetailsAugmented;
}

// needed for copyStructure when destination is different server
function createConDetFromString(connectionString, showQuery) {
  const connectionDetails = new ConnectionString(connectionString);
  const connectionDetailsAugmented = {
    host: connectionDetails.hosts[0].name,
    ...connectionDetails,
  };
  // plugin setting is type string because of bug KAH-6258
  if (showQuery === "YES") {
    connectionDetailsAugmented.showQuery = true;
  }
  return connectionDetailsAugmented;
}

module.exports = {
  createConnectionDetails,
  createConDetFromString,
};
