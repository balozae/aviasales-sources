import { FlightInfoState, AddFlightInfoAction } from '../types/flight_info.types'

export const initialState: FlightInfoState = Object.freeze({})

export default function(state: FlightInfoState = initialState, action: AddFlightInfoAction) {
  switch (action.type) {
    case 'ADD_FLIGHT_INFO':
      return action.flightInfo
    default:
      return state
  }
}
