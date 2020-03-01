import TripParams from 'utils/trip_params.coffee'
import { DEFAULT_SEGMENT } from 'form/components/avia_form/avia_form.constants'
import {
  MultiwayParamsState,
  MultiwayParamsActions,
  UPDATE_MULTIWAY_PARAMS,
  RESET_MULTIWAY_PARAMS,
} from '../types/multiway_params.types'

const { getTripType } = require('trip_helper.coffee')

export const initialState: MultiwayParamsState = Object.freeze(getInitialParams())

export default (state = initialState, action: MultiwayParamsActions) => {
  switch (action.type) {
    case UPDATE_MULTIWAY_PARAMS:
      return { ...state, ...action.params, tripType: getTripType(action.params) }

    case RESET_MULTIWAY_PARAMS:
      return initialState

    default:
      return state
  }
}

function getInitialParams(): MultiwayParamsState {
  const tripParams: MultiwayParamsState = TripParams.getNormalizedParams()

  if (!tripParams.segments.length) {
    return { ...tripParams, segments: [DEFAULT_SEGMENT] }
  }

  return tripParams
}
