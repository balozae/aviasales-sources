import finity from 'finity-js'
import i18next from 'i18next'
import { dateToLowerCase } from 'shared_components/l10n/l10n'

const utc = (timestamp) => finity.utc(new Date(timestamp * 1000))

export function timeFormatter(timestamp: number): string {
  return finity.format(utc(timestamp), 'HH:mm')
}

export function dateFormatter(timestamp: number): string {
  return dateToLowerCase(finity.format(utc(timestamp), 'D MMM YYYY, ddd'))
}

export function durationFormatter(durationMinutes: number): string {
  const units = [
    i18next.t('common:dateTime.durationShort.d'),
    i18next.t('common:dateTime.durationShort.h'),
    i18next.t('common:dateTime.durationShort.m'),
  ]

  let days = (durationMinutes / 60 / 24) | 0
  let hours = (durationMinutes / 60 - 24 * days) | 0
  let minutes = durationMinutes % 60

  // show hours instead of day with minutes (ex. 24h 34m instead of 1d 34m)
  const totalHours = (durationMinutes / 60) | 0
  if (totalHours === 24) {
    hours = totalHours
    days = 0
  }

  return [days, hours, minutes].reduce(
    (acc, part, i) => (part > 0 ? acc + ' ' + part + units[i] : acc),
    '',
  )
}

export default {}
