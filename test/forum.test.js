/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('Forum API', () => {

    var post = {
        title: "THIs is a title",
        body: "This is the body",
        userid: 1,
        username: "Harvey",
        postdate: "2019-09-09 10:00 am"
    }

    var postId = ''

    it('posts a post with body { title, body, userid, username, postdate }', () => {

        return chai.request(server)
            .post('/forum')
            .send(post)
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets all posts', () => {

        return chai.request(server)
            .get('/forumPosts')
            .then((res) => {
                postId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in post) {
                    chai.expect(res.body[0].key).to.equal(post.key)
                }
            })
    })

    it('Gets a single post based on the post\'s id', () => {
        return chai.request(server)
            .get('/forum/' + postId)
            .then((res) => {
                res.should.have.status(200)
                for (var key in post) {
                    chai.expect(res.body[0].key).to.equal(post.key)
                }
            })

    })

    it('Updates a single post based on the post\'s id, and updates the title and body fields', () => {
        const updatedPost = {
            title: "UPDATE THIS",
            body: "GREETING"
        }
        return chai.request(server)
            .put('/forum/' + postId)
            .send(updatedPost)
            .then((res) => {
                res.text.should.contain('Forum post updated')
                return chai.request(server).get('/forum/' + postId).then((result) => {
                    result.body[0].title.should.equal(updatedPost.title)
                    result.body[0].body.should.equal(updatedPost.body)
                })
            })
    })


    it('Deletes a single post based on the post\'s id', () => {

        return chai.request(server)
            .delete('/forum/' + postId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Forum post deleted')
            })
    })
})
