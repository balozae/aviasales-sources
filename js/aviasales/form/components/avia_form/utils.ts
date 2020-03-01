import { format as formatDate, diff, addYears } from 'finity-js'
import update from 'immutability-helper'
import {
  PlaceType,
  TripDuration,
  DateType,
  DateField,
  PlaceField,
  Place,
  Segment,
  MonthRange,
  DateFieldTabs,
} from './avia_form.types'
import { DEFAULT_PLACE } from './avia_form.constants'
import {
  TripDurationInput,
  TripDurationTab,
} from 'shared_components/trip_duration/trip_duration.types'
import { DepartPricesType, ReturnPricesType } from 'common/js/redux/types/calendar_prices.types'

export const isMonthRange = (date: DateField): boolean => Array.isArray(date)

export const isTripDuration = (date: DateField): boolean => date instanceof TripDuration

export const isDate = (date: DateField): boolean => date instanceof Date

export const isOpenSearch = (segments: ReadonlyArray<Segment>): boolean =>
  segments.some(({ origin, destination, date }) => {
    return isOpenSearchDate(date) || isOpenSearchPlace(origin) || isOpenSearchPlace(destination)
  })

export const getAsDate = (date: DateField) => (isDate(date) ? (date as Date) : undefined)

export const getAsMonthRange = (date: DateField) =>
  isMonthRange(date) ? (date as MonthRange) : undefined

export const getAsTripDuration = (date: DateField) =>
  isTripDuration(date) ? (date as TripDuration) : undefined

export const updateSegmentPlace = (
  field: PlaceField,
  place: Place,
  segments: ReadonlyArray<Segment>,
): ReadonlyArray<Segment> => {
  if (segments.length) {
    // NOTE: actually it's array
    const newSegments: { [key in number]: any } = { 0: { [field]: { $set: place } } }
    if (!isOneWay(segments)) {
      const returnField: PlaceField =
        field === PlaceField.Origin ? PlaceField.Destination : PlaceField.Origin
      newSegments[1] = { [returnField]: { $set: place } }
    }
    return update(segments, newSegments)
  }
  return [{ [field]: place }]
}

export const updateSegmentDate = (
  type: DateType,
  date: DateField,
  segments: ReadonlyArray<Segment>,
): ReadonlyArray<Segment> => {
  const isDepart = type === DateType.DepartDate
  const segmentIndex = isDepart ? 0 : 1
  if (isDepart && !date) {
    return update(segments, { [segmentIndex]: { date: { $set: date } } })
  }
  if (segments[segmentIndex]) {
    if (date) {
      segments = update(segments, {
        [segmentIndex]: { date: { $set: addYearToPastDate(date as Date) } },
      })
    } else {
      segments = update(segments, { $splice: [[segmentIndex, 1]] })
    }
  } else if (date) {
    let origin, destination
    switch (type) {
      case DateType.DepartDate:
        origin = getPlace(segments, PlaceField.Origin)
        destination = getPlace(segments, PlaceField.Destination)
        break
      // NOTE: returnDate (default just to prevent linter error ¯\_(ツ)_/¯)
      default:
        origin = getPlace(segments, PlaceField.Destination)
        destination = getPlace(segments, PlaceField.Origin)
        break
    }
    segments = segments.concat([{ origin, destination, date: addYearToPastDate(date as Date) }])
  }
  return segments
}

export const addYearToPastDate = (date: Date) => {
  const today = new Date()
  if (diff(date, today) < -1) {
    return addYears(date, 1)
  }
  return date
}

export const isOpenSearchDate = (date: DateField): boolean =>
  isTripDuration(date) || isMonthRange(date)

export const isOpenSearchPlace = (place: Place | undefined): boolean =>
  place ? place.type === PlaceType.Anywhere || place.type === PlaceType.Country : false

export const escapeRegExp = (str: string) =>
  str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')

export const generateRequestId = (): string => (0 | (Math.random() * 9e6)).toString(36)

export const getDate = (segments: ReadonlyArray<Segment>, type: DateType): DateField => {
  const segmentIndex = type === DateType.DepartDate ? 0 : 1
  const segment = segments[segmentIndex]
  if (segment) {
    return segment.date || undefined
  }
  return undefined
}

export const isOneWay = (segments: ReadonlyArray<Segment>): boolean =>
  !getDate(segments, DateType.ReturnDate)

