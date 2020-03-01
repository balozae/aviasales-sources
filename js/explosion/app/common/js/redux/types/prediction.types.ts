export const UPDATE_MATRIX_PRICES = 'UPDATE_MATRIX_PRICES'
export const UPDATE_GRAPH_PRICES = 'UPDATE_GRAPH_PRICES'
export const UPDATE_MATRIX_ONLY_DIRECT = 'UPDATE_MATRIX_ONLY_DIRECT'
export const UPDATE_GRAPH_TRIP_DURATION = 'UPDATE_GRAPH_TRIP_DURATION'
export const RESET_PREDICTION = 'RESET_PREDICTION'

interface UpdateMatrixPricesAction {
  type: typeof UPDATE_MATRIX_PRICES
  prices: any
}

interface UpdateGraphPricesAction {
  type: typeof UPDATE_GRAPH_PRICES
  prices: any
}

interface UpdateMatrixOnlyDirectAction {
  type: typeof UPDATE_MATRIX_ONLY_DIRECT
  isOnlyDirect: boolean
}

interface UpdateGraphTripDurationAction {
  type: typeof UPDATE_GRAPH_TRIP_DURATION
  tripDuration: any
}

interface ResetPredictionAction {
  type: typeof RESET_PREDICTION
}

export type PredictionActions =
  | UpdateMatrixPricesAction
  | UpdateGraphPricesAction
  | UpdateMatrixOnlyDirectAction
  | UpdateGraphTripDurationAction
  | ResetPredictionAction

export type PredictionState = {
  matrix: {
    initialPrices: any
    prices: any
    isOnlyDirect: boolean
  }
  graph: {
    initialPrices: any
    prices: any
    tripDuration: number | null
  }
}
