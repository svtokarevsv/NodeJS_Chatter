const mongoose = require('mongoose')
const Schema = mongoose.Schema
const messageSchema = new Schema({
	roomId: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	avatar: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	date: Date
})
module.exports = mongoose.model('message', messageSchema)
