/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('REFLECTION API', () => {

    var reflection = {
        userid: 1,
        reflectiondate: '2019-09-09',
        reflectiontext: 'A text'
    }

    var reflectionId = ''

    it('posts a reflection with body {userid, reflectiondate, reflectiontext}', () => {

        return chai.request(server)
            .post('/reflection')
            .send(reflection) //send the js reflection object to be posted
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets reflection for a date and userid', () => {

        return chai.request(server)
            .get('/reflection/' + reflection.userid + '/' + reflection.reflectiondate)
            .then((res) => {
                reflectionId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in reflection) {
                    chai.expect(res.body[0].key).to.equal(reflection.key)
                }
            })
    })

    it('Gets a single reflection based on the reflection\'s id', () => {

        return chai.request(server)
            .get('/reflection/' + reflectionId)
            .then((res) => {
                res.should.have.status(200)
                for (var key in reflection) {
                    chai.expect(res.body[0].key).to.equal(reflection.key)
                }
            })

    })

    it('Updates a single reflection based on the reflection\'s id, and updates the reflectiontext field', () => {
        const newreflection = {
            reflectiontext: "ABCD"
        }
        return chai.request(server)
            .put('/reflection/' + reflectionId)
            .send(newreflection)
            .then((res) => {
                res.text.should.contain('Reflection updated')
                return chai.request(server).get('/reflection/' + reflectionId).then((result) => {
                    result.body[0].reflectiontext.should.equal(newreflection.reflectiontext)
                })
            })
    })


    it('Deletes a single reflection based on the reflection\'s id', () => {

        return chai.request(server)
            .delete('/reflection/' + reflectionId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Reflection deleted')
            })
    })
})
