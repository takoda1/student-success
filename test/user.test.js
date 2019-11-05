/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('USER API', () => {

    var user = {
        firstname: "Test",
        lastname: "BOI",
        email: "A@A.com",
        groupid: 1
    }

    var userId = ''

    it('posts a user with body {firstname, lastname, email, groupid}', () => {

        return chai.request(server)
            .post('/user')
            .send(user)
            .then((res) => {
                res.should.have.status(201)
                res.text.should.contain('User added')
            })
    })

    it('gets all users', () => {

        return chai.request(server)
            .get('/users')
            .then((res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                //initial insertion plus current insertion
                res.body.length.should.equal(2)
            })
    })

    it('Gets a single user based on their first and last names', () => {

        return chai.request(server)
            .get('/user/' + user.firstname + '/' + user.lastname)
            .then((res) => {
                res.should.have.status(200)
                res.body.length.should.equal(1)
                userId = res.body[0].id
                for (var key in user) {
                    chai.expect(res.body[0].key).to.equal(user.key)
                }
            })

    })

    it('Gets a single user based on their email', () => {
        return chai.request(server)
            .get('/userByEmail/' + user.email)
            .then((res) => {
                res.should.have.status(200)
                res.body.length.should.equal(1)
                for (var key in user) {
                    chai.expect(res.body[0].key).to.equal(user.key)
                }
            })
    })

    it('Deletes a single user based on the user\'s id', () => {

        return chai.request(server)
            .delete('/user/' + userId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('User deleted')
            })
    })
})
