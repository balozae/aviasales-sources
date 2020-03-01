localstorageSupported = ->
  mod = '_test_local_storage_access_'
  try
    window.localStorage.setItem(mod, mod)
    window.localStorage.removeItem(mod)
    true
  catch
    false

isSupported = localstorageSupported()

storage =
  setItem: (key, value) ->
    return unless isSupported
    try
      window.localStorage.setItem(key, value)
    catch e
      console.log e

  setJSONItem: (key, value) ->
    storage.setItem(key, JSON.stringify(value))

  getItem: (key) ->
    return unless isSupported
    try
      window.localStorage.getItem(key)
    catch e
      console.log e

  getJSONItem: (key) ->
    try
      JSON.parse(storage.getItem(key))
    catch e
      console.log e

  # @param {string, RegExp} key - key(s) for removing
  removeItem: (key) ->
    return unless isSupported
    if key instanceof RegExp
      i = 0
      storageKey = ''
      while storageKey?
        storageKey = window.localStorage.key(i++)
        if key.test(storageKey)
          window.localStorage.removeItem(storageKey)
    else
      window.localStorage.removeItem(key)

module.exports = storage
