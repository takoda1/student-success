/*
Setup database connection string as a pool using
environmental variables (loaded with dotenv, values
are in .env)
*/
require('dotenv').config()

const { Pool } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction,
})

const emailAddress = isProduction ? process.env.EMAIL_ADDR : process.env.DEV_EMAIL_ADDR;
const emailPassword = isProduction ? process.env.EMAIL_PASS : process.env.DEV_EMAIL_PASS;

module.exports = { pool, emailAddress, emailPassword }