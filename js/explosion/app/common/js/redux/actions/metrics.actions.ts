import {
  MetricsActions,
  REACH_GOAL,
  REACH_GOAL_ONCE,
  REACH_GOAL_ON_URL,
  SEND_TIMING,
  SEND_FACEBOOK_PARAMS,
} from '../types/metrics.types'

export const reachGoal = (event: string, data?: any): MetricsActions => ({
  type: REACH_GOAL,
  event,
  data,
})

export const reachGoalOnce = (event: string, data?: any): MetricsActions => ({
  type: REACH_GOAL_ONCE,
  event,
  data,
})

export const reachGoalOnUrl = (event: string, data: any, url: string): MetricsActions => ({
  type: REACH_GOAL_ON_URL,
  event,
  data,
  url,
})

export const sendTiming = (event: string, data?: any): MetricsActions => ({
  type: SEND_TIMING,
  event,
  data,
})

export const sendFacebookParams = (params?: any): MetricsActions => ({
  type: SEND_FACEBOOK_PARAMS,
  params,
})
