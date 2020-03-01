module.exports = (func, wait, immediate) ->
  timeout = undefined
  (args...) ->
    context = this
    later = ->
      timeout = null
      func.apply(context, args) unless immediate
    callNow = immediate and not timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    func.apply(context, args) if callNow
