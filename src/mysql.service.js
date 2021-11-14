var mysql = require("mysql");
const fs = require("fs");
const {removeUndefinedAndEmpty} = require('./helpers');
const { promisify } = require('util');

const asyncFuncs = ["connect", "end", "query", "beginTransaction", "commit", "rollback"];
const mysqldump = require('mysqldump').default;

module.exports = class MySQLService{
    constructor(conOpts){
        if (!conOpts) throw "Connection string not provided!";
        if (!conOpts.host || !conOpts.user || !conOpts.password) throw "Didn't provide all required authentication information in connection string";
        this.conOpts = conOpts;
        this.connection = mysql.createConnection(removeUndefinedAndEmpty(conOpts));
        for (const func of asyncFuncs){
            this[func] = promisify(this.connection[func]).bind(this.connection);
        }
    }

    static buildSqlCommand(baseCmd, filters, orderBy){
        return `${baseCmd}${filters && filters.length ? `
                WHERE ${filters.map(([name, val]) => `${name} = '${val}`).join(" AND ")}'` : ""}${orderBy && orderBy.length ? `
                ORDER BY ${orderBy.map(([name, val]) => `${name}${val ? " " + val : ""}`).join(", ")}` : ""}`;
    }

    async executeQuery({query}, dontConnect=false) {
        if (!query) throw "Must provide query to execute!";
        if (!dontConnect) await this.connect();
        try {
            const result = await this.query(query);
            return result;
        }
        catch (error) {
            throw `Error executing query: ${error.message || JSON.stringify(error)}`
        }
        finally {
            if (!dontConnect) await this.end();
        }
    }

    async executeSQLFile({path}) {
        if (!path) throw "Must provide SQL query file to execute!";
        if (!fs.existsSync(path)) throw `Couldn't find file: ${path}`;
        return this.executeQuery({
            query: fs.readFileSync(path, 'utf8')
        });
    }

    async testConnectivity(){
        await this.connect();
        await this.end();
        return "Connected!";
    }

    async getTablesLockedStatus({db, table}){
        const filters = removeUndefinedAndEmpty({Database: db, Table: table}, true);
        const query = MySQLService.buildSqlCommand("SHOW OPEN TABLES", Object.entries(filters));
        return this.executeQuery({query});
    }

    async getServerVersion(){
        return this.executeQuery({
            query: `SELECT version()`
        });
    }

    async getDbSize({db}){
        return this.executeQuery({
            query: `SELECT table_schema 'database',
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) 'sizeInMb' 
                    FROM information_schema.tables 
                    GROUP BY table_schema${db && db !== "*" ? `
                    WHERE table_schema='${db}'` : ""}`
        });
    }

    async getTablesSize({db, table}){
        const filters = removeUndefinedAndEmpty({'table_schema': db, 'table_name': table}, true);
        const sorters = {'table_schema': "DESC", 'table_name': "DESC"};
        return this.executeQuery({
            query: MySQLService.buildSqlCommand(`SELECT table_schema 'database', table_name 'table', 
                                                ROUND(((data_length + index_length) / 1024 / 1024), 2) 'sizeInMb' 
                                                FROM information_schema.TABLES`, 
            Object.entries(filters), Object.entries(sorters))
        })
    }

    async createUser({user, pass, changePass, role, db, table, scope}){
        if (!user || !pass) throw "Must provide user to create and it's password";
        if (scope) await this.connect();
        const result = {createUser: await this.executeQuery({
            query: `CREATE USER '${user}'@'localhost'
                    IDENTIFIED BY '${pass}'${changePass ? " PASSWORD EXPIRE" : ""}${role ?
                    `DEFAULT ROLE ${role}` : ""}`
        }, scope)};
        if (!scope) return result;
        try {
            result.grantPermissions = await this.grantPermissions({user, db, table, scope}, true);
        }
        catch (error) {
            await this.deleteUser({user}, true);
            throw `Failed to grant permissions for the new user: ${error.message || JSON.stringify(error)}`;
        }
        finally {
            await this.end();
        }
        return result;
    }

    async grantPermissions({user, db, table, scope, role}, dontConnect){
        if (!scope && !role) throw "Must provide permissions scope!"; 
        if (!db && table) throw "If provided specific table, must specify the db it's in";
        table = table || "*"; db = db || "*";
        
        return this.executeQuery({
            query: `GRANT ${role ? `'${role}'` : scope == "full" ? "ALL PRIVILEGES" :
                scope == "readWrite" ? "INSERT, DELETE, UPDATE, SELECT" : 
                scope == "write" ? "INSERT, DELETE, UPDATE" : "SELECT"} ON ${db}.${table} TO '${user}'@'localhost';`
        }, dontConnect);
    }

    async createRole({role, db, table, scope}){
        if (!role) throw "Must provide role name!";
        if (scope) await this.connect();
        const result = {createRole: await this.executeQuery({query: `CREATE ROLE '${role}'@'localhost';`}, scope)};
        if (!scope) return result;
        try {
            result.grantPermissions = await this.grantPermissions({user: role, db, table, scope}, true);
        }
        catch (error) {
            await this.deleteUser({user: role}, true);
            throw `Failed to grant permissions for the new role: ${error.message || JSON.stringify(error)}`;
        }
        finally {
            await this.end();
        }
        return result;
    }

    async deleteUser({user}, dontConnect){
        if (!user) throw "Must provide user to delete";
        return this.executeQuery({query: `DROP USER '${user}'@'localhost'`}, dontConnect);
    }

    async copyStructure({srcDb, srcTable, destConStr, destDb, destTable, override}){
        if (!srcTable || !(destConStr || destDb || destTable)) throw "Didn't provide one of the required parameters.";
        destTable = destTable || srcTable;
        const srcConOpts = {...this.conOpts};
        const destConOpts = {...(destConStr || this.conOpts)};
        if (srcDb) srcConOpts.database = srcDb;
        if (destDb) destConOpts.database = destDb;
        const destService = new MySQLService(destConOpts);
        await destService.connect();
        const existingTable = await destService.executeQuery({query: `SHOW TABLES LIKE '${destTable}';`}, true);
        var dataDump, result = {}, lastAction, tempCreated = false, newTableName;
        try {
            if (existingTable && existingTable.length > 0){
                lastAction = "copy data from old destination table";
                if (!override) throw `Destination table already exists!
    Please provide override = true if you want to override the structure of the current table.`;
                // copy data
                dataDump = (await mysqldump({
                    connection: destConOpts,
                    dump: {
                        tables: [destTable],
                        data: {
                            verbose: false,
                            maxRowsPerInsertStatement: 1000000
                        },
                        schema: false,
                        trigger: false
                    }
                })).dump.data.split("\n").filter(line => !line.startsWith("#")).join("\n");
                newTableName = `${destTable}_temp`;
                dataDump = dataDump.replace(new RegExp(`\`${destTable}\``, "g"), `\`${newTableName}\``);
            }
            else newTableName = destTable;
            lastAction = "copy source table structure";
            var tableDump = (await mysqldump({
                connection: srcConOpts,
                dump: {
                    tables: [srcTable],
                    data: false,
                    trigger: false
                }
            })).dump.schema.split("\n").filter(line => !line.startsWith("#")).join("\n");
            tableDump = tableDump.replace(`\`${srcTable}\``, `\`${newTableName}\``);

            lastAction = `create new ${dataDump ? "temp " : ""}destination table`;
            result.createTable = await destService.executeQuery({query: tableDump}, true);
            tempCreated = true;
            if (!dataDump) return result; 

            lastAction = "insert data from old destination table to temp table";
            result.insertData = await destService.executeQuery({query: dataDump}, true);

            lastAction = "drop old destination table";
            result.dropTable = await destService.executeQuery({query: `DROP TABLE \`${destTable}\`;`}, true);

            lastAction = "rename temp destination table";
            result.dropTable = await destService.executeQuery({query: `RENAME TABLE \`${newTableName}\` TO \`${destTable}\`;`}, true);
            return result;
        }
        catch (error) {
            if (tempCreated) result.dropTemp = await destService.executeQuery({query: `DROP TABLE ${newTableName};`}, true);
            throw `Error when trying to ${lastAction}: ${error.message || JSON.stringify(error)}`;
        }
        finally {
            await destService.end();
        }
    }
    
    async listDbs(){
        return this.executeQuery({
            query: `SHOW DATABASES`
        });
    }
    
    async listTables({db}){
        return this.executeQuery({
            query: `SELECT table_schema 'database', table_name 'table'
                    FROM information_schema.tables WHERE table_type = 'BASE TABLE'
                        AND table_schema ${db && db != "*" ? `='${db}'` : "not in ('information_schema','mysql','performance_schema','sys')"}
                    ORDER BY table_schema, table_name;`
        });
    }
    
    async listRoles(){
        return this.executeQuery({
            query: `SELECT DISTINCT u.User 'roleName'
                    FROM mysql.user u
                    WHERE u.account_locked='Y' AND u.password_expired='Y' AND u.authentication_string='';`
        });
    }
    
    async listUsers(){
        return this.executeQuery({
            query: `SELECT DISTINCT user from mysql.user;`
        });
    }
}