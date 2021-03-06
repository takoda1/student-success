# Table of contents
* [0. Software for Student Success](#0-software-for-student-success)
* [1. Getting started](#1-getting-started)
* [2. Testing](#2-testing)
* [3. Deployment](#3-deployment)
* [4. Technologies used](#4-technologies-used)
* [5. Contributing](#5-contributing)
* [6. Authors](#6-authors)
* [7. License](#7-license)
* [8. Acknowledgements](#8-acknowledgements)
* [Developer section](#developer-section)
* [Auth0](#auth0) 
* [Future notes](#future-notes)

# 0. Software for Student Success
This webapp is meant to be used for senior honors students working on their honors thesis to help them stay organized and motivated throughout the writing process. The app also allows students to collaborate and interact with other students in their class. 

Project website: http://comp523teamb.web.unc.edu/
 
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
DEV_EMAIL_ADDR=testaddress@email.com
DEV_EMAIL_PASS=testemailpassword

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
`npm run cypress` to run frontend cypress tests.

# 3. Deployment  
The app is deployed to heroku, and can be accessed here: https://student-success.herokuapp.com/.  

- The production system lives on heroku. To get access to the project, email Takoda: takoda.ren@gmail.com
- No staging or pre-production environments exist
- Once you have access to the project, you will notice that there is an add-on: Heroku postgres.
- To connect to this database, install the heroku CLI first
- Then, run `heroku login`
- Then run `heroku pg:psql postgresql-shaped-80610 --app student-success` to connect to the database to run commands.
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
{id: int, firstname: string, lastname: string, email: string, groupid: foreignKey(groups: id), hidetimer: boolean, hidereflection: boolean, classid: foreignKey(classes: id)}

Goals:
{id: int, userid: foreignKey(Users: id), goaldate: yyyy-mm-dd, goaltext: string, completed: boolean, priority: int}

Subgoals:
{id: int, userid: foreignKey(Users: id), parentgoal: foreignKey(Goals: id), goaldate: yyyy-mm-dd, goaltext: string, completed: boolean}

Weeklygoals:
{id: int, userid: foreignKey(Users: id), goaldate: yyyy-mm-dd, goaltext: string, completed: boolean, completedate: yyyy-mm-dd, priority: int}

Timers:
{id: int, userid: foreignKey(Users: id), timerdate: yyyy-mm-dd, researchtime: int, writingtime: int, customtime: int}    (time is in seconds)

Customtimers:
{id: int, userid: foreignKey(Users: id), timerdate: yyyy-mm-dd, time: int, name: string}  (time in seconds)

Reflections:
{id: int, userid: foreignKey(Users: id), reflectiondate: yyyy-mm-dd, reflectiontext: string}

Groups:
{id: int, groupname: string}

Groupchat:
{id: int, groupid: foreignKey(groups: id), chattext: string, chatdate: string, userid: foreignKey(users: id), username: string}

Grouplinks:
{id: int, groupid: foreignKey(groups: id), link: string, title: string, linkdate: string, userid: foreignKey(users: id), username: string}

Forum:
{id: int, title: string, body: string, userid: int, username: string, postdate: string, classid: int}

Notes:
{ id: int, userid: int, notedate: "yyyy-mm-dd", notetext: string }

Classes:
{ id: int, classname: string }

Reflectionquestions:
{id: int, classid: int, questionone: string, questiontwo: string, questionthree: string, additionalquestions: string array }

Forumcomments:
{id: int, body: string, userid: int, postid: int, username: string, commentdate: string}

Classlinks:
{id: int, classid: int, linkname: string, linkurl: string}

## Current endpoints:

### Send Email
POST /send  Sends an email to specified recipients, requires a body of {recipients: string[], subject: string, message: string} (message is expected in HTML format)

### Users

GET /users   Returns all users

GET /user/:id    Returns user with specified id

GET /userByEmail/:email		Returns the user with specified email

GET /userByGroup/:groupid     Returns the user(s) with specified groupid

GET /user/:firstName/:lastName	Returns user with provided firstname and lastname

PUT /user/:id			Updates the user given its id with body of {firstname: string, lastname: string, email: string, groupid: int, hidetimer: boolean, hidereflection: boolean, classid: int}

POST /user   (Requires json body of {firstname: string, lastname: string, email: string, groupid: int, classid: int})
Posts user with specified values

DELETE /user/:id	Deletes user with specified id

### Goals

GET /goals/:userid/:date
Returns all goals for a specified user (userid, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /goal/:id
Returns a single goal referenced by the goal primary key id

POST /goal    (Requires json/js body of {userid: number, goaldate: "yyyy-mm-dd", goaltext: string, completed: boolean, priority: number})
Posts a goal with specified values

PUT /goal/:id  (Requires json/js body of {goaltext: string, completed: boolean, priority: number})
Updates/puts the goal specified by its unique id with new goalText, completed, and priority values.

DELETE /goal/:id
Deletes the goal specified by its unique id

### Sub Goals

GET /subgoals/:userid/:date
Returns all sub goals for a specified user (userid, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /subgoal/:id
Returns a single sub goal referenced by the goal primary key id

GET /subgoalByParent/:parentgoal
Returns all sub goals for a specified parent goal (parentgoal, references primary key of goals table)

POST /subgoal    (Requires json/js body of {userid: number, parentgoal: number, goaldate: "yyyy-mm-dd", goaltext: string, completed: boolean})
Posts a sub goal with specified values

PUT /subgoal/:id  (Requires json/js body of {goaltext: string, completed: boolean})
Updates/puts the sub goal specified by its unique id with new goalText and completed values.

DELETE /subgoal/:id
Deletes the sub goal specified by its unique id

### Weekly Goals

GET /weeklyGoals/:userid
Returns all weekly goals for a specified user (userid, references primary key of users table)

GET /weeklyGoal/:id
Returns a single goal referenced by the goal primary key id

POST /weeklyGoal    (Requires json/js body of {userid: number, goaldate: "yyyy-mm-dd", goaltext: string, completed: boolean, completedate: "yyyy-mm-dd", priority: number})
Posts a weekly goal with specified values

PUT /weeklyGoal/:id  (Requires json/js body of {goaltext: string, completed: boolean, completedate: "yyyy-mm-dd", priority: number})
Updates/puts the goal specified by its unique id with new goalText, completed, and completedate values.

DELETE /weeklyGoal/:id
Deletes the goal specified by its unique id

### Timers

#### all time values are in seconds

GET /timer/:userid/:date
Returns the timer for a specified user (userid, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /timer/:id
Returns a single timer referenced by the timer primary key id

GET /timerByUser/:userid
Returns multiple timers associated with the provided userid

POST /timer    (Requires json/js body of {userid: number, timerdate: "yyyy-mm-dd", researchtime: int, writingtime: int, customtime: int})
Posts a timer with specified values

PUT /timer/:id  (Requires json/js body of {researchtime: int, writingtime: int, customtime: int})
Updates/puts the timer specified by its unique id with new researchtime, writingtime, and customtime values.

DELETE /timer/:id
Deletes the timer specified by its unique id

#### Custom Timers

GET /customTimer/:userid/:date
Returns the timers for a specified user (userid, references primary key of users table)
and for a specified date in the format yyyy-mm-dd

GET /customTimerByUser/:userid
Returns all custom timer names ever used for a specified user (userid, references primary key of users table)

GET /customTimer/:id
Returns a single timer referenced by the timer primary key id

GET /allCustomTimers/:userid
Returns all custom timer entires for every date for a specified user

POST /customTimer   (Requires json/js body of {userid: number, timerdate: "yyyy-mm-dd", time: int, name: string})

PUT /customTimer/:id (Requires json/js body of {time: int, name: string})

DELETE /customTimer/:id
Deletes the custom timer specified by its unique id

DELETE /customTimerName/:name
Deletes all custom timer entries with the given name (effectively deleting that custom timer)

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

PUT /group/:id  (Requires json/js body of {groupname: string})
Updates/puts the group specified by its unique id with a new groupname value.

DELETE /group/:id	Deletes a single group with provided id

### Groupchat

GET /groupchat/:groupid     Gets all groupchat messages for a single group

POST /groupchat   Posts a single chat with body: {groupid: int, chattext: string, chatdate: string, userid: int, username: string}

### Group Links

GET /grouplinks/:groupid    Gets all groupchat links for a single group

POST /grouplinks            Posts a single link with body: {groupid: int, link: string, title: string, linkdate: string, userid: int, username: string}

PUT /grouplinks/:id         Updates a link by its id, requires body of {link: string, title: string}

DELETE /grouplinks/:id      Deletes a link by its id

### Forum

GET /forumPosts       Gets all forum posts

GET /forumPosts/:classid    Gets all forum posts with given classid (Private notes have classid = -1)

GET /forum/:id		Gets a forum post by its id

PUT /forum/:id		Updates a forum post by its id, requires body of {title: string, body: string}

POST /forum			Posts a forum post, requires body of  {title: string, body: string, userid: int, username: string, postdate: string, classid: int}

DELETE /forum/:id	Deletes a forum post by its id 

### Notes

GET /note/:userid/:date		Gets a note for a userid and given date (yyyy-mm-dd), to be used on Home page to get a user's note for the day

GET /note/:id		Gets a note by its unique id

GET /noteByDate/:date		Gets all notes for a specified date (yyyy-mm-dd format)  To be used on admin page to get all notes from students for the day

POST /note			Posts a note with body { userid: int, notedate: "yyyy-mm-dd", notetext: string }

PUT /note/:id		Updates a note with specified id with body {notetext: string}

DELETE /note/:id	Deletes a note with specified id

### Classes

GET /class/:classname    Gets the class with specified classname

GET /classes     Gets all classes

GET /clas/:id		No, that is not a typo. Gets a single class by provided id

POST /class			Posts a single class with body {classname: string}

PUT /class/:id  (Requires json/js body of {classname: string})
Updates/puts the class specified by its unique id with a new classname value.

DELETE /class/:id	Deletes a single class with provided id

### Forum comments/replies

GET /comment/:id		Gets the comment with specified id

GET /commentsByPost/:postid		Gets all comments associated to a provided postid

POST /comment		Requires body of {body: string, userid: int, postid: int, username: string, commentdate: string}

PUT /comment/:id	updates comment with provided id and requires body of {body: string, commentdate: string} 

DELETE /comment/:id		Deletes the comment with the associated id

### Reflection questions

GET /question/:classid		Gets the single set of questions already in the database for that class (returns {id: int, classid: int, questionone: string, questiontwo: string, questionthree: string, additionalquestions: string array})

POST /question  Requires body of {classid: int, questionone: string, questiontwo: string, questionthree: string}

PUT /question/:id		Updates the question with given id with body {questionone: string, questiontwo: string, questionthree: string, additionalquestions: string array}

### Class links

GET /classlink/:id Gets the class link with specified id

GET /allClasslinks/:classid Gets all the links associated to provided classid

POST /classlink Requires body of {classid: int, linkname: string, linkurl: string}

PUT /classlink/:id Updates a class link by its id, requires body of {linkname: string, linkurl: string}

DELETE /classlink/:id Deletes the class link with the associated id

## Auth0

https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/

If you want to create your own auth0 account to function with this app, follow these steps:
- Create an auth0 account
- Create a new single-page application (click of a button when creating a new auth0 app)
- Copy the domain and clientid (under settings) and put it in src/auth_config.json
- Add `http://localhost:3005/callback, https://student-success.herokuapp.com/callback` to ALLOWED CALLBACK URLS under application settings in auth0
- Add `http://localhost:3005, https://student-success.herokuapp.com` to ALLOWED WEB ORIGINS and ALLOWED LOGOUT URLS under application settings in auth0
- Save the changes
- Add a user role called user and an admin role called admin in auth0.
- Add this snippet of code to an empty rule (Rules are on the left sidebar on the auth0 dashboard) : 
```function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  //replace these emails with your desired admin emails
  var emails = ['jjacob20@live.unc.edu', 'perryh@cs.unc.edu', 'takoda@cs.unc.edu'];
  for(var i = 0; i < emails.length; i++){
    if(user.email === emails[i]){
      user.app_metadata.role = 'admin';
      break;
    }
    else{
      user.app_metadata.role = 'user';
    }
  }
  
if (!user.email || !user.email_verified) {
    return callback(null, user, context);
}
 
  auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
    .then(() => {
      context.idToken['https://student-success.herokuapp.com/role'] = user.app_metadata.role;
      callback(null, user, context);
    })
    .catch((err) => {
      callback(err);
    });
}
```

## FUTURE NOTES

Link to trello page that contains nice to have/future iteration notes: https://trello.com/b/aSzSg5tc/comp-523-software-for-student-success


The main notes:
- A user will receive a reminder if they haven't logged in for the day (Complicated given the structure of how a web app works)
- A user can set goals for the future as well as that day
- Allow the app to use persistent google oauth logins.
