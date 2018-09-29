/**
 * More comfortable raising exceptions
 * @param {String} message
 * @param {String|Number} code
 */
exports.throwError = (message = 'Internal error', code = 500) => {
  const err = new Error(message)
  err.code = code
  throw err
}

/**
 * Handler of the invalid JSON
 * @param {Object} socket
 */
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

/**
 * Handler of the invalid data
 * @param {Object} err
 * @param {String|Number} id
 * @param {object} socket
 */
exports.handleInvalidData = (err, id, socket) => {
  const { message, code } = err
  const errData = JSON.stringify({
    id,
    error: { message, code }
  })
  socket.send(errData)
}

/**
 * Handler of the unknown method
 * @param {String} method
 * @param {String|Number} id
 * @param {Object} socket
 */
exports.handleUnknownMethod = (method, id, socket) => {
  const err = new Error(`Unknown method: ${method}`)
  err.code = 400
  this.handleInvalidData(err, id, socket)
}

/**
 * Return random integer between min and max
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}
