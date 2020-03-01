import { AirportsState, AddAirportsAction } from '../types/airports.types'

export const initialState: AirportsState = Object.freeze({})

export default function(state: AirportsState = initialState, action: AddAirportsAction) {
  switch (action.type) {
    case 'ADD_AIRPORTS':
      return action.airports
    default:
      return state
  }
}
