import { stringify, parse } from 'query-string'
import cookie from 'oatmeal-cookie'
import { Gate, Proposal, TopPlacementParams } from './ticket_deeplink_creator.types'
import Rollbar from 'common/utils/rollbar'
import { SearchParams } from 'shared_components/ticket/ticket.types'

const AEROFLOT_GATE_ID = '504'

export const createDeeplink = (
  proposal: Proposal,
  gate: Gate = { label: `Gate ${proposal.gate_id}` },
  searchId: string,
  topPlacementParams: TopPlacementParams,
  originIata: string,
  destinationIata: string,
  assistedFallback?: string,
): string | undefined => {
  if (!searchId || !proposal.url) {
    return Rollbar.debug('Create deeplink error', { gate, proposal, topPlacementParams })
  }

  const params: { [key: string]: any } = {
    search_id: searchId,
    proposal_id: proposal.url,
    gate_id: proposal.gate_id,
    gate_label: gate.label,
  }

  if (topPlacementParams) {
    if (topPlacementParams.replace_params) {
      params.should_replace_params = true
      Object.keys(topPlacementParams.replace_params).forEach(
        (key) => (params[`replace[${key}]`] = topPlacementParams.replace_params![key]),
      )
    }

    if (topPlacementParams.utm) {
      params.utm_content = `${originIata}x${destinationIata}`
      params.patch_utm = 1
      Object.assign(params, parse(topPlacementParams.utm))
    }

    if (topPlacementParams.is_top_placement_ticket) {
      params.ticket_type = 'top_placement_ticket'
    }

    if (topPlacementParams.deeplink_prefix) {
      params.deeplink_prefix = encodeURIComponent(topPlacementParams.deeplink_prefix)
    }
  }

  if (gate.assisted) {
    return `/assisted?${stringify({
      ...params,
      fallback: assistedFallback,
      assisted: gate.assisted,
      is_airline: gate.is_airline,
      from_top_placement_aeroflot:
        topPlacementParams &&
        topPlacementParams.is_top_placement_ticket &&
        proposal.gate_id === AEROFLOT_GATE_ID,
    })}`
  } else {
    return `/click?${stringify({
      ...params,
      fallback: window.location.href,
      gate_currency: proposal.currency,
      banner_delay: gate.banner_delay,
    })}`
  }
}

export const createAirlineDeeplink = (
  searchId: string,
  validatingCarrier: string,
  marker: string,
  searchParams: SearchParams,
) =>
  '/search-api/adaptors/airline_deeplink?' +
  getAirlineParamsStr(searchId, validatingCarrier, marker) +
  getSearchParamsStr(searchParams)

const getSearchParamsStr = (searchParams: SearchParams) => {
  const params: any = {
    origin: searchParams.segments[0].origin,
    destination: searchParams.segments[0].destination,
    departure_date: searchParams.segments[0].date,
    trip_class: searchParams.trip_class,
    adults: searchParams.passengers.adults,
    children: searchParams.passengers.children,
    infants: searchParams.passengers.infants,
  }
  if (searchParams.segments.length > 1) {
    params.return_date = searchParams.segments[1].date
  }
  return `&${stringify(params)}`
}

const getAirlineParamsStr = (searchId: string, validatingCarrier: string, marker: string) => {
  const params: any = {
    iata: validatingCarrier,
    host: location.hostname,
    marker,
    search_uuid: searchId,
  }
  const auid: string = cookie.get('auid')
  if (auid) {
    params.auid = auid
  }

  return `&${stringify(params)}`
}
