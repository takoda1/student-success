const { pool } = require('./config')

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY lastName asc', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const addUser = (request, response) => {
    const { firstName, lastName, email } = request.body;

    pool.query('INSERT INTO users (firstName, lastName, email) VALUES ($1, $2, $3)', [firstName, lastName, email], (error) => {
        if (error) {
            throw error
        }
        response.status(201).send('User added!')
    })
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
    const firstName = request.params.firstName
    const lastName = request.params.lastName

    pool.query('SELECT * FROM users WHERE firstname = $1 AND lastname = $2', [firstName, lastName], (error, result) => {
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