import { MonthTuple, MonthPickerValue, DatesRange } from './month_picker.types'

const monthRgxp = /(\d{4})-(\d{1,2})/

const getMonthKeyByDate = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}`

export const incrementMonth = (key: string, increment: number): string => {
  const [year, month] = keyToTuple(key)
  const monthSum = month + increment
  if (monthSum > 12) {
    const yearsToAdd = Math.floor(monthSum / 12)
    const monthResult = monthSum - 12 * yearsToAdd

    return tupleToKey([yearsToAdd + year, monthResult])
  }

  return tupleToKey([year, monthSum])
}

export const tupleToKey = (month: MonthTuple): string => month.join('-')

export const keyToTuple = (key: string): MonthTuple => {
  const [_match, year, month] = key.match(monthRgxp)!
  return [+year, +month]
}

export const buildMonthPickerValue = (
  start: string = getMonthKeyByDate(),
  size: number = 12,
): MonthPickerValue => {
  const result: MonthPickerValue = []
  for (let i = 0; i < size; i++) {
    const tuple = incrementMonth(start, i)
    result.push({
      month: tuple,
      isSelected: false,
    })
  }
  return result
}

export const monthKeyToDateRange = (key: string): DatesRange => {
  const [year, month] = keyToTuple(key)
  const from = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const to = new Date(year, month, 0, 0, 0, 0, 0)
  return { from, to }
}

export const getDateFromMonthKey = (date: string) => {
  let [year, month] = date.split('-')
  month = month.length > 1 ? month : `0${month}`
  return new Date(`${year}/${month}/01`)
}
