/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('CUSTOM TIMER API', () => {

    var customTimer = {
        userid: 1,
        timerdate: '2019-09-09',
        time: 3600,
        name: "running"
    }

    var timerId = ''

    it('posts a timer with body {userid, timerdate, time, name}', () => {
        
        return chai.request(server)
        .post('/customTimer')
            .send(customTimer) //send the js timer object to be posted
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets timer for a date and userId', () => {

        return chai.request(server)
            .get('/customTimer/' + customTimer.userid + '/' + customTimer.timerdate)
            .then((res) => {
                timerId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in customTimer) {
                    chai.expect(res.body[0].key).to.equal(customTimer.key)
                }
            })
    })

    it('gets timers for a userid', () => {
        return chai.request(server)
            .get('/customTimerByUser/' + customTimer.userid)
            .then((res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in customTimer) {
                    chai.expect(res.body[0].key).to.equal(customTimer.key)
                }
            })
    })

    it('Gets a single timer based on the timer\'s id', () => {
        
        return chai.request(server)
            .get('/customTimer/' + timerId)
            .then((res) => {
                res.should.have.status(200)
                for (var key in customTimer) {
                    chai.expect(res.body[0].key).to.equal(customTimer.key)
                }
            })
        
    })

    it('Updates a single timer based on the timer\'s id, and updates the time and name fields', () => {
        const newtimer = {
            time: 5500,
            name: "Math HW"
        }
        return chai.request(server)
            .put('/customTimer/' + timerId)
            .send(newtimer)
            .then((res) => {
                res.text.should.contain('Timer updated')
                return chai.request(server).get('/customTimer/' + timerId).then((result) => {
                    result.body[0].time.should.equal(newtimer.time)
                    result.body[0].name.should.equal(newtimer.name)
                })
            })
    })


    it('Deletes a single timer based on the timer\'s id', () => {

        return chai.request(server)
            .delete('/customTimer/' + timerId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Timer deleted')
            })
    })
})
