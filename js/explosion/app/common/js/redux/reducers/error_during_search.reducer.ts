import {
  ErrorDuringSearchState,
  ErrorDuringSearchActions,
  SET_ERROR_DURING_SEARCH,
  REMOVE_ERROR_DURING_SEARCH,
} from '../types/error_during_search.types'

export const initialState: ErrorDuringSearchState = false

export default function(
  state: ErrorDuringSearchState = initialState,
  action: ErrorDuringSearchActions,
) {
  switch (action.type) {
    case SET_ERROR_DURING_SEARCH: {
      return true
    }
    case REMOVE_ERROR_DURING_SEARCH: {
      return false
    }
    default:
      return state
  }
}
