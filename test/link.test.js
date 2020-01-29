/*
This test assumes the database is up and running and init.sql has been run
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('Link API', () => {

    const link = {
        groupid: 1,
        link: 'ASDF.GHI',
        linkdate: 'November 10th 2019, 12:09:51 pm',
        userid: 1,
        username: "ABC"
    }

    it('posts a link with body {groupid, link, linkdate, userid, username }', () => {

        return chai.request(server)
            .post('/grouplinks')
            .send(link) //send the js link object to be posted
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets all links for a groupid', () => {

        return chai.request(server)
            .get('/grouplinks/' + link.groupid)
            .then((res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                for (var key in link) {
                    chai.expect(res.body[0].key).to.equal(link.key)
                }
            })
    })
})
