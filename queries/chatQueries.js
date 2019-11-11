const { pool } = require('../config')

const getAllChats = (request, response) => {
    const groupid = parseInt(request.params.groupid)

    if (!isNaN(groupid)) {
        pool.query('SELECT * FROM groupchat WHERE groupid = $1', [groupid], (error, results) => {
            response.status(200).json(results.rows);
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
    chattext: "text",
    chatdate: "Some date and time",
}
*/
const addChat = (request, response) => {
    const { groupid, chattext, chatdate, userid, username } = request.body;
    
    if (!isNaN(groupid) && chattext != null && chatdate != null && !isNaN(userid) && username != null) {
        pool.query('INSERT INTO groupchat (groupid, chattext, chatdate, userid, username) VALUES ($1, $2, $3, $4, $5)', [groupid, chattext, chatdate, userid, username], (error) => {
            response.status(201).json({ status: 'success', message: 'Chat added' })
        })
    }
    else {
        response.status(400).send("Error: Either groupid, chattext, chatdate, userid, username fields do not exist or are named incorrectly or are null")
    }

}

module.exports = {
    getAllChats,
    addChat,

}