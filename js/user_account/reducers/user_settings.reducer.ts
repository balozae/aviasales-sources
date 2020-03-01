import {
  UPDATE_USER_SETTING,
  UPDATE_ALL_USER_SETTINGS,
  UserSettingsState,
  UserSettingsActionTypes,
} from 'user_account/types/user_settings.types'
import guestia from 'guestia/client'

const initialState: UserSettingsState = guestia.getAllSettings()

export const userSettings = (
  state: UserSettingsState = initialState,
  action: UserSettingsActionTypes,
): UserSettingsState => {
  switch (action.type) {
    case UPDATE_USER_SETTING:
      return {
        ...state,
        [action.key]: action.value,
      }
    case UPDATE_ALL_USER_SETTINGS:
      return { ...action.settings }
    default:
      return state
  }
}

export default userSettings
