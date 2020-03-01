import sessionStorageHelper from 'common/js/session_storage_helper'
import {
  SHOW_SUBSCRIPTIONS_INFORMER,
  HIDE_SUBSCRIPTIONS_INFORMER,
  SUBSCRIPTIONS_INFORMER_SESSION_STORAGE_FLAG,
  SubscriptionsInformerState,
  SubscriptionsInformerActionTypes,
} from '../types/subscriptions_informer.types'

export const initialState: SubscriptionsInformerState = {
  active: false,
  wasShown: !!sessionStorageHelper.getItem(SUBSCRIPTIONS_INFORMER_SESSION_STORAGE_FLAG),
}

export default function(
  state: SubscriptionsInformerState = initialState,
  action: SubscriptionsInformerActionTypes,
) {
  switch (action.type) {
    case SHOW_SUBSCRIPTIONS_INFORMER:
      return {
        ...state,
        active: true,
      }
    case HIDE_SUBSCRIPTIONS_INFORMER:
      return {
        active: false,
        wasShown: true,
      }
    default:
      return state
  }
}
