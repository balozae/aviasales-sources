import { createSelector } from 'reselect'
import { AppState } from 'common/js/redux/types/root/explosion'
import { UserInfoState } from 'user_account/types/user_info.types'
import { UserSettingsState } from 'user_account/types/user_settings.types'

const getUserSettings = (state: AppState): UserSettingsState => state.userSettings
export const getUserInfo = (state: AppState): UserInfoState => state.userInfo

const filterNullString = (str: string) => (str === 'null' ? '' : str)

const getEmailFromSettings = createSelector(
  getUserSettings,
  (settings: UserSettingsState): string => filterNullString(settings.email),
)

export const getUserInfoData = (state: AppState) => getUserInfo(state).data

export const getIsAuthorized = createSelector(getUserInfoData, (userInfo) => !!userInfo)

export const getEmailFromUserInfoData = createSelector(
  getUserInfoData,
  (data: UserInfoState['data']): string => {
    if (data && data.details && data.details.email) {
      return filterNullString(data.details.email[0]) || ''
    }
    return ''
  },
)

export const getUserActivatedEmail = createSelector(
  getUserInfoData,
  (userInfo) => (userInfo ? userInfo.email_info.active_email : null),
)

export const getUserEmailForSubscription = (state: AppState) => {
  return getUserActivatedEmail(state) || getUserCandidateEmail(state)
}

// NOTE: the emailFromSetting has a higher priority than the emailFromInfo
export const getUserEmail = createSelector(
  [getEmailFromSettings, getEmailFromUserInfoData],
  (emailFromSettings, emailFromInfo): string => {
    return emailFromSettings ? emailFromSettings : emailFromInfo
  },
)

export const getUserEmailInfo = (state: AppState) => {
  const userInfoData = getUserInfoData(state)

  if (userInfoData) {
    return userInfoData.email_info
  }
}

export const getUserCandidateEmail = (state: AppState) => {
  const userEmailInfo = getUserEmailInfo(state)

  if (userEmailInfo) {
    return userEmailInfo.candidate_email
  }
}

export const getUserEmailActivationStatus = (state: AppState) => {
  const userEmailInfo = getUserEmailInfo(state)

  if (userEmailInfo) {
    return userEmailInfo.activation_status
  }
}
