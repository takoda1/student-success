const { pool } = require('../config')

const getClassLink = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM classlinks WHERE id = $1 ', [id], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number" })
    }
}


const getAllClassLinks = (request, response) => {
    const classid = parseInt(request.params.classid)

    if (!isNaN(classid)) {
        pool.query('SELECT * FROM classlinks WHERE classid = $1', [classid], (error, results) => {
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

const addClassLink = (request, response) => {
    const { classid, linkname, linkurl } = request.body;
    
    if (!isNaN(classid) && linkname != null && linkurl != null) {
        pool.query('INSERT INTO classlinks (classid, linkname, linkurl) VALUES ($1, $2, $3)', [classid, linkname, linkurl], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).json({ status: 'success', message: 'Class link added' })
            }
        })
    }
    else {
        response.status(400).send("Error: Either classid, linkname, or linkurl fields do not exist or are named incorrectly or are null")
    }

}

const putClassLink = (request, response) => {
    const id = parseInt(request.params.id)
    const { linkname, linkurl } = request.body;

    if (!isNaN(id) && linkname != null && linkurl != null) {
        pool.query('UPDATE classlinks SET linkname = $2, linkurl = $3 WHERE id = $1', [id, linkname, linkurl], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Class link updated')
            }
        });
    }
    else {
        response.status(400).send('Failure. Either the id provided is not a number, or one of the fields is null')
    }
    
}

const deleteClassLink = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM classlinks WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Class link deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number is null" })
    }
}

module.exports = {
    getClassLink,
    getAllClassLinks,
    addClassLink,
    putClassLink,
    deleteClassLink,
}