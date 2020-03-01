import { InitialInputValues } from 'form/types'
import { SearchHistory, TripClass } from 'common/types'
import { TripDurationInput } from 'shared_components/trip_duration/trip_duration.types'
import { CalendarPricesState } from 'common/js/redux/types/calendar_prices.types'
import { priceSwitcherCheck } from 'common/js/redux/actions/calendar_prices.actions'
import {
  changeAviaPlace,
  swapAviaPlaces,
  monthsMount,
  changeActiveDateInput,
  changeDateInputMonth,
  changeAviaDate,
} from 'common/js/redux/actions/avia_form.actions'

export interface Passengers {
  adults: number
  children: number
  infants: number
}

export enum PlaceType {
  City = 'city',
  Airport = 'airport',
  Country = 'country',
  Anywhere = 'anywhere',
  History = 'history',
  Hotel = 'hotel',
  HotelCity = 'hotelCity',
}

export interface PlaceCoordinates {
  lat: number
  lon: number
}

export interface Place {
  [key: string]: any
  iata: string
  name: string
  type: PlaceType
  cityIata?: string
  weight?: number
  cases?: Declentions
  countryIata?: string
  countryName?: string
  cityName?: string
  isMetropolis?: boolean
  inMetropolis?: boolean
  hotelsCount?: number
  coordinates?: PlaceCoordinates
}

export enum PlaceField {
  Origin = 'origin',
  Destination = 'destination',
}

export interface Segment {
  [PlaceField.Origin]?: Place
  [PlaceField.Destination]?: Place
  date?: DateField
}

export interface SearchParams {
  passengers: Passengers
  tripClass: TripClass
  segments: ReadonlyArray<Segment>
  highlightedTicket?: any
  currency?: string
  startSearch?: boolean
  tripType?: string
}

export type SearchParamsInHistory = Pick<
  SearchParams,
  'passengers' | 'tripClass' | 'highlightedTicket' | 'currency' | 'startSearch'
> & {
  segments: ReadonlyArray<{
    [PlaceField.Origin]?: Place
    [PlaceField.Destination]?: Place
    date?: string | TripDuration
  }>
}

export enum DateType {
  DepartDate = 'departDate',
  ReturnDate = 'returnDate',
}
export interface Props {
  aviaFormSubmit: (shouldSearchHotels: boolean) => void
  action: string
  changeParams: (
    params: Partial<SearchParams>,
    additionalParams?: object,
    callback?: Function,
  ) => void
  changeMultiwayParams: (
    params: Partial<SearchParams>,
    additionalParams?: object,
    callback?: Function,
  ) => void
  openMultiWayForm: () => void
  hideFormHint: () => void
  fetchSearchHistory: () => void
  fetchCurrencyRates: () => void
  footerActions?: boolean
  params: SearchParams
  multiwayParams: SearchParams
  showFormHint: boolean
  searchHistory: SearchHistory[]
  calendarPrices: CalendarPricesState
  calendarLoader: boolean
  reachGoal: (event: string, data?: any) => void
  currentPage: string
  initialInputValues?: InitialInputValues
  activeDateInput?: TripDurationInput
  shouldFocusFirstEmptyField?: boolean
  onPriceSwitcherCheck: typeof priceSwitcherCheck
  onAviaFormPlaceChange: typeof changeAviaPlace
  onSwapPlaces: typeof swapAviaPlaces
  onMonthsMount: typeof monthsMount
  onActiveDateInputChange: typeof changeActiveDateInput
  onMonthChange: typeof changeDateInputMonth
  onDateChange: typeof changeAviaDate
}

export interface FormError {
  message: string
}

export type FormErrors = { [key in PlaceField | DateType | 'date']?: FormError }

export interface State {
  activeInput?: TripDurationInput
  disabled: boolean
  showHint: boolean
  shouldSearchHotels: boolean
  withoutReturnDate: boolean
  progressBarClass: string
  errors: FormErrors
}

export interface Rates {
  [key: string]: number
}

export enum Calendar {
  Year = 'year',
  Months = 'months',
}

export interface CalendarType {
  [Calendar.Year]: number
  [Calendar.Months]: number
}

interface TripDurationInterface {
  min: number
  max: number
}
export class TripDuration implements TripDurationInterface {
  min: number
  max: number

  constructor(min: number, max: number) {
    this.min = min
    this.max = max
  }
}

export type MonthRange = ReadonlyArray<Date>

export type DateField = TripDuration | Date | MonthRange | undefined

export enum DateFieldTabs {
  Rangepicker = 'rangepicker',
  Datepicker = 'datepicker',
  Monthpicker = 'monthpicker',
}
