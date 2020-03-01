export const SET_ERROR = 'SET_ERROR'
export const RESET_ERROR = 'RESET_ERROR'

export type Error = any

interface SetErrorAction {
  type: typeof SET_ERROR
  error: Error
}

interface ResetErrorAction {
  type: typeof RESET_ERROR
}

export type ErrorActions = SetErrorAction | ResetErrorAction

export type ErrorState = Error
