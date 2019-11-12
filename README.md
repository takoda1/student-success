# 0. Software for Student Success
This webapp is meant to be used for senior honors students working on their honors thesis to help them stay organized and motivated throughout the writing process. The app also allows students to collaborate and interact with other students in their class.

# 1. Getting started

## Prerequisites 

### Project-wide
- Install nodejs https://nodejs.org/en/download/
- Obtain a .env file from a past developer, or it should look like this:
DB_USER=<user>
DB_PASSWORD=<password>
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=<database name>
PORT=3005

- Fork the project https://github.com/takoda1/student-success, then clone it
-`cd student-success`

### For the API

Follow this https://www.taniarascia.com/node-express-postgresql-heroku/ for postgres setup (the instructions for postgres setup are for mac, pc users will have to look up how to do instructions 1, 2, and 3) 


The following commands are boiled down what the tutorial above accomplishes

1. Install postgresql
2. Run the postgresql service
3. Have a user and password created for postgres as defined in the .env
4. Log in as this new user rather than the default login
5. Have a database created with name defined in .env. (there is a line that says DB_DATABASE=....)
6. Have the user connect to the database \c <databasename> and run the sql commands in init.sql to setup the tables.

## Installing
- `npm install` 
- Install postman if you would like to make manual requests

## Running locally
- Change src/auth_config.json environment to "development" instead of production
- `npm start`

## Warranty
On 11/8/2019, commit number 173, on a windows machine, these steps pulled up a local version of the app.

# 2. Testing
`npm test` to run backend/api tests.  
`cypress open` to run frontend cypress tests.

# 3. Deployment  
The app is deployed to heroku, and can be accessed here: https://student-success.herokuapp.com/.  

- The production system lives on heroku. To get access to the project, email Takoda: takoda.ren@gmail.com
- No staging or pre-production environments exist
- Once you have access to the project, you will notice that there is an add-on: Heroku postgres.
- To connect to this database, install the heroku CLI first
- Then, run `heroku login`
- Then run heroku `pg:psql postgresql-shaped-80610 --app student-success` to connect to the database to run commands.
- If the database is empty, run init.sql with `cat init.sql | pg:psql postgresql-shaped-80610 --app student-success`
- Continuous deployment is enabled, it is connected to github.com/takoda1/student-success. This can be changed to whatever repository when you are added as a collaborator to heroku.

# 4. Technologies Used
React.js, Express.js, Node.js, Postgres  
The ADRs are in the folder `adr`, which is in the root directory of the repository.  

# 5. Contributing
For new developers, developers will need to get access to the heroku (email jingjing.jacobson@gmail.com, takoda.ren@gmail.com or perryh@live.unc.edu for access). Developers can then fork this github repository and connect the new repository to be deployed to the heroku project.  
More info can be found at the project website: http://comp523teamb.web.unc.edu/

# 6. Authors  
Primary authors of this project are: Perry Healy, JingJing Jacobson, and Takoda Ren

# 7. License
This repository has an MIT license. More details can be found in the LICENSE.md file.  

# 8. Acknowledgements
We would like to give acknowledgements to Dr. Jeff Terrell at the University of North Carolina at Chapel Hill for giving us the help, resources, and knowledge that we needed to complete this project, as well as John Dinger, for being our project management mentor throughout this project.


# Developer section

## How to access authentication details in-app

In a react component:
-`import auth0Client from '../Auth';`
-Access email with `auth0Client.getProfile().name`
-Look at components/NavBar.js to see an example

## How to use authentication locally
-Change src/auth_config.json's `"environment": "production"` to `"enviornment": "development"`

### Authentication used
-Used Auth0
-Followed this tutorial: https://auth0.com/blog/react-tutorial-building-and-securing-your-first-app/#Securing-your-React-App

## Tables

Users:
{id: int, firstname: string, lastname: string, email: string, group: foreignKey(groups: id)}


Goals:
{id: int, userid: foreignKey(Users: id), goaldate: yyyy-mm-dd, goaltext: string, completed: boolean}


Timers:
{id: int, userid: foreignKey(Users: id), timerdate: yyyy-mm-dd, researchtime: int, writingtime: int, customtime: int}    (time is in seconds)

Reflections:
{id: int, userid: foreignKey(Users: id), reflectiondate: yyyy-mm-dd, reflectiontext: string}

Groups:
{id: int, groupname: string}

Groupchat:
{id: int, groupid: foreignKey(groups: id), chattext: string, chatdate: string}

Forum:
{id: int, title: string, body: string, userid: int, username: string, postdate: string}

## Current endpoints:

### Users

GET /users   Returns all users

GET /user/:id    Returns user with specified id

GET /userByEmail/:email		Returns the user with specified email

GET /userByGroup/:groupid     Returns the user(s) with specified groupid

GET /user/:firstName/:lastName	Returns user with provided firstname and lastname

POST /user   (Requires json body of {firstname: string, lastname: string, email: string})
Posts user with specified values

DELETE /user/:id	Deletes user with specified id

### Goals

GET /goals/:userid/:date
Returns all goals for a specified user (userid, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /goal/:id
Returns a single goal referenced by the goal primary key id

POST /goal    (Requires json/js body of {userid: number, goaldate: "yyyy-mm-dd", goaltext: string, completed: boolean})
Posts a goal with specified values

PUT /goal/:id  (Requires json/js body of {goaltext: string, completed: boolean})
Updates/puts the goal specified by its unique id with new goalText and completed values.

DELETE /goal/:id
Deletes the goal specified by its unique id

### Timers

#### all time values are in seconds

GET /timer/:userid/:date
Returns the timer for a specified user (userid, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /timer/:id
Returns a single timer referenced by the timer primary key id

POST /timer    (Requires json/js body of {userid: number, timerdate: "yyyy-mm-dd", researchtime: int, writingtime: int, customtime: int})
Posts a timer with specified values

PUT /timer/:id  (Requires json/js body of {researchtime: int, writingtime: int, customtime: int})
Updates/puts the timer specified by its unique id with new researchtime, writingtime, and customtime values.

DELETE /timer/:id
Deletes the timer specified by its unique id

### Reflections

GET /reflection/:userid/:date
Returns the reflection for a specified user (userid, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /reflection/:id
Returns a single reflection referenced by the reflection primary key id

POST /reflection   (Requires json/js body of {userid: number, reflectiondate: "yyyy-mm-dd", reflectiontext: string})
Posts a reflection with specified values

PUT /reflection/:id  (Requires json/js body of {reflectiontext: string})
Updates/puts the reflection specified by its unique id with new reflectiontext value.

DELETE /reflection/:id
Deletes the reflection specified by its unique id

### Groups

GET /group/:groupname    Gets the group with specified groupname

GET /groups     Gets all groups

GET /grou/:id		No, that is not a typo. Gets a single group by provided id

POST /group			Posts a single group with body {groupname: string}

DELETE /group/:id	Deletes a singel group with provided id

### Groupchat

GET /groupchat/:groupid     Gets all groupchat messages for a single group

POST /groupchat   Posts a single chat with body: {groupid: int, chattext: string, chatdate: string}

### Forum

GET /forumPosts       Gets all forum posts

GET /forum/:id		Gets a forum post by its id

PUT /forum/:id		Updates a forum post by its id, requires body of {title: string, body: string}

POST /forum			Posts a forum post, requires body of  {title: string, body: string, userid: int, username: string, postdate: string}

DELETE /forum/:id	Deletes a forum post by its id 


### Forum comments/replies
