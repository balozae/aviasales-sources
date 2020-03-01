finity = require('finity-js')
{dateWithoutTimezone} = require('utils_date')
i18next = require('i18next')
{dateToLowerCase} = require('shared_components/l10n/l10n')
#example:
#date_formatter = require('date_formatter.coffee')
#date_formatter.form_date(+new Date())

utcTimestampFormatter = (format) ->
  (ts) ->
    locale = i18next.t('common:dateTime', {returnObjects: true})
    unless ts
      return format
    dt = new Date(ts * 1000)
    finity.format(finity.utc(dt), format, null, locale)

reformatter = (toFormat, genetive = false) ->
  (string) ->
    locale = i18next.t('common:dateTime', {returnObjects: true})
    date = finity.format(dateWithoutTimezone(string), toFormat, genetive, locale)
    dateToLowerCase(date)

default_formatter = (ts) -> new Date(finity.utc(ts)).toISOString()

module.exports =
  ticket_date: default_formatter
  non_localized_date: default_formatter
  form_date: utcTimestampFormatter('D MMMM, ddd')
  ticket_time: utcTimestampFormatter('HH:mm')
  ticket_mini_date: utcTimestampFormatter('D MMM YYYY')
  ticket_full_date: utcTimestampFormatter('D MMM YYYY')
  ticket_mini_date_with_weekday: utcTimestampFormatter('D MMM YYYY, ddd')
  ticket_flight_date: utcTimestampFormatter('D MMM')
  ticket_flight_date_with_weekday: utcTimestampFormatter('D MMM, ddd')
  ticket_mini_weekday: utcTimestampFormatter('ddd')
  ticket_fulldate: utcTimestampFormatter('D MMMM')
  filter_arrival: utcTimestampFormatter('H:mm, D MMMM')
  filter_arrival_short: utcTimestampFormatter('HH:mm, D MMM')

  format_duration: (duration) ->
    locale  = i18next.t('common:dateTime.durationShort', {returnObjects: true})
    units = [locale.h, locale.m]
    parts = [Math.floor(duration / 60), duration % 60]
    result = ''
    for index, val of parts
      result += ' ' + "#{val}".slice(-2) + units[index] if val > 0
    result

  format_transfer_duration: (duration) ->
    locale  = i18next.t('common:dateTime.durationShort', {returnObjects: true})
    "#{Math.floor(duration / 60)}".slice(-2) + "#{locale.h} " + "00#{duration % 60}".slice(-2) + locale.m

  flight_time_format_duration_with_units: (duration) ->
    locale  = i18next.t('common:dateTime.durationShort', {returnObjects: true})
    "0#{Math.floor(duration / 60)}".slice(-2) + "#{locale.h} " + "0#{duration % 60}".slice(-2) + locale.m

  dp_day: (dt) ->
    return '' unless dt
    reformatter('ddd')(dt)

  dp_date: (dt) ->
    return '' unless dt
    reformatter('D MMMM', true)(dt)

  flight_time_filter: (date_string) ->
    return undefined unless date_string
    reformatter('D MMMM')(date_string)
