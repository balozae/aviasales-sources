import store from '../store'
import { reachGoal, sendTiming } from './metrics.actions'

// tslint:disable:variable-name

export const UNSAFE_reachGoal = (event: string, data?: any) =>
  store.dispatch(reachGoal(event, data))

export const UNSAFE_sendTiming = (event: string, data?: any) =>
  store.dispatch(sendTiming(event, data))
