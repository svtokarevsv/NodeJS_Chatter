const express = require('express');
const path = require('path');
const shell_exec = require('shell_exec').shell_exec;
const mongoose = require('mongoose');
const config = require('./config');
mongoose.connect(config.db.url);
const messageSchema = require('./messageSchema')

const app = express();
app.set('port', (process.env.PORT || 5000));
const server = app.listen(app.get('port'));
const io = require('socket.io')(server);
const Users = require('./users');
const users = new Users();
const Rooms = require('./rooms');
const rooms = new Rooms(io);
rooms.addRoom('General');

const rootUrl = process.env.USER?'/project/Chatter/':'/'
app.use(express.static(path.join(__dirname, 'public')));
app
	.get(rootUrl, function (req, res) {
		res.sendFile(path.join(__dirname, 'public', 'login.html'));
	})
	.post(rootUrl+'github', function (req, res) {
		shell_exec('git pull')
		res.end()
	})
	.get(rootUrl+'rooms/:room', function (req, res) {
		res.sendFile(path.join(__dirname, 'public', 'room.html'));
	});
io.on('connection', async function (socket) {
	let params = socket.handshake.query;
	let name = params.name;
	let avatar = params.avatar;
	let roomId = params.room;
	users.joinRoom(socket, name, roomId, avatar);
	socket.emit('updateRoomList', await rooms.getPublicRoomList());
	if (roomId) {
		let room = await rooms.getRoom(roomId)
		messageSchema.find({roomId})
			.select("-roomName")
			.then((history)=>{
				socket.emit('roomInfo', {history,roomName:room.name});
			})
			.catch((err)=>console.error(err))
	}
	socket.broadcast.to(roomId).emit('infoMessage', `${name} has joined`);
	io.sockets.in(roomId).emit('updateUserList', users.getUserList(roomId));
	socket.on('chat', async function (message) {
		if (message && message.length > 500) {
			message = message.substring(0, 500) + "...";
		}
		const user = users.getUser(socket.id);
		if (!user || !message.trim())return;
		let name = user.name;
		let avatar = user.avatar;
		let room = await rooms.getRoom(roomId);
		let fullMsg = {name, avatar, message, date: Date.now(),roomId};

		if (room) {
			messageSchema.create(fullMsg)
				.catch((err)=>console.error(err))
		}
		socket.broadcast.to(roomId).emit('message', fullMsg);
	});
	socket.on('createPrivateRoom', async (name, callback) => {
		"use strict";
		await rooms.addRoom(name, false);
		callback(Rooms.createId(name));
	});
	socket.on('createPublicRoom', async (name, callback) => {
		"use strict";
		await rooms.addRoom(name);
		io.sockets.emit('updateRoomList', await rooms.getPublicRoomList());
		callback();
	});
	socket.on('disconnect', () => {
		users.removeUser(socket.id);
		io.sockets.in(roomId).emit('updateUserList', users.getUserList(roomId));
		socket.broadcast.to(roomId).emit('infoMessage', `${name} has left`);
	})
});
