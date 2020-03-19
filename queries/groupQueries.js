const { pool } = require('../config')

/*
Requires param of groupname
*/

const getGroup = (request, response) => {
    const groupname = request.params.groupname

    pool.query('SELECT * FROM groups WHERE groupname = $1', [groupname], (error, results) => {
        if (error) {
            throw error
        }
        else {
            response.status(200).json(results.rows);
        }
    })
}

const getGroups = (request, response) =>{
    pool.query('SELECT * FROM groups ', (error, results) => {
        if (error) {
            throw error
        }
        else {
            response.status(200).json(results.rows);
        }
    })
}

const addGroup = (request, response) => {

    const groupname = request.body.groupname

    if (groupname != null) {
        pool.query('INSERT INTO groups (groupname) VALUES ($1)', [groupname], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Group added!')
            }
        })
    }
    else {
        response.status(400).send('Error: groupname field in body likely named incorrectly and is undefined')
    }

}

const getGroupById = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('SELECT * FROM groups WHERE id = $1', [id], (error, result) => {
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

const putGroup = (request, response) => {
    const { groupname } = request.body;
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('UPDATE groups SET groupname = $2 WHERE id = $1', [id, groupname], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Group updated with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter not a number")
    }
}

const deleteGroup = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('DELETE FROM groups WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Group deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter not a number")
    }
}

module.exports = {
    getGroup,
    getGroups,
    addGroup,
    getGroupById,
    putGroup,
    deleteGroup
}