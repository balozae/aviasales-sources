module.exports = dateWithoutTimezone = (dateString) ->
  date = new Date(dateString)
  new Date(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()
  )
