const { bootstrap } = require("@kaholo/plugin-library");
const { createConnectionDetails, createConDetFromString } = require("./helpers");
const MySQLService = require("./mysql.service");
const autocomplete = require("./autocomplete");

async function executeQuery(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.executeQuery({
    query: params.query,
  });
}

async function executeSQLFile(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.executeSQLFile({
    path: params.path.absolutePath,
  });
}

async function insertData(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.insertData({
    db: params.db,
    table: params.table,
    data: params.data,
  });
}

async function testConnectivity(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.testConnectivity();
}

async function getTablesLockedStatus(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.getTablesLockedStatus({
    db: params.db,
    table: params.table,
  });
}

async function getServerVersion(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.getServerVersion();
}

async function getDbSize(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.getDbSize({
    db: params.db,
  });
}

async function getTablesSize(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.getTablesSize({
    db: params.db,
    table: params.table,
  });
}

async function createUser(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.createUser({
    user: params.user,
    host: params.host,
    pass: params.pass,
    changePass: params.changePass,
    role: params.role,
  });
}

async function grantPermissions(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.grantPermissions({
    user: params.user,
    db: params.db,
    table: params.table,
    scope: params.scope,
  });
}

async function grantRole(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.grantRole({
    user: params.user,
    role: params.role,
  });
}

async function showGrants(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.showGrants({
    user: params.user,
  });
}

async function createRole(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.createRole({
    role: params.role,
  });
}

async function deleteUser(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.deleteUser({
    user: params.user,
  });
}

async function deleteRole(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.deleteRole({
    role: params.role,
  });
}

async function listDbs(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.listDbs({});
}

async function listRoles(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.listRoles();
}

async function listUsers(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.listUsers();
}

async function listTables(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  const mySql = new MySQLService(connectionDetails);
  return mySql.listTables({
    db: params.db,
  });
}

async function copyStructure(params, { settings }) {
  const connectionDetails = createConnectionDetails(params, settings);
  let destConDet = "";
  if (params.destConStr) {
    destConDet = createConDetFromString(params.destConStr, settings.showQuery);
  }
  const mySql = new MySQLService(connectionDetails);
  return mySql.copyStructure({
    srcDb: params.db,
    srcTable: params.srcTable,
    destConOpts: destConDet || connectionDetails,
    destDb: params.destDb,
    destTable: params.destTable,
    override: params.override,
  });
}

module.exports = bootstrap(
  {
    executeQuery,
    executeSQLFile,
    insertData,
    testConnectivity,
    getTablesLockedStatus,
    getServerVersion,
    getDbSize,
    getTablesSize,
    createUser,
    grantPermissions,
    grantRole,
    showGrants,
    createRole,
    deleteUser,
    deleteRole,
    copyStructure,
    // list funcs
    listDbs,
    listTables,
    listRoles,
    listUsers,
  },
  // autocomplete methods
  autocomplete,
);
