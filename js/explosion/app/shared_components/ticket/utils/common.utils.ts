import { Trip, TripDirectionType, Airports, Proposal, TicketViewProps } from '../ticket.types'
import { Segment, Airport, TicketData, Gate, TicketTuple } from '../ticket_incoming_data.types'
import { FixedFlightsState } from 'common/js/redux/types/fixed_flights.types'
import { HighlightedTicketParamsState } from 'common/js/redux/types/highlighted_ticket_params.types'
// @ts-ignore
import { isTicketFootprint } from 'common/utils/ticket_footprint'

export const getFlightSignature = (flight: Trip) => {
  return [
    flight.departure,
    flight.local_departure_timestamp,
    flight.arrival,
    flight.local_arrival_timestamp,
  ].join('-')
}

export const isHighlightedTicket = (
  [ticketData]: TicketTuple,
  params: HighlightedTicketParamsState,
): boolean => {
  if (!params) {
    return false
  }
  const isFootprintOld = !!params.footprintOld
  return (
    (isFootprintOld && isTicketFootprint(ticketData, params.footprintOld)) ||
    params.sign === ticketData.sign
  )
}

export const fixedFlightsMatch = ([ticket]: TicketTuple, fixedFlights: FixedFlightsState) => {
  if (!(fixedFlights && fixedFlights.length)) {
    return true
  }
  let intersections: string[] = []
  for (let i = 0; i < ticket.segment.length; i++) {
    intersections = intersections.concat(
      getFlightsIntersections(fixedFlights, ticket.segment[i].flight as Trip[]),
    )
    if (fixedFlights.length === intersections.length) {
      return true
    }
  }
  return false
}

export const getFlightsIntersections = (fixedFlights: FixedFlightsState, ticketFlights: Trip[]) => {
  const intersections: string[] = []
  let ai = 0
  let bi = 0
  while (ai < fixedFlights.length && bi < ticketFlights.length) {
    const ffSign = fixedFlights[ai]
    const tfSign = getFlightSignature(ticketFlights[bi])
    if (ffSign === tfSign) {
      intersections.push(ffSign)
      ai++
      bi = 0
    } else if (bi === ticketFlights.length - 1) {
      ai++
      bi = 0
    } else {
      bi++
    }
  }
  return intersections
}

export const getSegmentSignature = (flights: Trip[]) => flights.map(getFlightSignature).join('|')

export const getTripDirectionType = (
  segments: Segment[],
  airports: Airports,
): TripDirectionType => {
  if (segments.length === 1) {
    return TripDirectionType.OneWay
  }

  if (segments.length === 2) {
    // forth
    const forthSegment = segments[0]
    const forthFirstTrip = forthSegment.flight[0]
    const forthLastTrip = forthSegment.flight[forthSegment.flight.length - 1]
    const forthDepartureIata = getCityIata(forthFirstTrip.departure, airports)
    const forthArrivalIata = getCityIata(forthLastTrip.arrival, airports)

    // back
    const backSegment = segments[1]
    const backfirstTrip = backSegment.flight[0]
    const backlastTrip = backSegment.flight[backSegment.flight.length - 1]
    const backDepartureIata = getCityIata(backfirstTrip.departure, airports)
    const backArrivalIata = getCityIata(backlastTrip.arrival, airports)

    if (forthDepartureIata === backArrivalIata && forthArrivalIata === backDepartureIata) {
      return TripDirectionType.RoundTrip
    }
  }

  return TripDirectionType.Multiway
}

const getCityIata = (iata: string, airports: Airports) => {
  let cityAirport: Airport | undefined = airports[iata]
  if (!cityAirport) {
    cityAirport = Object.values(airports).find((airport) => airport.city_code === iata)
  }
  return cityAirport ? cityAirport.city_code || iata : iata
}

export const isPinnedTrip = (trip: Trip, fixedTrips: TicketViewProps['fixedTrips']): boolean =>
  !!(fixedTrips && fixedTrips.includes(getFlightSignature(trip)))

export const isPinnedSegment = (
  trips: Trip[],
  fixedTrips: TicketViewProps['fixedTrips'],
): boolean => !!(fixedTrips && trips.every((trip) => fixedTrips.includes(getFlightSignature(trip))))

export const handleStopPropagation = (event: React.MouseEvent) => event.stopPropagation()

export const getMetaInfo = ({
  proposal,
  ticketData,
  gates,
}: {
  proposal?: Proposal
  ticketData: TicketData
  gates: {
    [gateId: string]: Gate
  }
}) => ({
  price_rub: proposal && proposal.unifiedPrice,
  gate_id: proposal && proposal.gateId,
  gate: proposal && proposal.gateId && gates[proposal.gateId] && gates[proposal.gateId].label,
  validating_carrier: ticketData.validating_carrier,
  first_operating_carrier: ticketData.segment[0].flight[0].operating_carrier,
  recommend: ticketData.recommend,
})
