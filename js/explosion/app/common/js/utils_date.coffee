module.exports =
  DAYS_IN_WEEK: 7
  MS_IN_DAY: 24 * 60 * 60 * 1000

  isWeekend: (date) ->
    date instanceof Date and (date.getDay() is 0 or date.getDay() is 6)

  dateWithoutTimezone: (dateString) ->
    date = new Date(dateString)
    new Date(
      date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()
    )
