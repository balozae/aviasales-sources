import { createSelector } from 'reselect'
import { TicketData, RawProposal } from 'shared_components/ticket/ticket_incoming_data.types'
import { AppState } from '../types/root/explosion'
import { getGates } from './gates.selectors'
import { getSearchId } from './search.selectors'
import { getSearchParams } from './search_params.selectors'
import {
  createAirlineDeeplink,
  createDeeplink,
} from 'common/js/ticket_deeplink_creator/ticket_deeplink_creator'
import { getMarker } from './marker.selectors'
import { TopPlacementCampaign } from 'components/ad_top_placement/ad_top_placement.types'
import { getCurrencies } from './currencies.selectors'
import { createUrl } from 'common/js/ticket_url_creator'

export const getDeeplinkFn = createSelector(
  (_: AppState, ticketData: TicketData, topPlacementParams?: TopPlacementCampaign['data']) =>
    ticketData,
  (_: AppState, ticket: TicketData, topPlacementParams?: TopPlacementCampaign['data']) =>
    topPlacementParams,
  getGates,
  getSearchId,
  getSearchParams,
  getMarker,
  getCurrencies,
  (ticketData, topPlacementParams, gates, searchId, searchParams, marker, currencyRates) => (
    proposal: RawProposal,
  ) => {
    const airlineIatas = gates[proposal.gate_id] ? gates[proposal.gate_id].airline_iatas || [] : []
    const isAirline = airlineIatas.includes(ticketData.validating_carrier)
    if (isAirline && !proposal.unified_price) {
      return createAirlineDeeplink(searchId!, ticketData.validating_carrier, marker, searchParams!)
    }
    return createDeeplink(
      proposal,
      gates[proposal.gate_id],
      searchId!,
      topPlacementParams,
      searchParams!.segments[0].origin,
      searchParams!.segments[0].destination,
      createUrl({
        ticket: ticketData,
        unified_price: proposal ? proposal.unified_price : null,
        searchId: searchId!,
        currencyRates,
        proposal,
        gate: gates[proposal.gate_id],
      }),
    )!
  },
)

export const getAirlineDeeplink = createSelector(
  (_: AppState, ticketData: TicketData) => ticketData,
  getSearchId,
  getSearchParams,
  getMarker,
  (ticketData, searchId, searchParams, marker) =>
    createAirlineDeeplink(searchId!, ticketData.validating_carrier, marker, searchParams!),
)
