const { pool } = require('../config')

var dateReg = /^\d{4}-\d{2}-\d{2}$/

const getNote = (request, response) => {
    const userid = parseInt(request.params.userid)
    const date = request.params.date

    if (!isNaN(userid) && date.match(dateReg) != null) {
        pool.query('SELECT * FROM notes WHERE userid = $1 AND notedate = $2', [userid, date], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter userid not a number or incorrect date format" })
    }
}

const getNoteById = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM notes WHERE id = $1', [id], (error, results) => {
            if (error) { throw error }
            else {
                response.status(200).json(results.rows)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number." })
    }
}

const getAllNotesByDate = (request, response) => {
    const date = request.params.date
    if (date.match(dateReg) != null) {
        pool.query('SELECT * FROM notes WHERE notedate = $1', [date], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows)
            }
        })
    }
    else {
        response.status(400).send("Error, incorrect or null date.")
    }
}

/*
Expects: request.body to have json:
{
    userid: int,
    notedate: yyyy-mm-dd,
    notetext: string
}
*/
const addNote = (request, response) => {
    const { userid, notedate, notetext } = request.body;
    
    if (notedate.match(dateReg) != null && !isNaN(userid)) {
        pool.query('INSERT INTO notes (userId, notedate, notetext) VALUES ($1, $2, $3)', [userid, notedate, notetext], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).json({ status: 'success', message: 'Note added' })
            }
        })
    }
    else {
        response.status(400).send('Failure. Either the date is not in the format yyyy-mm-dd, or userid is not a number')
    }

}


/*
    Requires params of id (id specific to reflection)
    and body of {reflectiontext: string}
*/

const putNote = (request, response) => {
    const id = parseInt(request.params.id)

    const { notetext } = request.body;
    if (!isNaN(id) && notetext != null) {
        pool.query('UPDATE notes SET notetext = $2 WHERE id = $1', [id, notetext], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Note updated')
            }
        });
    }
    else {
        response.status(400).send('Failure. The id provided is not a number or the note text is not null.')
    }

}

/*
Requires param of id (the unique id for a reflection)
*/

const deleteNote = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM notes WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Note deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number." })
    }
}

module.exports = {
    getNote,
    getNoteById,
    getAllNotesByDate,
    addNote,
    putNote,
    deleteNote
}