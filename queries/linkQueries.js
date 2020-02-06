const { pool } = require('../config')

const getAllLinks = (request, response) => {
    const groupid = parseInt(request.params.groupid)

    if (!isNaN(groupid)) {
        pool.query('SELECT * FROM grouplinks WHERE groupid = $1', [groupid], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows)
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter id not a number")
    }
}

/*
Expects: request.body to have json:
{
    groupid: int, 
    link: string, 
    title: string,
    linkdate: string, 
    userid: int, 
    username: string
}
*/
const addLink = (request, response) => {
    const { groupid, link, title, linkdate, userid, username } = request.body;
    
    if (!isNaN(groupid) && link != null && title != null && linkdate != null && !isNaN(userid) && username != null) {
        pool.query('INSERT INTO grouplinks (groupid, link, title, linkdate, userid, username) VALUES ($1, $2, $3, $4, $5, $6)', [groupid, link, title, linkdate, userid, username], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).json({ status: 'success', message: 'Link added' })
            }
        })
    }
    else {
        response.status(400).send("Error: Either groupid, link, title, linkdate, userid, username fields do not exist or are named incorrectly or are null")
    }

}

const putLink = (request, response) => {
    const id = parseInt(request.params.id)
    const { link, title } = request.body;

    if (!isNaN(id) && link != null && title != null) {
        pool.query('UPDATE grouplinks SET link = $2, title = $3 WHERE id = $1', [id, link, title], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Group link updated')
            }
        });
    }
    else {
        response.status(400).send('Failure. Either the id provided is not a number, or One of the fields is null')
    }
    
}

const deleteLink = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM grouplinks WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Group link deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number is null" })
    }
}

module.exports = {
    getAllLinks,
    addLink,
    putLink,
    deleteLink,
}