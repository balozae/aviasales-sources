import {
  RawProposal,
  TicketData,
  TicketTuple,
  IncomingBadge,
} from 'shared_components/ticket/ticket_incoming_data.types'
import patchTicketTariffs from './ticket_tariffs_processor/ticket_tariffs_processor'
// @ts-ignore
import { priceInRubToCurrency } from 'utils_price.coffee'

type BadgesBySign = { [ticketSign: string]: IncomingBadge[] }
type TicketsBySign = { [ticketSign: string]: TicketTuple }

const makePromoSign = (sign: string) => `${sign}-promo`

const extractPromoTickets = (
  badgesBySign: BadgesBySign,
  ticketsBySign: TicketsBySign,
  currencies: { [curr: string]: number },
): Array<TicketTuple> => {
  const promoTickets: Array<TicketTuple> = []

  Object.keys(badgesBySign).forEach((sign) => {
    badgesBySign[sign].forEach((badge, badgeIndex) => {
      if (badge.type === 'promo_ticket' && ticketsBySign[sign]) {
        const promoProposal = ticketsBySign[sign][1].find(
          (proposal) => proposal.url === badge.meta!.proposal_id,
        )

        if (promoProposal) {
          const newSign = makePromoSign(sign)

          const clonedTicketInfo: TicketData = {
            ...ticketsBySign[sign][0],
            sign: newSign,
          }

          const unifiedPriceWithDiscount = promoProposal.unified_price - badge.meta!.discount

          const clonedProposal: RawProposal = {
            ...promoProposal,
            strike_price: promoProposal.price,
            strike_unified_price: promoProposal.unified_price,
            price:
              promoProposal.currency === 'rub'
                ? promoProposal.price - badge.meta!.discount
                : priceInRubToCurrency(
                    unifiedPriceWithDiscount,
                    promoProposal.currency,
                    currencies,
                  ),
            unified_price: unifiedPriceWithDiscount,
          }

          const clonedTicketTuple: TicketTuple = [clonedTicketInfo, [clonedProposal]]

          patchTicketTariffs(clonedTicketTuple)
          promoTickets.push(clonedTicketTuple)

          badgesBySign[newSign] = [{ ...badge }]
          badgesBySign[sign].splice(badgeIndex, 1)
        }
      }
    })
  })

  return promoTickets
}

export default extractPromoTickets
