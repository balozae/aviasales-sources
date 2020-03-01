export const USER_ACCOUNT_GOAL = 'USER_ACCOUNT_GOAL'
export const USER_ACCOUNT_GOAL_ONCE = 'USER_ACCOUNT_GOAL_ONCE'
export const USER_ACCOUNT_GOAL_ON_URL = 'USER_ACCOUNT_GOAL_ON_URL'
export const USER_ACCOUNT_SEND_TIMING = 'USER_ACCOUNT_SEND_TIMING'

type UserAccountGoalAction = { type: typeof USER_ACCOUNT_GOAL; event: string; data: any }
type UserAccountGoalOnceAction = { type: typeof USER_ACCOUNT_GOAL_ONCE; event: string; data: any }
type UserAccountGoalOnUrlAction = {
  type: typeof USER_ACCOUNT_GOAL_ON_URL
  event: string
  data: any
  url: string
}
type UserAccountSendTimingAction = {
  type: typeof USER_ACCOUNT_SEND_TIMING
  event: string
  data: any
}

export type UserAccountMetricsActions =
  | UserAccountGoalAction
  | UserAccountGoalOnceAction
  | UserAccountGoalOnUrlAction
  | UserAccountSendTimingAction
