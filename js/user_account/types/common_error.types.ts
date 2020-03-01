export type CommonErrorType = 'unauthorized' | 'serverError' | '404' | 'unknown'

export const SET_COMMON_ERROR = 'SET_COMMON_ERROR'
export const RESET_COMMON_ERROR = 'RESET_COMMON_ERROR'

export type CommonErrorState = CommonErrorType | null

interface SetCommonErrorAction {
  type: typeof SET_COMMON_ERROR
  errorType: CommonErrorType
}

interface ResetCommonErrorAction {
  type: typeof RESET_COMMON_ERROR
}

export type CommonErrorActionTypes = SetCommonErrorAction | ResetCommonErrorAction
