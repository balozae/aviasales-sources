noop = ->

getJSON = (url, {done, error, always}) ->
  done ?= noop
  error ?= noop
  always ?= noop
  request = new XMLHttpRequest()
  request.open('GET', url, true)
  request.onerror = ->
    try
      error('Connection Error', request)
    finally
      always(request)
  request.onload = ->
    try
      if not request.status or 200 <= request.status < 400
        done(JSON.parse(request.responseText), request)
      else
        error(request.statusText, request)
    finally
      always(request)
  request.send()
  request

module.exports = getJSON
