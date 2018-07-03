const express = require('express')
const path = require('path')
const shell_exec = require('shell_exec').shell_exec
const app = express()
const rootUrl = process.env.USER ? '/project/Chatter/' : '/'
app.use(express.static(path.join(__dirname,'../..','public')))
app
	.get(rootUrl, function (req, res) {
		res.sendFile(path.join(__dirname,'../..','public', 'login.html'))
	})
	.post(rootUrl + 'github', function (req, res) {
		shell_exec('git pull')
		res.end()
	})
	.get(rootUrl + 'rooms/:room', function (req, res) {
		res.sendFile(path.join(__dirname,'../..','public', 'room.html'))
	})

module.exports = app
