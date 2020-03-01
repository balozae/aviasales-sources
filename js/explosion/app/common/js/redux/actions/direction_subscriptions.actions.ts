import {
  DirectionSubscriptionsActionTypes,
  DirectionSubscriptionPopupInteractionType,
  DIRECTION_SUBSCRIPTIONS_POPUP_SHOW,
} from '../types/direction_subscriptions.types'

export const showDirectionSubscriptionPopup = (
  type: DirectionSubscriptionPopupInteractionType,
): DirectionSubscriptionsActionTypes => ({
  type: DIRECTION_SUBSCRIPTIONS_POPUP_SHOW,
  interactionType: type,
})
