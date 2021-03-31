# kaholo-plugin-MySQL
Kaholo Plugin for running scripts and queries on MySQL servers.

## Settings:
1. Host Name (String) **Optional** - The URL of the endpoint where the default MySQL server is stored.
2. Port (Int) **Optional** - The port the default MySQL server listens on.
3. User Name (String) **Optional** - The username of the default user to connect with.
4. Password (Vault) **Optional** - The password of the default user.
5. Database (String) **Optional** - The name of the defaut database to run sctipts or queries on.

## Method: Execute Query
Execute a SQL query on a MySQL server.

### Parameters:
1. Query (String) **Required** - The SQL query to run on the MySQL server.
2. Host Name (String) **Optional** - The URL of the MySQL server.
3. Port (Int) **Optional** - The port the MySQL server listens on.
4. User Name (String) **Optional** - The username to connect with.
5. Password (Vault) **Optional** - The password of the user.
6. Database (String) **Optional** - The name of the database to execute the query on.

* Parameters 2-6 or required to either be provided for the method or provided in the settings

## Method: Execute SQL File
Execute a SQL script from a file on a MySQL server.

### Parameters:
1. SQL File Path (String) **Required** - The path of the script file to execute.
2. Host Name (String) **Optional** - The URL of the MySQL server.
3. Port (Int) **Optional** - The port the MySQL server listens on.
4. User Name (String) **Optional** - The username to connect with.
5. Password (Vault) **Optional** - The password of the user.
6. Database (String) **Optional** - The name of the database to execute the script on.

* Parameters 2-6 or required to either be provided for the method or provided in the settings

