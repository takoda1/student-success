const { pool } = require('../config')

/*
Requires param of groupname
*/

const getQuestion = (request, response) => {

    pool.query('SELECT * FROM reflectionquestion', (error, results) => {
        if (error) {
            throw error
        }
        else {
            response.status(200).json(results.rows);
        }
    })
}

const addQuestion = (request, response) => {
    const { questionone, questiontwo, questionthree } = request.body;
    pool.query('INSERT INTO reflectionquestion (questionone, questiontwo, questionthree) VALUES ($1, $2, $3)', [questionone, questiontwo, questionthree], (error) => {
        if (error) {
            throw error
        }
        else {
            response.status(201).send('Question added!')
        }
    })

}

const putQuestion = (request, response) => {
    const { questionone, questiontwo, questionthree } = request.body;
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('UPDATE reflectionquestion SET questionone = $2, questiontwo = $3, questionthree  = $4 WHERE id = $1', [id, questionone, questiontwo, questionthree], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Question updated with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter not a number")
    }
}

const deleteQuestion = (request, response) => {
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('DELETE FROM reflectionquestion WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Question deleted with ID: ${id}`)
            }
        })
    }
    else {
        response.status(400).send("Error: Parameter not a number")
    }
}

module.exports = {
    getQuestion,
    addQuestion,
    putQuestion,
    deleteQuestion
}