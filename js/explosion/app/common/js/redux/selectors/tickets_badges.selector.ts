import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'
import flagr from 'common/utils/flagr_client_instance'
import { AppState } from '../types/root/explosion'
import { getFilters } from './filters.selectors'
import { TicketsBadgesState } from '../types/tickets_badges.types'

export const getTicketsBadges = (state: AppState) => state.ticketsBadges

export const getFilteredTicketsBadges = createSelector(
  getTicketsBadges,
  getFilters,
  (badges, filters): TicketsBadgesState => {
    const isOnlyBaggage = filters.filters && filters.filters.baggage.no_baggage === true
    return Object.keys(badges).reduce((acc, sign) => {
      const ticketBadge = badges[sign].filter((badge) => {
        if (isOnlyBaggage) {
          return badge.type.includes('_baggage')
        } else {
          return !badge.type.includes('_baggage')
        }
      })
      return { ...acc, [sign]: ticketBadge }
    }, {})
  },
)

const ticketSign = (_state: AppState, sign: string) => sign

const PROMO_TICKET_TYPE = 'promo_ticket'

export const getBadgeByTicketSign = (sign: string, badges: TicketsBadgesState) => {
  if (!flagr.is('avs-exp-badges')) {
    return undefined
  }

  if (!(badges && badges[sign])) {
    return undefined
  }

  const badgesBySign = badges[sign]
  const badge = badgesBySign[0]

  // NOTE: do not show promo ticket for original ticket
  if (badge && badge.type === PROMO_TICKET_TYPE && !/\-promo/.test(sign)) {
    return badgesBySign[1]
  }

  return badge
}

export const getTicketBadge = createCachedSelector(
  ticketSign,
  getFilteredTicketsBadges,
  getBadgeByTicketSign,
)(ticketSign)
