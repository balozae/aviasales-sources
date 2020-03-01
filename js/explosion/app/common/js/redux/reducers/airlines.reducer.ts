import { AirlinesState } from '../types/airlines.types'
import { UPDATE_SEARCH_DATA, SearchParamsActions } from '../types/search_params.types'
import { Airlines } from 'shared_components/ticket/ticket.types'

export const initialState: AirlinesState = Object.freeze({})

export default function(state: AirlinesState = initialState, action: SearchParamsActions) {
  switch (action.type) {
    case UPDATE_SEARCH_DATA: {
      let newState = Object.assign({}, state)
      if (action.airlines) {
        newState = addAirlines(newState, action.airlines)
      }
      if (action.airlineRules) {
        newState = extendAirlines(newState, 'bags', action.airlineRules)
      }
      if (action.airlineFeatures) {
        newState = extendAirlines(newState, 'wifi', action.airlineFeatures)
      }
      if (action.tariffMapping) {
        newState = extendAirlines(newState, 'tariffs', action.tariffMapping)
      }
      return newState
    }
    default:
      return state
  }
}

function addAirlines(state: AirlinesState, airlines: Airlines) {
  let airline, iata
  const newAirlines = {}
  for (iata in airlines) {
    airline = airlines[iata]
    if (!(state[iata] != null ? state[iata].iata : undefined)) {
      newAirlines[iata] = airline
    }
  }
  if (Object.keys(newAirlines).length === 0) {
    return state
  } else {
    state = Object.assign({}, state)
    for (iata in newAirlines) {
      airline = newAirlines[iata]
      state[iata] = Object.assign({}, state[iata], airline)
    }
    return state
  }
}

function extendAirlines(state, feature, values) {
  if (Object.keys(values).length === 0) {
    return state
  } else {
    const airlines = Object.assign({}, state)
    for (let iata in values) {
      const value = values[iata]
      airlines[iata] = Object.assign({}, state[iata], { [feature]: value })
    }
    return airlines
  }
}
