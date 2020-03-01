import { ErrorActions, SET_ERROR, RESET_ERROR } from '../types/error.types'

export const setError = (error): ErrorActions => ({ type: SET_ERROR, error })

export const resetError = (): ErrorActions => ({ type: RESET_ERROR })
