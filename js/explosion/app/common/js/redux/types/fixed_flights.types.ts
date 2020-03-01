export const TOGGLE_FIXED_FLIGHTS = 'TOGGLE_FIXED_FLIGHTS'
export const CLEAR_FIXED_FLIGHTS = 'CLEAR_FIXED_FLIGHTS'

export type ToggleFixedFlightAction = {
  type: typeof TOGGLE_FIXED_FLIGHTS
  isActive: boolean
  signs: string[]
}

export type ClearFixedFlightAction = {
  type: typeof CLEAR_FIXED_FLIGHTS
}

export type FixedFlightsActions = ToggleFixedFlightAction | ClearFixedFlightAction

export type FixedFlightsState = string[]
