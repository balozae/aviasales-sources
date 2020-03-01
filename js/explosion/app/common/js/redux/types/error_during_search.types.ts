export const SET_ERROR_DURING_SEARCH = 'SET_ERROR_DURING_SEARCH'
export const REMOVE_ERROR_DURING_SEARCH = 'REMOVE_ERROR_DURING_SEARCH'

interface SetErrorDuringSearchAction {
  type: typeof SET_ERROR_DURING_SEARCH
}

interface RemoveErrorDuringSearchAction {
  type: typeof REMOVE_ERROR_DURING_SEARCH
}

export type ErrorDuringSearchActions = SetErrorDuringSearchAction | RemoveErrorDuringSearchAction

export type ErrorDuringSearchState = boolean
