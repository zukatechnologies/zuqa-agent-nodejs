
const apm = require('../../index').start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'HELLO EXPRESS',

  // Use if APM Server requires a token
  secretToken: '',

  // Set custom APM Server URL (default: http://localhost:32140)
  serverUrl: 'http://localhost:32140'
})

const restify = require('example-app/restify/restify')

const app = restify.createServer()

app.get('/hello', function (req, res, next) {
  res.send('Hello World')
  next()
})

app.listen(3000)
