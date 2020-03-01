import {
  TicketsBadgesActions,
  TicketsBadgesState,
  UPDATE_TICKETS_BADGES,
  RESET_TICKETS_BADGES,
} from '../types/tickets_badges.types'
import { ThunkAction } from 'redux-thunk'
import { AppState } from '../types/root/explosion'
import { AnyAction } from 'redux'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { reachGoal } from './metrics.actions'
import { updateSearchData } from './search_params.actions'

export const promoTicketCreated = (
  newTickets: TicketTuple[],
  badges: TicketsBadgesState,
): ThunkAction<any, AppState, void, AnyAction> => (dispatch, getState) => {
  dispatch(updateSearchData({ tickets: newTickets }))
  dispatch(updateTicketsBadges(badges))
  dispatch(reachGoal('promo_ticket_created'))
}

export const updateTicketsBadges = (badges: TicketsBadgesState): TicketsBadgesActions => ({
  type: UPDATE_TICKETS_BADGES,
  badges,
})

export const resetTicketBadges = (): TicketsBadgesActions => ({
  type: RESET_TICKETS_BADGES,
})
