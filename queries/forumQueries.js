const { pool } = require('../config')

const getAllPosts = (request, response) => {
   
    pool.query('SELECT * FROM forum ORDER BY id DESC', (error, results) => {
        response.status(200).json(results.rows);
    })
}

const getPost = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM forum WHERE id = $1 ', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number" })
    }
}


const addPost = (request, response) => {
    const { title, body, userid, username, postdate } = request.body;

    if (title != null && body != null && !isNaN(userid) && username != null && postdate != null) {
        pool.query('INSERT INTO forum (title, body, userid, username, postdate) VALUES ($1, $2, $3, $4, $5)', [title, body, userid, username, postdate], (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: 'Forum post added' })
        })
    }
    else {
        response.status(400).send("Error: One of the 5 fields do not exist or are named incorrectly or are null")
    }
    
}

const putPost = (request, response) => {
    const id = parseInt(request.params.id)
    const { title, body } = request.body;

    if (!isNaN(id) && title != null && body != null) {
        pool.query('UPDATE forum SET title = $2, body = $3 WHERE id = $1', [id, title, body], (error) => {
            if (error) {
                throw error
            }
            response.status(201).send('Forum post updated')
        });
    }
    else {
        response.status(400).send('Failure. Either the id provided is not a number, or One of the fields is null')
    }
    
}

const deletePost = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM forum WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            response.status(200).send(`Forum post deleted with ID: ${id}`)
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number is null" })
    }
}

module.exports = {
    getAllPosts,
    getPost,
    addPost,
    putPost,
    deletePost,
}