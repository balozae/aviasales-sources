import {
  UserAccountMetricsActions,
  USER_ACCOUNT_GOAL,
  USER_ACCOUNT_GOAL_ONCE,
  USER_ACCOUNT_GOAL_ON_URL,
  USER_ACCOUNT_SEND_TIMING,
} from 'user_account/types/metrics.types'

export const userAccountGoal = (event: string, data?: any): UserAccountMetricsActions => ({
  type: USER_ACCOUNT_GOAL,
  event,
  data,
})

export const userAccountGoalOnce = (event: string, data?: any): UserAccountMetricsActions => ({
  type: USER_ACCOUNT_GOAL_ONCE,
  event,
  data,
})

export const userAccountGoalOnUrl = (
  event: string,
  data: any,
  url: string,
): UserAccountMetricsActions => ({
  type: USER_ACCOUNT_GOAL_ON_URL,
  event,
  data,
  url,
})

export const userAccountSendTiming = (event: string, data?: any): UserAccountMetricsActions => ({
  type: USER_ACCOUNT_SEND_TIMING,
  event,
  data,
})
