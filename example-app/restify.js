
const apm = require('../').start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'HELLO EXPRESS',

  // Use if APM Server requires a token
  secretToken: '',

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'http://localhost:8200'
})

const restify = require('restify')

const app = restify.createServer()

app.get('/hello', function (req, res, next) {
  res.send('Hello World')
  next()
})

app.listen(3000)
