import i18next from 'i18next'

export const getStopsFilterName = (
  value: string,
  withoutStopsKey: string = 'stops:withoutStops',
  pluralStopsKey: string = 'stops:stopsCount',
) => {
  const count: number = parseInt(value, 10)
  if (isNaN(count)) {
    return value
  }
  if (count === 0) {
    return i18next.t(withoutStopsKey)
  }
  return i18next.t(pluralStopsKey, {
    stopsCount: count,
  })
}
