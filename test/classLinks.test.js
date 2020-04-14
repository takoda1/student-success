/*
This test assumes the database is up and running and init.sql has been run
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('CLASS LINKS API', () => {

    var classLink = {
        classid: 1,
        linkname: 'Useful Resource',
        linkurl: 'https://www.google.com/'
    }

    var classLinkId = ''

    it('posts a class link with body {classid, linkname, linkurl}', () => {

        return chai.request(server)
            .post('/classlink')
            .send(classLink) //send the js link object to be posted
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets all class links for a classid', () => {

        return chai.request(server)
            .get('/allClasslinks/' + classLink.classid)
            .then((res) => {
                classLinkId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                for (var key in classLink) {
                    chai.expect(res.body[0].key).to.equal(classLink.key)
                }
            })
    })

    it('Updates a single class link based on the link\'s id, and updates the linkname and linkurl fields', () => {
        const updatedLink = {
            linkname: "Syllabus Link",
            linkurl: "https://github.com/takoda1/student-success#2-testing"
        }
        return chai.request(server)
            .put('/classlink/' + classLinkId)
            .send(updatedLink)
            .then((res) => {
                res.text.should.contain('Class link updated')
                return chai.request(server).get('/classlink/' + classLinkId).then((result) => {
                    result.body[0].linkname.should.equal(updatedLink.linkname)
                    result.body[0].linkurl.should.equal(updatedLink.linkurl)
                })
            })
    })


    it('Deletes a single class link based on the link\'s id', () => {

        return chai.request(server)
            .delete('/classlink/' + classLinkId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Class link deleted')
            })
    })
})
