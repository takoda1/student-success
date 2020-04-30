const { pool } = require('../config')

/*
Requires param of groupname
*/

const getQuestion = (request, response) => {
    const classid = parseInt(request.params.classid)

    if (!isNaN(classid)) {
        pool.query('SELECT * FROM reflectionquestion where classid = $1 ', [classid], (error, results) => {
            if (error) {
                throw error
            }
            else {
                response.status(200).json(results.rows);
            }
        })
    } else {
        response.status(400).json({ "Error": "Parameter classid not a number" })
    }
}

const addQuestion = (request, response) => {
    const { questionone, questiontwo, questionthree, classid } = request.body;
    pool.query('INSERT INTO reflectionquestion (questionone, questiontwo, questionthree, classid) VALUES ($1, $2, $3, $4)', [questionone, questiontwo, questionthree, classid], (error) => {
        if (error) {
            throw error
        }
        else {
            response.status(201).send('Question added!')
        }
    })

}

const putQuestion = (request, response) => {
    const { questionone, questiontwo, questionthree, additionalquestions } = request.body;
    const id = parseInt(request.params.id)
    if (!isNaN(id)) {
        pool.query('UPDATE reflectionquestion SET questionone = $2, questiontwo = $3, questionthree  = $4, additionalquestions = $5 WHERE id = $1', [id, questionone, questiontwo, questionthree, additionalquestions], (error, result) => {
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
    const classid = parseInt(request.params.classid)
    if (!isNaN(classid)) {
        pool.query('DELETE FROM reflectionquestion WHERE classid = $1', [classid], (error, result) => {
            if (error) { throw error }
            else {
                response.status(200).send(`Question deleted with class ID: ${classid}`)
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