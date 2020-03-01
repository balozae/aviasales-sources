export const UPDATE_CHEAPEST_STOPS = 'UPDATE_CHEAPEST_STOPS'
export const RESET_CHEAPEST_STOPS = 'RESET_CHEAPEST_STOPS'

export type CheapestStops = any

interface UpdateCheapestStopsAction {
  type: typeof UPDATE_CHEAPEST_STOPS
  cheapestStops: CheapestStops
}

interface ResetCheapestStopsAction {
  type: typeof RESET_CHEAPEST_STOPS
}

export type CheapestStopsActions = UpdateCheapestStopsAction | ResetCheapestStopsAction

export type CheapestStopsState = CheapestStops
