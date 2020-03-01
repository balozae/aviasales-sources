import { format, utc } from 'finity-js'

export const getTicketFlightDateWithWeekday = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return format(utc(date), 'D MMM, ddd')
}

export const getRatingModifier = (rating: number): string => {
  let modifier = '--red'

  if (rating > 7.5) {
    modifier = '--green'
  } else if (rating > 6.5) {
    modifier = '--yellow'
  }

  return modifier
}
