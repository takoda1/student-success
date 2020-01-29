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
    linkdate: string, 
    userid: int, 
    username: string
}
*/
const addLink = (request, response) => {
    const { groupid, link, linkdate, userid, username } = request.body;
    
    if (!isNaN(groupid) && link != null && linkdate != null && !isNaN(userid) && username != null) {
        pool.query('INSERT INTO grouplinks (groupid, link, linkdate, userid, username) VALUES ($1, $2, $3, $4, $5)', [groupid, link, linkdate, userid, username], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).json({ status: 'success', message: 'Link added' })
            }
        })
    }
    else {
        response.status(400).send("Error: Either groupid, link, linkdate, userid, username fields do not exist or are named incorrectly or are null")
    }

}

module.exports = {
    getAllLinks,
    addLink,

}