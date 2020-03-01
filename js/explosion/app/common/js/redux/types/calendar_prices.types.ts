import { DateType, Calendar } from 'form/components/avia_form/avia_form.types'
import {
  TripDurationInput,
  TripDurationTab,
} from 'shared_components/trip_duration/trip_duration.types'

export const UPDATE_ONE_WAY_PRICES = 'UPDATE_ONE_WAY_PRICES'
export const SET_YEAR_CALENDAR_PRICES = 'SET_YEAR_CALENDAR_PRICES'
export const SET_MONTH_CALENDAR_PRICES = 'SET_MONTH_CALENDAR_PRICES'
export const RESET_MONTH_CALENDAR_PRICES = 'RESET_MONTH_CALENDAR_PRICES'
export const FETCH_YEAR_PRICES = 'FETCH_YEAR_PRICES'
export const FETCH_MONTH_PRICES = 'FETCH_MONTH_PRICES'
export const PRICE_SWITCHER_CHECK = 'PRICE_SWITCHER_CHECK'

export interface YearPrices {
  [key: string]: number
}

export enum DepartPricesType {
  OW = 'oneWay',
  RT = 'roundTrip',
}

export enum ReturnPricesType {
  WD = 'withDepart',
  ND = 'noDepart',
}

export type DaypickerPrices = {
  [DateType.DepartDate]: { [type in DepartPricesType]: MonthsPrices }
  [DateType.ReturnDate]: { [type in ReturnPricesType]: MonthsPrices }
}

export interface PricesRequestParams {
  origin_iata: string
  destination_iata?: string
  one_way: boolean
  min_trip_duration?: number
  max_trip_duration?: number
}

export interface MonthPrice {
  [DateType.DepartDate]: Date
  [DateType.ReturnDate]?: Date
  // NOTE: is this price less then most of all prices in array
  isMin: boolean
  originalPrice: number
  price: number
}

export type MonthsPrices = { [month: string]: { [day: string]: MonthPrice } }

export interface SetYearCalendarAction {
  type: typeof SET_YEAR_CALENDAR_PRICES
  prices: YearPrices
}

export interface SetMonthCalendarAction {
  type: typeof SET_MONTH_CALENDAR_PRICES
  monthsPrices: MonthsPrices
  dateType: DateType
  oneWay?: boolean
  withDepart?: boolean
}

export interface ResetMonthCalendarAction {
  type: typeof RESET_MONTH_CALENDAR_PRICES
  dateType?: DateType
}

interface UpdateOneWayPrices {
  type: typeof UPDATE_ONE_WAY_PRICES
  checked: boolean
}

export interface FetchYearPrices {
  type: typeof FETCH_YEAR_PRICES
}

export interface FetchMonthPrices {
  type: typeof FETCH_MONTH_PRICES
  dateType: DateType
  fromMonth: Date
}

export interface PriceSwitcherCheck {
  type: typeof PRICE_SWITCHER_CHECK
  checked: boolean
  activeInput: TripDurationInput
  tab: TripDurationTab
  month?: Date
}

export type CalendarPricesActions =
  | SetYearCalendarAction
  | SetMonthCalendarAction
  | ResetMonthCalendarAction
  | UpdateOneWayPrices
  | FetchYearPrices
  | FetchMonthPrices
  | PriceSwitcherCheck

export interface MonthPricesResponse {
  depart_date: string
  return_date: string
  price: number
}

export interface CalendarPricesState {
  [Calendar.Year]: YearPrices
  [Calendar.Months]: DaypickerPrices
  oneWayPrices: boolean
}
