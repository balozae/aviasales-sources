import { stringify } from 'query-string'
import { addMonths, format } from 'finity-js'
import { createSelector } from 'reselect'
import { AppState } from '../types/root/explosion'
import {
  getAsTripDuration,
  getPlace,
  getDate,
  getPriceTypeFromParams,
  isDate,
  isTripDuration,
  convertDateFieldName,
} from 'form/components/avia_form/utils'
import { getAviaFormParams } from './form_params.selectors'
import { PlaceField, DateType, TripDuration } from 'form/components/avia_form/avia_form.types'
import { TRIP_DURATION } from 'form/components/avia_form/avia_form.constants'
import { isMobile } from 'shared_components/resizer'
import { TripDurationInput } from 'shared_components/trip_duration/trip_duration.types'
import { DepartPricesType, ReturnPricesType } from '../types/calendar_prices.types'

const MONTH_PRICES_URL = 'https://lyssa.aviasales.ru/date_picker_prices?'
const YEAR_PRICES_URL = 'https://lyssa.aviasales.ru/v3/widget/year?'

export const getCalendarPrices = (state: AppState) => state.calendarPrices

interface YearPricesRequestParams extends CommonRequestParams {
  one_way: boolean
  min_trip_duration: number
  max_trip_duration: number
}

interface CommonRequestParams {
  origin_iata: string
  destination_iata?: string
  one_way: boolean
}

interface OWMonthPricesParams extends CommonRequestParams {
  one_way: true
  depart_months: string[]
}

interface RTDepartMonthPricesParams extends CommonRequestParams {
  one_way: false
  depart_months: string[]
}

interface RTDepartTripDurationMonthPricesParams extends CommonRequestParams {
  one_way: false
  depart_months: string[]
  min_trip_duration: number
  max_trip_duration: number
}

interface RTReturnMonthPricesParams extends CommonRequestParams {
  one_way: false
  depart_date: string
  return_months: string[]
}

interface RTReturnNoDepartDateMonthPricesParams extends CommonRequestParams {
  one_way: false
  depart_months: string[]
  return_months: string[]
}

type MonthPricesRequestParams =
  | OWMonthPricesParams
  | RTDepartTripDurationMonthPricesParams
  | RTDepartMonthPricesParams
  | RTReturnMonthPricesParams
  | RTReturnNoDepartDateMonthPricesParams

const getCommonParams = createSelector(
  getAviaFormParams,
  getCalendarPrices,
  (params, calendarPrices): CommonRequestParams => {
    const origin = getPlace(params.segments, PlaceField.Origin)
    const destination = getPlace(params.segments, PlaceField.Destination)
    return {
      origin_iata: origin.cityIata || origin.iata,
      destination_iata: destination.cityIata || destination.iata,
      one_way: calendarPrices.oneWayPrices,
    }
  },
)

const getYearPricesParams = createSelector(
  getCommonParams,
  getAviaFormParams,
  (commonParams, formParams): YearPricesRequestParams => {
    const selectedDate = getDate(formParams.segments, DateType.ReturnDate)
    const tripDuration = getAsTripDuration(selectedDate)
    return {
      ...commonParams,
      min_trip_duration: tripDuration ? tripDuration.min : TRIP_DURATION.min,
      max_trip_duration: tripDuration ? tripDuration.max : TRIP_DURATION.max,
    }
  },
)

export const getMonthsToFetch = createSelector(
  (state: AppState, type: DateType) => type,
  (state: AppState, type: DateType, month: Date) => month,
  getCalendarPrices,
  getAviaFormParams,
  (type: DateType, fromMonth, calendarPrices, formParams) => {
    const monthsToFetch: string[] = []
    const withDepart = !!(formParams.segments.length && formParams.segments[0].date)
    const priceType = getPriceTypeFromParams(type, calendarPrices.oneWayPrices, withDepart)

    if (!priceType) {
      return []
    }

    let i = isMobile() ? 13 : 2

    while (i > 0) {
      i--
      const month = addMonths(fromMonth, i)
      const formattedMonth = format(month, 'YYYY-MM-DD')
      if (!calendarPrices.months[type][priceType][formattedMonth]) {
        monthsToFetch.push(formattedMonth)
      }
    }

    return monthsToFetch
  },
)

