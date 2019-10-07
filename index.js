const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const queries = require('./queries')
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

app.get('/', (request, response)=>{
    response.status(200).json({ success: "HEY WHATS UP" , user:process.env.DB_USER});
})

app.listen(process.env.PORT || port, () => {
    console.log('App running on port '+port)
})