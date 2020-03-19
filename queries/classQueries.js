const { pool } = require('../config')

/*
Requires param of classname
*/

const getClass = (request, response) => {
    const classname = request.params.classname

    pool.query('SELECT * FROM classes WHERE classname = $1', [classname], (error, results) => {
        if (error) {
            throw error
        }
        else {
            response.status(200).json(results.rows);
        }
    })
}

const getClasses = (request, response) => {
    pool.query('SELECT * FROM classes ', (error, results) => {
        if (error) {
            throw error
        }
        else {
            response.status(200).json(results.rows);
        }
    })
}

const addClass = (request, response) => {

    const classname = request.body.classname

    if (classname != null) {
        pool.query('INSERT INTO classes (classname) VALUES ($1)', [classname], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Class added!')
            }
        })
    }
    else {
        response.status(400).send('Error: classname field in body likely named incorrectly and is undefined')
    }

}

const getClassById = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('SELECT * FROM classes WHERE id = $1', [id], (error, result) => {
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

const putClass = (request, response) => {
    const { classname } = request.body;
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('UPDATE classes SET classname = $2 WHERE id = $1', [id, classname], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Class updated with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter not a number")
    }
}

const deleteClass = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('DELETE FROM classes WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Class deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter not a number")
    }
}

module.exports = {
    getClass,
    getClasses,
    addClass,
    getClassById,
    putClass,
    deleteClass
}