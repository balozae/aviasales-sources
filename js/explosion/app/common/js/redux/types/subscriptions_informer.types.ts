export const SUBSCRIPTIONS_INFORMER_SESSION_STORAGE_FLAG = 'subscriptionsInformerShown'
export const SHOW_SUBSCRIPTIONS_INFORMER = 'SHOW_SUBSCRIPTIONS_INFORMER'
export const HIDE_SUBSCRIPTIONS_INFORMER = 'HIDE_SUBSCRIPTIONS_INFORMER'

export type SubscriptionsInformerState = {
  active: boolean
  wasShown: boolean
}

export type ShowSubscriptionsInformerAction = {
  type: typeof SHOW_SUBSCRIPTIONS_INFORMER
}

export type HideSubscriptionsInformerAction = {
  type: typeof HIDE_SUBSCRIPTIONS_INFORMER
}

export type SubscriptionsInformerActionTypes =
  | ShowSubscriptionsInformerAction
  | HideSubscriptionsInformerAction
