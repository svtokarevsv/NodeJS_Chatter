const express = require('express');
const path = require('path');
const app = express();
app.set('port', (process.env.PORT || 5000));
const server = app.listen(app.get('port'));
server.listen(app.get('port'));
const io = require('socket.io')(server);
const Users = require('./users');
const users = new Users();
const Rooms = require('./rooms');
const rooms = new Rooms(io);
rooms.addRoom('General');
app.use(express.static(path.join(__dirname, 'public')));
app
	.get('/', function (req, res) {
		res.sendFile(path.join(__dirname, 'public', 'login.html'));
	})
	.get('/rooms/:room', function (req, res) {
		res.sendFile(path.join(__dirname, 'public', 'room.html'));
	});
io.on('connection', function (socket) {
	let params = socket.handshake.query;
	let name = params.name;
	let avatar = params.avatar;
	let room = params.room;
	users.joinRoom(socket, name, room, avatar);
	socket.emit('updateRoomList', rooms.getRoomList());
	socket.broadcast.to(room).emit('infoMessage', `${name} has joined`);
	io.sockets.in(room).emit('updateUserList', users.getUserList(room));
	socket.on('chat', function (message) {
		const user = users.getUser(socket.id);
		if(!user || !message.trim())return;
		let name = user.name;
		let avatar = user.avatar;
		socket.broadcast.to(room).emit('message', {name,avatar,message});
	});
	socket.on('createPrivateRoom',(name,callback)=>{
		"use strict";
		callback(Rooms.createId(name));
	});
	socket.on('createPublicRoom',(name,callback)=>{
		"use strict";
		rooms.addRoom(name);
		io.sockets.emit('updateRoomList', rooms.getRoomList());
		callback();
	});
	socket.on('disconnect', () => {
		users.removeUser(socket.id);
		io.sockets.in(room).emit('updateUserList', users.getUserList(room));
		socket.broadcast.to(room).emit('infoMessage', `${name} has left`);
	})
});