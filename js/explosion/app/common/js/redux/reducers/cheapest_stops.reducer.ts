import {
  CheapestStopsState,
  CheapestStopsActions,
  UPDATE_CHEAPEST_STOPS,
  RESET_CHEAPEST_STOPS,
} from '../types/cheapest_stops.types'

export const initialState: CheapestStopsState = Object.freeze({})

export default function(state: CheapestStopsState = initialState, action: CheapestStopsActions) {
  switch (action.type) {
    case UPDATE_CHEAPEST_STOPS:
      return action.cheapestStops
    case RESET_CHEAPEST_STOPS:
      return initialState
    default:
      return state
  }
}
