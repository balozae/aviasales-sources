import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'
import flagr from 'common/utils/flagr_client_instance'
import { AppState } from '../types/root/explosion'
import { TicketData, TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { TicketsBadgesState } from '../types/tickets_badges.types'
import { SortState } from '../types/sort.types'
import { getBadgeByTicketSign } from './tickets_badges.selector'

export const getTickets = (state: AppState): TicketTuple[] => state.tickets

export const getTicketBySign = createSelector(
  getTickets,
  (_s: AppState, sign: string) => sign,
  (tickets, ticketSign) => tickets.find(([{ sign }]) => sign === ticketSign),
)

export const getTopTicketBySortKey = createSelector(
  (tickets: ReadonlyArray<TicketTuple>) => tickets,
  (_t, sortKey: SortState) => sortKey,
  (_t, _s, badges: TicketsBadgesState = {}) => badges,
  (tickets, sortKey, badges) => {
    const fn = getCompareFunctionBySortKey(sortKey, badges)
    return tickets.reduce((accTicket, ticket) => {
      if (fn(accTicket, ticket) > 0) {
        return ticket
      }
      return accTicket
    }, tickets[0])
  },
)

export const sortTickets = createCachedSelector(
  (tickets: ReadonlyArray<TicketTuple>) => tickets,
  (_t, sortKey: SortState) => sortKey,
  (_t, _s, badges: TicketsBadgesState = {}) => badges,
  (tickets, sortKey, badges) => tickets.slice().sort(getCompareFunctionBySortKey(sortKey, badges)),
)((tickets, sortKey, badges) => `${tickets.length}-${sortKey}-${Object.keys(badges).join('.')}`)

export const getTopTicketsPrices = createSelector(
  (tickets: ReadonlyArray<TicketTuple>) => tickets,
  (tickets) => ({
    price: getTicketPrice(getTopTicketBySortKey(tickets, 'price')),
    duration: getTicketPrice(getTopTicketBySortKey(tickets, 'duration')),
    rating: getTicketPrice(getTopTicketBySortKey(tickets, 'rating')),
  }),
)

/**
 * Private helper functions below
 */

type TicketCompareFn = (ticket1: TicketTuple, ticket2: TicketTuple) => number
const getCompareFunctionBySortKey = createSelector(
  (sortKey: SortState) => sortKey,
  (_s, badges: TicketsBadgesState) => badges,
  (sortKey, badges): TicketCompareFn => {
    return {
      price: compareTicketsPrice(badges),
      duration: compareTicketsDuration(badges),
      rating: compareTicketsRating(badges),
    }[sortKey]
  },
)

const getTicketPrice = (ticket: TicketTuple) => ticket[1][0].unified_price

const getDuration = (ticket: TicketData) =>
  ticket.segment_durations!.reduce((sum, num) => sum + num)

const isDirect = (ticket: TicketData) => ticket.max_stops === 0

const compare = (a, b) => {
  if (a > b) {
    return 1
  }
  if (a < b) {
    return -1
  }
  return 0
}

const compareTicketBadges = (
  badges: TicketsBadgesState,
  t1: TicketData,
  t2: TicketData,
): number => {
  if (!flagr.is('avs-exp-badges')) {
    return 0
  }
  return -compare(!!getBadgeByTicketSign(t1.sign, badges), !!getBadgeByTicketSign(t2.sign, badges))
}

const compareTicketsPrice = (badges: TicketsBadgesState) => (
  [ticket1, proposals1]: TicketTuple,
  [ticket2, proposals2]: TicketTuple,
) => {
  if (!ticket2 || !proposals2 || !proposals2[0]) {
    return 1
  }
  if (!ticket1 || !proposals1 || !proposals2[0]) {
    return -1
  }
  return (
    compareTicketBadges(badges, ticket1, ticket2) ||
    compare(+proposals1[0].unified_price, +proposals2[0].unified_price) ||
    compare(getDuration(ticket1), getDuration(ticket2)) ||
    compare(+ticket1.ticket_rating!, +ticket2.ticket_rating!) ||
    compare(ticket1.sign, ticket2.sign)
  )
}

const compareTicketsDuration = (badges: TicketsBadgesState) => (
  [ticket1, proposals1]: TicketTuple,
  [ticket2, proposals2]: TicketTuple,
) =>
  compareTicketBadges(badges, ticket1, ticket2) ||
  -compare(isDirect(ticket1), isDirect(ticket2)) ||
  (isDirect(ticket1) && isDirect(ticket2)
    ? compareTicketsPrice(badges)([ticket1, proposals1], [ticket2, proposals2])
    : 0) ||
  compare(getDuration(ticket1), getDuration(ticket2)) ||
  compare(+ticket1.ticket_rating!, +ticket2.ticket_rating!) ||
  compare(ticket1.sign, ticket2.sign)

const compareTicketsRating = (badges: TicketsBadgesState) => (
  [ticket1, proposals1]: TicketTuple,
  [ticket2, proposals2]: TicketTuple,
) =>
  compareTicketBadges(badges, ticket1, ticket2) ||
  compare(+ticket1.ticket_rating!, +ticket2.ticket_rating!)
