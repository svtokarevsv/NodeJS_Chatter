class Rooms {
	constructor(io) {
		this._io=io;
		this._rooms = [];
	}
	addRoom(name){
		let id = Rooms.createId(name);
		this._rooms.push({name,id})
	}
	getRoom(name){
		return this._rooms.find((room)=>room.id===Rooms.createId(name));
	}
	removeRoom(id){
		this._rooms = this._rooms.filter((room)=>room.id!==id);
	}
	getVisitorsCount(name){
		let room = this._io.nsps['/'].adapter.rooms[name];
		if (!room) return 0;
		return Object.keys(room).length;
	}
	getRoomList(){
		return this._rooms;
	}
	static createId(name){
		return name.replace(/\s+/g, '-').replace('/[^a-zA-Z-]/g', '').toLowerCase();
	}

}
module.exports = Rooms;
