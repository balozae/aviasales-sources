import {
  TicketsBadgesState,
  UPDATE_TICKETS_BADGES,
  TicketsBadgesActions,
  RESET_TICKETS_BADGES,
} from '../types/tickets_badges.types'

const initialState: TicketsBadgesState = Object.freeze({})

export default (state: TicketsBadgesState = initialState, action: TicketsBadgesActions) => {
  switch (action.type) {
    case UPDATE_TICKETS_BADGES:
      return { ...action.badges }

    case RESET_TICKETS_BADGES:
      return initialState

    default:
      return state
  }
}
