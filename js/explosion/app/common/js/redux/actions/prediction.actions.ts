import {
  PredictionActions,
  UPDATE_GRAPH_PRICES,
  UPDATE_MATRIX_PRICES,
  UPDATE_GRAPH_TRIP_DURATION,
  UPDATE_MATRIX_ONLY_DIRECT,
  RESET_PREDICTION,
} from '../types/prediction.types'

export const updateGraphPrices = (prices): PredictionActions => ({
  type: UPDATE_GRAPH_PRICES,
  prices,
})

export const updateMatrixPrices = (prices): PredictionActions => ({
  type: UPDATE_MATRIX_PRICES,
  prices,
})

export const updateGraphTripDuration = (tripDuration): PredictionActions => ({
  type: UPDATE_GRAPH_TRIP_DURATION,
  tripDuration,
})

export const updateMatrixOnlyDirect = (isOnlyDirect: boolean): PredictionActions => ({
  type: UPDATE_MATRIX_ONLY_DIRECT,
  isOnlyDirect,
})

export const resetPrediction = (): PredictionActions => ({ type: RESET_PREDICTION })
