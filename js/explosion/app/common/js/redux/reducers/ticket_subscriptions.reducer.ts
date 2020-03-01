import update from 'immutability-helper'
import { RequestStatus } from 'common/types'
import {
  TicketSubscriptionsTicketsState,
  ADD_TICKET_SUBSCRIPTION_EXPLOSION,
  FETCH_TICKET_SUBSCRIPTIONS_FAILURE_EXPLOSION,
  FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION,
  FETCH_TICKET_SUBSCRIPTIONS_REQUEST_EXPLOSION,
  REMOVE_TICKET_SUBSCRIPTION_EXPLOSION,
  RESET_TICKET_SUBSCRIPTIONS,
  CHANGE_TICKET_SUBSCRIPTION_ACTION_STATUS,
  TicketSubscriptionsExplosionActionTypes,
} from '../types/ticket_subscriptions.types'

const initialState: TicketSubscriptionsTicketsState = {
  tickets: [],
  fetchStatus: RequestStatus.Idle,
  actionStatus: {},
}

export default (
  state = initialState,
  action: TicketSubscriptionsExplosionActionTypes,
): TicketSubscriptionsTicketsState => {
  switch (action.type) {
    case FETCH_TICKET_SUBSCRIPTIONS_REQUEST_EXPLOSION:
      return {
        ...state,
        fetchStatus: RequestStatus.Pending,
      }
    case FETCH_TICKET_SUBSCRIPTIONS_FAILURE_EXPLOSION:
      return {
        ...state,
        fetchStatus: RequestStatus.Failure,
      }
    case FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION:
      return {
        ...state,
        tickets: action.tickets,
        fetchStatus: RequestStatus.Success,
      }
    case ADD_TICKET_SUBSCRIPTION_EXPLOSION:
      return {
        ...state,
        tickets: [action.ticket, ...state.tickets],
      }
    case REMOVE_TICKET_SUBSCRIPTION_EXPLOSION:
      const ticketIndex = state.tickets.indexOf(action.ticket)
      const newState = update(state, {
        tickets: { $splice: [[ticketIndex, 1]] },
      })
      return newState
    case CHANGE_TICKET_SUBSCRIPTION_ACTION_STATUS:
      return {
        ...state,
        actionStatus: {
          ...state.actionStatus,
          [action.ticketSign]: {
            status: action.actionStatus,
          },
        },
      }
    case RESET_TICKET_SUBSCRIPTIONS:
      return initialState
    default:
      return state
  }
}
