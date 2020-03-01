import {
  takeLatest,
  put,
  select,
  race,
  take,
  takeEvery,
  call,
  fork,
} from '@redux-saga/core/effects'
import { EmailStatus, EmailInfo } from 'guestia_client/lib/types'
import rollbar from 'common/utils/rollbar'
import { RequestStatus } from 'common/types'
import {
  saveTicketSubscription as saveTicketSubscriptionApi,
  removeTicketSubscription,
} from 'shared_components/subscriptions/subscriptions'
import {
  getIsAuthorized,
  getUserEmailActivationStatus,
} from 'user_account/selectors/user.selectors'
import {
  ACTIVATE_EMAIL_SUBMIT,
  ACTIVATE_EMAIL_POPUP_CLOSE,
  SAVE_TICKET_SUBSCRIPTION,
  SaveTicketSubscriptionAction,
} from 'user_account/types/ticket_subscriptions.types'
import {
  getTicketSubscriptionActionStatusByTicketSign,
  getSubscriptionByTicketSign,
} from 'common/js/redux/selectors/ticket_subscription.selectors'
import { TICKET_SUBSCRIPTION_CLICK, TicketSubscriptionClickAction } from '../types/ticket.types'
import { AppState } from '../types/root/explosion'
import { FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION } from '../types/ticket_subscriptions.types'
import {
  changeTicketSubscriptionsActionStatus,
  addTicketSubscriptionAction,
  saveTicketSubscription,
  removeTicketSubscriptionAction,
} from '../actions/ticket_subscriptions.actions'
import { addPopup, removePopup } from '../actions/popups.actions'
import { PopupType } from '../types/popups.types'
import { getSearchParams } from '../selectors/search_params.selectors'
import { getCheapestTicket } from '../selectors/cheapest_ticket.selectors'
import { reachGoal } from '../actions/metrics.actions'
import { TicketSubscriptionData } from 'shared_components/subscriptions/subscriptions.types'
import guestia from 'guestia/client'
import cookie from 'oatmeal-cookie'
import markerable from 'common/bindings/markerable'

function* saveTicketSubscriptionSaga() {
  yield takeEvery(SAVE_TICKET_SUBSCRIPTION, function*({ ticket }: SaveTicketSubscriptionAction) {
    const userEmailActivationStatus: EmailInfo['activation_status'] = yield select(
      getUserEmailActivationStatus,
    )

    if (userEmailActivationStatus === EmailStatus.NotActive) {
      yield put(
        // @ts-ignore
        addPopup({
          popupType: PopupType.ActivateEmail,
        }),
      )

      const { cancel } = yield race({
        success: take(ACTIVATE_EMAIL_SUBMIT),
        cancel: take(ACTIVATE_EMAIL_POPUP_CLOSE),
      })

      if (cancel) {
        return
      }
    }

    const ticketSign = ticket[0].sign
    yield put(changeTicketSubscriptionsActionStatus(ticketSign, RequestStatus.Pending))

    const searchParams = yield select(getSearchParams)
    const cheapestTicket = yield select(getCheapestTicket)

    try {
      const response = yield call(() =>
        saveTicketSubscriptionApi(
          ticket,
          searchParams,
          cheapestTicket[1][0].unified_price,
          markerable.marker(),
          cookie.get('auid'),
          guestia.getJWT(),
        ),
      )

      const newTicket = response.data.info.ticket_subscription
      yield put(addTicketSubscriptionAction(newTicket))
      yield put(changeTicketSubscriptionsActionStatus(ticketSign, RequestStatus.Success))
      yield put(reachGoal('ticket-subscription--save', { ticket: ticketSign }))
    } catch (error) {
      yield put(changeTicketSubscriptionsActionStatus(ticketSign, RequestStatus.Failure))
      rollbar.warn('Can not save ticket subscription', error)
    }
  })
}

function* ticketSubscriptionClickSaga() {
  yield takeLatest(TICKET_SUBSCRIPTION_CLICK, function*({
    ticket,
    hasSubscription,
  }: TicketSubscriptionClickAction) {
    const [ticketData] = ticket
    const { sign } = ticketData
    const actionStatus = yield select((state: AppState) =>
      getTicketSubscriptionActionStatusByTicketSign(state, sign),
    )
    if (actionStatus === RequestStatus.Pending) {
      return
    }
    const isAuthorized = yield select(getIsAuthorized)

    if (!isAuthorized) {
      yield put(
        // @ts-ignore
        addPopup({
          popupType: PopupType.LoginForm,
          params: { from: 'ticket-subscription' },
        }),
      )

      const { auth } = yield race({
        auth: take(FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION),
        cancel: take('REMOVE_POPUP'),
      })

      if (auth) {
        // @ts-ignore
        yield put(removePopup(PopupType.LoginForm))
        yield put(saveTicketSubscription(ticket))
      }
      return
    }

    if (hasSubscription) {
      const subscription: TicketSubscriptionData = yield select((state: AppState) =>
        getSubscriptionByTicketSign(state, sign),
      )
      const ticketSign = ticket[0].sign
      yield put(changeTicketSubscriptionsActionStatus(ticketSign, RequestStatus.Pending))

      try {
        yield call(removeTicketSubscription, subscription.id, cookie.get('auid'), guestia.getJWT())
        yield put(removeTicketSubscriptionAction(subscription))
        yield put(changeTicketSubscriptionsActionStatus(ticketSign, RequestStatus.Success))
        yield put(reachGoal('ticket-subscription--remove', { ticket: ticketSign }))
      } catch (error) {
        yield put(changeTicketSubscriptionsActionStatus(ticketSign, RequestStatus.Failure))
        rollbar.error('An error occured during ticket subscription remove', error)
      }
    } else {
      yield put(saveTicketSubscription(ticket))
    }
  })
}

export default function* ticketSubscriptionsSaga() {
  yield fork(saveTicketSubscriptionSaga)
  yield fork(ticketSubscriptionClickSaga)
}
