var mysql = require("mysql");
const fs = require("fs");
const {removeUndefinedAndEmpty} = require('./helpers');
const { promisify } = require('util');

const asyncFuncs = ["connect", "end", "query", "beginTransaction", "commit", "rollback"]

module.exports = class MySQLService{
    constructor(conOpts){
        if (!conOpts) throw "Connection string not provided!";
        if (!conOpts.host || !conOpts.user || !conOpts.password) throw "Didn't provide all required authentication information in connection string";
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
    
    async listDbs({query}){
        return this.executeQuery({
            query: `SHOW DATABASES${query ? ` LIKE '%${query}%'` : ""}`
        });
    }
    
    async listTables({db, query}){
        return this.executeQuery({
            query: `SELECT table_schema 'database', table_name 'table'
                    FROM information_schema.tables WHERE table_type = 'BASE TABLE'${query ? ` AND table_name LIKE '%${query}%'` : ""}
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