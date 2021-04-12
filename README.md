# kaholo-plugin-MySQL
Kaholo Plugin for running scripts and queries on MySQL servers.

## Settings:
1. Connection String (string) **Optional** - The Default MySQL Server connection string to connect with.

## Method: Execute Query
Execute a SQL query on a MySQL server.

### Parameters:
1. Query (String) **Required** - The SQL query to run on the MySQL server.
2. Connection String (String) **Optional** - The MySQL Server connection string to connect with this time. Required in case it was not given in settings.

## Method: Execute SQL File
Execute a SQL script from a file on a MySQL server.

### Parameters:
1. SQL File Path (String) **Required** - The path of the script file to execute.
2. Connection String (String) **Optional** - The MySQL Server connection string to connect with this time. Required in case it was not given in settings.

