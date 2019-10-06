/*
Setup database connection string as a pool using
environmental variables (loaded with dotenv, values
are in .env)
*/
require('dotenv').config()

const { Pool } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'

console.log("DBUSER:" + process.env.DB_USER)

console.log("DB PASSWORD:" + process.env.DB_PASSWORD)

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction,
})

module.exports = { pool }