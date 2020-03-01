import { IncomingBadge } from 'shared_components/ticket/ticket_incoming_data.types'

export const UPDATE_TICKETS_BADGES = 'UPDATE_TICKETS_BADGES'
export const RESET_TICKETS_BADGES = 'RESET_TICKETS_BADGES'

interface AddTicketsBadges {
  type: typeof UPDATE_TICKETS_BADGES
  badges: TicketsBadgesState
}

interface ResetTicketsBadges {
  type: typeof RESET_TICKETS_BADGES
}

export type TicketsBadgesActions = AddTicketsBadges | ResetTicketsBadges

export type TicketsBadgesState = { [ticketSign: string]: IncomingBadge[] }
