export const SAVE_DIRECTION_SUBSCRIPTION = 'SAVE_DIRECTION_SUBSCRIPTION'
export const DIRECTION_SUBSCRIPTIONS_POPUP_SHOW = 'DIRECTION_SUBSCRIPTIONS_POPUP_SHOW'
export const DIRECTION_SUBSCRIPTIONS_POPUP_CLOSE = 'DIRECTION_SUBSCRIPTIONS_POPUP_CLOSE'
export const DIRECTION_SUBSCRIPTIONS_POPUP_PROCEED = 'DIRECTION_SUBSCRIPTIONS_POPUP_PROCEED'

export type DirectionSubscriptionPopupInteractionType = 'inactive' | 'exit'

export interface DirectionSubscriptionPopupShowAction {
  type: typeof DIRECTION_SUBSCRIPTIONS_POPUP_SHOW
  interactionType: DirectionSubscriptionPopupInteractionType
}

export type DirectionSubscriptionsActionTypes = DirectionSubscriptionPopupShowAction
