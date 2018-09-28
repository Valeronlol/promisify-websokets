exports.throwError = (message = 'Internal error', code = 500) => {
  const err = new Error(message)
  err.code = code
  throw err
}

exports.handleInvalidJSON = socket => {
  const errData = JSON.stringify({
    id: null,
    error: {
      message: 'Invalid JSON',
      code: 400
    }
  })
  socket.send(errData)
}

exports.handleInvalidData = (err, id, socket) => {
  const { message, code } = err
  const errData = JSON.stringify({
    id,
    error: { message, code }
  })
  socket.send(errData)
}

exports.handleUnknownMethod = (method, id, socket) => {
  const err = new Error(`Unknown method: ${method}`)
  err.code = 400
  this.handleInvalidData(err, id, socket)
}

exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}
