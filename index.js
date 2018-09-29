const express = require('express')
const app = express()
const WebSocket = require('ws')
const { privileges, users } = require('./app/stub')
const {
  utils: {
    throwError,
    handleInvalidJSON,
    handleInvalidData,
    handleUnknownMethod,
    getRandomInt
  }
} = require('./app')

const appPort = 3000
const socketPort = 3001

// Serve our css, js
app.use(express.static(`${__dirname}/public`))

// Send index.html by / route
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
})

// Run app and listen appPort port
app.listen(appPort, initWebSockets)

function initWebSockets() {
  // Run ws server
  const WS = new WebSocket.Server({ port: socketPort })

  WS.on('connection', socket => {
    // After connection subscribe on message even
    socket.on('message', data => {
      // try to parse JSON data
      try {
        data = JSON.parse(data)
      } catch (e) {
        return handleInvalidJSON(socket)
      }

      // extract data
      const { method, id = null, params = {} } = data
      // you can pass additional params and use additional conditions here
      console.log('request params: ', params)

      try {
        // we always need id, because this is our marker
        if (!id) throwError('id is required', 400)

        // create an artificial server delay from 500 to 1250, you can change this limits
        const timeout = getRandomInt(500, 1250)

        // artificial server delay
        setTimeout(() => {
          // method router
          switch(method) {
            case 'getUsers':
              return socket.send(JSON.stringify({ id, data: users }))
            case 'getPrivileges':
              return socket.send(JSON.stringify({ id, data: privileges }))
            default:
              handleUnknownMethod(method, id, socket)
          }
        }, timeout)
      } catch (err) {
        // handle all errors and send to frontend
        handleInvalidData(err, id, socket)
      }
    })
  })
}
