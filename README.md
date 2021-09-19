# kaholo-plugin-mysql
Kaholo Plugin for running scripts and queries on MySQL servers.

## Settings
1. Connection String (Vault) **Required if not in method** - The connection string to use on default to connect to the MySQL server.
Can be in one of two formats:
* Server=myServerAddress;Port=3306;Database=myDataBase;Uid=myUsername;Pwd=myPassword;
* mysql://myUsername:myPassword@myServerAddress:myServerPort/myDataBase


## Method: Execute Query
Execute the specified SQL query on the connected MySQL database.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. Query String (Text) **Required** - The SQL query to run on the connected database. You can enter multiple commands separated by ';'.

## Method: Execute SQL File
Execute the SQL file in the specified path.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. SQL File Path (String) **Required** - The path to the SQL script file to execute.

## Method: Test Connectivity
Test if able to connect to the specified connection string.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.

## Method: Get Tables Locked Status
Retrieve whether the specified tables are locked(In Use) or not.
If specific table or database wasn't specified retrieve data on all of them(All tables inside a specific db / All tables inside all dbs the user has access to in the server).

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Required for parameter 3** - The database to retrieve data on his tables. If not specified, return data from all tables of all dbs the user has access to.
3. Table (Autocomplete) **Optional** - The table to retrieve whether is locked or not. If not specified, retrieve data on all tables in the specified db inside.

## Method: Get MySQL Server Version
Return the version of the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.

## Method: Get Databases Size
Get the size of the specified database, or of all databases the user has access to.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Optional** - The database to return it's size. If not specified return data on databases in the server that the user has access to.

## Method: Get Tables Size
Get the specified table size, or of all tables.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Required for parameter 3** - The database to return info about his tables. If not specified return data on all tables in all dbs.
3. Table (Autocomplete) **Optional** - The table to return it's size. If not specified, return data on all tables inside the db specified.

## Method: Create User
Create a new user with the specified permmisions.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. Username (String) **Required** - The username of the new user to create. Needs to be unique(Not used already).
3. Password (Vault) **Required** - The password of the new user.
4. Change Password On Login (Boolean) **Optional** - If true, require the user to change his password on his first login. Default is false.
5. Role (Autocomplete) **Optional** - If specified, assign the specified role and it's permissions to the new user.
6. DB Permission (Autocomplete) **Required for parameter 7** - If specified, and permissions scope was chosen, give the new user access to the specified database. Default value is all databases.
7. Table Permission (Autocomplete) **Optional** - If specified, and permissions scope was chosen, give the new user access to the specified table. Default value is all tables in the specified database.
8. Permission Scope (Options) **Required to give permissions** - The scope of permissions to give to the new user. Possible values are:
* Read Only - Can only execute SQL SELECT commands.
* Write(Insert/Update/Delete) Only  - Can execute SQL INSERT\UPDATE\DELETE commands only.
* Read And Write - Can execute SQL SELECT\INSERT\UPDATE\DELETE commands.
* Full Access - Can execute any SQL command.


## Method: Grant Permissions
Grant the specified permissions to the specified user.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. User (Autocomplete) **Required** - The user to grant permissions to.
3. DB (Autocomplete) **Required for parameter 4** - The name of the database to grant permissions on. Default value is all databases.
4. Table (Autocomplete) **Optional** - The name of the table to grant permissions on. Default value is all tables in the specified database.
5. Permission Scope (Options) **Required If No Role** - The scope of permissions to give to the new user. Possible values are:
* Read Only - Can only execute SQL SELECT commands.
* Write(Insert/Update/Delete) Only  - Can execute SQL INSERT\UPDATE\DELETE commands only.
* Read And Write - Can execute SQL SELECT\INSERT\UPDATE\DELETE commands.
* Full Access - Can execute any SQL command.
6. Role (Autocomplete) **Required If No Permission Scope** - The role to assign to the user. Can't be speecified together with permmision scope, db, and table parameter.


## Method: Create Role
Create a new role and grant it permissions if specified.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. Role Name (String) **Required** - The name of the new role to create.
3. DB (Autocomplete) **Required for parameter 4** - The name of the database to grant permissions on. Default value is all databases.
4. Table (Autocomplete) **Optional** - The name of the table to grant permissions on. Default value is all tables in the specified database.
5. Permission Scope (Options) **Required to grant permission** - The scope of permissions to give to the new user. Possible values are:
* Read Only - Can only execute SQL SELECT commands.
* Write(Insert/Update/Delete) Only  - Can execute SQL INSERT\UPDATE\DELETE commands only.
* Read And Write - Can execute SQL SELECT\INSERT\UPDATE\DELETE commands.
* Full Access - Can execute any SQL command.

## Method: List Databases
List all databases in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.

## Method: List Roles
List all roles in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.

## Method: List Users
List all users in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.

## Method: List Tables
List tables of the specified database in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use on to connect to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Optional** - The database to list it's tables. If not specified use the database described in the connection string or the default database in the server.
