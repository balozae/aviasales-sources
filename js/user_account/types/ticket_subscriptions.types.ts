import { RequestStatus } from 'common/types'
import { TicketUIResolverProps } from 'shared_components/ticket/ticket_ui_resolver/ticket_ui_resolver'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'

export const TICKET_SUBSCRIPTIONS_FETCH_REQUEST = 'TICKET_SUBSCRIPTIONS_FETCH_REQUEST'
export const TICKET_SUBSCRIPTIONS_FETCH_SUCCESS = 'TICKET_SUBSCRIPTIONS_FETCH_SUCCESS'
export const TICKET_SUBSCRIPTIONS_FETCH_FAILURE = 'TICKET_SUBSCRIPTIONS_FETCH_FAILURE'
export const TICKET_SUBSCRIPTION_REMOVE = 'TICKET_SUBSCRIPTION_REMOVE'
export const RESET_TICKET_SUBSCRIPTIONS = 'RESET_TICKET_SUBSCRIPTIONS'
export const SAVE_TICKET_SUBSCRIPTION = 'SAVE_TICKET_SUBSCRIPTION'
export const ACTIVATE_EMAIL_SUBMIT = 'ACTIVATE_EMAIL_SUBMIT'
export const ACTIVATE_EMAIL_POPUP_CLOSE = 'ACTIVATE_EMAIL_POPUP_CLOSE'
export const ACTIVATE_EMAIL_POPUP_SUCCESS_CLOSE = 'ACTIVATE_EMAIL_POPUP_SUCCESS_CLOSE'

export enum TicketSubscriptionsSortingTypes {
  createdAt = 'createdAt',
  destinationCityIata = 'destinationCityIata',
  departureDate = 'departureDate',
}

export type SortedTicketSubscriptions = { [key: string]: TicketUIResolverProps[] }

export interface TicketSubscription {
  createdAt: string
  destinationCityIata: string
  departureDate: string
  sign: string
  ticketId: string
  actual: boolean
  ticket: TicketUIResolverProps
  placesIatas: string[]
}

export type TicketSubscriptions = {
  actual: TicketSubscription[]
  nonActual: TicketSubscription[]
}

export type TicketSubscriptionsState = {
  data: TicketSubscriptions
  fetchStatus: RequestStatus
}

interface TicketSubscriptionsFetchRequestAction {
  type: typeof TICKET_SUBSCRIPTIONS_FETCH_REQUEST
}

interface TicketSubscriptionsFetchSuccessAction {
  type: typeof TICKET_SUBSCRIPTIONS_FETCH_SUCCESS
  data: TicketSubscriptions
}

interface TicketSubscriptionsFetchFailureAction {
  type: typeof TICKET_SUBSCRIPTIONS_FETCH_FAILURE
}

interface TicketSubscriptionRemoveAction {
  type: typeof TICKET_SUBSCRIPTION_REMOVE
  ticketSubscription: TicketSubscription
}

interface TicketSubscriptionsResetAction {
  type: typeof RESET_TICKET_SUBSCRIPTIONS
}

export interface SaveTicketSubscriptionAction {
  type: typeof SAVE_TICKET_SUBSCRIPTION
  ticket: TicketTuple
}

export interface ActivateEmailSubmitAction {
  type: typeof ACTIVATE_EMAIL_SUBMIT
  email: string
}

interface ActivateEmailPopupCloseAction {
  type: typeof ACTIVATE_EMAIL_POPUP_CLOSE
}

interface ActivateEmailPopupSuccessCloseAction {
  type: typeof ACTIVATE_EMAIL_POPUP_SUCCESS_CLOSE
}

export type TicketSubscriptionsActionTypes =
  | TicketSubscriptionsFetchRequestAction
  | TicketSubscriptionsFetchSuccessAction
  | TicketSubscriptionsFetchFailureAction
  | TicketSubscriptionRemoveAction
  | TicketSubscriptionsResetAction
  | ActivateEmailSubmitAction
  | ActivateEmailPopupCloseAction
  | ActivateEmailPopupSuccessCloseAction
  | SaveTicketSubscriptionAction
