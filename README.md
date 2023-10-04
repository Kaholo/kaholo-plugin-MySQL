# Kaholo MySQL Plugin
This plugin extends Kaholo's capabilities to include running SQL queries and scripts in MySQL. It does so by means of the [mysql npm package](https://www.npmjs.com/package/mysql). There is another plugin, the [Kaholo MySQL CLI Plugin](https://github.com/Kaholo/kaholo-plugin-MySQL-CLI#readme) that executes `mysql` commands directly on the Kaholo agent.

The methods available to the CLI and non-CLI Kaholo MySQL plugins vary some, but which to use is largely a matter of personal preference. Considerations include:
* CLI version also does database dump and restore, using `mysqldump` and `mysqladmin`.
* CLI version may work using whatever version of mysql clients are installed on the Kaholo agent.
* Non-CLI version has methods for creating users and roles and granting permissions.
* Non-CLI version does not require MySQL client to be installed on the Kaholo agent.
* Non-CLI version works even on Windows Kaholo agents.
* Non-CLI version has many methods that run specific queries for the user without having to write any SQL.
* Non-CLI version puts result set into JSON format automatically, which makes provides for easier access using the Kaholo code layer.

If you would like to see either of the plugins enhanced or find a bug please do not hesitate to [contact us](https://kaholo.io/contact/).

Another alternative to any CLI plugin is one can run any arbitrary command (including `mysql` ones) on the Kaholo Agent using the [Command Line Plugin](https://github.com/Kaholo/kaholo-plugin-cmd/releases/tag/v3.2.0). This may provide an immediate and/or temporary solution if the MySQL plugin is not providing the required action.

## Forks of MySQL
When MySQL came under control of Oracle various open-source forks were created, the most common being MariaDB. This plugin will likely work for any of these variants of MySQL.

## Plugin Settings
Settings and Accounts are configured by clicking on Settings | Plugins and then the name of the plugin, `MySQL CLI`, in the list of plugins is a hyperlink to Settings and Accounts for this plugin. An Account is required to use the plugin. The setting is optional.

Plugin Settings normally serve as default values for Action parameters, but in the case of this plugin there is only one setting that is a global parameter for all actions that use this plugin. It is "Show Queries in Activity Log". If enabled, every method of the plugin will show the fully-formed SQL Query in the Activity Log prior to execution. This can be helpful in diagnosing exactly what the plugin is doing, especially useful when the result it unexpected. However it may also expose sensitive information, such the the IDENTIFIED BY clause of user account creation, in which case the password will be exposed in the UI and recording in the Kaholo logs in plain text.

## Plugin Account
The MySQL CLI Plugin uses Kaholo Accounts to manage the connection string and password. This is for convenience and security. Once a default account is configured all new MySQL actions will automatically inherit it, so the same authentication details are pre-configured every time. If multiple accounts are configured, at the Action level which account to use is selected from a drop-down list.

The password is optionally stored in the Kaholo Vault so it does not appear in configuration, logs, or the user interface when used. It may also be included as part of the connection string. If both are used, the vaulted password will be used instead of the one in the connection string.

A typical connection string for MySQL looks something like this:

    Server=10.11.22.33;Port=3306;Database=mydb;Uid=myuser;Pwd=mypasswd;SslMode=Preferred;

The plugin is using a more universal [connection string format](https://www.npmjs.com/package/connection-string). The above connection string would be rewritten as:

    mysql://myuser:mypasswd@10.11.22.33:3306/mydb?SslMode=Preferred

The "mysql" protocol and SslMode elements are not implemented by the plugin, the connection string can be shortened:

    myuser:mypasswd@10.11.22.33:3306/mydb

If the password is in the Kaholo Vault instead of the connection string, the connection string can be shorter still:

    myuser@10.11.22.33:3306/mydb

Finally, the connection string can omit the database. When doing this the queries themselves are responsible to `USE <DATABASE_NAME>` when appropriate. For example to `SHOW TABLES;` of mydb with this connection string:

    myuser@10.11.22.33:3306

One must include `USE mydb;` in the query:

    USE mydb; SHOW TABLES;

## Users and Roles
Many methods refer to users and roles, which are very similar constructs in MySQL and both stored in table `mysql.user`. For the purpose of keeping the plugin simple, the following assumptions are made:
* roles have accounts locked
* roles have no passwords
* roles have host of '%' (unrestricted)
* users have acounts not locked
* users have passwords
* users may have any host - '%', 'localhost', a FQDN, etc.
* roles are granted to users

If any of these simplifications create difficulty, they are easily worked around by just running the appropriate SQL Query instead of using the more user-friendly methods provided in the plugin. For example `CREATE ROLE 'myrole'@'localhost' IDENTIFIED AS 'apl30ekg'`. The method `Create Role` of the plugin would never run such a query but the `Execute Query` method will attempt to run any query precisely as specified.

## Method: Test Connectivity
Make a test connection to confirm the Kaholo Account including connection string and password are correctly configured and that the database is accessible on the network from the Kaholo agent.

## Method: Execute Query
Execute any arbitrary query. This requries a correctly written SQL query to work. It is the least user-friendly method but also the most versatile.

### Parameter: Query String
The query to execute.

## Method: Execute SQL File
Execute any arbitrary query written in a file on the Kaholo agent.

### Parameter: SQL File Path
Path to the file on the Kaholo agent containing the query to be executed. The path may be relative or absolute. If relative, it is relative to the default working directory on the Kaholo agent, e.g. `/twiddlebug/workspace`.

## Method: Insert Data Into Table
Insert data into a Table. Inserts data in the format of an array of JSON objects into a table. 

### Parameter: Database
The database into which the data is to be inserted.

### Parameter: Table
The table into which the data is to be inserted.

### Parameter: Data
The data to insert. Provide the data as an array of objects or a string JSON representation of the same. The keys of the object must match the headers of the table for this to work. For example if the table has headers `name` and `job`, the following could be inserted into the table:

object data as code:

    const data = [{
                    name: "Jill",
                    job: "Doctor"
                }]

or as text:

    [{"name":"Jack","job":"Pilot"},{"name":"Johan","job":"Copilot"}]

## Method: List Databases
Lists all databases - the same as running query "SHOW DATABASES;"

## Method: List Tables
List all tables in the specified database, or if none specified in all databases.

### Parameter: Database
Specify a database to list only tables in that database.

## Method: Get Databases Size
Gets the size of one or more databases in Mb.

### Parameter: Database
Specify a database to get the size of only that database. If non specified the size of all databases is retrieved.

## Method: Get Tables Size
Gets the size of one or more tables in Mb.

### Parameter: Database
Specify a database to get the size of tables only in that database.

### Parameter: Table
Specifiy a table to get the size of one specific table.

## Method: Get Tables Locked Status
Gets the locked status of one or more tables.

### Parameter: Database
Specify a database to get the locked status of tables only in that database.

### Parameter: Table
Specifiy a table to get the locked status of one specific table.

## Method: Copy Table Structure
Copies a table structure, but not the data, from one server-database-table to another.

### Parameter: Source DB
The source database of the table to be copied.

### Parameter: Source Table
The table to be copied - in structure only, not including the row data.

### Parameter: Destination Connection String
A connection string to another database server. If not specified, the source server is assumed.

### Parameter: Destination DB
The destination database for the copy of the table structure. If not specified the same database of the source is assumed.

### Parameter: Destination Table Name
A name for the copy table. If not specified the same name as the source table is assumed.

### Parameter: Override Destination Table
If enabled and the destination table already exists, copy the structure anyway. Otherwise end in error.

## Method: List Users
Lists know users in the MySQL Server.

## Method: List Roles
List known roles in the MySQL Server.

## Method: Create User
Creates a new user account in the MySQL Server.

### Parameter: Username
A name for the new user.

### Parameter: Host
Host from which the new user account is permitted to connect. If none specified `%` (all hosts) is assumed.

### Parameter: Password
A password for the new user. The password is vaulted in the Kaholo vault so it does not appear in the UI, log files, or error messages. Be careful not to use plugin setting `Show Queries in Activity Log` if creating users.

### Parameter: Change Password On Login
If enabled, the user will be forced to change password upon login. This adds `PASSWORD EXPIRE` to the `CREATE USER` query.

### Parameter: Default Role
Optionally assing the user a default role upon creation. Roles can be granted to users after creation using method `Grant Role to User`.

## Method: Create Role
Create a new role. Permissions can be assigned to the role using method `Grant Permissions`.

### Parameter: Role Name
A name for the new role.

## Method: Grant Role to User
Grant a role to a user. Multiple roles may be granted to a user by using this method multiple times.

### Parameter: User
The user to receive the grant.

### Parameter: Role
The role to be granted.

## Method: Grant Permissions
Grant permissions either directly to users or to roles.

### Parameter: User or Role
The user or role to which to grant permissions.

### Parameter: DB
The database that is the subject of the grant.

### Parameter: Table
A specific table to be subject of the grant. If not specified the grant is for the whole database instead.

### Parameter: Permission Scope
The specific permissions to grant.

## Method: Show Grants
Show the grants bestowed upon a user or role.

### Parameter: User or Role
The user or role who's grants are to be shown.

## Method: Get MySQL Server Version
Get the version of the MySQL server to which the plugin is connecting using the plugin account connection string and credentials.

## Method: Delete User
Delete a user from the MySQL server.

### Parameter: User
The user to delete.

## Method: Delete Role
Delete a role from the MySQL server.

### Parameter: Role
The role to delete.
