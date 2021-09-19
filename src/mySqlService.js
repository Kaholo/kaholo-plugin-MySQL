var mysql = require("mysql");
const fs = require("fs");
const {removeUndefinedAndEmpty} = require('./helpers');

module.exports = class MySQLService{
    constructor({host, user, password, database, port}){
        if (!host || !user || !password) throw "Didn't provide all required authentication information in connection string";
        this.connectionOpts = removeUndefinedAndEmpty({host, user, password, database, port});
    }

    async connect(){
        this.connection = mysql.createConnection(this.connectionOpts);
        const context = this;
        return new Promise(function(resolve, reject) {
            context.connection.connect(function(err) {
                if (err) return reject(`Error Connecting: ${err.message || JSON.stringify(err)}`);
                return resolve(true);
            });
        });
    }

    async disconnect(){
        const context = this;
        if (!this.connection) throw "Must connect first!";
        const result = await (new Promise(function(resolve, reject) {
            context.connection.end(function(err) {
                if (err) return reject(`Error Disconnecting: ${err.message || JSON.stringify(err)}`);
                return resolve(true);
            });
        }));
        return result;
    }

    static buildSqlCommand(baseCmd, filters, orderBy){
        return `${baseCmd}${filters && filters.length ? `
                WHERE ${filters.map(([name, val]) => `${name} = '${val}`).join(" AND ")}'` : ""}${orderBy && orderBy.length ? `
                ORDER BY ${orderBy.map(([name, val]) => `${name}${val ? " " + val : ""}`).join(", ")}` : ""}`;
    }

    async executeQuery({query}, dontConnect=false) {
        if (!query) throw "Must provide query to execute!";
        if (!dontConnect) await this.connect();
        const context = this;
        const execPromise = new Promise((resolve, reject) => context.connection.query(query, function(err, result) {
            if (err) return reject(`Error executing query: ${err.message || JSON.stringify(err)}`);
            return resolve(result);
        }));
        const result = await execPromise;
        if (!dontConnect) {
            try{ await this.disconnect(); }
            catch(error){ throw {error, result}; }
        }
        return result;
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
        await this.disconnect();
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
        if (scope) await this.connect(); // if should grant permissions - than handle connection
        const result = {createUser: await this.executeQuery({
            query: `CREATE USER '${user}'@'localhost'
                    IDENTIFIED BY '${pass}'${changePass ? " PASSWORD EXPIRE" : ""}${role ?
                    `DEFAULT ROLE ${role}` : ""}`
        }, scope)};
        if (!scope) return result;
        try {
            result.grantPermissions = await this.grantPermissions({user, db, table, scope}, true);
        }
        catch (err) {
            throw {...result, err};
        }
        finally {
            await this.disconnect();
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
                scope == "write" ? "INSERT, DELETE, UPDATE" : "SELECT"} ON ${db}.${table} TO '${user}'@'localhost'`
        }, dontConnect);
    }

    async createRole({role, db, table, scope}){
        if (!role) throw "Must provide role name!"; 
        if (!scope && (db || table)) throw "Must provide permission scope!";
        if (!db && table) throw "If provided specific table, must specify the db it's in";
        table = table || "*"; db = db || "*";
        
        await this.connect();
        const result = {};
        try {
            result.createRole = await this.executeQuery({query: `CREATE ROLE '${role}'@'localhost';`}, true);
            if (scope) result.grantPermissions = await this.grantPermissions({user: role, db, table, scope}, true);
        }
        catch (error) {
            throw {...result, error};
        }
        finally {
            await this.disconnect();
        }
        return result;
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