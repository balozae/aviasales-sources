import { AppState } from '../types/root/explosion'
import { createSelector } from 'reselect'
import { getTopTicketBySortKey } from './tickets.selectors'
import { getFilteredTicketsBadges } from './tickets_badges.selector'

export const getSortState = (state: AppState) => state.sort

const getTicketPriceInfo = (ticket) => {
  if (ticket && ticket[1]) {
    const ticketData = ticket[1][0]

    return {
      unified_price: ticketData.unified_price,
      price: ticketData.price,
      currency: ticketData.currency,
    }
  }
}

export const topTicketsPriceInfoSelector = createSelector(
  (_state, tickets) => tickets,
  getFilteredTicketsBadges,
  (tickets, badges) => ({
    price: getTicketPriceInfo(getTopTicketBySortKey(tickets, 'price', badges)),
    duration: getTicketPriceInfo(getTopTicketBySortKey(tickets, 'duration', badges)),
    rating: getTicketPriceInfo(getTopTicketBySortKey(tickets, 'rating', badges)),
  }),
)
