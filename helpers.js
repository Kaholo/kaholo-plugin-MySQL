const { ConnectionString } = require("connection-string");

function createConnectionDetails({ connectionString, password, showQuery }) {
  const connectionDetails = new ConnectionString(connectionString);
  const connectionDetailsAugmented = {
    host: connectionDetails.hosts[0].name,
    ...connectionDetails,
  };
  if (password) {
    connectionDetailsAugmented.password = password;
  }
  if (showQuery) {
    connectionDetailsAugmented.showQuery = true;
  }
  return connectionDetailsAugmented;
}

// needed for copyStructure when destination is not as kaholo account
function createConDetFromString(connectionString, showQuery) {
  const connectionDetails = new ConnectionString(connectionString);
  const connectionDetailsAugmented = {
    host: connectionDetails.hosts[0].name,
    ...connectionDetails,
  };
  if (showQuery) {
    connectionDetailsAugmented.showQuery = true;
  }
  return connectionDetailsAugmented;
}

module.exports = {
  createConnectionDetails,
  createConDetFromString,
};
