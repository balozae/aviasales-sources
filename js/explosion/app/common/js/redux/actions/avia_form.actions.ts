import { HistoryItem } from 'form/components/autocomplete/search_history'
import { DateField, DateType, Place, PlaceField } from 'form/components/avia_form/avia_form.types'
import {
  ACTIVE_DATE_INPUT_CHANGE,
  AVIA_DATE_CHANGE,
  AVIA_FORM_MONTHS_MOUNT,
  AVIA_PLACE_CHANGE,
  AviaParamsActions,
  CHANGE_DATE_INPUT_MONTH,
  SET_ACTIVE_DATE_INPUT,
  SET_HISTORY_ITEM,
  SWAP_AVIA_PLACES,
} from '../types/avia_params.types'
import { TripDurationInput } from 'shared_components/trip_duration/trip_duration.types'

export const swapAviaPlaces = (): AviaParamsActions => ({ type: SWAP_AVIA_PLACES })

export const changeAviaPlace = (
  placeType: PlaceField,
  place: Place | HistoryItem,
): AviaParamsActions => ({
  type: AVIA_PLACE_CHANGE,
  placeType,
  place,
})

export const setHistoryItem = (placeType: PlaceField, item: HistoryItem): AviaParamsActions => ({
  type: SET_HISTORY_ITEM,
  placeType,
  item,
})

/**
 * Убрать month
 * Для него должны быть отдельные экшены которые передают это значение
 *
 * @param activeInput
 * @param month
 */
export const changeActiveDateInput = (
  activeInput?: TripDurationInput,
  month?: Date,
): AviaParamsActions => ({
  type: ACTIVE_DATE_INPUT_CHANGE,
  activeInput,
  month,
})

export const setActiveDateInput = (activeInput?: TripDurationInput): AviaParamsActions => ({
  type: SET_ACTIVE_DATE_INPUT,
  activeInput,
})

export const changeDateInputMonth = (
  activeInput: TripDurationInput,
  month: Date,
  direction?: 'prev' | 'next',
): AviaParamsActions => ({
  type: CHANGE_DATE_INPUT_MONTH,
  activeInput,
  month,
  direction,
})

export const changeAviaDate = (dateType: DateType, date: DateField) => ({
  type: AVIA_DATE_CHANGE,
  dateType,
  date,
})

export const monthsMount = (): AviaParamsActions => ({ type: AVIA_FORM_MONTHS_MOUNT })
