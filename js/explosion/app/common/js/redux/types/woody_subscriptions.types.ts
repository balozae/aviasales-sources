import { RequestStatus, Currency } from 'common/types'
export const FETCH_WOOODY_SUBSCRIPTIONS_REQUEST = 'FETCH_WOOODY_SUBSCRIPTIONS__REQUEST'
export const FETCH_WOOODY_SUBSCRIPTIONS_SUCCESS = 'FETCH_WOOODY_SUBSCRIPTIONS__SUCCESS'
export const FETCH_WOOODY_SUBSCRIPTIONS_FAILURE = 'FETCH_WOOODY_SUBSCRIPTIONS__FAILURE'
export const CREATE_WOODY_SUBSCRIPTION_REQUEST = 'CREATE_WOODY_SUBSCRIPTION_REQUEST'
export const CREATE_WOODY_SUBSCRIPTION_SUCCESS = 'CREATE_WOODY_SUBSCRIPTION_SUCCESS'
export const CREATE_WOODY_SUBSCRIPTION_FAILURE = 'CREATE_WOODY_SUBSCRIPTION_FAILURE'
export const RESET_WOODY_CREATION_STATUS = 'RESET_WOODY_CREATION_STATUS'
export const RESET_WOODY_SUBSCRIPTIONS = 'RESET_WOODY_SUBSCRIPTIONS'

export type WoodySubscriptionsState = {
  data: WoodySubscription[]
  fetchingStatus: RequestStatus
  creationStatus: RequestStatus
}

interface FetchWoodySubscriptionsRequestAction {
  type: typeof FETCH_WOOODY_SUBSCRIPTIONS_REQUEST
}

interface FetchWoodySubscriptionsFailureAction {
  type: typeof FETCH_WOOODY_SUBSCRIPTIONS_FAILURE
}

interface FetchWoodySubscriptionsSuccessAction {
  type: typeof FETCH_WOOODY_SUBSCRIPTIONS_SUCCESS
  data: WoodySubscription[]
}

interface CreateWoodySubscriptionRequestAction {
  type: typeof CREATE_WOODY_SUBSCRIPTION_REQUEST
}

interface CreateWoodySubscriptionFailureAction {
  type: typeof CREATE_WOODY_SUBSCRIPTION_FAILURE
}

interface CreateWoodySubscriptionSuccessAction {
  type: typeof CREATE_WOODY_SUBSCRIPTION_SUCCESS
  data: WoodySubscription[]
}

interface ResetWoodyCreactionStatusAction {
  type: typeof RESET_WOODY_CREATION_STATUS
}

interface ResetWoodySubscriptionsAction {
  type: typeof RESET_WOODY_SUBSCRIPTIONS
}

export type WoodySubscriptionsActionTypes =
  | FetchWoodySubscriptionsRequestAction
  | FetchWoodySubscriptionsFailureAction
  | FetchWoodySubscriptionsSuccessAction
  | CreateWoodySubscriptionRequestAction
  | CreateWoodySubscriptionFailureAction
  | CreateWoodySubscriptionSuccessAction
  | ResetWoodyCreactionStatusAction
  | ResetWoodySubscriptionsAction

export type WoodySubscription = {
  id: number
  currency: string
  depart_date: string
  return_date: string
  marker: string
  locale: string
  one_way: boolean
  state: string
  origin: {
    iata: string
    name: string
  }
  destination: {
    iata: string
    name: string
  }
}

export type WoodyResponse = {
  active: boolean
  recieve_news: boolean
  email_enabled: boolean
  web_push_enabled: boolean
  subscriptions: WoodySubscription[]
}

export type WoodySubscriptionParams = {
  marker: string
  origin: {
    iata: string
    name: string
  }
  destination: {
    iata: string
    name: string
  }
  depart_date: string
  return_date: string
  one_way: boolean
  currency: Currency
}

export type WoodySubscriberParams = {
  email: string
  params: WoodySubscriptionParams
}
