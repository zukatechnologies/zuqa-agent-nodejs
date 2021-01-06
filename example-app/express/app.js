
const apm = require('../../index').start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'HELLO EXPRESS',

  // Use if APM Server requires a token
  secretToken: '',

  // Set custom APM Server URL (default: http://localhost:32140)
  serverUrl: 'http://localhost:32140'
})

const app = require('express')()
var cors = require('cors')

app.get('/hello', cors(), function (req, res) {
  setTimeout(function () {
    res.send('Hello World!')
  }, 800)
})

app.listen(3000)
