const { pool } = require('../config')

const getCommentsByPost = (request, response) => {
    const postid = parseInt(request.params.postid)
    console.log("ABC ABC"+postid)
    if (!isNaN(postid)) {
        pool.query('SELECT * FROM forumcomment WHERE postid = $1', [postid], (error, results) => {
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
    body: string,
	userid: int,
	postid: int,
	username: string,
	commentdate: string
}
*/
const addComment = (request, response) => {
    const { body, userid, postid, username, commentdate } = request.body
    if (!isNaN(userid) && body != null && commentdate != null && !isNaN(postid) && username != null) {
        pool.query('INSERT INTO forumcomment (body, userid, postid, username, commentdate) VALUES ($1, $2, $3, $4, $5)', [body, userid, postid, username, commentdate], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).json({ status: 'success', message: 'Comment added' })
            }
        })
    }
    else {
        response.status(400).send("Error: Either body, userid, postid, username, or commentdate fields do not exist or are named incorrectly or are null")
    }

}


const putComment = (request, response) => {
    const { body, commentdate } = request.body
    const id = parseInt(request.params.id)

    if (!isNaN(id) && body != null && commentdate != null) {
        pool.query('UPDATE forumcomment SET body = $2, commentdate = $3 WHERE id = $1', [id, body, commentdate], (error) => {
            if (error) {
                response.status(400).send(error)
            }
            else {
                response.status(201).send('Comment updated!')
            }
        })
    }
    else {
        response.status(400).send('Error: fields in body likely named incorrectly, at least one of them is undefined, or id is not a number/undefined')
    }

}

const getComment = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('SELECT * FROM forumcomment WHERE id = $1', [id], (error, result) => {
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


const deleteComment = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('DELETE FROM forumcomment WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Comment deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter not a number" })
    }
}

module.exports = {
    getComment,
    addComment,
    putComment,
    deleteComment,
    getCommentsByPost

}