export const getPlace = (segments: ReadonlyArray<Segment>, type: PlaceField): Place => {
  const firstSegment = segments[0]
  if (firstSegment) {
    return firstSegment[type] || DEFAULT_PLACE
  }
  return DEFAULT_PLACE
}

export const buildChindlrenString = (
  str: string = '',
  count: number,
  childrenAge: string | string[] | number | number[],
) => {
  if (!count) {
    return str
  }
  const res: string[] = []
  for (let i = 0; i < count; i++) {
    const age = Array.isArray(childrenAge) ? childrenAge[i] : childrenAge
    res.push(age.toString())
  }
  if (str.length && res.length) {
    return `${str},${res.join(',')}`
  }
  return res.join(',')
}

export const isEmptyPlace = (place: Place): boolean => {
  return place
    ? place.type !== PlaceType.Anywhere && (place.type !== PlaceType.HotelCity && !place.iata)
    : false
}

export const getAllowedDateTabs = (
  type: TripDurationInput,
  segments: ReadonlyArray<Segment>,
  allowOpenSearch: boolean,
): ReadonlyArray<TripDurationTab> => {
  if (!allowOpenSearch) {
    return ['calendar']
  }
  const origin = getPlace(segments, PlaceField.Origin)
  const destination = getPlace(segments, PlaceField.Destination)
  const departDate = getDate(segments, DateType.DepartDate)
  const isSomePlaceEmpty = isEmptyPlace(origin) || isEmptyPlace(destination)

  if (type === 'departure') {
    if (isOpenSearchPlace(destination) || isSomePlaceEmpty) {
      return ['calendar', 'months']
    } else {
      return ['calendar']
    }
  }

  if (type === 'return') {
    if (isOpenSearchPlace(destination) || isSomePlaceEmpty) {
      return isMonthRange(departDate) ? ['range-slider'] : ['calendar', 'range-slider']
    } else {
      return ['calendar']
    }
  }

  return []
}

export const getFormTypeToUpdate = (pageHeader): 'avia' | 'multiway' => {
  const availableForms = ['avia', 'multiway']
  const { activeForm, prevActiveForm } = pageHeader

  if (availableForms.includes(activeForm)) {
    return activeForm
  }

  if (availableForms.includes(prevActiveForm)) {
    return prevActiveForm
  }

  return 'avia'
}

export const formatSegmentDateToString = (date: DateField | string): string => {
  if (date instanceof Date) {
    return formatDate(date, 'YYYY-MM-DD')
  }
  return date as string
}

export const convertDateFieldName = (field?: TripDurationInput) => {
  switch (field) {
    case 'departure':
      return DateType.DepartDate
    case 'return':
      return DateType.ReturnDate
    default:
      return undefined
  }
}

export const convertDateTabToDateType = (tab?: TripDurationTab) => {
  switch (tab) {
    case 'calendar':
      return 'Day'
    case 'months':
      return 'Month'
    case 'range-slider':
      return 'Range'
    default:
      return undefined
  }
}

export const convertDateTabName = (tab?: TripDurationTab) => {
  switch (tab) {
    case 'calendar':
      return DateFieldTabs.Datepicker
    case 'months':
      return DateFieldTabs.Monthpicker
    case 'range-slider':
      return DateFieldTabs.Rangepicker
    default:
      return undefined
  }
}

export const getPriceTypeFromParams = (
  dateType: DateType,
  oneWay?: boolean,
  withDepart?: boolean,
): DepartPricesType | ReturnPricesType | null => {
  let priceType: ReturnType<typeof getPriceTypeFromParams> = null

  if (dateType === DateType.DepartDate) {
    // if (isDesktop() && flagr.is('avs-feat-showCalendarPriceSwitcher')) {
    // priceType = oneWay ? DepartPricesType.OW : DepartPricesType.RT
    // } else {
    priceType = DepartPricesType.OW
    // }
  }

  if (dateType === DateType.ReturnDate) {
    // if (isDesktop() && flagr.is('avs-feat-showCalendarPriceSwitcher')) {
    //   priceType = withDepart ? ReturnPricesType.WD : ReturnPricesType.ND
    // } else {
    priceType = withDepart ? ReturnPricesType.WD : null
    // }
  }

  return priceType
}
