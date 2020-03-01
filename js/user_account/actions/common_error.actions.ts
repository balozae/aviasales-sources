import {
  SET_COMMON_ERROR,
  RESET_COMMON_ERROR,
  CommonErrorActionTypes,
  CommonErrorType,
} from 'user_account/types/common_error.types'

export const setCommonError = (errorType: CommonErrorType): CommonErrorActionTypes => ({
  type: SET_COMMON_ERROR,
  errorType,
})

export const resetCommonError = (): CommonErrorActionTypes => ({
  type: RESET_COMMON_ERROR,
})
