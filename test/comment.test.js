/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('Comment API', () => {

    var comment = {
        body: "This is the body",
        userid: 1,
        postid: 1,
        username: "TEST",
        commentdate: "2019-09-17"
    }

    var commentId = ''

    it('Posts a comment with body { body, userid, postid, username, commentdate }', () => {

        return chai.request(server)
            .post('/comment')
            .send(comment)
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets all comments by post', () => {

        return chai.request(server)
            .get('/commentsByPost/'+comment.postid)
            .then((res) => {
                commentId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in comment) {
                    chai.expect(res.body[0].key).to.equal(comment.key)
                }
            })
    })

    it('Gets a single comment based on the comment\'s id', () => {
        return chai.request(server)
            .get('/comment/' + commentId)
            .then((res) => {
                res.should.have.status(200)
                for (var key in comment) {
                    chai.expect(res.body[0].key).to.equal(comment.key)
                }
            })

    })

    it('Updates a single comment based on the comment\'s id, and updates body and commentdate fields', () => {
        const newComment = {
            body: "UPDATE",
            commentdate: "2019-09-09"
        }
        return chai.request(server)
            .put('/comment/' + commentId)
            .send(newComment)
            .then((res) => {
                res.text.should.contain('Comment updated')
                return chai.request(server).get('/comment/' + commentId).then((result) => {
                    result.body[0].body.should.equal(newComment.body)
                    result.body[0].commentdate.should.equal(newComment.commentdate)
                })
            })
    })


    it('Deletes a single comment based on the comment\'s id', () => {

        return chai.request(server)
            .delete('/comment/' + commentId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Comment deleted')
            })
    })
})
