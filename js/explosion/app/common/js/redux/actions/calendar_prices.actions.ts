import { DateType } from 'form/components/avia_form/avia_form.types'

import {
  ResetMonthCalendarAction,
  RESET_MONTH_CALENDAR_PRICES,
  UPDATE_ONE_WAY_PRICES,
  CalendarPricesActions,
  FETCH_MONTH_PRICES,
  FETCH_YEAR_PRICES,
  PRICE_SWITCHER_CHECK,
} from '../types/calendar_prices.types'
import {
  TripDurationInput,
  TripDurationTab,
} from 'shared_components/trip_duration/trip_duration.types'

export const fetchYearPrices = (): CalendarPricesActions => ({
  type: FETCH_YEAR_PRICES,
})

export const fetchMonthPrices = (dateType: DateType, fromMonth: Date): CalendarPricesActions => ({
  type: FETCH_MONTH_PRICES,
  dateType,
  fromMonth,
})

export const resetMonthCalendarPrices = (type?: DateType): ResetMonthCalendarAction => ({
  type: RESET_MONTH_CALENDAR_PRICES,
  dateType: type,
})

export const updateOneWayPrices = (checked: boolean): CalendarPricesActions => ({
  type: UPDATE_ONE_WAY_PRICES,
  checked,
})

export const priceSwitcherCheck = (
  checked: boolean,
  activeInput: TripDurationInput,
  tab: TripDurationTab,
  month?: Date,
): CalendarPricesActions => ({
  type: PRICE_SWITCHER_CHECK,
  checked,
  activeInput,
  tab,
  month,
})
