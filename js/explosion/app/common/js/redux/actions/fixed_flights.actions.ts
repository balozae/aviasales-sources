import {
  FixedFlightsActions,
  TOGGLE_FIXED_FLIGHTS,
  CLEAR_FIXED_FLIGHTS,
} from '../types/fixed_flights.types'

export const toggleFixedFlights = (signs: string[], isActive: boolean): FixedFlightsActions => ({
  type: TOGGLE_FIXED_FLIGHTS,
  signs,
  isActive,
})

export const clearFixedFlights = (): FixedFlightsActions => ({ type: CLEAR_FIXED_FLIGHTS })
