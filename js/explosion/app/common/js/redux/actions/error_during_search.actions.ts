import {
  SET_ERROR_DURING_SEARCH,
  ErrorDuringSearchActions,
  REMOVE_ERROR_DURING_SEARCH,
} from '../types/error_during_search.types'

export const setErrorDuringSearch = (): ErrorDuringSearchActions => ({
  type: SET_ERROR_DURING_SEARCH,
})

export const removeErrorDuringSearch = (): ErrorDuringSearchActions => ({
  type: REMOVE_ERROR_DURING_SEARCH,
})
