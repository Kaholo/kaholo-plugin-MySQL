const mysql = require("mysql");
const fs = require("fs");
const mysqldump = require("mysqldump").default;
const { promisify } = require("util");

const asyncFuncs = ["connect", "end", "query", "beginTransaction", "commit", "rollback"];

module.exports = class MySQLService {
  constructor(connectionDetails) {
    if (!connectionDetails) {
      throw new Error("Connection string not provided! Expected format: mysql://username@host:port/database");
    }
    if (!connectionDetails.host) {
      throw new Error("Host not found in connection string! Expected format: mysql://username@host:port/database");
    }
    if (!connectionDetails.user) {
      throw new Error("User (name) not found in connection string! Expected format: mysql://username@host:port/database");
    }
    if (!connectionDetails.host) {
      throw new Error("Password not found in connection string or Kaholo plugin account! Expected format: mysql://username@host:port/database");
    }
    this.connectionDetails = connectionDetails;
    this.connection = mysql.createConnection(connectionDetails);
    asyncFuncs.forEach((func) => {
      this[func] = promisify(this.connection[func]).bind(this.connection);
    });
  }

  static buildSqlCommand(baseCmd, filters, orderBy) {
    return `${baseCmd}${filters && filters.length ? `
                WHERE ${filters.map(([name, val]) => `${name} = '${val}'`).join(" AND ")}` : ""}${orderBy && orderBy.length ? `
                ORDER BY ${orderBy.map(([name, val]) => `${name}${val ? ` ${val}` : ""}`).join(", ")}` : ""}`;
  }

  async executeQuery({ query }, dontConnect = false) {
    if (!query) {
      throw new Error("Must provide query to execute!");
    }
    if (this.connectionDetails.showQuery) {
      console.error(`\nTHE QUERY IS: ${query}\n`);
    }
    if (!dontConnect) {
      await this.connect();
    }
    try {
      const result = await this.query(query);
      return result;
    } catch (error) {
      throw new Error(`Error executing query: ${error.message || JSON.stringify(error)}`);
    } finally {
      if (!dontConnect) {
        await this.end();
      }
    }
  }

  async insertData({ db, table, data }, dontConnect = false) {
    if (!dontConnect) {
      await this.connect();
    }
    try {
      // Set since we don't want duplicate fields, but not all objects necessarily has all fields
      let fields = new Set();
      data.forEach((row) => Object.keys(row).forEach((field) => fields.add(field)));
      fields = Array.from(fields);
      const dataMetrix = data.map((row) => fields.map((field) => row[field]));
      const result = await this.query(`INSERT INTO ${db || "dbo"}.${table} (${fields.join(", ")}) VALUES ?`, [dataMetrix]);
      return result;
    } catch (error) {
      throw new Error(`Error inserting data: ${error.message || JSON.stringify(error)}`);
    } finally {
      if (!dontConnect) {
        await this.end();
      }
    }
  }

  async executeSQLFile({ path }) {
    if (!path) {
      throw new Error("Must provide SQL query file to execute!");
    }
    if (!fs.existsSync(path)) {
      throw new Error(`Couldn't find file: ${path}`);
    }
    return this.executeQuery({
      query: fs.readFileSync(path, "utf8"),
    });
  }

  async testConnectivity() {
    try {
      await this.connect();
      await this.end();
    } catch (e) {
      const result = {
        status: "error",
        ...e,
      };
      throw result;
    }
    return { status: "connected" };
  }

  async getTablesLockedStatus({ db, table }) {
    if (table && !db) {
      throw new Error("If specifying a table, specifying a database is also required.");
    }
    const queryArray = ["SHOW OPEN TABLES"];
    if (db) {
      queryArray.push(`WHERE \`Database\` = '${db}'`);
    }
    if (table) {
      queryArray.push(`AND \`Table\` = '${table}'`);
    }
    return this.executeQuery({ query: queryArray.join(" ") });
  }

  async getServerVersion() {
    return this.executeQuery({
      query: "SELECT version()",
    });
  }

  async getDbSize({ db }) {
    return this.executeQuery({
      query: `SELECT table_schema 'database',
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) 'sizeInMb' 
                    FROM information_schema.tables 
                    ${db && db !== "*" ? `WHERE table_schema='${db}'` : ""} GROUP BY table_schema`,
    });
  }

  async getTablesSize({ db, table }) {
    const filters = { table_schema: db, table_name: table };
    const sorters = { table_schema: "DESC", table_name: "DESC" };
    return this.executeQuery({
      query: MySQLService.buildSqlCommand(
        `SELECT table_schema 'database', table_name 'table', 
                                                ROUND(((data_length + index_length) / 1024 / 1024), 2) 'sizeInMb' 
                                                FROM information_schema.TABLES`,
        Object.entries(filters),
        Object.entries(sorters),
      ),
    });
  }

  async createUser({
    user, host = "%", pass, changePass, role,
  }, dontConnect) {
    const queryArray = [`CREATE USER '${user}'@'${host}'`];
    queryArray.push(`IDENTIFIED BY '${pass}'`);
    if (role) {
      queryArray.push(`DEFAULT ROLE ${role}`);
    }
    if (changePass) {
      queryArray.push("PASSWORD EXPIRE");
    }
    return this.executeQuery({
      query: queryArray.join(" "),
    }, dontConnect);
  }

  async grantPermissions({
    user,
    db = "*",
    table = "*",
    scope,
  }, dontConnect) {
    if (db === "*" && table !== "*") {
      throw new Error("If specifying a table, specifying a database is also required.");
    }
    const grantArray = ["GRANT"];
    switch (scope) {
      case "fullWithGrant":
      case "full":
        grantArray.push("ALL PRIVILEGES");
        break;
      case "readWrite":
        grantArray.push("INSERT, DELETE, UPDATE, SELECT");
        break;
      case "write":
        grantArray.push("INSERT, DELETE, UPDATE");
        break;
      default:
        grantArray.push("SELECT");
    }
    grantArray.push(`ON ${db}.${table}`);
    grantArray.push(`TO ${user}`);
    if (scope === "fullWithGrant") {
      grantArray.push("WITH GRANT OPTION");
    }
    return this.executeQuery({
      query: grantArray.join(" "),
    }, dontConnect);
  }

  async grantRole({ user, role }, dontConnect) {
    return this.executeQuery({ query: `GRANT ${role} TO ${user}` }, dontConnect);
  }

  async showGrants({ user }, dontConnect) {
    return this.executeQuery({ query: `SHOW GRANTS FOR ${user}` }, dontConnect);
  }

  async createRole({ role }, dontConnect) {
    return this.executeQuery({ query: `CREATE ROLE '${role}'` }, dontConnect);
  }

  async deleteUser({ user }, dontConnect) {
    if (!user) {
      throw new Error("Must provide user to delete");
    }
    return this.executeQuery({ query: `DROP USER ${user}` }, dontConnect);
  }

  async deleteRole({ role }, dontConnect) {
    if (!role) {
      throw new Error("Must select role to delete");
    }
    return this.executeQuery({ query: `DROP ROLE ${role}` }, dontConnect);
  }

  async copyStructure({
    srcDb, srcTable, destConOpts, destDb, destTable, override,
  }) {
    if (!(srcTable && destConOpts && destDb && destTable)) {
      throw new Error("Didn't provide one of the required parameters.");
    }
    const srcConOpts = { ...this.connectionDetails };
    const revisedDestConOpts = destConOpts;
    if (srcDb) {
      srcConOpts.database = srcDb;
    }
    if (destDb) {
      revisedDestConOpts.database = destDb;
    }
    const destService = new MySQLService(revisedDestConOpts);
    await destService.connect();
    const existingTable = await destService.executeQuery({ query: `SHOW TABLES LIKE '${destTable}';` }, true);
    let dataDump; const result = {}; let lastAction; let tempCreated = false; let
      newTableName;
    try {
      if (existingTable && existingTable.length > 0) {
        lastAction = "copy data from old destination table";
        if (!override) {
          throw new Error(`Destination table already exists!
    Please provide override = true if you want to override the structure of the current table.`);
        }
        // copy data
        dataDump = (await mysqldump({
          connection: destConOpts,
          dump: {
            tables: [destTable],
            data: {
              verbose: false,
              maxRowsPerInsertStatement: 1000000,
            },
            schema: false,
            trigger: false,
          },
        })).dump.data.split("\n").filter((line) => !line.startsWith("#")).join("\n");
        newTableName = `${destTable}_temp`;
        dataDump = dataDump.replace(new RegExp(`\`${destTable}\``, "g"), `\`${newTableName}\``);
      } else {
        newTableName = destTable;
      }
      lastAction = "copy source table structure";
      let tableDump = (await mysqldump({
        connection: srcConOpts,
        dump: {
          tables: [srcTable],
          data: false,
          trigger: false,
        },
      })).dump.schema.split("\n").filter((line) => !line.startsWith("#")).join("\n");
      tableDump = tableDump.replace(`\`${srcTable}\``, `\`${newTableName}\``);

      lastAction = `create new ${dataDump ? "temp " : ""}destination table`;
      result.createTable = await destService.executeQuery({ query: tableDump }, true);
      tempCreated = true;
      if (!dataDump) {
        return result;
      }

      lastAction = "insert data from old destination table to temp table";
      result.insertData = await destService.executeQuery({ query: dataDump }, true);

      lastAction = "drop old destination table";
      result.dropTable = await destService.executeQuery({ query: `DROP TABLE \`${destTable}\`;` }, true);

      lastAction = "rename temp destination table";
      result.dropTable = await destService.executeQuery({ query: `RENAME TABLE \`${newTableName}\` TO \`${destTable}\`;` }, true);
      return result;
    } catch (error) {
      if (tempCreated) {
        result.dropTemp = await destService.executeQuery({ query: `DROP TABLE ${newTableName};` }, true);
      }
      throw new Error(`Error when trying to ${lastAction}: ${error.message || JSON.stringify(error)}`);
    } finally {
      await destService.end();
    }
  }

  async listDbs() {
    return this.executeQuery({
      query: "SHOW DATABASES",
    });
  }

  async listTables({ db }) {
    return this.executeQuery({
      query: `SELECT table_schema 'database', table_name 'table'
                    FROM information_schema.tables WHERE table_type = 'BASE TABLE'
                        AND table_schema ${db && db !== "*" ? `='${db}'` : "not in ('information_schema','mysql','performance_schema','sys')"}
                    ORDER BY table_schema, table_name;`,
    });
  }

  async listRoles() {
    return this.executeQuery({
      query: `SELECT u.user 'role', u.host 'host', concat('\\'', u.user, '\\'@\\'', u.host, '\\'') 'roleHost'
                    FROM mysql.user u
                    WHERE u.account_locked='Y' AND u.password_expired='Y' AND NOT LENGTH(u.authentication_string);`,
    });
  }

  async listUsers() {
    return this.executeQuery({
      query: `SELECT u.user 'user', u.host 'host', concat('\\'', u.user, '\\'@\\'', u.host, '\\'') 'userHost'
                    FROM mysql.user u
                    WHERE account_locked = 'N';`,
    });
  }

  async listUsersRoles() {
    return this.executeQuery({
      query: `SELECT u.user 'userOrRole', u.host 'host', concat('\\'', u.user, '\\'@\\'', u.host, '\\'') 'userOrRoleHost'
                    FROM mysql.user u
                    WHERE u.account_locked != 'Y' OR NOT LENGTH(u.authentication_string)`,
    });
  }
};
