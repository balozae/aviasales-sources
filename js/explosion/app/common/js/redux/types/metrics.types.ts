export const REACH_GOAL = 'REACH_GOAL'
export const REACH_GOAL_ONCE = 'REACH_GOAL_ONCE'
export const REACH_GOAL_ON_URL = 'REACH_GOAL_ON_URL'
export const SEND_TIMING = 'SEND_TIMING'
export const SEND_FACEBOOK_PARAMS = 'SEND_FACEBOOK_PARAMS'

interface ReachGoalAction {
  type: typeof REACH_GOAL
  event: string
  data: any
}
interface ReachGoalOnceAction {
  type: typeof REACH_GOAL_ONCE
  event: string
  data: any
}
type ReachGoalOnUrlAction = {
  type: typeof REACH_GOAL_ON_URL
  event: string
  data: any
  url: string
}
interface SendTimingAction {
  type: typeof SEND_TIMING
  event: string
  data: any
}

interface SendFacebookParamsAction {
  type: typeof SEND_FACEBOOK_PARAMS
  params: any
}

export type MetricsActions =
  | ReachGoalAction
  | ReachGoalOnceAction
  | ReachGoalOnUrlAction
  | SendTimingAction
  | SendFacebookParamsAction
