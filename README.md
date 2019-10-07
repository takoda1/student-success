# Setting up the API for development

1. Install postgresql
2. Run the postgresql service
3. Have a user and password created for postgres as defined in the .env
4. Have a database created with name defined in .env. (there is a line that says DB_DATABASE=....)
5. Have the user login to the database and run the sql commands in init.sql to setup the tables.
6. Run npm i
7. Run node index.js
8. Install postman to make requests, or use curl.

## Future notes
Run the react app on process.env.port (provided/populated by heroku) and run the api on
another port; have the react app talk to the api using the api endpoints.

## Heroku deployment

Currently, deploys to master on the repo takoda1/student-success automatically deploy to heroku.

## Current endpoints:

GET /users   Returns all users

GET /user/:id    Returns user with specified id

POST /user   (Requires json body of {firstName, lastName, email})
Posts user with specified values

DELETE /user/:id	Deletes user with specified id

