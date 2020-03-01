import TripParams from 'utils/trip_params.coffee'
import { PlaceField } from 'form/components/avia_form/avia_form.types'
import { getPlace } from 'form/components/avia_form/utils'
import {
  AviaParamsState,
  AviaParamsActions,
  UPDATE_AVIA_PARAMS,
  RESET_AVIA_PARAMS,
  SET_ACTIVE_DATE_INPUT,
} from '../types/avia_params.types'

const { getTripType } = require('trip_helper.coffee')

export const initialState: AviaParamsState = Object.freeze(getInitialParams())

export default (state = initialState, action: AviaParamsActions) => {
  switch (action.type) {
    case UPDATE_AVIA_PARAMS:
      return { ...state, ...action.params, tripType: getTripType(action.params) }

    case SET_ACTIVE_DATE_INPUT:
      return { ...state, activeDateInput: action.activeInput }

    case RESET_AVIA_PARAMS:
      return initialState

    default:
      return state
  }
}

function getInitialParams(): AviaParamsState {
  const tripParams: AviaParamsState = TripParams.getNormalizedParams()

  if (!TripParams.isOpenJaw(tripParams.segments)) {
    return tripParams
  }

  const origin = getPlace(tripParams.segments, PlaceField.Origin)
  const destination = getPlace(tripParams.segments, PlaceField.Destination)
  const directSegment = { ...tripParams.segments[0], origin, destination }
  const returnSegment = { ...tripParams.segments[1], origin: destination, destination: origin }

  return { ...tripParams, segments: [directSegment, returnSegment] }
}
