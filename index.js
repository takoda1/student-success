const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const userQueries = require('./queries/userQueries')
const goalQueries = require('./queries/goalQueries')
const timerQueries = require('./queries/timerQueries')
const customTimerQueries = require('./queries/customTimerQueries')
const reflectionQueries = require('./queries/reflectionQueries')
const groupQueries = require('./queries/groupQueries')
const chatQueries = require('./queries/chatQueries')
const linkQueries = require('./queries/linkQueries')
const forumQueries = require('./queries/forumQueries')
const noteQueries = require('./queries/noteQueries')
const classQueries = require('./queries/classQueries')
const commentQueries = require('./queries/commentQueries')
const questionQueries = require('./queries/questionQueries')

/*
process.env.port is provided by heroku and is the port on which,
if used, provides access to the outside world.
Right now we are using it for our api, but eventually we will have
our react app running on process.env.port and this api
running on a different port that we can hopefuly talk to from our react
app.
*/

//Load connection pool for postgres
const { pool } = require('./config')

const port = 3000


const app = express();

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({ extended: true })
)
app.use(cors())

app.get('/users', userQueries.getUsers)
app.get('/user/:id', userQueries.getUser)
app.get('/userByEmail/:email', userQueries.getUserByEmail)
app.get('/user/:firstname/:lastname', userQueries.getUserByName)
app.get('/userByGroup/:groupid', userQueries.getUserByGroup)
app.put('/user/:id', userQueries.putUser)
app.post('/user', userQueries.addUser)
app.delete('/user/:id', userQueries.deleteUser)

app.get('/goals/:userid/:date', goalQueries.getGoals)
app.get('/goal/:id', goalQueries.getGoal)
app.post('/goal', goalQueries.addGoal)
app.put('/goal/:id', goalQueries.putGoal)
app.delete('/goal/:id', goalQueries.deleteGoal)

app.get('/timer/:userid/:date', timerQueries.getTimer)
app.get('/timer/:id', timerQueries.getTimerById)
app.get('/timerByUser/:userid', timerQueries.getTimerByUserid)
app.post('/timer', timerQueries.addTimer)
app.put('/timer/:id', timerQueries.putTimer)
app.delete('/timer/:id', timerQueries.deleteTimer)

app.get('/customTimer/:userid/:date', customTimerQueries.getCustomTimer);
app.get('/customTimerByUser/:userid', customTimerQueries.getCustomTimerByUserid);
app.get('/customTimer/:id', customTimerQueries.getCustomTimerById);
app.post('/customTimer/', customTimerQueries.addCustomTimer);
app.put('/customTimer/:id', customTimerQueries.putCustomTimer);
app.delete('/customTimer/:id', customTimerQueries.deleteCustomTimer);

app.get('/reflection/:userid/:date', reflectionQueries.getReflection)
app.get('/reflection/:id', reflectionQueries.getReflectionById)
app.post('/reflection', reflectionQueries.addReflection)
app.put('/reflection/:id', reflectionQueries.putReflection)
app.delete('/reflection/:id', reflectionQueries.deleteReflection)

app.get('/group/:groupname', groupQueries.getGroup)
app.get('/groups', groupQueries.getGroups)
app.get('/grou/:id', groupQueries.getGroupById)
app.post('/group', groupQueries.addGroup)
app.delete('/group/:id', groupQueries.deleteGroup) 

app.get('/groupchat/:groupid', chatQueries.getAllChats)
app.post('/groupchat', chatQueries.addChat)

app.get('/grouplinks/:groupid', linkQueries.getAllLinks)
app.post('/grouplinks', linkQueries.addLink)
app.put('/grouplinks/:id', linkQueries.putLink)
app.delete('/grouplinks/:id', linkQueries.deleteLink)

app.get('/forumPosts', forumQueries.getAllPosts)
app.get('/forum/:id', forumQueries.getPost)
app.put('/forum/:id', forumQueries.putPost)
app.post('/forum', forumQueries.addPost)
app.delete('/forum/:id', forumQueries.deletePost) 

app.get('/note/:userid/:date', noteQueries.getNote)
app.get('/note/:id', noteQueries.getNoteById)
app.get('/noteByDate/:date', noteQueries.getAllNotesByDate)
app.post('/note', noteQueries.addNote)
app.put('/note/:id', noteQueries.putNote)
app.delete('/note/:id', noteQueries.deleteNote)

app.get('/class/:classname', classQueries.getClass)
app.get('/classes', classQueries.getClasses)
app.get('/clas/:id', classQueries.getClassById) //why won't /class/:id work?? Anything other than /class works
app.post('/class', classQueries.addClass)
app.delete('/class/:id', classQueries.deleteClass)

app.get('/comment/:id', commentQueries.getComment)
app.get('/commentsByPost/:postid', commentQueries.getCommentsByPost)
app.post('/comment', commentQueries.addComment)
app.put('/comment/:id', commentQueries.putComment)
app.delete('/comment/:id', commentQueries.deleteComment)

app.get('/question', questionQueries.getQuestion)
app.put('/question/:id', questionQueries.putQuestion)

app.get('/quit', (req, res) => {
    res.send('Closing..')
    app.close()
})

app.listen(port, () => {
    console.log('App running on port '+port)
})


module.exports = app