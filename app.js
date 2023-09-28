const { bootstrap } = require("@kaholo/plugin-library");
const { createConnectionDetails, createConDetFromString } = require("./helpers");
const MySQLService = require("./mysql.service");
const autocomplete = require("./autocomplete");

async function executeQuery(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.executeQuery({
    query: params.query,
  });
}

async function executeSQLFile(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.executeSQLFile({
    path: params.path.absolutePath,
  });
}

async function insertData(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.insertData({
    db: params.db,
    table: params.table,
    data: params.data,
  });
}

async function testConnectivity(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.testConnectivity();
}

async function getTablesLockedStatus(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.getTablesLockedStatus({
    db: params.db,
    table: params.table,
  });
}

async function getServerVersion(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.getServerVersion();
}

async function getDbSize(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.getDbSize({
    db: params.db,
  });
}

async function getTablesSize(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.getTablesSize({
    db: params.db,
    table: params.table,
  });
}

async function createUser(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.createUser({
    user: params.user,
    host: params.host,
    pass: params.pass,
    changePass: params.changePass,
    role: params.role,
  });
}

async function grantPermissions(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.grantPermissions({
    user: params.user,
    db: params.db,
    table: params.table,
    scope: params.scope,
  });
}

async function grantRole(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.grantRole({
    user: params.user,
    role: params.role,
  });
}

async function showGrants(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.showGrants({
    user: params.user,
  });
}

async function createRole(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.createRole({
    role: params.role,
  });
}

async function deleteUser(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.deleteUser({
    user: params.user,
  });
}

async function deleteRole(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.deleteRole({
    role: params.role,
  });
}

async function listDbs(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.listDbs({});
}

async function listRoles(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.listRoles();
}

async function listUsers(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.listUsers();
}

async function listTables(params) {
  const connectionDetails = createConnectionDetails(params)
  const mySql = new MySQLService(connectionDetails);
  return mySql.listTables({
    db: params.db,
  });
}

async function copyStructure(params) {
  const connectionDetails = createConnectionDetails(params)
  let destConDet = "";
  if (params.destConStr) {
    destConDet = createConDetFromString(params.destConStr);
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

module.exports = bootstrap({
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
  listUsers},
  // autocomplete methods
  autocomplete);
