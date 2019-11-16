/*
This test assumes the database is up and running and init.sql has been ran
*/

var server = require('../index.js')
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()

chai.use(chaiHttp)

describe('Note API', () => {

    var note = {
        userid: 1,
        notedate: '2019-09-09',
        notetext: 'HELP HELP PROFESSOR'
    }

    var noteId = ''

    it('posts a note with body {userid, notedate, notetext}', () => {

        return chai.request(server)
            .post('/note')
            .send(note) //send the js reflection object to be posted
            .then((res) => {
                res.should.have.status(201)
            })
    })

    it('gets note for a date and userid', () => {

        return chai.request(server)
            .get('/note/' + note.userid + '/' + note.notedate)
            .then((res) => {
                noteId = res.body[0].id
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.equal(1)
                for (var key in note) {
                    chai.expect(res.body[0].key).to.equal(note.key)
                }
            })
    })

    it('Gets all notes based on the notes\'s date', () => {

        return chai.request(server)
            .get('/noteByDate/' + note.notedate)
            .then((res) => {
                res.should.have.status(200)
                for (var key in note) {
                    chai.expect(res.body[0].key).to.equal(note.key)
                }
            })

    })

    it('Updates a single note based on the note\'s id, and updates the notetext field', () => {
        const newnote = {
            notetext: "ABCD"
        }
        return chai.request(server)
            .put('/note/' + noteId)
            .send(newnote)
            .then((res) => {
                res.text.should.contain('Note updated')
                return chai.request(server).get('/note/' + noteId).then((result) => {
                    result.body[0].notetext.should.equal(newnote.notetext)
                })
            })
    })


    it('Deletes a single note based on the note\'s id', () => {

        return chai.request(server)
            .delete('/note/' + noteId)
            .then((res) => {
                res.should.have.status(200)
                res.text.should.contain('Note deleted')
            })
    })
})
