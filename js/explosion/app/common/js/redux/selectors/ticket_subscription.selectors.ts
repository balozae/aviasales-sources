import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'
import { AppState } from '../types/root/explosion'
import { TicketSubscriptionsTicketsState } from '../types/ticket_subscriptions.types'
import { TicketData } from 'shared_components/ticket/ticket_incoming_data.types'
import { findTicketSubscriptionDataBySign } from 'shared_components/subscriptions/subscriptions'
import { getIsAuthorized } from 'user_account/selectors/user.selectors'
import { RequestStatus } from 'common/types'

const getTicketSubscriptions = (state: AppState): TicketSubscriptionsTicketsState['tickets'] =>
  state.ticketSubscriptions.tickets

export const getTicketSubscriptionsFetchStatus = (
  state: AppState,
): TicketSubscriptionsTicketsState['fetchStatus'] => state.ticketSubscriptions.fetchStatus

export const getSubscriptionByTicketSign = createCachedSelector(
  getTicketSubscriptions,
  (_: AppState, ticketSign: TicketData['sign']) => ticketSign,
  (ticketSubscription, ticketSign) =>
    findTicketSubscriptionDataBySign(ticketSign, ticketSubscription),
)((_state, ticketSign) => ticketSign)

export const getTicketSubscriptionActionStatusByTicketSign = (
  state: AppState,
  sign?: TicketData['sign'],
) => {
  if (sign && state.ticketSubscriptions.actionStatus[sign]) {
    return state.ticketSubscriptions.actionStatus[sign].status
  }
}

export const getWithTicketSubscription = createSelector(
  getIsAuthorized,
  getTicketSubscriptionsFetchStatus,
  (isAuthorized, fetchStatus) => !isAuthorized || fetchStatus === RequestStatus.Success,
)
