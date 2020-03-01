import {
  FixedFlightsState,
  TOGGLE_FIXED_FLIGHTS,
  CLEAR_FIXED_FLIGHTS,
  FixedFlightsActions,
} from '../types/fixed_flights.types'

export const initialState: FixedFlightsState = []

export default (state: FixedFlightsState = initialState, action: FixedFlightsActions) => {
  switch (action.type) {
    case TOGGLE_FIXED_FLIGHTS: {
      if (action.isActive) {
        return state.filter((sign) => !action.signs.includes(sign))
      }

      return [...state, ...action.signs.filter((sign) => !state.includes(sign))]
    }

    case CLEAR_FIXED_FLIGHTS:
      return initialState
    default:
      return state
  }
}
