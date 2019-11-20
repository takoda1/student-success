/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('Class API', () => {

    var aClass = {
        classname: "ITS A class"
    }

    var classId = ''

    it('Posts a class with body {classname}', () => {

        return chai.request(server)
            .post('/class')
            .send(aClass)
            .then((res) => {
                res.should.have.status(201)
                res.text.should.contain('Class added')
            })
    })

    it('gets a single class by name', () => {

        return chai.request(server)
            .get('/class/' + aClass.classname)
            .then((res) => {
                res.should.have.status(200)
                classId = res.body[0].id
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
            })
    })

    it('gets all classes', () => {
        return chai.request(server)
            .get('/classes')
            .then((res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                //getting class inserted by init.sql as well as from this test
                res.body.length.should.equal(2)
            })
    })

    it('Gets a single class by ID', () => {

        return chai.request(server)
            .get('/clas/' + classId)
            .then((res) => {
                res.should.have.status(200)
                res.body.length.should.equal(1)
                chai.expect(res.body[0].classname).to.equal(aClass.classname)
            })

    })


    it('Deletes a single class based on the class\'s id', () => {

        return chai.request(server)
            .delete('/class/' + classId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Class deleted')
            })
    })
})