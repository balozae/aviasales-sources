import { RequestStatus } from 'common/types'
import { UserInfo, EmailInfo } from 'guestia_client/lib/types'
import { CommonErrorType } from './common_error.types'

export const USER_INFO_REQUEST = 'USER_INFO_REQUEST'
export const USER_INFO_SUCCESS = 'USER_INFO_SUCCESS'
export const USER_INFO_FAILURE = 'USER_INFO_FAILURE'
export const SET_USER_PROMOS_COUNT = 'SET_USER_PROMOS_COUNT'
export const SET_USER_LOGGED_OUT = 'SET_USER_LOGGED_OUT'
export const SET_USER_TYPE = 'SET_USER_TYPE'
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO'
export const ACTIVATE_USER_EMAIL = 'ACTIVATE_USER_EMAIL'
export const ACTIVATE_USER_EMAIL_FAILURE = 'ACTIVATE_USER_EMAIL_FAILURE'

export type UserType = 'unknown' | 'authorized' | 'nonauthorized'

export type UserInfoState = {
  data: UserInfo | null
  error: string | null
  fetchStatus: RequestStatus
  promosCount?: number
  userType: UserType
}

interface UserInfoRequestAction {
  type: typeof USER_INFO_REQUEST
}

interface UserInfoSuccessAction {
  type: typeof USER_INFO_SUCCESS
  data: UserInfo
}

interface UserInfoFailureAction {
  type: typeof USER_INFO_FAILURE
  error: CommonErrorType
}

interface SetUserPromosCountAction {
  type: typeof SET_USER_PROMOS_COUNT
  count: number
}

interface UserLoggedOutAction {
  type: typeof SET_USER_LOGGED_OUT
}

interface SetUserType {
  type: typeof SET_USER_TYPE
  userType: UserType
}

interface UpdateUserInfo {
  type: typeof UPDATE_USER_INFO
  data: Partial<UserInfo>
}

export interface ActivateUserEmailAction {
  type: typeof ACTIVATE_USER_EMAIL
  email: string
}

export type UserInfoActionTypes =
  | UserInfoRequestAction
  | UserInfoSuccessAction
  | UserInfoFailureAction
  | SetUserPromosCountAction
  | UserLoggedOutAction
  | SetUserType
  | UpdateUserInfo
  | ActivateUserEmailAction
