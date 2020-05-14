// /*
// This test assumes the database is up and running and init.sql has been ran
// */

// var server = require('../index.js')
// var chai = require('chai')
// var chaiHttp = require('chai-http')
// var should = chai.should()

// chai.use(chaiHttp)

// describe('TIMER API', () => {

//     var timer = {
//         userid: 1,
//         timerdate: '2019-09-09',
//         researchtime: 3600,
//         writingtime: 4800,
//         customtime: 360
//     }

//     var timerId = ''

//     it('posts a timer with body {userid, timerdate, rearchtime, writingtime, customtime}', () => {
        
//         return chai.request(server)
//         .post('/timer')
//             .send(timer) //send the js timer object to be posted
//             .then((res) => {
//                 res.should.have.status(201)
//             })
//     })

//     it('gets timer for a date and userId', () => {

//         return chai.request(server)
//             .get('/timer/' + timer.userid + '/' + timer.timerdate)
//             .then((res) => {
//                 timerId = res.body[0].id
//                 res.should.have.status(200)
//                 res.body.should.be.a('array')
//                 res.body.length.should.equal(1)
//                 for (var key in timer) {
//                     chai.expect(res.body[0].key).to.equal(timer.key)
//                 }
//             })
//     })

//     it('gets timers for a userid', () => {
//         return chai.request(server)
//             .get('/timerByUser/' + timer.userid)
//             .then((res) => {
//                 res.should.have.status(200)
//                 res.body.should.be.a('array')
//                 res.body.length.should.equal(1)
//                 for (var key in timer) {
//                     chai.expect(res.body[0].key).to.equal(timer.key)
//                 }
//             })
//     })

//     it('Gets a single timer based on the timer\'s id', () => {
        
//         return chai.request(server)
//             .get('/timer/' + timerId)
//             .then((res) => {
//                 res.should.have.status(200)
//                 for (var key in timer) {
//                     chai.expect(res.body[0].key).to.equal(timer.key)
//                 }
//             })
        
//     })

//     it('Updates a single timer based on the timer\'s id, and updates the researchtime, writingtime, and customtime fields', () => {
//         const newtimer = {
//             researchtime: 5500,
//             writingtime: 10000,
//             customtime: 2000
//         }
//         return chai.request(server)
//             .put('/timer/' + timerId)
//             .send(newtimer)
//             .then((res) => {
//                 res.text.should.contain('Timer updated')
//                 return chai.request(server).get('/timer/' + timerId).then((result) => {
//                     result.body[0].researchtime.should.equal(newtimer.researchtime)
//                     result.body[0].writingtime.should.equal(newtimer.writingtime)
//                     result.body[0].customtime.should.equal(newtimer.customtime)
//                 })
//             })
//     })


//     it('Deletes a single timer based on the timer\'s id', () => {

//         return chai.request(server)
//             .delete('/timer/' + timerId)
//             .then((res) => {
//                 res.should.have.status(200)
//                 res.text.should.contain('Timer deleted')
//             })
//     })
// })
