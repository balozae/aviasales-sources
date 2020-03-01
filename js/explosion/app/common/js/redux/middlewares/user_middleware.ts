import { AnyAction, Middleware } from 'redux'
import { batchActions } from 'redux-batched-actions'
import { SET_USER_LOGGED_OUT, USER_INFO_SUCCESS } from 'user_account/types/user_info.types'
import { AppState } from '../types/root/explosion'
import { resetTicketSubscriptions } from '../actions/ticket_subscriptions.actions'
import {
  fetchWoodySubscriptions,
  resetWoodySubscriptions,
} from '../actions/woody_subscriptions.actions'

const userMiddleware: Middleware<{}, AppState, any> = (store) => (next) => async (action) => {
  switch (action.type) {
    case SET_USER_LOGGED_OUT:
      const resetUserDataActions: AnyAction[] = [
        resetTicketSubscriptions(),
        resetWoodySubscriptions(),
      ]
      store.dispatch(batchActions(resetUserDataActions))

      break
    case USER_INFO_SUCCESS:
      await next(action)
      const { currentPage } = store.getState()
      if (currentPage === 'search' || currentPage === 'user_account') {
        store.dispatch(fetchWoodySubscriptions())
      }
      break
    default:
      break
  }

  return next(action)
}

export default userMiddleware
