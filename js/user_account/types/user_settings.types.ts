import { GuestiaSettings } from 'guestia/client'

export const UPDATE_USER_SETTING = 'UPDATE_USER_SETTING'
export const UPDATE_ALL_USER_SETTINGS = 'UPDATE_ALL_USER_SETTINGS'

export type UserSettingsState = GuestiaSettings

interface SetUserSettingAction {
  type: typeof UPDATE_USER_SETTING
  key: string
  value: string
}

interface UpdateAllUserSettingAction {
  type: typeof UPDATE_ALL_USER_SETTINGS
  settings: GuestiaSettings
}

export type UserSettingsActionTypes = SetUserSettingAction | UpdateAllUserSettingAction
