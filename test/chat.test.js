// /*
// This test assumes the database is up and running and init.sql has been ran
// */

// var server = require('../index.js')
// var chai = require('chai')
// var chaiHttp = require('chai-http')
// var should = chai.should()

// chai.use(chaiHttp)

// describe('Chat API', () => {

//     const chat = {
//         groupid: 1,
//         chattext: 'ASDF',
//         chatdate: 'November 10th 2019, 12:09:51 pm',
//         userid: 1,
//         username: "ABC"
//     }

//     it('posts a chat with body {groupid, chattext, chatdate, userid, username }', () => {

//         return chai.request(server)
//             .post('/groupchat')
//             .send(chat) //send the js chat object to be posted
//             .then((res) => {
//                 res.should.have.status(201)
//             })
//     })

//     it('gets all chats for a groupid', () => {

//         return chai.request(server)
//             .get('/groupchat/' + chat.groupid)
//             .then((res) => {
//                 res.should.have.status(200)
//                 res.body.should.be.a('array')
//                 for (var key in chat) {
//                     chai.expect(res.body[0].key).to.equal(chat.key)
//                 }
//             })
//     })
// })
