import { AppState } from '../types/root/explosion'
import { createSelector } from 'reselect'
import { getSearchParams } from './search_params.selectors'
import { getFilters } from './filters.selectors'

export const getTopPlacementTicket = (state: AppState) => state.topPlacementTicket

export const getHeaviestTopPlacementCampaign = (state: AppState) =>
  state.heaviestTopPlacementCampaign

export const getIsTopPlacementShown = (state: AppState) => state.isTopPlacementShown

export const getTopPlacementMetricsData = createSelector(
  getHeaviestTopPlacementCampaign,
  getSearchParams,
  (heaviestTopPlacementCampaign, searchParams) => ({
    banner: heaviestTopPlacementCampaign!.name,
    origin: searchParams!.segments[0].origin,
    destination: searchParams!.segments[0].destination,
    one_way: searchParams!.segments.length === 1,
  }),
)

export const getIsTopPlacementTicketFiltered = createSelector(
  getTopPlacementTicket,
  getFilters,
  (topPlacementTicket, filters) => {
    if (topPlacementTicket && topPlacementTicket.ticket_info && filters.filterFunc) {
      const result = filters.filterFunc(topPlacementTicket.ticket_info)
      return !result
    }

    return false
  },
)
