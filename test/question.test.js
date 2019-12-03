/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('Question API', () => {

    var newQuestion = {
        questionone: "q1",
        questiontwo: "q2",
        questionthree: "q3"
    }

    var questionId = ''

    it('gets single existing questions already in database', () => {

        return chai.request(server)
            .get('/question')
            .then((res) => {
                questionId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
            })
    })

    it('Updates a singlequestion based on the question\'s id, and updates questionone, questiontwo, and questionthree fields', () => {
        return chai.request(server)
            .put('/question/' + questionId)
            .send(newQuestion)
            .then((res) => {
                res.text.should.contain('Question updated')
                return chai.request(server).get('/question').then((result) => {

                    for (var key in newQuestion) {
                        chai.expect(result.body[0].key).to.equal(newQuestion.key)
                    }
                })
            })
    })
})
