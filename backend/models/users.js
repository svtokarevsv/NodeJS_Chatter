class Users {
	constructor() {
		this._users = []
	}

	addUser(user) {
		this._users.push(user)
	}

	getUser(id) {
		return this._users.find((user) => user.id === id)
	}

	removeUser(id) {
		this._users = this._users.filter(user => user.id !== id)
	}

	joinRoom(socket, name, room, avatar) {
		let id = socket.id
		this.removeUser(id)
		this.addUser({id, name, room, avatar})
		socket.join(room)
	}

	getUserList(room) {
		return this._users.filter((user) => user.room === room)
	}
}

module.exports = Users
