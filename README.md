# Setting up the API for development

Follow this https://www.taniarascia.com/node-express-postgresql-heroku/ for postgres setup if you are on mac.


1. Install postgresql
2. Run the postgresql service
3. Have a user and password created for postgres as defined in the .env
4. Log in as this new user rather than the default login
5. Have a database created with name defined in .env. (there is a line that says DB_DATABASE=....)
6. Have the user connect to the database \c <databasename> and run the sql commands in init.sql to setup the tables.
7. Run npm i
8. Run node index.js
9. Install postman to make requests, or use curl.

## Future notes
Run the react app on process.env.port (provided/populated by heroku) and run the api on
another port; have the react app talk to the api using the api endpoints.

## Heroku deployment

Currently, deploys to master on the repo takoda1/student-success automatically deploy to heroku.

## Tests

`npm test` to run tests.

## Current endpoints:

### Users

GET /users   Returns all users

GET /user/:id    Returns user with specified id

GET /user/:firstName/:lastName	Returns user with provided firstname and lastname

POST /user   (Requires json body of {firstName: string, lastName: string, email: string})
Posts user with specified values

DELETE /user/:id	Deletes user with specified id

### Goals

GET /goals/:userId/:date
Returns all goals for a specified user (userId, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /goal/:id
Returns a single goal referenced by the goal primary key id

POST /goal    (Requires json/js body of {userId: number, goalDate: "yyyy-mm-dd", goalText: string, completed: boolean})
Posts a goal with specified values

PUT /goal/:id  (Requires json/js body of {goalText: string, completed: boolean})
Updates/puts the goal specified by its unique id with new goalText and completed values.

DELETE /goal/:id
Deletes the goal specified by its unique id