import {
  CheapestStops,
  UPDATE_CHEAPEST_STOPS,
  CheapestStopsActions,
} from '../types/cheapest_stops.types'

export const updateCheapestStops = (cheapestStops: CheapestStops): CheapestStopsActions => ({
  type: UPDATE_CHEAPEST_STOPS,
  cheapestStops,
})
