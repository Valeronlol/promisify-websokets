const EE = require('event-emitter')

const ws = new WebSocket("ws://localhost:3001")

const getUserBtn = document.querySelector('#get-users')
const getPrivilegesBtn = document.querySelector('#get-privileges')
const errorBtn = document.querySelector('#error')

const getUniqId = () => Date.now().toString()

const WS = method => {
  const id = getUniqId()
  ws.send(JSON.stringify({ id, method }))

  return new Promise((resolve, reject) => {
    ws.onerror = reject
    ws.onclose = reject
    ws.onmessage = e => {
      try {
        const { id: responseId, data, error } = JSON.parse(e.data)

        if (data) {
          /**
           * TODO решить проблему с несколькими запросами
           * Убрать event emiter если не неужен
           * порефакторить
           */
          console.log('ONSOLE: ', responseId === id)
          if (responseId === id) resolve(data)
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
  WS('getUsers')
    .then(data => {
      console.log('getUsers received: ', data)
    })
    .catch(console.error)
}

getPrivilegesBtn.onclick = () => {
  WS('getPrivileges')
    .then(data => {
      console.log('getUsers received: ', data)
    })
    .catch(console.error)
}

errorBtn.onclick = () => {
  WS('wrongMethod').catch(console.error)
}
