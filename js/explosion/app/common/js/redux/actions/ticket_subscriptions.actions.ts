import { ThunkAction } from 'redux-thunk'
import i18next from 'i18next'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { TicketSubscriptionData } from 'shared_components/subscriptions/subscriptions.types'
import {
  fetchSubscriptions,
  actualizeSubscriber,
} from 'shared_components/subscriptions/subscriptions'
import rollbar from 'common/utils/rollbar'
import { RequestStatus } from 'common/types'
import {
  ACTIVATE_EMAIL_SUBMIT,
  TicketSubscriptionsActionTypes,
  ACTIVATE_EMAIL_POPUP_CLOSE,
  ACTIVATE_EMAIL_POPUP_SUCCESS_CLOSE,
  SAVE_TICKET_SUBSCRIPTION,
} from 'user_account/types/ticket_subscriptions.types'
import {
  TicketSubscriptionsExplosionActionTypes as ActionTypes,
  FETCH_TICKET_SUBSCRIPTIONS_REQUEST_EXPLOSION,
  FETCH_TICKET_SUBSCRIPTIONS_FAILURE_EXPLOSION,
  FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION,
  ADD_TICKET_SUBSCRIPTION_EXPLOSION,
  REMOVE_TICKET_SUBSCRIPTION_EXPLOSION,
  RESET_TICKET_SUBSCRIPTIONS,
  CHANGE_TICKET_SUBSCRIPTION_ACTION_STATUS,
  UpdateEmailAction,
  UPDATE_EMAIL,
  SendConfirmEmailAction,
  SEND_CONFIRM_EMAIL,
} from '../types/ticket_subscriptions.types'
import { AppState } from '../types/root/explosion'
import guestia from 'guestia/client'
import markerable from 'common/bindings/markerable'
import cookie from 'oatmeal-cookie'

export const fetchTicketSubscriptionsRequestAction = (): ActionTypes => ({
  type: FETCH_TICKET_SUBSCRIPTIONS_REQUEST_EXPLOSION,
})

export const fetchTicketSubscriptionsFailureAction = (): ActionTypes => ({
  type: FETCH_TICKET_SUBSCRIPTIONS_FAILURE_EXPLOSION,
})

export const fetchTicketSubscriptionsSuccessAction = (
  tickets: TicketSubscriptionData[],
): ActionTypes => ({
  type: FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION,
  tickets,
})

export const addTicketSubscriptionAction = (ticket: TicketSubscriptionData): ActionTypes => ({
  type: ADD_TICKET_SUBSCRIPTION_EXPLOSION,
  ticket,
})

export const removeTicketSubscriptionAction = (ticket: TicketSubscriptionData): ActionTypes => ({
  type: REMOVE_TICKET_SUBSCRIPTION_EXPLOSION,
  ticket,
})

export const changeTicketSubscriptionsActionStatus = (
  ticketSign: TicketSubscriptionData['sign'],
  actionStatus: RequestStatus,
): ActionTypes => ({
  type: CHANGE_TICKET_SUBSCRIPTION_ACTION_STATUS,
  ticketSign,
  actionStatus,
})

export const resetTicketSubscriptions = (): ActionTypes => ({ type: RESET_TICKET_SUBSCRIPTIONS })

export const fetchTicketSubscriptions = (): ThunkAction<
  void,
  AppState,
  void,
  ActionTypes
> => async (dispatch: Function, getState: Function) => {
  const { ticketSubscriptions, userInfo } = getState()

  if (
    ticketSubscriptions.fetchStatus !== RequestStatus.Idle ||
    userInfo.fetchStatus !== RequestStatus.Success
  ) {
    return
  }

  try {
    dispatch(fetchTicketSubscriptionsRequestAction())
    const { ticket_subscriptions } = await fetchSubscriptions(guestia.getJWT())
    dispatch(fetchTicketSubscriptionsSuccessAction(ticket_subscriptions))
  } catch (error) {
    // NOTE: we should handle this case and show button to subscribe on any ticket
    if (error.response.data.message === 'Subscriber is missing') {
      dispatch(fetchTicketSubscriptionsSuccessAction([]))
    } else {
      dispatch(fetchTicketSubscriptionsFailureAction())
      rollbar.warn('An error occured during ticket subscriptions fetch', error)
    }
  }
}

export const actualizeTicketSubscriber = (): ThunkAction<void, AppState, void, ActionTypes> => (
  dispatch: Function,
  getState: Function,
) => {
  try {
    const state = getState()
    const currency = state.currency
    actualizeSubscriber(
      currency,
      i18next.language,
      markerable.marker(),
      cookie.get('auid'),
      guestia.getJWT(),
    )
  } catch (error) {
    rollbar.warn('An error occured during actualization of ticket subscriber', error)
  }
}

export const actualizeTicketsSubscriberSERP = (): ThunkAction<
  void,
  AppState,
  void,
  ActionTypes
> => (dispatch: Function, getState: Function) => {
  const state = getState()
  const ticketSubscriptions = state.ticketSubscriptions.tickets
  if (ticketSubscriptions.length && window.isSearchPage) {
    dispatch(actualizeTicketSubscriber())
  }
}

export const saveTicketSubscription = (ticket: TicketTuple): TicketSubscriptionsActionTypes => ({
  type: SAVE_TICKET_SUBSCRIPTION,
  ticket,
})

export const activateEmailSubmit = (email: string): TicketSubscriptionsActionTypes => ({
  type: ACTIVATE_EMAIL_SUBMIT,
  email,
})

export const activateEmailPopupClose = (): TicketSubscriptionsActionTypes => ({
  type: ACTIVATE_EMAIL_POPUP_CLOSE,
})

export const activateEmailSuccessPopupClose = (): TicketSubscriptionsActionTypes => ({
  type: ACTIVATE_EMAIL_POPUP_SUCCESS_CLOSE,
})

export const updateEmail = (email: string): UpdateEmailAction => ({
  type: UPDATE_EMAIL,
  email,
})

export const sendConfirmEmail = (): SendConfirmEmailAction => ({
  type: SEND_CONFIRM_EMAIL,
})
