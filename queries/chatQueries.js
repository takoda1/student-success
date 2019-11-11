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
    const { groupid, chattext, chatdate } = request.body;

    if (!isNaN(groupid) && chattext != null && chatdate != null) {
        pool.query('INSERT INTO groupchat (groupid, chattext, chatdate) VALUES ($1, $2, $3)', [groupid, chattext, chatdate], (error) => {
            response.status(201).json({ status: 'success', message: 'Chat added' })
        })
    }
    else {
        response.status(400).send("Error: Either userid or goaldate fields do not exist or are named incorrectly or are null")
    }

}

module.exports = {
    getAllChats,
    addChat,

}