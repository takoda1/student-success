const { pool } = require('../config')

var dateReg = /^\d{4}-\d{2}-\d{2}$/

//Timer object: {id, userid, timerdate, researchtime, writingtime, customtime}

const getTimer = (request, response) => {
    const userid = parseInt(request.params.userid)
    const date = request.params.date;

    if (!isNaN(userid) && date.match(dateReg) != null) {
        pool.query('SELECT * FROM timers WHERE userid = $1 AND timerdate = $2', [userid, date], (error, results) => {
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

const getTimerByUserid = (request, response) => {
    const userid = parseInt(request.params.userid)
    if (!isNaN(userid)) {
        pool.query('SELECT * FROM timers WHERE userid = $1', [userid], (error, results) => {
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

const getTimerById = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM timers WHERE id = $1', [id], (error, results) => {
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
    researchtime: int, (seconds)
    writingtime: int, (seconds)
    customtime: int (seconds)
}
*/
const addTimer = (request, response) => {
    const { userid, timerdate, researchtime, writingtime, customtime } = request.body;



    if (userid != null && timerdate != null) {
        if (timerdate.match(dateReg) != null && !isNaN(userid)) {
            pool.query('INSERT INTO timers (userId, timerdate, researchtime, writingtime, customtime) VALUES ($1, $2, $3, $4, $5)', [userid, timerdate, researchtime, writingtime, customtime], (error) => {
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
    and body of {researchtime: int, writingtime: int, customtime:int}
*/

const putTimer = (request, response) => {
    const id = parseInt(request.params.id)

    const { researchtime, writingtime, customtime } = request.body;
    if (!isNaN(id)) {
        pool.query('UPDATE timers SET researchtime = $2, writingtime = $3, customtime = $4 WHERE id = $1', [id, researchtime, writingtime, customtime], (error) => {
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

const deleteTimer = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM timers WHERE id = $1', [id], (error, result) => {
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

module.exports = {
    getTimer,
    getTimerById,
    getTimerByUserid,
    putTimer,
    addTimer,
    deleteTimer
}