/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('Group API', () => {

    var group = {
        groupname: "ITS A GROUP"
    }

    var groupId = ''

    it('posts a group with body {groupname}', () => {

        return chai.request(server)
            .post('/group')
            .send(group)
            .then((res) => {
                res.should.have.status(201)
                res.text.should.contain('Group added')
            })
    })

    it('gets a single group by name', () => {

        return chai.request(server)
            .get('/group/' + group.groupname)
            .then((res) => {
                res.should.have.status(200)
                groupId = res.body[0].id
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
            })
    })

    it('Gets a single group by ID', () => {
        
        return chai.request(server)
            .get('/grou/' + groupId)
            .then((res) => {
                res.should.have.status(200)
                res.body.length.should.equal(1)
                chai.expect(res.body[0].groupname).to.equal(group.groupname)
            })

    })

    
    it('Deletes a single group based on the group\'s id', () => {

        return chai.request(server)
            .delete('/group/' + groupId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Group deleted')
            })
    })
})