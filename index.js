const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const queries = require('./queries')
const port = 3000

//Load connection pool for postgres
const { pool } = require('./config')


const app = express();

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({ extended: true })
)
app.use(cors())

app.get('/users', queries.getUsers)

app.post('/user', queries.addUser)

app.listen(port, () => {
    console.log('App running on port ${port}')
})