const emitter = require('event-emitter')()
const hasListeners = require('event-emitter/has-listeners')

const getUniqId = () => Date.now().toString() + '#' + Math.random().toString(36).substr(2, 9)

const ws = new WebSocket("ws://localhost:3001")
const getUserBtn = document.querySelector('#get-users')
const getPrivilegesBtn = document.querySelector('#get-privileges')
const getUsersAndPrivilegesBtn = document.querySelector('#get-all')
const errorBtn = document.querySelector('#error')
const serverExceedTimeout = 2

ws.onmessage = e => {
  try {
    const { id, data, error } = JSON.parse(e.data)
    emitter.emit(id, { data, error })
  } catch (e) {
    console.warn('onmessage error: ', e)
  }
}

const WS = (method, params) => new Promise((resolve, reject) => {
  const id = getUniqId()
  ws.send(JSON.stringify({ id, method, params }))
  emitter.once(id, ({ data, error}) => {
    data
      ? resolve(data)
      : reject(error || new Error('Unexpected server response.'))
  })

  setTimeout(() => {
    if (hasListeners(emitter, id)) {
      reject(new Error('Timeout exceed'))
      emitter.off(id, resolve)
    }
  }, serverExceedTimeout * 1000)
})

getUserBtn.onclick = function () {
  WS('getUsers', { someData: [1, 2, 3] })
    .then(data => {
      console.log(data)
    })
    .catch(console.error)
}

getPrivilegesBtn.onclick = () => {
  WS('getPrivileges', { anotherData: [3, 2, 1] })
    .then(data => {
      console.log('getUsers received: ', data)
    })
    .catch(console.error)
}

getUsersAndPrivilegesBtn.onclick = () => {
  Promise.all([
    WS('getUsers', { someData: [1, 2, 3] }),
    WS('getPrivileges', { someData: [5, 4, 1] }),
  ])
    .then(([users, privileges]) => {
      console.log('users: ', users)
      console.log('privileges: ', privileges)
    })
    .catch(console.error)
}

errorBtn.onclick = () => {
  WS('wrongMethod').catch(console.error)
}
