import guestia from 'guestia/client'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import {
  USER_INFO_REQUEST,
  USER_INFO_SUCCESS,
  USER_INFO_FAILURE,
  SET_USER_PROMOS_COUNT,
  SET_USER_LOGGED_OUT,
  SET_USER_TYPE,
  UserInfoActionTypes,
  UserType,
  UPDATE_USER_INFO,
  ACTIVATE_USER_EMAIL,
} from 'user_account/types/user_info.types'
import { CommonErrorType } from 'user_account/types/common_error.types'
import { setCommonError } from './common_error.actions'
import { AppState, AppActions } from 'user_account/types/app.types'
import { UserInfo, AvailableLoginMethods, EmailInfo } from 'guestia_client/lib/types'
import { updateAllUserSettings } from './user_settings.actions'
import { fetchUserPromosCount } from 'user_account/utils/common'
import loadScript from 'assisted/utils/load_script'
import { userAccountGoal } from 'user_account/actions/metrics.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { actualizeTicketSubscriber } from 'common/js/redux/actions/ticket_subscriptions.actions'
import { initFCM } from './fcm.actions'

declare global {
  interface Window {
    openyolo: any
    onGoogleYoloLoad(googleyolo: any): void
  }
}

const PUBLIC_CLIENT_ID = '898676391515-g5p7ih2rij9q1r4tscd801h0oe5skqqr.apps.googleusercontent.com'
const ONE_TAP_AUTH_CONFIG = {
  supportedAuthMethods: ['https://accounts.google.com'],
  supportedIdTokenProviders: [
    {
      uri: 'https://accounts.google.com',
      clientId: PUBLIC_CLIENT_ID,
    },
  ],
}

export const userInfoRequest = (): UserInfoActionTypes => ({
  type: USER_INFO_REQUEST,
})

export const userInfoSuccess = (userInfo: UserInfo): UserInfoActionTypes => ({
  type: USER_INFO_SUCCESS,
  data: userInfo,
})

export const userInfoFailure = (error: CommonErrorType): UserInfoActionTypes => ({
  type: USER_INFO_FAILURE,
  error,
})

export const setUserPromosCount = (count: number): UserInfoActionTypes => ({
  type: SET_USER_PROMOS_COUNT,
  count,
})

export const setUserLoggedOut = (): UserInfoActionTypes => ({
  type: SET_USER_LOGGED_OUT,
})

export const setUserType = (userType: UserType): UserInfoActionTypes => ({
  type: SET_USER_TYPE,
  userType,
})

export const updateUserInfo = (userInfo: Partial<UserInfo>): UserInfoActionTypes => ({
  type: UPDATE_USER_INFO,
  data: userInfo,
})

export const activateUserEmail = (email: string): UserInfoActionTypes => ({
  type: ACTIVATE_USER_EMAIL,
  email,
})

export const fetchUserInfo = (): ThunkAction<void, AppState, void, AppActions> => async (
  dispatch,
) => {
  dispatch(userInfoRequest())
  try {
    const { userInfo } = await guestia.getUserInfo()
    dispatch(userInfoSuccess(userInfo))
  } catch (error) {
    let errorType: CommonErrorType = 'unknown'
    // TODO: server error
    if (error === 'User is not authorized') {
      errorType = 'unauthorized'
    }
    dispatch(userInfoFailure(errorType))
    dispatch(setCommonError(errorType))
  }
}

export const userLoggedIn = (
  userInfo?: UserInfo,
): ThunkAction<void, AppState, void, AppActions> => async (dispatch) => {
  dispatch(updateAllUserSettings(guestia.getAllSettings()))
  if (!userInfo) {
    dispatch(fetchUserInfo())
  } else {
    dispatch(userInfoSuccess(userInfo))
  }
  const promosCount = await fetchUserPromosCount()
  if (promosCount) {
    dispatch(setUserPromosCount(promosCount))
  }

  if (Notification && Notification.permission === 'granted') {
    dispatch(initFCM())
  }
}

export const userLogout = (): ThunkAction<void, AppState, void, any> => async (
  dispatch,
  getState,
) => {
  const { userInfo } = getState()
  await guestia.logout()
  dispatch(setUserLoggedOut())
  dispatch(userAccountGoal('user-logout', { userInfo: userInfo.data }))
  if (window.isUserPage) {
    window.location.href = '/'
  }
}

export const userLogin = (
  method: AvailableLoginMethods,
): ThunkAction<void, AppState, void, AppActions> => async (dispatch) => {
  try {
    const { userInfo } = await guestia.login(method)
    dispatch(userLoggedIn(userInfo))
    dispatch(reachUserGoal('user-login', { userInfo }))
    dispatch(actualizeTicketSubscriber())
  } catch (error) {
    console.error(error)
  }
}

export const userOneTapAuth = (): ThunkAction<void, AppState, void, AppActions> => async (
  dispatch,
) => {
  window.onGoogleYoloLoad = (googleyolo) => {
    window.openyolo.setRenderMode('navPopout')
    googleyolo.hint(ONE_TAP_AUTH_CONFIG).then(async (credential) => {
      try {
        const { userInfo } = await guestia.jwtAuth('google', credential.idToken)
        dispatch(userLoggedIn(userInfo))
        dispatch(reachUserGoal('user-login', { userInfo }))
        dispatch(actualizeTicketSubscriber())
      } catch (error) {
        console.error(error)
      }
    })
  }
  loadScript('https://smartlock.google.com/client')
}

export const userAuthorize = (): ThunkAction<void, AppState, void, AppActions> => async (
  dispatch,
) => {
  try {
    const { jwt } = await guestia.authorize()
    if (jwt) {
      dispatch(userLoggedIn())
    } else {
      dispatch(setUserType('nonauthorized'))
      dispatch(userOneTapAuth())
    }
  } catch (error) {
    console.error(error)
  }
}

export const userNavbarDropdown = (
  isShown: boolean,
): ThunkAction<void, AppState, void, AppActions> => (dispatch, getState) => {
  const { userInfo } = getState()
  dispatch(reachUserGoal('user-navbar-dropdown', { isShown, isAuthorized: !!userInfo.data }))
}

const reachUserGoal = (event: string, data?: any): ThunkAction<void, AppState, void, AnyAction> => (
  dispatch,
) => {
  if (window.isUserPage) {
    dispatch(userAccountGoal(event, data))
  } else {
    dispatch(reachGoal(event, data))
  }
}
