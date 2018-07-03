const validator = require('validator')
const Users = require('../models/users')
const Rooms = require('../models/rooms')

const config = require('../../config')
const mongoose = require('mongoose')
mongoose.connect(config.db.url)
const messageSchema = require('../models/messageSchema')

module.exports = function (io) {
	const users = new Users()
	const rooms = new Rooms()
	rooms.addRoom('General')
	io.on('connection', async function (socket) {
		let params = socket.handshake.query
		let name = validator.escape(params.name + "")
		let avatar = validator.escape(params.avatar + "")
		let roomId = validator.escape(params.room + "")
		users.joinRoom(socket, name, roomId, avatar)
		socket.emit('updateRoomList', await rooms.getPublicRoomList())
		if (roomId && roomId !== "undefined") {
			let room = await rooms.getRoom(roomId)
			messageSchema.find({roomId})
				.select("-roomName")
				.then((history) => {
					socket.emit('roomInfo', {history, roomName: room.name})
				})
				.catch((err) => console.error(err))
		}
		socket.broadcast.to(roomId).emit('infoMessage', `${name} has joined`)
		io.sockets.in(roomId).emit('updateUserList', users.getUserList(roomId))
		socket.on('chat', async function (message) {
			message = validator.escape(message + "")
			if (message && message.length > 500) {
				message = message.substring(0, 500) + "..."
			}
			const user = users.getUser(socket.id)
			if (!user || !message.trim()) return
			let name = user.name
			let avatar = user.avatar
			let room = await rooms.getRoom(roomId)
			let fullMsg = {name, avatar, message, date: Date.now(), roomId}

			if (room) {
				messageSchema.create(fullMsg)
					.catch((err) => console.error(err))
			}
			socket.broadcast.to(roomId).emit('message', fullMsg)
		})
		socket.on('createPrivateRoom', async (name, callback) => {
			"use strict"
			name = validator.escape(name + "")
			await rooms.addRoom(name, false)
			callback(Rooms.createId(name))
		})
		socket.on('createPublicRoom', async (name, callback) => {
			"use strict"
			name = validator.escape(name + "")
			await rooms.addRoom(name)
			io.sockets.emit('updateRoomList', await rooms.getPublicRoomList())
			callback()
		})
		socket.on('disconnect', () => {
			users.removeUser(socket.id)
			io.sockets.in(roomId).emit('updateUserList', users.getUserList(roomId))
			socket.broadcast.to(roomId).emit('infoMessage', `${name} has left`)
		})
	})
};