const getRTDepart = createSelector(
  (state: AppState, type: DateType) => type,
  getMonthsToFetch,
  getAviaFormParams,
  (type, monthsToFetch, formParams) => {
    const returnDate =
      type === DateType.DepartDate
        ? getDate(formParams.segments, DateType.ReturnDate)
        : getDate(formParams.segments, DateType.DepartDate)
    const result = { depart_months: monthsToFetch, one_way: false }
    if (isDate(returnDate)) {
      return result
    }
    if (isTripDuration(returnDate)) {
      const { min, max } = returnDate as TripDuration
      return {
        ...result,
        min_trip_duration: min,
        max_trip_duration: max,
      }
    }
    return result
  },
)

const getRTReturn = createSelector(
  (state: AppState, type: DateType) => type,
  getMonthsToFetch,
  getAviaFormParams,
  (type, monthsToFetch, formParams) => {
    const departDate = getDate(formParams.segments, DateType.DepartDate) as Date
    const result = { return_months: monthsToFetch }
    if (departDate) {
      return { ...result, depart_date: format(departDate, 'YYYY-MM-DD') }
    }
    return result
  },
)

const getMonthPricesParams = createSelector(
  (state: AppState, type: DateType) => type,
  getMonthsToFetch,
  getCalendarPrices,
  getCommonParams,
  getRTDepart,
  getRTReturn,
  getAviaFormParams,
  (
    type: DateType,
    monthsToFetch,
    calendarPrices,
    commonParams,
    RTDepart,
    RTReturn,
    aviaFormParams,
  ): MonthPricesRequestParams => {
    const common = { ...commonParams, depart_months: monthsToFetch }
    const withDepart = !!(aviaFormParams.segments.length && aviaFormParams.segments[0].date)
    const priceType = getPriceTypeFromParams(type, calendarPrices.oneWayPrices, withDepart)

    switch (priceType) {
      case DepartPricesType.OW:
        return { ...common, one_way: true }
      case DepartPricesType.RT:
        return { ...common, ...RTDepart, one_way: false }
      case ReturnPricesType.ND:
        return { ...common, ...RTReturn, one_way: false }
      case ReturnPricesType.WD:
        return { ...common, ...RTReturn, one_way: false }
      default: {
        return { ...common, one_way: true }
      }
    }
  },
)

export const getYearPricesUrl = createSelector(
  getYearPricesParams,
  (yearPricesParams) => YEAR_PRICES_URL + stringify(yearPricesParams),
)

export const getMonthPricesUrl = createSelector(
  getMonthPricesParams,
  (monthPricesParams) =>
    MONTH_PRICES_URL + stringify(monthPricesParams, { arrayFormat: 'bracket' }),
)

const getActiveInputType = (_, { activeInput }) => convertDateFieldName(activeInput)

export const getDayPrice = createSelector(
  [
    (_, props: { activeInput: TripDurationInput; date: Date }) => props.date,
    getActiveInputType,
    getAviaFormParams,
    getCalendarPrices,
  ],
  (date, dateType, aviaFormParams, calendarPrices) => {
    if (!dateType) {
      return null
    }

    const { segments } = aviaFormParams
    const withDepart = !!(segments.length && segments[0].date)
    const priceType = getPriceTypeFromParams(dateType, calendarPrices.oneWayPrices, withDepart)

    if (!priceType) {
      return null
    }

    const daypickerPrices = calendarPrices.months[dateType][priceType]
    const formattedDate = format(date, 'YYYY-MM-DD')
    const formattedMonth = `${formattedDate.substring(0, 7)}-01`

    if (daypickerPrices[formattedMonth] && daypickerPrices[formattedMonth][formattedDate]) {
      return daypickerPrices[formattedMonth][formattedDate]
    }
  },
)
