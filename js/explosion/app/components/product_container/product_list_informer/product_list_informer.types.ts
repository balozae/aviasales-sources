export interface Segment {
  origin: string
  origin_city_iata?: string
  destination: string
  destination_city_iata?: string
  original_origin: string
  original_destination: string
}

export interface Airport {
  name: string
}

export interface CheaperAirport {
  departure: string
  arrival: string
  arrivalCurrent: string
  departureCurrent: string
  flightDirection: FlightDirection
}

export enum FlightDirection {
  Return = 'return',
  Straight = 'straight',
}

export enum InformerType {
  CheaperAirport = 'cheaperAirport',
  DirectFlight = 'directFlight',
}
