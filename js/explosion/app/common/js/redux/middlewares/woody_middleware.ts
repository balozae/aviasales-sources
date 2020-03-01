const serpMetrics = require('analytics/metrics')
import {
  CREATE_WOODY_SUBSCRIPTION_FAILURE,
  CREATE_WOODY_SUBSCRIPTION_SUCCESS,
  WoodySubscription,
} from '../types/woody_subscriptions.types'

const reachGoal = (event, data?) => {
  serpMetrics.reach_goal(event, { ...data })
}

// NOTE: specific for subscription_popup
export default (store) => (next: any) => (action: any) => {
  switch (action.type) {
    case CREATE_WOODY_SUBSCRIPTION_SUCCESS:
      const subscriptions: WoodySubscription[] = action.data
      // NOTE: subscriptions have already been sorted into action
      const current = subscriptions[subscriptions.length - 1]
      reachGoal('PROPHET_SUBSCRIBE_POPUP_SUBMITTED', { subscription_id: current.id })
      break
    case CREATE_WOODY_SUBSCRIPTION_FAILURE:
      reachGoal('PROPHET_SUBSCRIBE_POPUP_ERROR')
      break
    default:
      break
  }

  return next(action)
}
