const app = require('./routes')
const server =require('http').createServer(app)
const io = require('socket.io')(server)
require('./sockets')(io)
module.exports=server