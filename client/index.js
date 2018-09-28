const remove = require('lodash/remove')

const ws = new WebSocket("ws://localhost:3001")

const getUserBtn = document.querySelector('#get-users')
const getPrivilegesBtn = document.querySelector('#get-privileges')
const errorBtn = document.querySelector('#error')

const getUniqId = () => Date.now().toString()
const subscribes = []

function WS(method, params) {
  const id = getUniqId()
  ws.send(JSON.stringify({ id, method, params }))
  subscribes.push(id)

  return new Promise((resolve, reject) => {
    ws.onerror = reject
    ws.onclose = reject
    ws.onmessage = e => {
      try {
        const { id: responseId, data, error } = JSON.parse(e.data)

        if (data) {
          if (subscribes.includes(responseId)) {
            console.log('!!!!!!!!!: ', data)
            remove(subscribes, el => el === responseId)
            resolve(data)
          }
        } else if (error) {
          reject(error)
        } else {
          reject(new Error('Unexpected server response.'))
        }
      } catch (e) {
        reject(e)
      }
    }
  })
}

getUserBtn.onclick = () => {
  WS('getUsers', { someData: [1, 2, 3] })
    .then(data => {
      console.log('ONSOLE: ', 222)
      console.log('getUsers received: ', data)
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

errorBtn.onclick = () => {
  WS('wrongMethod').catch(console.error)
}
