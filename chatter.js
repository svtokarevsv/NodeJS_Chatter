const server = require('./backend')
const config = require('./config')
server.listen(process.env.PORT || config.port)
