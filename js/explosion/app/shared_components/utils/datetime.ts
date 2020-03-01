import { format } from 'finity-js'

export function formatDateToString(date?: Date, pattern: string = 'DD.MM.YYYY'): string {
  if (!date) {
    return ''
  }

  try {
    return format(date, pattern, true).toLowerCase()
  } catch (e) {
    return ''
  }
}

export default {}
