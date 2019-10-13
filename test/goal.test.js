/*
This test assumes the database is up and running and init.sql has been ran
*/

/*
Tests acting weird because of asynchronous
TODO: because we are performing asynchronous actions with the
tests, the tests will "pass" if something goes wrong, but will still
output an error. See how to fix this.
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('the goal api', () => {

    const values = {
        userId: 1,
        date: '2019-09-09'
    }

    var goal = {
        userId: values.userId,
        goalDate: values.date,
        goalText: 'this is text',
        completed: true
    }

    var goalId = ''

    it('posts a goal with body {userId, goalDate, goalText, completed}', () => {

        return chai.request(server)
        .post('/goal')
            .send(goal)
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets all goals for a date and userId', () => {

        return chai.request(server)
            .get('/goals/' + values.userId + '/' + values.date)
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
            goalText: "YAY",
            completed: false
        }
        return chai.request(server)
            .put('/goal/' + goalId)
            .send(newGoal)
            .then((res) => {
                res.text.should.contain('Goal updated')
                return chai.request(server).get('/goal/' + goalId).then((result) => {
                    result.body[0].goaltext.should.equal(newGoal.goalText)
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
