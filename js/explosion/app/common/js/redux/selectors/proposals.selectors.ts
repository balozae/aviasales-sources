import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'
import { AppState } from '../types/root/explosion'
import { TicketData } from 'shared_components/ticket/ticket_incoming_data.types'
import { TariffType } from 'shared_components/types/tariffs'
import {
  Proposal,
  ProposalType,
  AirlineWithoutPrice,
  Proposals,
  AirlineProposals,
} from 'shared_components/ticket/ticket.types'
import { getGates } from './gates.selectors'
import { getDeeplinkFn, getAirlineDeeplink } from './deeplink.selectors'
import { prepareTicketProposalsData } from 'shared_components/ticket/utils/ticket_proposals.utils'
import { getAirlines } from './airlines.selectors'
import { TripClass } from 'common/types'
import { getSearchParams } from './search_params.selectors'
import { getBestSellerData } from './best_seller_data.selectors'

export const prepareTicketProposals = createCachedSelector(
  (_state: AppState, ticketData: TicketData) => ticketData,
  getGates,
  getDeeplinkFn,
  getAirlineDeeplink,
  getAirlines,
  (
    ticketData,
    gates,
    deeplinkFn,
    airlineDeeplink,
    airlines,
  ): [Proposals, AirlineProposals, TariffType, TariffType] => {
    const {
      proposals,
      airlineProposals,
      cheaperTariffKey,
      defaultTariff,
    } = prepareTicketProposalsData(ticketData, gates, deeplinkFn, airlineDeeplink, airlines)
    return [proposals, airlineProposals, cheaperTariffKey, defaultTariff]
  },
)((_state, ticketData) => ticketData.sign)

export const getBuyClickProposalEventData = createSelector(
  prepareTicketProposals,
  getSearchParams,
  getBestSellerData,
  (_s, _t, proposal: Proposal) => proposal,
  ([tariffs], searchParams, bestSellerData, proposal) => {
    if (!proposal) {
      return {}
    }

    const { worstBags } = proposal

    const metrics = {
      currency: proposal.currency,
      type: proposal.type,
      price: proposal.price,
      unified_price: proposal.unifiedPrice,
      gateId: proposal.gateId,
      baggage: {
        baggage: worstBags != null ? worstBags.baggage.code : undefined,
        handbags: worstBags != null ? worstBags.handbags.code : undefined,
      },
      ticket_baggage: {
        hasBaggage: tariffs.hasBaggage[0] != null ? tariffs.hasBaggage[0].worstBags : undefined,
        otherBaggage:
          tariffs.otherBaggage[0] != null ? tariffs.otherBaggage[0].worstBags : undefined,
      },
    }

    const { trip_class, passengers } = searchParams!

    if (
      bestSellerData.ticketSign &&
      trip_class === TripClass.Economy &&
      !(passengers.children || passengers.infants)
    ) {
      Object.assign(metrics, {
        bestseller_is_found: true,
        average_price: Math.round(proposal.unifiedPrice / passengers.adults),
      })
    }

    return metrics
  },
)

export const getAllProposalEventData = createSelector(
  prepareTicketProposals,
  (_s, _t, currentTariff: TariffType) => currentTariff,
  ([tariffs, airlineProposals], currentTariff) => {
    const airlineProposal = airlineProposals[currentTariff]
    const [firstProposal, ...otherProposals] = tariffs[currentTariff]

    // NOTE: airline proposal always goes second
    const allProposals = airlineProposal
      ? [firstProposal, airlineProposal, ...otherProposals]
      : tariffs[currentTariff]

    return {
      proposals: allProposals.map((item, i) => {
        if (item.type === ProposalType.AirlineWithoutPrice) {
          const proposal = item as AirlineWithoutPrice
          return {
            position: i,
            airlineDeeplink: proposal.deeplink,
          }
        } else {
          const proposal = item as Proposal
          return {
            position: i,
            gate_id: proposal.gateId,
            price: proposal.unifiedPrice,
            productivity: proposal.debugProductivity,
            multiplier: proposal.debugMultiplier,
          }
        }
      }),
    }
  },
)
