import { Calendar, DateType } from 'form/components/avia_form/avia_form.types'
import {
  CalendarPricesState,
  SET_YEAR_CALENDAR_PRICES,
  SET_MONTH_CALENDAR_PRICES,
  RESET_MONTH_CALENDAR_PRICES,
  CalendarPricesActions,
  DepartPricesType,
  ReturnPricesType,
  UPDATE_ONE_WAY_PRICES,
} from '../types/calendar_prices.types'
import { getPriceTypeFromParams } from 'form/components/avia_form/utils'
import deepCopy from 'common/js/deep_copy.coffee'

export const initialState: CalendarPricesState = Object.freeze({
  [Calendar.Year]: {},
  [Calendar.Months]: {
    [DateType.DepartDate]: {
      [DepartPricesType.OW]: {},
      [DepartPricesType.RT]: {},
    },
    [DateType.ReturnDate]: {
      [ReturnPricesType.WD]: {},
      [ReturnPricesType.ND]: {},
    },
  },
  oneWayPrices: false,
})

export default (state: CalendarPricesState = initialState, action: CalendarPricesActions) => {
  switch (action.type) {
    case UPDATE_ONE_WAY_PRICES:
      return { ...state, oneWayPrices: action.checked }

    case SET_YEAR_CALENDAR_PRICES:
      return { ...state, year: action.prices }

    case SET_MONTH_CALENDAR_PRICES: {
      const { monthsPrices, dateType, oneWay, withDepart } = action
      const priceType = getPriceTypeFromParams(dateType, oneWay, withDepart)
      const newMonthsState = deepCopy(state.months)

      if (!priceType) {
        return newMonthsState
      }

      newMonthsState[dateType][priceType] = {
        ...newMonthsState[dateType][priceType],
        ...monthsPrices,
      }
      return { ...state, months: newMonthsState }
    }

    case RESET_MONTH_CALENDAR_PRICES: {
      const { dateType } = action
      let monthsState
      if (dateType) {
        monthsState = { ...state.months }
        monthsState[dateType] = { ...initialState.months[dateType] }
      } else {
        monthsState = { ...initialState.months }
      }
      return { ...state, months: monthsState }
    }

    default:
      return state
  }
}
