class Rooms {
	constructor(io) {
		this._io=io;
		this._rooms = [];
	}
	addRoom(name,isPublic=true){
		let id = Rooms.createId(name);
		let messages = [];
		this._rooms.push({name,id,isPublic,messages})
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
	getPublicRoomList(){
		return this._rooms.filter((room)=>room.isPublic===true);
	}
	getMsgHistory(name){
		if(!name)return;
		let room =this.getRoom(name);
		if(!room)return;
		return room.messages;
	}
	static createId(name){
		return name.replace(/\s+/g, '-').replace('/[^a-zA-Z-]/g', '').toLowerCase();
	}

}
module.exports = Rooms;
