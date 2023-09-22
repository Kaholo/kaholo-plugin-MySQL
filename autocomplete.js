const parsers = require("./parsers");
const MySQLService = require('./mysql.service');

// auto complete helper methods

const MAX_RESULTS = 10;

function mapAutoParams(autoParams){
  const params = {};
  autoParams.forEach(param => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

/***
 * @returns {[{id, value}]} filtered result items
 ***/
function handleResult(result, query, keyField, valField){
  if (!result || result.length == 0) return [];
  const items = result.map(item => getAutoResult(item[keyField], item[valField])).filter(item => item.value);
  return filterItems(items, query);
}

function getAutoResult(id, value) {
  return {
    id: id || value,
    value: value || id
  };
}

function filterItems(items, query){
  if (query){
    const qWords = query.split(/[. ]/g).filter(word => word).map(word => word.toLowerCase()); // split by '.' or ' ' and make lower case
    items = items.filter(item => qWords.every(word => item.value.toLowerCase().includes(word)));
    items = items.sort((word1, word2) => word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0]));
  }
  return items.splice(0, MAX_RESULTS);
}

function listAuto(listFuncName, fields, addAllOption) {
  return async (query, pluginSettings, triggerParameters) => {
    const settings = mapAutoParams(pluginSettings), params = mapAutoParams(triggerParameters); 
    const conOpts = parsers.mySqlConStr(params.conStr || settings.conStr);
    const client = new MySQLService(conOpts);
    const result = await client[listFuncName](params);
    const items = handleResult(result, query, ...fields);
    return addAllOption ? [{id: "*", value: "All"}, ...items] : items;
  }
}


module.exports = {
  listRolesAuto: listAuto("listRoles", ["roleName"]),
  listUsersAuto: listAuto("listUsers", ["user"]),
  listDatabasesAuto: listAuto("listDbs", ["Database"]),
  listDatabasesOrAll: listAuto("listDbs", ["Database"], true),
  listTablesAuto: listAuto("listTables", ["table"]),
  listTablesOrAll: listAuto("listTables", ["table"], true)
}