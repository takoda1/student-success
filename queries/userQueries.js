const { pool } = require('../config')

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY lastName asc', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const addUser = (request, response) => {
    
    const { firstname, lastname, email, groupid } = request.body;
    if (firstname != null && lastname != null && email != null) {
        pool.query('INSERT INTO users (firstname, lastname, email, groupid) VALUES ($1, $2, $3, $4)', [firstname, lastname, email, groupid], (error) => {
            if (error) {
                throw error
            }
            response.status(201).send('User added!')
        })
    }
    else {
        response.status(400).send('Error: fields in body likely named incorrectly, at least one of them is undefined')
    }
    
}

const getUser = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('SELECT * FROM users WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            response.status(200).json(result.rows);
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter not a number" })
    }
}

const getUserByName = (request, response) => {
    const firstname = request.params.firstname
    const lastname = request.params.lastname
    pool.query('SELECT * FROM users WHERE firstname = $1 AND lastname = $2', [firstname, lastname], (error, result) => {
        if (error) { throw error }
        response.status(200).json(result.rows)
    })
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('DELETE FROM users WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            response.status(200).send(`User deleted with ID: ${id}`)
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter not a number" })
    }
}

module.exports = {
    getUsers,
    addUser,
    getUser,
    getUserByName,
    deleteUser,
}