const { pool } = require('./config')

const getUsers = (request, response) => {
    console.log("ABC");
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
        response.status(201).json({ status: 'success', message:'User added'})
    })
}

module.exports = {
    getUsers,
    addUser,
}