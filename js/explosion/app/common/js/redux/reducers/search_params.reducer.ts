import {
  SearchParamsState,
  SearchParamsActions,
  UPDATE_SEARCH_DATA,
  UPDATE_SEARCH_PARAMS,
} from '../types/search_params.types'
import { UPDATE_CURRENCY } from '../types/currency.types'

export const initialState: SearchParamsState = null

export default function(
  state: SearchParamsState = initialState,
  action: SearchParamsActions,
): SearchParamsState {
  switch (action.type) {
    case UPDATE_SEARCH_DATA:
      if (action.segments) {
        return _assignParams(state, { segments: action.segments, market: action.market })
      }

      return state
    case UPDATE_SEARCH_PARAMS:
      return _extendByHelpers({
        ...action.data.params,
        request_id: action.data.request_id,
      })
    case UPDATE_CURRENCY:
      return _assignParams(state, { currency: action.currency })
    default:
      return state
  }
}

/**
 *
 * @param state
 * @param data
 * @private
 */
function _assignParams(state, data) {
  const params = { ...state, ...data }
  if (params.segments) {
    params.segments = params.segments.map((segment, index) =>
      Object.assign(
        {},
        (state.segments != null ? state.segments[index] : undefined) || {},
        segment,
      ),
    )

    // eslint-disable-next-line no-use-before-define
    _extendByHelpers(params)
  }
  return params
}

// Any helpers for params
function _extendByHelpers(params) {
  params.isOneWay = params.segments.length > 1 ? false : true
  if (params.segments[0].destination_name) {
    params.destinationName = params.segments[0].destination_name
  }
  if (params.segments[0].destination_cases) {
    params.destinationCases = params.segments[0].destination_cases
  }
  if (params.segments[0].origin_name) {
    params.originName = params.segments[0].origin_name
  }
  if (params.segments[0].origin_cases) {
    params.originCases = params.segments[0].origin_cases
  }

  params.isPlacesRestored = true
  params.originCityIata = params.segments[0].origin_city_iata || params.segments[0].origin
  params.destinationCityIata =
    params.segments[0].destination_city_iata || params.segments[0].destination

  return params
}
