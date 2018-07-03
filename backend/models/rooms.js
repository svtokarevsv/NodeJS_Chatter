const roomSchema = require('./roomSchema')

class Rooms {
	async addRoom(name, isPublic = true) {
		const id = Rooms.createId(name)
		let room = await roomSchema.find({id, public: isPublic})
		if (room.length > 0) return
		console.log(room)
		room = {name, id, public: isPublic}
		await roomSchema.create(room)
			.then((response) => console.log("Room created: " + response.name))
			.catch((err) => console.error(err))
	}

	async getRoom(id) {
		if (!id) return ""
		return await roomSchema.findOne({id})
	}

	// removeRoom(id){
	// 	this._rooms = this._rooms.filter((room)=>room.id!==id);
	// }
	// getVisitorsCount(name){
	// 	let room = this._io.nsps['/'].adapter.rooms[name];
	// 	if (!room) return 0;
	// 	return Object.keys(room).length;
	// }
	// getRoomList(){
	// 	return this._rooms;
	// }
	async getPublicRoomList() {
		return await roomSchema.find({public: true})
	}

	// getMsgHistory(name){
	// 	let room =this.getRoom(name);
	// 	if(!room)return;
	// 	return room.messages;
	// }
	static createId(name) {
		return name.replace(/\s+/g, '-').replace('/[^a-zA-Z-]/g', '').toLowerCase()
	}

}

module.exports = Rooms
