const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const userQueries = require('./queries/userQueries')
const goalQueries = require('./queries/goalQueries')
const timerQueries = require('./queries/timerQueries')
const reflectionQueries = require('./queries/reflectionQueries')
const groupQueries = require('./queries/groupQueries')

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
app.get('/user/:firstname/:lastname', userQueries.getUserByName)
app.post('/user', userQueries.addUser)
app.delete('/user/:id', userQueries.deleteUser)

app.get('/goals/:userid/:date', goalQueries.getGoals)
app.get('/goal/:id', goalQueries.getGoal)
app.post('/goal', goalQueries.addGoal)
app.put('/goal/:id', goalQueries.putGoal)
app.delete('/goal/:id', goalQueries.deleteGoal)

app.get('/timer/:userid/:date', timerQueries.getTimer)
app.get('/timer/:id', timerQueries.getTimerById)
app.post('/timer', timerQueries.addTimer)
app.put('/timer/:id', timerQueries.putTimer)
app.delete('/timer/:id', timerQueries.deleteTimer)

app.get('/reflection/:userid/:date', reflectionQueries.getReflection)
app.get('/reflection/:id', reflectionQueries.getReflectionById)
app.post('/reflection', reflectionQueries.addReflection)
app.put('/reflection/:id', reflectionQueries.putReflection)
app.delete('/reflection/:id', reflectionQueries.deleteReflection)

app.get('/group/:groupname', groupQueries.getGroup)
app.get('/grou/:id', groupQueries.getGroupById)
app.post('/group', groupQueries.addGroup)
app.delete('/group/:id', groupQueries.deleteGroup)


app.get('/', (request, response)=>{
    response.status(200).json({ success: "HEY WHATS UP" , user:process.env.DB_USER});
})

app.listen(port, () => {
    console.log('App running on port '+port)
})

module.exports = app