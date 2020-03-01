import { ThunkAction } from 'redux-thunk'
import { AppState } from '../types/root/explosion'
import {
  HIDE_SUBSCRIPTIONS_INFORMER,
  SHOW_SUBSCRIPTIONS_INFORMER,
  SUBSCRIPTIONS_INFORMER_SESSION_STORAGE_FLAG,
  SubscriptionsInformerActionTypes,
} from '../types/subscriptions_informer.types'
import sessionStorageHelper from 'common/js/session_storage_helper'

export const showSubscriptionsInformer = (): ThunkAction<
  void,
  AppState,
  void,
  SubscriptionsInformerActionTypes
> => (dispatch: Function, getState) => {
  if (getState().subscriptionsInformer.wasShown) {
    return
  }

  dispatch({
    type: SHOW_SUBSCRIPTIONS_INFORMER,
  })
}

export const hideSubscriptionsInformer = (): SubscriptionsInformerActionTypes => {
  sessionStorageHelper.setItem(SUBSCRIPTIONS_INFORMER_SESSION_STORAGE_FLAG, 'true')

  return {
    type: HIDE_SUBSCRIPTIONS_INFORMER,
  }
}
