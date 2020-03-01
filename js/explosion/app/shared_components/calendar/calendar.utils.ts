import { format } from 'finity-js'

export const getDirectedDates = (from: Date, to?: Date): { from: Date; to: Date } => {
  let _from = from
  let _to = to || from

  if (_from > _to) {
    return {
      from: _to,
      to: _from,
    }
  }

  return {
    from: _from,
    to: _to,
  }
}

export const getDateTime = (date: Date, time: string = '12:00:00'): Date => {
  return new Date(`${format(date, 'YYYY/MM/DD')} ${time}`)
}
