const { pool } = require('./config')

var dateReg = /^\d{4}-\d{2}-\d{2}$/

const getGoals = (request, response) => {
    const userId = parseInt(request.params.userId)
    const date = request.params.date;

    if (!isNaN(userId) && date.match(dateReg) != null) {
        pool.query('SELECT * FROM goals WHERE userId = $1 AND goalDate = $2', [userId, date], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number or incorrect date format" })
    }
}

const getGoal = (request, response) => {
    const goalId = parseInt(request.params.id)

    if (!isNaN(goalId)) {
        pool.query('SELECT * FROM goals WHERE id = $1 ', [goalId], (error, results) => {
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

/*
Expects: request.body to have json:
{
    userId: int,
    goalDate: "yyyy-mm-dd",
    goalText: "This is some text",
    completed: boolean
}
*/
const addGoal = (request, response) => {
    const { userId, goalDate, goalText, completed } = request.body;


    if (goalDate.match(dateReg) != null && typeof completed === "boolean") {
        pool.query('INSERT INTO goals (userId, goalDate, goalText, completed) VALUES ($1, $2, $3, $4)', [userId, goalDate, goalText, completed], (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: 'Goal added' })
        })
    }
    else {
        response.status(400).send('Failure. Either the date is not in the format yyyy-mm-dd, or completed is not a boolean')
    }
}



const putGoal = (request, response) => {
    const id = parseInt(request.params.id)

    const { goalText, completed } = request.body;
    if (!isNaN(id) && typeof completed === "boolean") {
        pool.query('UPDATE goals SET goalText = $2, completed = $3 WHERE id = $1', [id, goalText, completed], (error) => {
            if (error) {
                throw error
            }
            response.status(201).send('Goal updated')
        });
    }
    else {
        response.status(400).send('Failure. Either the id provided is not a number, or completed is not a boolean')
    }
    
}

const deleteGoal = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM goals WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            response.status(200).send(`Goal deleted with ID: ${id}`)
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number or date is null" })
    }
}

module.exports = {
    getGoals,
    getGoal,
    addGoal,
    putGoal,
    deleteGoal,

}