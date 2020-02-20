const { pool } = require('../config')

var dateReg = /^\d{4}-\d{2}-\d{2}$/

const getWeeklyGoals = (request, response) => {
    const userid = parseInt(request.params.userid)

    if (!isNaN(userid)) {
        pool.query('SELECT * FROM weeklygoals WHERE userid = $1', [userid], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter id not a number")
    }
}

const getWeeklyGoal = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM weeklygoals WHERE id = $1 ', [id], (error, results) => {
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

/*
Expects: request.body to have json:
{
    userId: int,
    goalDate: "yyyy-mm-dd",
    goalText: "This is some text",
    completed: boolean,
    completeDate: "yyyy-mm-dd"
}
*/
const addWeeklyGoal = (request, response) => {
    const { userid, goaldate, goaltext, completed, completedate } = request.body;

    if (userid != null && goaldate != null) {
        if (goaldate.match(dateReg) != null && typeof completed === "boolean" && 
            completedate.match(dateReg)) {
            pool.query('INSERT INTO weeklygoals (userid, goaldate, goaltext, completed, completedate) VALUES ($1, $2, $3, $4, $5)', [userid, goaldate, goaltext, completed, completedate], (error) => {
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
        response.status(400).send("Error: Either userid, goaldate, or completedate fields do not exist or are named incorrectly or are null")
    }
    
}



const putWeeklyGoal = (request, response) => {
    const id = parseInt(request.params.id)

    const { goaltext, completed, completedate } = request.body;
    if (!isNaN(id) && typeof completed === "boolean" && completedate.match(dateReg)) {
        pool.query('UPDATE weeklygoals SET goaltext = $2, completed = $3, completedate = $4 WHERE id = $1', [id, goaltext, completed, completedate], (error) => {
            if (error) {
                throw error
            }
            else {
                response.status(201).send('Goal updated')
            }
        });
    }
    else {
        response.status(400).send('Failure. Either the id provided is not a number, completed is not a boolean, or completedate is not in the yyyy-mm-dd format')
    }
    
}

const deleteWeeklyGoal = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM weeklygoals WHERE id = $1', [id], (error, result) => {
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
    getWeeklyGoals,
    getWeeklyGoal,
    addWeeklyGoal,
    putWeeklyGoal,
    deleteWeeklyGoal,

}