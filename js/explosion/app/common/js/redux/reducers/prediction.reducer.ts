import update from 'immutability-helper'
import { diff } from 'finity-js'
import dateUtils from 'common/js/utils_date.coffee'
import {
  PredictionState,
  PredictionActions,
  UPDATE_MATRIX_PRICES,
  UPDATE_GRAPH_PRICES,
  UPDATE_MATRIX_ONLY_DIRECT,
  UPDATE_GRAPH_TRIP_DURATION,
  RESET_PREDICTION,
} from '../types/prediction.types'
import { UPDATE_SEARCH_PARAMS, SearchParamsActions } from '../types/search_params.types'

export const initialState: PredictionState = Object.freeze({
  matrix: {
    initialPrices: null,
    prices: null,
    isOnlyDirect: false,
  },
  graph: {
    initialPrices: null,
    prices: null,
    tripDuration: null,
  },
})

export default function(
  state: PredictionState = initialState,
  action: PredictionActions | SearchParamsActions,
) {
  switch (action.type) {
    case UPDATE_MATRIX_PRICES:
      return update(state, {
        matrix: {
          prices: { $set: action.prices },
          initialPrices: {
            $set: state.matrix.initialPrices != null ? state.matrix.initialPrices : action.prices,
          },
        },
      })
    case UPDATE_GRAPH_PRICES:
      return update(state, {
        graph: {
          prices: { $set: action.prices },
          initialPrices: {
            $set: state.graph.initialPrices != null ? state.graph.initialPrices : action.prices,
          },
        },
      })
    case UPDATE_MATRIX_ONLY_DIRECT:
      return update(state, { matrix: { isOnlyDirect: { $set: action.isOnlyDirect } } })
    case UPDATE_GRAPH_TRIP_DURATION:
      return update(state, { graph: { tripDuration: { $set: action.tripDuration } } })
    case UPDATE_SEARCH_PARAMS: {
      const [there, back] = action.data.params.segments
      const departDate = dateUtils.dateWithoutTimezone(there.date)
      let tripDuration: number | null = null

      if (back) {
        const returnDate = dateUtils.dateWithoutTimezone(back.date)
        tripDuration = diff(returnDate, departDate)
      }

      return update(state, { graph: { tripDuration: { $set: tripDuration } } })
    }
    case RESET_PREDICTION:
      return initialState
    default:
      return state
  }
}
