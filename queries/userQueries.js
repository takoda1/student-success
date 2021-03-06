const { pool } = require('../config')

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY lastName asc', (error, results) => {
        if (error) {
            throw error
        }
        else {
            response.status(200).json(results.rows);
        }
    })
}

const addUser = (request, response) => {
    
    const { firstname, lastname, email, groupid, classid } = request.body;
    if (firstname != null && lastname != null && email != null && !isNaN(groupid) && !isNaN(classid)) {
        pool.query('INSERT INTO users (firstname, lastname, email, groupid, classid) VALUES ($1, $2, $3, $4, $5)', [firstname, lastname, email, groupid, classid], (error) => {
            if (error) {
                response.status(400).send(error)
            }
            else {
                response.status(201).send('User added!')
            }
        })
    }
    else {
        response.status(400).send('Error: fields in body likely named incorrectly, at least one of them is undefined')
    }
    
}

const putUser = (request, response) => {
    const { firstname, lastname, email, groupid, hidetimer, hidereflection, classid, hideweeklygoals } = request.body
    const id = parseInt(request.params.id)

    if (!isNaN(id) && firstname != null && lastname != null && email != null && !isNaN(groupid) && hidetimer != null && hidereflection != null && !isNaN(classid) && hideweeklygoals != null) {
        pool.query('UPDATE users SET firstname = $2, lastname = $3, email = $4, groupid = $5, hidetimer = $6, hidereflection = $7, classid = $8, hideweeklygoals = $9 WHERE id = $1', [id, firstname, lastname, email, groupid, hidetimer, hidereflection, classid, hideweeklygoals], (error) => {
            if (error) {
                response.status(400).send(error)
            }
            else {
                response.status(201).send('User updated!')
            }
        })
    }
    else {
        response.status(400).send('Error: fields in body likely named incorrectly, at least one of them is undefined, or id is not a number/undefined')
    }

}

const getUser = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('SELECT * FROM users WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).json(result.rows);
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter not a number" })
    }
}

const getUserByGroup = (request, response) => {
    const groupid = parseInt(request.params.groupid)
    if (!isNaN(groupid)) {
        pool.query('SELECT * FROM users WHERE groupid = $1', [groupid], (error, result) => {
            if (error) { throw error }
            else{
                response.status(200).json(result.rows)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter groupid is not a number" })
    }
}

const getUserByName = (request, response) => {
    const firstname = request.params.firstname
    const lastname = request.params.lastname
    pool.query('SELECT * FROM users WHERE firstname = $1 AND lastname = $2', [firstname, lastname], (error, result) => {
        if (error) { throw error }
        else {
            response.status(200).json(result.rows)
        }
    })
}

const getUserByEmail = (request, response) => {
    const email = request.params.email

    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, result) => {
        if (error) { throw error }
        response.status(200).json(result.rows)
    })
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('DELETE FROM users WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`User deleted with ID: ${id}`)
            }
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
    putUser,
    getUserByName,
    getUserByEmail,
    getUserByGroup,
    deleteUser,
}