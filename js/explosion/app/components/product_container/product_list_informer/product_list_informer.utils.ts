import { FlightDirection } from './product_list_informer.types'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
const { is_open_jaw } = require('utils')

export const getTicketPrice = (ticket: TicketTuple) => ticket[1][0].unified_price

export const getTicketPriceMaximumIncrease = (price): number => {
  if (price <= 10000) {
    return 2
  }
  if (price <= 20000) {
    return 1.25
  }
  if (price <= 40000) {
    return 1.2
  }
  return 1.15
}

export const hasDirectFlight = (tickets): boolean => {
  return tickets.some((ticket) => ticket[0].is_direct)
}

const getAirportsFromSegment = (segment) => {
  const originCityIata = segment.origin_city_iata || segment.origin
  const destinationCityIata = segment.destination_city_iata || segment.destination
  const isDepartureAirport = originCityIata !== segment.original_origin
  const isArrivalAirport = destinationCityIata !== segment.original_destination
  return {
    departure: isDepartureAirport && segment.original_origin,
    arrival: isArrivalAirport && segment.original_destination,
  }
}

export const getCheaperAirportFromSearchParamsAndCheapestTicket = (
  searchParams,
  cheapestTicket,
) => {
  if (is_open_jaw(searchParams.segments) || !cheapestTicket) {
    return
  }

  const cheaperAirports = searchParams.segments
    .map((segment, index) => {
      const searchParamsAirports = getAirportsFromSegment(segment)
      const cheapestTicketAirports = cheapestTicket[0].segments_airports[index]
      const departureAirportCheapestTicket = cheapestTicketAirports[0]
      const arrivalAirportCheapestTicket = cheapestTicketAirports[cheapestTicketAirports.length - 1]
      let departure, arrival, departureCurrent, arrivalCurrent

      if (
        searchParamsAirports.departure &&
        searchParamsAirports.departure !== departureAirportCheapestTicket
      ) {
        departure = departureAirportCheapestTicket
        departureCurrent = searchParamsAirports.departure
      }

      if (
        searchParamsAirports.arrival &&
        searchParamsAirports.arrival !== arrivalAirportCheapestTicket
      ) {
        arrival = arrivalAirportCheapestTicket
        arrivalCurrent = searchParamsAirports.arrival
      }

      if (departure || arrival) {
        return {
          departure,
          arrival,
          departureCurrent,
          arrivalCurrent,
        }
      }
    })
    .filter(Boolean)

  // NOTE: return only if have cheaper airports
  // NOTE: return only if have cheaper airports
  if (cheaperAirports.length <= 0) {
    return
  }

  if (cheaperAirports.length > 1) {
    return {
      ...cheaperAirports[1],
      flightDirection: FlightDirection.Return,
    }
  }
  return {
    ...cheaperAirports[0],
    flightDirection: FlightDirection.Straight,
  }
}
