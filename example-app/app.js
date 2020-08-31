
const apm = require('../').start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'HELLO EXPRESS',

  // Use if APM Server requires a token
  secretToken: '',

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'http://localhost:8200'
})

const app = require('express')()

app.get('/hello23', function (req, res) {
  setTimeout(function () {
    res.send('Hello World!')
  }, 400)
})

app.listen(3000)
