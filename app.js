const MySQLService = require("./mysql.service");
const parsers = require("./parsers");
const autocomplete = require("./autocomplete");

async function executeQuery(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.executeQuery({
    query: parsers.string(action.params.query),
  });
}

async function executeSQLFile(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.executeSQLFile({
    path: parsers.path(action.params.path),
  });
}

async function insertData(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.insertData({
    db: parsers.autocomplete(action.params.db),
    table: parsers.autocomplete(action.params.table),
    data: parsers.arrayOfObjects(action.params.data),
  });
}

async function testConnectivity(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.testConnectivity();
}

async function getTablesLockedStatus(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.getTablesLockedStatus({
    db: parsers.autocomplete(action.params.db),
    table: parsers.autocomplete(action.params.table),
  });
}

async function getServerVersion(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.getServerVersion();
}

async function getDbSize(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.getDbSize({
    db: parsers.autocomplete(action.params.db),
  });
}

async function getTablesSize(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.getTablesSize({
    db: parsers.autocomplete(action.params.db),
    table: parsers.autocomplete(action.params.table),
  });
}

async function createUser(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.createUser({
    user: parsers.string(action.params.user),
    pass: action.params.pass,
    changePass: parsers.boolean(action.params.changePassrole),
    role: parsers.autocomplete(action.params.role),
    db: parsers.autocomplete(action.params.db),
    table: parsers.autocomplete(action.params.table),
    scope: action.params.scope,
  });
}

async function grantPermissions(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.grantPermissions({
    user: parsers.autocomplete(action.params.user),
    db: parsers.autocomplete(action.params.db),
    table: parsers.autocomplete(action.params.table),
    role: parsers.autocomplete(action.params.role),
    scope: action.params.scope,
  });
}

async function createRole(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.createRole({
    role: parsers.string(action.params.role),
    db: parsers.autocomplete(action.params.db),
    table: parsers.autocomplete(action.params.table),
    scope: action.params.scope,
  });
}

async function deleteUser(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.deleteUser({
    user: parsers.autocomplete(action.params.user),
  });
}

async function copyStructure(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.copyStructure({
    srcDb: parsers.autocomplete(action.params.srcDb),
    srcTable: parsers.autocomplete(action.params.srcTable),
    destConStr: parsers.mySqlConStr(action.params.destConStr),
    destDb: parsers.autocomplete(action.params.destDb),
    destTable: parsers.autocomplete(action.params.destTable),
    override: parsers.boolean(action.params.override),
  });
}

async function listDbs(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.listDbs({});
}

async function listRoles(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.listRoles();
}

async function listUsers(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.listUsers();
}

async function listTables(action, settings) {
  const conOpts = parsers.mySqlConStr(action.params.conStr || settings.conStr);
  const mySql = new MySQLService(conOpts);
  return mySql.listTables({
    db: parsers.autocomplete(action.params.db),
  });
}

module.exports = {
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
  createRole,
  deleteUser,
  copyStructure,
  // list funcs
  listDbs,
  listTables,
  listRoles,
  listUsers,
  // autocomplete methods
  ...autocomplete,
};
