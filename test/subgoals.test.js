/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('SUB GOAL API', () => {

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

    var subgoal = {
        userid: values.userid,
        goaldate: values.date,
        goaltext: 'this is subtext',
        completed: true
    }

    var subgoalId = ''


    it('posts a sub goal with body {userid, parentgoal, goaldate, goaltext, completed}', async () => {
        
        await chai.request(server)
        .post('/goal')
            .send(goal) //send the js goal object to be posted
            .then((res) => {
                res.should.have.status(201)
            })

        await chai.request(server)
        .get('/goals/' + values.userid + '/' + values.date)
            .then((res) => {
                goalId = res.body[0].id
            })
        
        return chai.request(server)
        .post('/subgoal')
            .send({ ...subgoal, parentgoal: parseInt(goalId) }) //send the js goal object to be posted
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets all sub goals for a date and userId', () => {

        return chai.request(server)
            .get('/subgoals/' + values.userid + '/' + values.date)
            .then((res) => {
                subgoalId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in subgoal) {
                    chai.expect(res.body[0].key).to.equal(goal.key)
                }
            })
    })

    it('Correctly errors when provided erroneous userid input when getting sub goals for a user', () => {
        return chai.request(server)
            .get('/subgoals/abc/' + '2019-09-09')
            .then((res) => {
                res.should.have.status(400)
                res.error.text.should.contain("Error: Parameter id not a number or incorrect date format")
            })
    })

    it('Correctly errors when provided erroneous date input when getting sub goals for a user', () => {
        return chai.request(server)
            .get('/subgoals/1/' + '20-00-aa')
            .then((res) => {
                res.should.have.status(400)
                res.error.text.should.contain("Error: Parameter id not a number or incorrect date format")
            })
    })

    it('Gets a single sub goal based on the goal\'s id', () => {
        return chai.request(server)
            .get('/subgoal/' + subgoalId)
            .then((res) => {
                res.should.have.status(200)
                for (var key in subgoal) {
                    chai.expect(res.body[0].key).to.equal(goal.key)
                }
            })
        
    })

    it('Updates a single sub goal based on the goal\'s id, and updates the goalText and completed fields', () => {
        const newGoal = {
            goaltext: "YAY",
            completed: false
        }
        return chai.request(server)
            .put('/subgoal/' + subgoalId)
            .send(newGoal)
            .then((res) => {
                res.text.should.contain('Goal updated')
                return chai.request(server).get('/subgoal/' + subgoalId).then((result) => {
                    result.body[0].goaltext.should.equal(newGoal.goaltext)
                })
            })
    })


    it('Deletes a single sub goal based on the goal\'s id', () => {

        let result = chai.request(server)
            .delete('/subgoal/' + subgoalId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Goal deleted')
            })

        chai.request(server)
            .delete('/goal/' + goalId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Goal deleted')
            })

        return result;
    })
})
