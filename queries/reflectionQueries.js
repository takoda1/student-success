const { pool } = require('../config')

var dateReg = /^\d{4}-\d{2}-\d{2}$/

//Reflection object: {id, userid, reflectiondate, reflectiontext}

const getReflection = (request, response) => {
    const userid = parseInt(request.params.userid)
    const date = request.params.date;

    if (!isNaN(userid) && date.match(dateReg) != null) {
        pool.query('SELECT * FROM reflections WHERE userid = $1 AND reflectiondate = $2', [userid, date], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter userid not a number or incorrect date format" })
    }
}

/*
Requires param of id (unique identier for reflection)
*/

const getReflectionById = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('SELECT * FROM reflections WHERE id = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
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
    reflectiondate: yyyy-mm-dd,
    reflectiontext: string
}
*/
const addReflection = (request, response) => {
    const { userid, reflectiondate, reflectiontext } = request.body;



    if (userid != null && reflectiondate != null) {
        if (reflectiondate.match(dateReg) != null && !isNaN(userid)) {
            pool.query('INSERT INTO reflections (userId, reflectiondate, reflectiontext) VALUES ($1, $2, $3)', [userid, reflectiondate, reflectiontext], (error) => {
                if (error) {
                    throw error
                }
                response.status(201).json({ status: 'success', message: 'Reflection added' })
            })
        }
        else {
            response.status(400).send('Failure. Either the date is not in the format yyyy-mm-dd, or userid is not a number')
        }
    }
    else {
        response.status(400).send('Error. Either userid or reflectiondate fields do not exist or are named incorrectly or are null')
    }

}


/*
    Requires params of id (id specific to reflection)
    and body of {reflectiontext: string}
*/

const putReflection = (request, response) => {
    const id = parseInt(request.params.id)

    const { reflectiontext } = request.body;
    if (!isNaN(id) && reflectiontext != null) {
        pool.query('UPDATE reflections SET reflectiontext = $2 WHERE id = $1', [id, reflectiontext], (error) => {
            if (error) {
                throw error
            }
            response.status(201).send('Reflection updated')
        });
    }
    else {
        response.status(400).send('Failure. The id provided is not a number or the reflection text is not null.')
    }

}

/*
Requires param of id (the unique id for a reflection)
*/

const deleteReflection = (request, response) => {
    const id = parseInt(request.params.id)

    if (!isNaN(id)) {
        pool.query('DELETE FROM reflections WHERE id = $1', [id], (error, result) => {
            if (error) { throw error }
            response.status(200).send(`Reflection deleted with ID: ${id}`)
        })
    }
    else {
        response.status(400).json({ "Error": "Parameter id not a number." })
    }
}

module.exports = {
    getReflection,
    getReflectionById,
    putReflection,
    addReflection,
    deleteReflection
}