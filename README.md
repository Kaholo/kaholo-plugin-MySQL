# kaholo-plugin-mysql
Kaholo Plugin for running scripts and queries on MySQL servers.

## Settings
1. Connection String (Vault) **Required if not in method** - The connection string to use by default when connecting to the MySQL server.

Can be in one of these two formats:
* ```Server=myServerAddress;Port=3306;Database=myDataBase;Uid=myUsername;Pwd=myPassword;```
* ```mysql://myUsername:myPassword@myServerAddress:myServerPort/myDataBase```

You can learn more about MySQL connection strings [here](https://dev.mysql.com/doc/connector-net/en/connector-net-connections-string.html#:~:text=The%20MySqlConnection%20object%20is%20configured,value%20pairs%2C%20separated%20by%20semicolons.&text=In%20this%20example%2C%20the%20MySqlConnection,and%20a%20password%20of%2012345%20.).

## Method: Execute Query
Execute the specified SQL query on the connected MySQL database. 

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Query String (Text) **Required** - The SQL query to run on the connected database. You can enter multiple commands separated by ';'.

## Method: Execute SQL File
Execute the SQL file in the specified path.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server.  The format of the connection string is specified in the settings.
2. SQL File Path (String) **Required** - The path to the SQL script file to execute.

## Method: Insert Data To Table
Insert all provided data to the specified table. Data is passed in the format of an array of objects, with matching fields names to the inserted table.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Optional** - If specified, you can filter tables only from the specified database. Default value is the database in the connection string or the server's default database.
3. Table (Autocomplete) **Required** - The table to insert the data into.
4. Data (Array Of Objects) **Required** - The data to insert into the specified table. Should be passed in the format of an array of objects with matching fields to the specified table.

## Method: Test Connectivity
Test if able to connect to the specified connection string.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.

## Method: Get Tables Locked Status
Retrieve whether the specified tables are locked (In Use) or not.

If a specific table or database wasn't specified, it retrieves data on all of them:
* All tables inside a specific database 
* All tables inside all databases the user has access to in the server

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Required for parameter 3** - The database to retrieve data on his tables. If not specified, return data from all tables of all databases the user has access to.
3. Table (Autocomplete) **Optional** - The table to retrieve whether is locked or not. If not specified, retrieve data on all tables in the specified database.

## Method: Get MySQL Server Version
Return the version of the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.

## Method: Get Databases Size
Get the size of the specified database, or of all databases the user has access to.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Optional** - The database to return its size. If not specified, return data on databases in the server that the user has access to.

## Method: Get Tables Size
Get the specified table size, or of all tables.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Required for parameter 3** - The database to return info about its tables. If not specified, return data on all tables in all databases.
3. Table (Autocomplete) **Optional** - The table to return its size. If not specified, return data on all tables inside the specified database.

## Method: Create User
Create a new user with the specified permmisions. If fails to grant permissions, this method won't create a new user as it runs the entire command as a transaction.

### Parameters
1. Connection String (Vault) **Required if not in settings** - TThe connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Username (String) **Required** - The username of the new user to create. Needs to be unique and not in use.
3. Password (Vault) **Required** - The password of the new user.
4. Change Password On Login (Boolean) **Optional** - If true, requires the user to change his password on his first login. Default value is false.
5. Role (Autocomplete) **Optional** - If specified, assign the specified role and its permissions to the new user.
6. DB Permission (Autocomplete) **Required for parameter 7** - If specified, and permissions scope was chosen, give the new user access to the specified database. Default value is all databases.
7. Table Permission (Autocomplete) **Optional** - If specified, and permissions scope was chosen, give the new user access to the specified table. Default value is all tables in the specified database.
8. Permission Scope (Options) **Required to give permissions** - The scope of permissions to give to the new user. Possible values are:
* ```Read Only``` - Can only execute ```SQL SELECT``` commands.
* ```Write (Insert/Update/Delete) Only ``` - Can execute ```SQL INSERT\UPDATE\DELETE``` commands only.
* ```Read And Write``` - Can execute ```SQL SELECT\INSERT\UPDATE\DELETE``` commands.
* ```Full Access``` - Can execute any SQL command.

## Method: Grant Permissions
Grant the specified permissions to the specified user.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. User (Autocomplete) **Required** - The user to grant permissions to.
3. DB (Autocomplete) **Required for parameter 4** - The name of the database to grant permissions on. Default value is all databases.
4. Table (Autocomplete) **Optional** - The name of the table to grant permissions on. Default value is all tables in the specified database.
5. Permission Scope (Options) **Required If No Role** - The scope of permissions to give to the new user. Possible values are:
* ```Read Only``` - Can only execute ```SQL SELECT``` commands.
* ```Write (Insert/Update/Delete) Only ``` - Can execute ```SQL INSERT\UPDATE\DELETE``` commands only.
* ```Read And Write``` - Can execute ```SQL SELECT\INSERT\UPDATE\DELETE``` commands.
* ```Full Access``` - Can execute any SQL command.
6. Role (Autocomplete) **Required If No Permission Scope** - The role to assign to the user. Can't be specified together with permmision scope, db, and table parameter.

## Method: Create Role
Create a new role and grant its permissions if specified. If fails to grant permissions, this method won't create a new role as it runs the entire command as a transaction.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Role Name (String) **Required** - The name of the new role to create.
3. DB (Autocomplete) **Required for parameter 4** - The name of the database to grant permissions on. Default value is all databases.
4. Table (Autocomplete) **Optional** - The name of the table to grant permissions on. Default value is all tables in the specified database.
5. Permission Scope (Options) **Required to grant permission** - The scope of permissions to give to the new user. Possible values are:
* ```Read Only``` - Can only execute ```SQL SELECT``` commands.
* ```Write (Insert/Update/Delete) Only ``` - Can execute ```SQL INSERT\UPDATE\DELETE``` commands only.
* ```Read And Write``` - Can execute ```SQL SELECT\INSERT\UPDATE\DELETE``` commands.
* ```Full Access``` - Can execute any SQL command.

## Method: Delete User
Delete the specified user (can also be a role).

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. User (Autocomplete) **Required** - The user or role to delete.

## Method: Copy Table Structure
Copy a table schema only (with no data inside) from the specified database and table to the specified destination database and table name.

If destination table already exists in the destination database, create a new temporary table with "__temp" suffix to the name specified, then try to copy old data from old destination table to the new temporary table. Afterwards, if copy was successful, delete the old destination table and rename the temporary table to be the new destination table. If fails in any step other than renaming the temporary table, will rollback any changes done in this action. If fails in renaming the temporary table, won't be able to rollback any changes.

### Parameters
1. Source Connection String (Vault) **Required if not in settings** - The connection string to use to connect to the MySQL server containing the source table. Will use the value specified in the settings if not specified.
2. Source Database (Autocomplete) **Optional** - The name of the database containing the source schema to be copied. If not specified, will use the database specified in the connection string or the default database of the server.
3. Source Table (Autocomplete) **Required** - The name of the source table to copy its schema.
4. Destination Connection String (Vault) **Required if not specified params 5 or 6** - The connection string to use to connect to the MySQL server to copy the schema into. Will use Source Connection String if not specified.
5. Destination Database (Autocomplete) **Required if not specified params 4 or 6** - The name of the database containing the source schema to be copied. If not specified will use the database specified in the connection string or the default database of the server.
6. Destination Table (Autocomplete) **Required if not specified params 4 or 5** - The name of the new table to copy the source schema into.
* **Must provide at least one of the parameters 4, 5, or 6**
7. Override Destination Table (Autocomplete) **Optional** - If false and destination table already exists, throw an error. If true and the destination table aleady exists, try to copy all data from it to a temporary table with the new schema, and than drop the original table and rename the temporary table to be the new destination table.


## Method: List Databases
List all databases in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.

## Method: List Roles
List all roles in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.

## Method: List Users
List all users in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.

## Method: List Tables
List tables of the specified database in the connected MySQL server.

### Parameters
1. Connection String (Vault) **Required if not in settings** - The connection string to use by default when connecting to the MySQL server. The format of the connection string is specified in the settings.
2. Database (Autocomplete) **Optional** - The database to list its tables. If not specified use the database described in the connection string or the default database in the server.
