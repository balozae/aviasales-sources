import { TicketSubscriptionData } from 'shared_components/subscriptions/subscriptions.types'
import { RequestStatus } from 'common/types'

export const FETCH_TICKET_SUBSCRIPTIONS_REQUEST_EXPLOSION =
  'FETCH_TICKET_SUBSCRIPTIONS_REQUEST_EXPLOSION'
export const FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION =
  'FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION'
export const FETCH_TICKET_SUBSCRIPTIONS_FAILURE_EXPLOSION =
  'FETCH_TICKET_SUBSCRIPTIONS_FAILURE_EXPLOSION'
export const ADD_TICKET_SUBSCRIPTION_EXPLOSION = 'ADD_TICKET_SUBSCRIPTION_EXPLOSION'
export const REMOVE_TICKET_SUBSCRIPTION_EXPLOSION = 'REMOVE_TICKET_SUBSCRIPTION_EXPLOSION'
export const RESET_TICKET_SUBSCRIPTIONS = 'RESET_TICKET_SUBSCRIPTIONS'
export const CHANGE_TICKET_SUBSCRIPTION_ACTION_STATUS = 'CHANGE_TICKET_SUBSCRIPTION_ACTION_STATUS'
export const UPDATE_EMAIL = 'UPDATE_EMAIL'
export const SEND_CONFIRM_EMAIL = 'SEND_CONFIRM_EMAIL'

interface FetchTicketSubscriptionsRequestAction {
  type: typeof FETCH_TICKET_SUBSCRIPTIONS_REQUEST_EXPLOSION
}

interface FetchTicketSubscriptionsFailureAction {
  type: typeof FETCH_TICKET_SUBSCRIPTIONS_FAILURE_EXPLOSION
}

interface FetchTicketSubscriptionsSuccessAction {
  type: typeof FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION
  tickets: TicketSubscriptionData[]
}

interface AddTicketSubscriptionExplosion {
  type: typeof ADD_TICKET_SUBSCRIPTION_EXPLOSION
  ticket: TicketSubscriptionData
}

interface RemoveTicketSubscriptionDataAction {
  type: typeof REMOVE_TICKET_SUBSCRIPTION_EXPLOSION
  ticket: TicketSubscriptionData
}

export interface ResetTicketSubscriptionsAction {
  type: typeof RESET_TICKET_SUBSCRIPTIONS
}

interface ChangeTicketSubscriptionActionStatusAction {
  type: typeof CHANGE_TICKET_SUBSCRIPTION_ACTION_STATUS
  ticketSign: TicketSubscriptionData['sign']
  actionStatus: RequestStatus
}

export interface UpdateEmailAction {
  type: typeof UPDATE_EMAIL
  email: string
}

export interface SendConfirmEmailAction {
  type: typeof SEND_CONFIRM_EMAIL
}

export type TicketSubscriptionsExplosionActionTypes =
  | FetchTicketSubscriptionsRequestAction
  | FetchTicketSubscriptionsFailureAction
  | FetchTicketSubscriptionsSuccessAction
  | AddTicketSubscriptionExplosion
  | RemoveTicketSubscriptionDataAction
  | ResetTicketSubscriptionsAction
  | ChangeTicketSubscriptionActionStatusAction
  | UpdateEmailAction
  | SendConfirmEmailAction

export interface TicketSubscriptionsTicketsState {
  tickets: TicketSubscriptionData[]
  fetchStatus: RequestStatus
  actionStatus: {
    [key: string]: {
      status: RequestStatus
    }
  }
}
