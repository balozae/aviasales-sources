import {
  SearchParams,
  PlaceField,
  Place,
  DateType,
  DateField,
} from 'form/components/avia_form/avia_form.types'
import { HistoryItem } from 'form/components/autocomplete/search_history'
import { TripDurationInput } from 'shared_components/trip_duration/trip_duration.types'

export const UPDATE_AVIA_PARAMS = 'UPDATE_AVIA_PARAMS'
export const RESET_AVIA_PARAMS = 'RESET_AVIA_PARAMS'
export const SET_HISTORY_ITEM = 'SET_HISTORY_ITEM'
export const AVIA_PLACE_CHANGE = 'AVIA_PLACE_CHANGE'
export const SWAP_AVIA_PLACES = 'SWAP_AVIA_PLACES'
export const AVIA_FORM_MONTHS_MOUNT = 'AVIA_FORM_MONTHS_MOUNT'
export const ACTIVE_DATE_INPUT_CHANGE = 'ACTIVE_DATE_INPUT_CHANGE'
export const SET_ACTIVE_DATE_INPUT = 'SET_ACTIVE_DATE_INPUT'
export const CHANGE_DATE_INPUT_MONTH = 'CHANGE_DATE_INPUT_MONTH'
export const AVIA_DATE_CHANGE = 'AVIA_DATE_CHANGE'

export interface UpdateAviaParamsAction {
  type: typeof UPDATE_AVIA_PARAMS
  params: Partial<SearchParams>
}

export interface ResetAviaParamsAction {
  type: typeof RESET_AVIA_PARAMS
}

export interface SetHistoryItem {
  type: typeof SET_HISTORY_ITEM
  placeType: PlaceField
  item: HistoryItem
}

export interface AviaPlaceChange {
  type: typeof AVIA_PLACE_CHANGE
  placeType: PlaceField
  place: Place | HistoryItem
}

export interface SwapAviaPlaces {
  type: typeof SWAP_AVIA_PLACES
}

export interface AviaFormMonthsMount {
  type: typeof AVIA_FORM_MONTHS_MOUNT
}

export interface ActiveDateInputChange {
  type: typeof ACTIVE_DATE_INPUT_CHANGE
  activeInput?: TripDurationInput
  month?: Date
}

export interface SetActiveDateInput {
  type: typeof SET_ACTIVE_DATE_INPUT
  activeInput?: TripDurationInput
}

export interface DateInputMonthChange {
  type: typeof CHANGE_DATE_INPUT_MONTH
  direction?: 'prev' | 'next'
  activeInput: TripDurationInput
  month: Date
}

export interface AviaDateChange {
  type: typeof AVIA_DATE_CHANGE
  dateType: DateType
  date: DateField
}

export type AviaParamsActions =
  | UpdateAviaParamsAction
  | ResetAviaParamsAction
  | SetHistoryItem
  | AviaPlaceChange
  | SwapAviaPlaces
  | AviaFormMonthsMount
  | ActiveDateInputChange
  | DateInputMonthChange
  | AviaDateChange
  | SetActiveDateInput

export interface AviaParamsState extends SearchParams {
  activeDateInput?: TripDurationInput
}
