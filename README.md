#Setting up the API for development

1. Install postgresql
2. Run the postgresql service
3. Have a user and password created for postgres as defined in the .env
4. Have a database created with name defined in .env. (there is a line that says DB_DATABASE=....)
5. Have the user login to the database and run the sql commands in init.sql to setup the tables.
6. Run npm i
7. Run node index.js
8. Install postman to make requests, or use curl.