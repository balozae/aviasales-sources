import TripParams from 'utils/trip_params.coffee'
import { SearchParams, PlaceField, DateType } from 'form/components/avia_form/avia_form.types'
import { getDate, getPlace } from 'form/components/avia_form/utils'
import {
  HotelParamState,
  UpdateHotelParamsAction,
  ResetHotelParamsAction,
} from '../types/hotel_params.types'
import { addDays } from 'finity-js'

const { getTripType } = require('trip_helper.coffee')

export const initialState: HotelParamState = Object.freeze(getInitialParams())

export default (state = initialState, action: UpdateHotelParamsAction | ResetHotelParamsAction) => {
  switch (action.type) {
    case 'UPDATE_HOTEL_PARAMS':
      return { ...state, ...action.params, tripType: getTripType(action.params) }

    case 'RESET_HOTEL_PARAMS':
      return initialState

    default:
      return state
  }
}

function getInitialParams(): HotelParamState {
  let params: SearchParams = TripParams.getNormalizedParams()

  const checkIn = getDate(params.segments, DateType.DepartDate) as Date
  let checkOut = getDate(params.segments, DateType.ReturnDate)
  if (!checkOut && checkIn) {
    checkOut = addDays(checkIn, 1)
  }
  const { adults = 1, children = 0, infants = 0 } = params.passengers
  const childrenAge = [...childrenAges(children, 7), ...childrenAges(infants, 2)].slice(0, 3)
  return {
    checkIn,
    checkOut,
    adults,
    childrenAge,
    children: Math.min(3, children + infants),
    destination: getPlace(params.segments, PlaceField.Destination),
  } as HotelParamState
}

function childrenAges(count: number, age: number): number[] {
  const res: number[] = []
  for (let i = 0; i < count; i++) {
    res.push(age)
  }
  return res
}
