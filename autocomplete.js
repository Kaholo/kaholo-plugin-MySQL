const parsers = require("./parsers");
const MySQLService = require("./mysql.service");

// auto complete helper methods

const MAX_RESULTS = 10;

function mapAutoParams(autoParams) {
  const params = {};
  autoParams.forEach((param) => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

/** *
 * @returns {[{id, value}]} filtered result items
 ** */
function handleResult(result, query, k, v) {
  if (!result || result.length === 0) {
    return [];
  }
  const items = result.map((item) => getAutoResult(item[k], item[v])).filter((item) => item.value);
  return filterItems(items, query);
}

function getAutoResult(id, value) {
  return {
    id: id || value,
    value: value || id,
  };
}

function filterItems(items, query) {
  let sItems = items;
  if (query) {
    // split by '.' or ' ' and make lower case
    const qWords = query.split(/[. ]/g).filter((word) => word).map((word) => word.toLowerCase());
    const fItems = items.filter(
      (item) => qWords.every((word) => item.value.toLowerCase().includes(word)),
    );
    sItems = fItems.sort(
      (word1, word2) => word1.value.indexOf(qWords[0]) - word2.value.indexOf(qWords[0]),
    );
  }
  return sItems.splice(0, MAX_RESULTS);
}

function listAuto(listFuncName, fields, addAllOption) {
  return async (query, pluginSettings, triggerParameters) => {
    const settings = mapAutoParams(pluginSettings); const
      params = mapAutoParams(triggerParameters);
    const conOpts = parsers.mySqlConStr(params.conStr || settings.conStr);
    const client = new MySQLService(conOpts);
    const result = await client[listFuncName](params);
    const items = handleResult(result, query, ...fields);
    return addAllOption ? [{ id: "*", value: "All" }, ...items] : items;
  };
}

module.exports = {
  listRolesAuto: listAuto("listRoles", ["roleHost"]),
  listUsersAuto: listAuto("listUsers", ["userHost"]),
  listDatabasesAuto: listAuto("listDbs", ["Database"]),
  listDatabasesOrAll: listAuto("listDbs", ["Database"], true),
  listTablesAuto: listAuto("listTables", ["table"]),
  listTablesOrAll: listAuto("listTables", ["table"], true),
  listUsersRolesAuto: listAuto("listUsersRoles", ["userOrRoleHost"]),
};
