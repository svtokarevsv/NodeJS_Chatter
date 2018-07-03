const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roomSchema = new Schema({
	id: {
		type: String,
		required:true
	},
	public: {
		type:Boolean
	},

	name: {
		type: String,
		required:true
	},
})
module.exports = mongoose.model('room', roomSchema)
