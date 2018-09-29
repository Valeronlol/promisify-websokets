// As you noticed i use nodejs require function on frontend
// this is done with the help of watchify(module for browserify builds)
// https://github.com/browserify/browserify
// https://github.com/browserify/watchify
const emitter = require('event-emitter')()
const hasListeners = require('event-emitter/has-listeners')

// Create unique string
const getUniqId = () => Date.now().toString() + '#' + Math.random().toString(36).substr(2, 9)

// Create web sockets connection
const ws = new WebSocket("ws://localhost:3001")

// Select all button elements from the DOM
const getUserBtn = document.querySelector('#get-users')
const getUserResult = document.querySelector('#get-users-response')
const getPrivilegesBtn = document.querySelector('#get-privileges')
const getPrivilegesResult = document.querySelector('#get-privileges-response')
const getUsersAndPrivilegesBtn = document.querySelector('#get-all')
const getUsersAndPrivilegesResult = document.querySelector('#get-all-response')
const errorBtn = document.querySelector('#error')
const errorResult = document.querySelector('#error-response')

// maximum response time from server
const serverExceedTimeout = 2

// Web sockets on message handler
ws.onmessage = e => {
  try {
    // Parse JSON data from server
    const { id, data, error } = JSON.parse(e.data)
    // we generate event that our id came from server
    emitter.emit(id, { data, error })
  } catch (e) {
    console.warn('onmessage error: ', e)
  }
}

// implementation of out WS functionality
const WS = (method, params) => new Promise((resolve, reject) => {
  // create unique id
  const id = getUniqId()
  // Send id, params and method to the server.
  // By the name of the method on the server, we understand what data
  // you need to receive or what other actions you need to execute.
  // There will be routing.
  ws.send(JSON.stringify({ id, method, params }))
  // We once time subscribe to the event.
  // check if an error is received from the server then we call reject
  // else we received data and call resolve
  emitter.once(id, ({ data, error}) => {
    data
      ? resolve(data)
      : reject(error || new Error('Unexpected server response.'))
  })

  // Waiting for some time and if the server did not answer
  // we call reject and unsubscribe id
  setTimeout(() => {
    if (hasListeners(emitter, id)) {
      reject(new Error(`Timeout exceed, ${serverExceedTimeout} sec`))
      emitter.off(id, resolve)
    }
  }, serverExceedTimeout * 1000)
})

// getUserBtn handler, call WS with "getUsers" method and pass test data
getUserBtn.onclick = () => {
  // // just clear the result container before call to make it clearer
  getUserResult.innerHTML = ''

  WS('getUsers', { someData: [1, 2, 3] })
    .then(data => {
      console.log(data)
      getUserResult.innerHTML = JSON.stringify(data)
    })
    .catch(console.error)
}

// getPrivilegesBtn handler, call WS with "getPrivileges" method and pass test data
getPrivilegesBtn.onclick = () => {
  // // just clear the result container before call to make it clearer
  getPrivilegesResult.innerHTML = ''

  WS('getPrivileges', { anotherData: [3, 2, 1] })
    .then(data => {
      console.log('getUsers received: ', data)
      getPrivilegesResult.innerHTML = JSON.stringify(data)
    })
    .catch(console.error)
}

// Make sure the promises work properly.
// getUsersAndPrivilegesBtn handler, call WS with
// Promise.all(<Array>) "getPrivileges" and "getUserBtn" methods
getUsersAndPrivilegesBtn.onclick = () => {
  // // just clear the result container before call to make it clearer
  getUsersAndPrivilegesResult.innerHTML = ''

  Promise.all([
    WS('getUsers', { someData: [1, 2, 3] }),
    WS('getPrivileges', { someData: [5, 4, 1] }),
  ])
    .then(([users, privileges]) => {
      console.log('users: ', users)
      console.log('privileges: ', privileges)
      getUsersAndPrivilegesResult.innerHTML = JSON.stringify({users, privileges})
    })
    .catch(console.error)
}

// Let's try to call a method that does not exist
// and we expect that the server will generate an error
// due to which we will get into the catch and show server error
errorBtn.onclick = () => {
  // // just clear the result container before call to make it clearer
  errorResult.innerHTML = ''

  WS('omgWrongMethod')
    .catch(err => {
      console.error(err)
      errorResult.innerHTML = JSON.stringify(err)
    })
}
