import { RequestStatus } from 'common/types'
import {
  USER_INFO_REQUEST,
  USER_INFO_SUCCESS,
  USER_INFO_FAILURE,
  SET_USER_PROMOS_COUNT,
  SET_USER_LOGGED_OUT,
  SET_USER_TYPE,
  UserInfoActionTypes,
  UserInfoState,
  UPDATE_USER_INFO,
} from 'user_account/types/user_info.types'

const initialState: UserInfoState = {
  data: null,
  error: null,
  fetchStatus: RequestStatus.Idle,
  userType: 'unknown',
}

export const userInfo = (
  state: UserInfoState = initialState,
  action: UserInfoActionTypes,
): UserInfoState => {
  switch (action.type) {
    case USER_INFO_REQUEST:
      return {
        ...state,
        fetchStatus: RequestStatus.Pending,
        error: null,
      }
    case USER_INFO_SUCCESS:
      return {
        ...state,
        data: action.data,
        fetchStatus: RequestStatus.Success,
        userType: 'authorized',
      }
    case USER_INFO_FAILURE:
      return {
        ...state,
        data: null,
        error: action.error,
        fetchStatus: RequestStatus.Failure,
        userType: 'nonauthorized',
      }
    case SET_USER_PROMOS_COUNT:
      return {
        ...state,
        promosCount: action.count,
      }
    case SET_USER_TYPE:
      return {
        ...state,
        userType: action.userType,
      }
    case SET_USER_LOGGED_OUT:
      return initialState
    case UPDATE_USER_INFO:
      return { ...state, data: { ...state.data!, ...action.data } }
    default:
      return state
  }
}

export default userInfo
