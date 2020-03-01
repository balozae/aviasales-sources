import guestia, { GuestiaSettings } from 'guestia/client'
import { ThunkAction } from 'redux-thunk'
import {
  UPDATE_USER_SETTING,
  UPDATE_ALL_USER_SETTINGS,
  UserSettingsActionTypes,
} from 'user_account/types/user_settings.types'
import { AppState, AppActions } from 'user_account/types/app.types'
import rollbar from 'common/utils/rollbar'
import { userAccountGoal } from './metrics.actions'

const updateUserSetting = (key: string, value: string): UserSettingsActionTypes => ({
  type: UPDATE_USER_SETTING,
  key,
  value,
})

export const updateAllUserSettings = (settings: GuestiaSettings): UserSettingsActionTypes => ({
  type: UPDATE_ALL_USER_SETTINGS,
  settings,
})

export const setUserSetting = (
  key: string,
  value: string,
): ThunkAction<void, AppState, void, AppActions> => async (dispatch) => {
  try {
    guestia.setSettings(key, value)
    dispatch(updateUserSetting(key, value))
    dispatch(userAccountGoal('setting-updated', { key, value }))
  } catch (error) {
    rollbar.warn('Cant set user settings', error)
  }
}
