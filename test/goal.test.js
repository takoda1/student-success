/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('GOAL API', () => {

    const values = {
        userid: 1,
        date: '2019-09-09'
    }

    var goal = {
        userid: values.userid,
        goaldate: values.date,
        goaltext: 'this is text',
        completed: true
    }

    var goalId = ''

    it('posts a goal with body {userid, goaldate, goaltext, completed}', () => {
        
        return chai.request(server)
        .post('/goal')
            .send(goal) //send the js goal object to be posted
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets all goals for a date and userId', () => {

        return chai.request(server)
            .get('/goals/' + values.userid + '/' + values.date)
            .then((res) => {
                goalId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in goal) {
                    chai.expect(res.body[0].key).to.equal(goal.key)
                }
            })
    })

    it('Correctly errors when provided erroneous userid input when getting goals for a user', () => {
        return chai.request(server)
            .get('/goals/abc/' + '2019-09-09')
            .then((res) => {
                res.should.have.status(400)
                res.error.text.should.contain("Error: Parameter id not a number or incorrect date format")
            })
    })

    it('Correctly errors when provided erroneous date input when getting goals for a user', () => {
        return chai.request(server)
            .get('/goals/1/' + '20-00-aa')
            .then((res) => {
                res.should.have.status(400)
                res.error.text.should.contain("Error: Parameter id not a number or incorrect date format")
            })
    })

    it('Gets a single goal based on the goal\'s id', () => {
        return chai.request(server)
            .get('/goal/' + goalId)
            .then((res) => {
                res.should.have.status(200)
                for (var key in goal) {
                    chai.expect(res.body[0].key).to.equal(goal.key)
                }
            })
        
    })

    it('Updates a single goal based on the goal\'s id, and updates the goalText and completed fields', () => {
        const newGoal = {
            goaltext: "YAY",
            completed: false
        }
        return chai.request(server)
            .put('/goal/' + goalId)
            .send(newGoal)
            .then((res) => {
                res.text.should.contain('Goal updated')
                return chai.request(server).get('/goal/' + goalId).then((result) => {
                    result.body[0].goaltext.should.equal(newGoal.goaltext)
                })
            })
    })


    it('Deletes a single goal based on the goal\'s id', () => {

        return chai.request(server)
            .delete('/goal/' + goalId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Goal deleted')
            })
    })
})
