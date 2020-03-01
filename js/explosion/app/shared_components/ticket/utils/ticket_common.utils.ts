import { TicketData, Flight, Segment } from '../ticket_incoming_data.types'
import { TripTransport, FlightInfo } from '../ticket.types'

const MIN_COMFORTABLE_SEATS_PITCH_SIZE = 75
const NIGHT_TIME_UP = 5
const LONG_STOP = 180 // 3 * 60

export const isBus = (ticket: TicketData): boolean => {
  if (ticket.is_mixed && ticket.is_mixed.includes('bus')) {
    return true
  }

  if (ticket.segment && ticket.segment.length) {
    return ticket.segment.some((segment: Segment) => {
      if (segment.flight) {
        return segment.flight.some((flight: Flight) => Boolean(flight.is_bus))
      }

      return false
    })
  }

  return false
}

export const isTrain = (ticket: TicketData): boolean => {
  if (ticket.is_mixed && ticket.is_mixed.includes('train')) {
    return true
  }

  if (ticket.segment && ticket.segment.length) {
    return ticket.segment.some((segment: Segment) => {
      if (segment.flight) {
        return segment.flight.some((flight: Flight) => Boolean(flight.is_train))
      }

      return false
    })
  }

  return false
}

export const isFullyTrain = (ticket: TicketData): boolean => {
  if (ticket.segment && ticket.segment.length) {
    return ticket.segment.every((segment: Segment) => {
      if (segment.flight) {
        return segment.flight.every((flight: Flight) => Boolean(flight.is_train))
      }

      return false
    })
  }

  return false
}

export const isFullyBus = (ticket: TicketData): boolean => {
  if (ticket.segment && ticket.segment.length) {
    return ticket.segment.every((segment: Segment) => {
      if (segment.flight) {
        return segment.flight.every((flight: Flight) => Boolean(flight.is_bus))
      }

      return false
    })
  }

  return false
}

export const isAirportChange = (ticket: TicketData): boolean => {
  if (ticket.segment && ticket.segment.length) {
    return ticket.segment.some((segment) => {
      if (segment.flight) {
        let prevAirport = ''
        return segment.flight.some((flight) => {
          if (prevAirport && prevAirport !== flight.departure) {
            return true
          }
          prevAirport = flight.arrival
          return false
        })
      }

      return false
    })
  }

  return false
}

export const isNightStop = (ticket: TicketData): boolean => {
  if (ticket.segment && ticket.segment.length) {
    return ticket.segment.some((segment) => {
      if (segment.flight) {
        let prevFlight
        return segment.flight.some((flight) => {
          if (prevFlight && isDuringNight(prevFlight, flight)) {
            return true
          }
          prevFlight = flight
          return false
        })
      }

      return false
    })
  }

  return false
}

export const isDuringNight = (flight: Flight, nextFlight: Flight): boolean => {
  return (
    flight.arrival_date !== nextFlight.departure_date ||
    parseInt(flight.arrival_time, 10) < NIGHT_TIME_UP
  )
}

export const isLongStop = (ticket: TicketData): boolean => {
  if (ticket.max_stop_duration) {
    return ticket.max_stop_duration > LONG_STOP
  }
  return false
}

export const isRecheckBaggage = (ticket: TicketData) => {
  if (ticket.segment && ticket.segment.length) {
    return ticket.segment.some((segment) => {
      if (segment.transfers && segment.transfers.length) {
        return segment.transfers.some((transfer) => transfer.recheck_baggage)
      }
    })
  }

  return false
}

export const isAirportDifferent = (ticket: TicketData): boolean => {
  if (!ticket.segments_airports || ticket.segments_airports.length !== 2) {
    return false
  }

  // check if first segment arrival airport isnt second segment departure airport
  return ticket.segments_airports[0][1] !== ticket.segments_airports[1][0]
}

export const isUncomfortableChairs = (ticket: TicketData, flightInfo?: FlightInfo): boolean => {
  if (!flightInfo || !ticket.segment.length) {
    return false
  }

  return ticket.segment.some((segment) => {
    if (!segment.flight || !segment.flight.length) {
      return false
    }

    return segment.flight.some((flight) => {
      const carrier = flight.marketing_carrier || flight.operating_carrier
      const flightInfoString = `${flight.trip_class}${carrier}${flight.number}`
      const currentFlightInfo = flightInfo[flightInfoString]

      if (currentFlightInfo && currentFlightInfo.seat && currentFlightInfo.seat.pitch) {
        const pitch = Math.round(currentFlightInfo.seat.pitch)
        return pitch < MIN_COMFORTABLE_SEATS_PITCH_SIZE
      }
      return false
    })
  })
}

export type NeedVisaCountry = {
  country: string
  isTransit?: boolean
}

export const isNeedVisaCountries = (ticket: TicketData): NeedVisaCountry[] => {
  const needVisaCountries = {}
  ticket.segment.forEach((segment) => {
    const transfers = segment.transfers
    if (transfers) {
      transfers.forEach((transfer) => {
        if (transfer.visa_rules.required) {
          needVisaCountries[transfer.country_code] =
            /* NOTE: We mark this visa as «Transit» because usually VISA not needed in GB,
              but in this case — needed. The logic on the backend
            */
            needVisaCountries[transfer.country_code] || transfer.country_code === 'GB'
        }
      })
    }
  })

  return Object.keys(needVisaCountries).map((country) => ({
    country,
    isTransit: needVisaCountries[country],
  }))
}

export const getTicketTransportType = (ticket: TicketData): TripTransport => {
  if (isBus(ticket)) {
    return 'bus'
  }
  if (isTrain(ticket)) {
    return 'train'
  }
  return 'airplane'
}

export const getTripTransportType = (trip: Flight): TripTransport => {
  if (trip.is_bus) {
    return 'bus'
  }
  if (trip.is_train) {
    return 'train'
  }
  return 'airplane'
}
