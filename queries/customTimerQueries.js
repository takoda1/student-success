const { pool } = require('../config')

var dateReg = /^\d{4}-\d{2}-\d{2}$/

//customTimer object: {id, userid, timerdate, time, name}

const getCustomTimer = (request, response) => {
    const userid = parseInt(request.params.userid)
    const date = request.params.date;

    if (!isNaN(userid) && date.match(dateReg) != null) {
        pool.query('SELECT * FROM customtimers WHERE userid = $1 AND timerdate = $2', [userid, date], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter userid not a number or incorrect date format" })
    }
}

const getAllCustomTimers = (request, response) => {
    const userid = parseInt(request.params.userid)
    if (!isNaN(userid)) {
        pool.query('SELECT * FROM customtimers WHERE userid = $1', [userid], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter userid not a number" })
    }
}

const getCustomTimerByUserid = (request, response) => {
    const userid = parseInt(request.params.userid)
    if (!isNaN(userid)) {
        pool.query('SELECT DISTINCT name FROM customtimers WHERE userid = $1', [userid], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter userid not a number" })
    }
}

/*
Requires param of id (unique identier for timer)
*/

const getCustomTimerById = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM customtimers WHERE id = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number." })
    }
}

/*
Expects: request.body to have json:
{
    userid: int,
    timerdate: yyyy-mm-dd,
    time: int, (seconds)
    name: string
}
*/
const addCustomTimer = (request, response) => {
    const { userid, timerdate, time, name } = request.body;



    if (userid != null && timerdate != null) {
        if (timerdate.match(dateReg) != null && !isNaN(userid)) {
            pool.query('INSERT INTO customtimers (userId, timerdate, time, name) VALUES ($1, $2, $3, $4)', [userid, timerdate, time, name], (error) => {
                if (error) {
                    throw error
                }
                else {
                    response.status(201).json({ status: 'success', message: 'Timer added' })
                }
            })
        }
        else {
            response.status(400).send('Failure. Either the date is not in the format yyyy-mm-dd, or userid is not a number')
        }
    }
    else {
        response.status(400).send('Error. Either userid or timerdate fields do not exist or are named incorrectly or are null')
    }
    
}


/*
    Requires params of id (id specific to timer)
    and body of {time: int, name: string}
*/

const putCustomTimer = (request, response) => {
    const id = parseInt(request.params.id)

    const { time, name } = request.body;
    if (!isNaN(id)) {
        pool.query('UPDATE customtimers SET time = $2, name = $3 WHERE id = $1', [id, time, name], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Timer updated')
            }
        });
    }
    else {
        response.status(400).send('Failure. The id provided is not a number.')
    }
    
}

/*
Requires param of id (the unique id for a timer)
*/

const deleteCustomTimer = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM customtimers WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Timer deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number." })
    }
}

const deleteCustomTimerName = (request, response) => {
    const name = request.params.name;

    if (name !== null) {
        pool.query('DELETE FROM customtimers WHERE name = $1', [name], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Timer name deleted with name: ${name}`)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter name is null." })
    }

}

module.exports = {
    getCustomTimer,
    getAllCustomTimers,
    getCustomTimerById,
    getCustomTimerByUserid,
    putCustomTimer,
    addCustomTimer,
    deleteCustomTimer,
    deleteCustomTimerName
}
