const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const queries = require('./queries')
const goalQueries = require('./goalQueries')

/*
process.env.port is provided by heroku and is the port on which,
if used, provides access to the outside world.
Right now we are using it for our api, but eventually we will have
our react app running on process.env.port and this api
running on a different port that we can hopefuly talk to from our react
app.
*/
const port = process.env.port || 3000

//Load connection pool for postgres
const { pool } = require('./config')


const app = express();

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({ extended: true })
)
app.use(cors())



app.get('/users', queries.getUsers)
app.get('/user/:id', queries.getUser)
app.post('/user', queries.addUser)
app.delete('/user/:id', queries.deleteUser)

app.get('/goals/:userId/:date', goalQueries.getGoals)
app.get('/goal/:id', goalQueries.getGoal)
app.post('/goal', goalQueries.addGoal)
app.put('/goal/:id', goalQueries.putGoal)
app.delete('/goal/:id', goalQueries.deleteGoal)

app.get('/', (request, response)=>{
    response.status(200).json({ success: "HEY WHATS UP" , user:process.env.DB_USER});
})

app.listen(process.env.PORT || port, () => {
    console.log('App running on port '+port)
})