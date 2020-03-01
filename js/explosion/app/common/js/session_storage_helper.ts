const sessionStorageSupported = () => {
  const mod = '_test_session_storage_access_'

  try {
    window.sessionStorage.setItem(mod, mod)
    window.sessionStorage.removeItem(mod)
    return true
  } catch (error) {
    return false
  }
}

const isSupported = sessionStorageSupported()
const sessionStorageHelper = {
  setItem: (key: string, value: string) => {
    if (!isSupported) {
      return
    }

    try {
      window.sessionStorage.setItem(key, value)
    } catch (e) {
      console.log(e)
    }
  },

  getItem: (key: string) => {
    if (!isSupported) {
      return
    }

    try {
      return window.sessionStorage.getItem(key)
    } catch (e) {
      console.log(e)
    }
  },

  removeItem: (key: string) => {
    if (!isSupported) {
      return
    }

    try {
      window.sessionStorage.removeItem(key)
    } catch (e) {
      console.log(e)
    }
  },
}

export default sessionStorageHelper
