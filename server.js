const express = require('express');
const path = require('path');
const shell_exec = require('shell_exec').shell_exec;
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
		res.send(process.env)
	})
	.get('/github', function (req, res) {
		shell_exec('git pull 2>&1')
		res.end()
	})
	.get('/rooms/:room', function (req, res) {
		res.sendFile(path.join(__dirname, 'public', 'room.html'));
	});
io.on('connection', function (socket) {
	let params = socket.handshake.query;
	let name = params.name;
	let avatar = params.avatar;
	let roomName = params.room;
	users.joinRoom(socket, name, roomName, avatar);
	socket.emit('updateRoomList', rooms.getPublicRoomList());
	if(roomName){
		socket.emit('roomInfo', {
			history:rooms.getMsgHistory(roomName),
			roomName:rooms.getRoom(roomName).name
		});
	}
	socket.broadcast.to(roomName).emit('infoMessage', `${name} has joined`);
	io.sockets.in(roomName).emit('updateUserList', users.getUserList(roomName));
	socket.on('chat', function (message) {
		if (message && message.length > 500) {
			message=message.substring(0,500)+"...";
		}
		const user = users.getUser(socket.id);
		if (!user || !message.trim())return;
		let name = user.name;
		let avatar = user.avatar;
		let room =rooms.getRoom(roomName);
		let fullMsg={name, avatar, message,date:Date.now()};
		if(room){
			room.messages.push(fullMsg)
		}
		socket.broadcast.to(roomName).emit('message', fullMsg);
	});
	socket.on('createPrivateRoom', (name, callback) => {
		"use strict";
		rooms.addRoom(name, false);
		callback(Rooms.createId(name));
	});
	socket.on('createPublicRoom', (name, callback) => {
		"use strict";
		rooms.addRoom(name);
		io.sockets.emit('updateRoomList', rooms.getPublicRoomList());
		callback();
	});
	socket.on('disconnect', () => {
		users.removeUser(socket.id);
		io.sockets.in(roomName).emit('updateUserList', users.getUserList(roomName));
		socket.broadcast.to(roomName).emit('infoMessage', `${name} has left`);
	})
});