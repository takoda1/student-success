const { pool } = require('../config')

var dateReg = /^\d{4}-\d{2}-\d{2}$/

const getWeeklySubGoals = (request, response) => {
    const userid = parseInt(request.params.userid)
    const date = request.params.date;

    if (!isNaN(userid) && date.match(dateReg) != null) {
        pool.query('SELECT * FROM weeklysubgoals WHERE userid = $1 AND goaldate = $2', [userid, date], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter id not a number or incorrect date format")
    }
}

const getWeeklySubGoal = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM weeklysubgoals WHERE id = $1 ', [id], (error, results) => {
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

const getWeeklySubGoalByParent = (request, response) => {
    const parentgoal = parseInt(request.params.parentgoal)

    if (!isNaN(parentgoal)) {
        pool.query('SELECT * FROM weeklysubgoals WHERE parentgoal = $1 ', [parentgoal], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter parentgoal not a number" })
    }
}

/*
Expects: request.body to have json:
{
    userId: int,
    parentgoal: int,
    goalDate: "yyyy-mm-dd",
    goalText: "This is some text",
    completed: boolean
}
*/
const addWeeklySubGoal = (request, response) => {
    const { userid, parentgoal, goaldate, goaltext, completed } = request.body;

    if (userid != null && parentgoal != null && goaldate != null) {
        if (goaldate.match(dateReg) != null && typeof completed === "boolean") {
            pool.query('INSERT INTO weeklysubgoals (userid, parentgoal, goaldate, goaltext, completed) VALUES ($1, $2, $3, $4, $5)', [userid, parentgoal, goaldate, goaltext, completed], (error) => {
                if (error) {
                    throw error
                }
                else {
                    response.status(201).json({ status: 'success', message: 'Goal added' })
                }
            })
        }
        else {
            response.status(400).send('Failure. Either the date is not in the format yyyy-mm-dd, or completed is not a boolean')
        }
    }
    else {
        response.status(400).send("Error: Either userid, parentgoal, or goaldate fields do not exist or are named incorrectly or are null")
    }
    
}



const putWeeklySubGoal = (request, response) => {
    const id = parseInt(request.params.id)

    const { goaltext, completed } = request.body;
    if (!isNaN(id) && typeof completed === "boolean") {
        pool.query('UPDATE weeklysubgoals SET goaltext = $2, completed = $3 WHERE id = $1', [id, goaltext, completed], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Goal updated')
            }
        });
    }
    else {
        response.status(400).send('Failure. Either the id provided is not a number, or completed is not a boolean')
    }
    
}

const deleteWeeklySubGoal = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM weeklysubgoals WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Goal deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number or date is null" })
    }
}

module.exports = {
    getWeeklySubGoals,
    getWeeklySubGoal,
    addWeeklySubGoal,
    putWeeklySubGoal,
    deleteWeeklySubGoal,
    getWeeklySubGoalByParent,
}