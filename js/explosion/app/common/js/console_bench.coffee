bench = if window.location.search.indexOf('bench') isnt -1
  (label, func) ->
    console.time(label)
    result = func()
    console.timeEnd(label)
    result
else
  (_label, func) -> func()

module.exports = bench
