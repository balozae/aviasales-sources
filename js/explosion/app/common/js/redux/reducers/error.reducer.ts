import { ErrorState, ErrorActions, SET_ERROR, RESET_ERROR } from '../types/error.types'

export const initialState: ErrorState = null

export default function(state: ErrorState = initialState, action: ErrorActions) {
  switch (action.type) {
    case SET_ERROR:
      return action.error
    case RESET_ERROR:
      return null
    default:
      return state
  }
}
