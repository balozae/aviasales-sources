import axios from 'axios'
import { format } from 'finity-js'
import { fork, takeEvery, put, select, call } from '@redux-saga/core/effects'
import Rollbar from 'common/utils/rollbar'
import {
  FETCH_YEAR_PRICES,
  SET_YEAR_CALENDAR_PRICES,
  YearPrices,
  FETCH_MONTH_PRICES,
  FetchMonthPrices,
  MonthPricesResponse,
  MonthPrice,
  SET_MONTH_CALENDAR_PRICES,
  CalendarPricesState,
} from '../types/calendar_prices.types'
import { getAviaFormPlace, getAviaFormParams } from '../selectors/form_params.selectors'
import { PlaceField, Place, DateType, PlaceType } from 'form/components/avia_form/avia_form.types'
import {
  getYearPricesUrl,
  getCalendarPrices,
  getMonthsToFetch,
  getMonthPricesUrl,
} from '../selectors/calendar_prices.selectors'
import { getPlace, getPriceTypeFromParams } from 'form/components/avia_form/utils'
import { AviaParamsState } from '../types/avia_params.types'

const cache = {}
const MIN_PRICE_PERCENT = 1.02

const formatMonthsPricesResponse = (
  type: DateType,
  prices: MonthPricesResponse[],
  monthsToFetch: ReadonlyArray<string>,
): { [month: string]: { [day: string]: MonthPrice } } => {
  const minPrice =
    prices.reduce((acc, { price }) => (!acc || price < acc ? price : acc), 0) * MIN_PRICE_PERCENT

  const monthsPrices = prices.reduce((acc, item) => {
    const departDate = new Date(item.depart_date)
    const departDateString = format(departDate, 'YYYY-MM-DD')
    const departMonthString = `${departDateString.substr(0, 7)}-01`
    const returnDate = item.return_date ? new Date(item.return_date) : undefined

    const priceItem = {
      originalPrice: item.price,
      isMin: item.price <= minPrice,
      price: item.price,
      [DateType.DepartDate]: departDate,
      [DateType.ReturnDate]: returnDate,
    }

    if (type === DateType.ReturnDate) {
      if (!returnDate) {
        return acc
      }

      const returnDateString = format(returnDate, 'YYYY-MM-DD')
      const returnMonthString = `${returnDateString.substr(0, 7)}-01`
      return {
        ...acc,
        [returnMonthString]: { ...acc[returnMonthString], [returnDateString]: priceItem },
      }
    }

    return {
      ...acc,
      [departMonthString]: { ...acc[departMonthString], [departDateString]: priceItem },
    }
  }, {})

  monthsToFetch.forEach((month) => {
    if (!monthsPrices[month]) {
      monthsPrices[month] = {}
    }
  })

  return monthsPrices
}

function* fetchYearPrices() {
  yield takeEvery(FETCH_YEAR_PRICES, function*() {
    yield put({ type: SET_YEAR_CALENDAR_PRICES, prices: {} })
    const origin: Place = yield select(getAviaFormPlace, PlaceField.Origin)
    if (!origin.iata) {
      return
    } else {
      yield put({ type: 'SHOW_CALENDAR_LOADER' })
      try {
        const url: string = yield select(getYearPricesUrl)
        const response = cache[url] || (yield call(axios, url))
        const prices: YearPrices = response.data.year
        yield put({ type: SET_YEAR_CALENDAR_PRICES, prices })
        cache[url] = response
      } catch (error) {
        Rollbar.warn('Month picker prices error', error)
      } finally {
        yield put({ type: 'HIDE_CALENDAR_LOADER' })
      }
    }
  })
}

function* fetchMonthPrices() {
  yield takeEvery(FETCH_MONTH_PRICES, function*({ dateType, fromMonth }: FetchMonthPrices) {
    const formParams: AviaParamsState = yield select(getAviaFormParams)
    const destination = getPlace(formParams.segments, PlaceField.Destination)
    const calendarPrices: CalendarPricesState = yield select(getCalendarPrices)
    const withDepart = !!(formParams.segments.length && formParams.segments[0].date)
    let isOneWay = calendarPrices.oneWayPrices

    if (
      (destination.type === PlaceType.City || destination.type === PlaceType.Airport) &&
      (destination.cityIata || destination.iata)
    ) {
      const priceType = getPriceTypeFromParams(dateType, isOneWay, withDepart)

      if (!priceType) {
        return
      }

      const daypickerPrices = calendarPrices.months[dateType][priceType]
      const monthsToFetch = yield select(getMonthsToFetch, dateType, fromMonth)

      if (monthsToFetch.length) {
        yield put({ type: 'SHOW_CALENDAR_LOADER' })
        try {
          const url = yield select(getMonthPricesUrl, dateType, fromMonth)
          const response = yield call(axios, url)
          const monthsPrices = {
            ...daypickerPrices,
            ...formatMonthsPricesResponse(dateType, response.data.prices, monthsToFetch),
          }
          yield put({
            type: SET_MONTH_CALENDAR_PRICES,
            monthsPrices,
            dateType,
            oneWay: isOneWay,
            withDepart,
          })
          yield put({ type: 'HIDE_CALENDAR_LOADER' })
        } catch {
          yield put({ type: 'HIDE_CALENDAR_LOADER' })
        }
      }
    }
  })
}

export default function* calendarPricesSaga() {
  yield fork(fetchMonthPrices)
  yield fork(fetchYearPrices)
}
