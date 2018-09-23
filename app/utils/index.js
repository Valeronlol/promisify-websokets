exports.throwError = (message = 'Internal error', status = 500) => {
  const err = new Error(message)
  err.status = status
  throw err
}

exports.handleInvalidJSON = socket => {
  const errData = JSON.stringify({
    id: null,
    error: {
      message: 'Invalid JSON',
      status: 400
    }
  })
  socket.send(errData)
}

exports.handleInvalidData = (err, id, socket) => {
  const { message, status } = err
  const errData = JSON.stringify({
    id,
    error: { message, status }
  })
  socket.send(errData)
}

exports.handleUnknownMethod = (method, id, socket) => {
  const err = new Error(`Unknown method: ${method}`)
  err.status = 400
  this.handleInvalidData(err, id, socket)
}

exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}
