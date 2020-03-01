import flagr from './flagr_client_instance'
import mamka from 'mamka'

let isInitRegistration = false

declare global {
  interface Window {
    updatedData?: {
      keys: any
      isAll: any
    }
  }
}

function send(keys: any, isAll: any) {
  let name = ''
  if (isInitRegistration) {
    name = 'flags--update--init'
    isInitRegistration = false
  } else {
    if (isAll) {
      name = 'flags--update--dynamic'
    } else {
      name = 'flags--add--dynamic'
    }
  }

  const meta = {
    context: flagr.getBasicContext(),
    flags: flagr.serialize(),
  }

  console.log(JSON.stringify(meta, null, 4))

  mamka('send_event', { name, meta })
}

if (window.updatedData) {
  send(window.updatedData.keys, window.updatedData.isAll)
  delete window.updatedData
}

flagr.off('update', '*').on('update', send)
