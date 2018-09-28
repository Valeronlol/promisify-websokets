const express = require('express')
const app = express()
const WebSocket = require('ws')
const { privileges, users } = require('./client/stub/index')
const {
  utils: {
    throwError,
    handleInvalidJSON,
    handleInvalidData,
    handleUnknownMethod,
    getRandomInt
  }
} = require('./app')

app.use(express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
})

app.listen(3000, () => {
  const WS = new WebSocket.Server({ port: 3001 })

  WS.on('connection', socket => {
    socket.on('message', data => {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return handleInvalidJSON(socket)
      }

      const { method, id = null, params = {} } = data
      console.log('request params: ', params)

      try {
        if (!id) throwError('id is required', 400)

        const timeout = getRandomInt(500, 1250)

        setTimeout(() => {
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
        handleInvalidData(err, id, socket)
      }
    })
  })
})
