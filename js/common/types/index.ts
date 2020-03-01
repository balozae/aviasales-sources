import { Passengers } from 'form/components/avia_form/avia_form.types'

export enum RequestStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Failure = 'failure',
}

export enum TripClass {
  Economy = 'Y',
  PremiumEconomy = 'W',
  Business = 'C',
  FirstClass = 'F',
}

export interface Flight {
  aircraft?: string
  arrival: string
  arrival_date: string
  arrival_time: string
  arrival_timestamp: number
  baggage?: string | false
  delay: number
  departure: string
  departure_date: string
  departure_time: string
  departure_timestamp: number
  duration: number
  equipment?: string
  fare?: string
  local_arrival_timestamp: number
  local_departure_timestamp: number
  marketing_carrier?: string
  number: number
  operated_by?: string
  operating_carrier: string
  rating?: number
  seats?: number | string
  technical_stops: string[]
  trip_class: string
}

export interface Segment {
  flight: Flight[]
}

type NullableNumber = number | null
export type Currency = string // TODO: Declare type Currency
export type CurrencyRates = { [key in string]: number }

export interface Ticket {
  carriers: string[]
  flight_weight: number
  is_charter?: boolean
  is_direct: boolean
  is_popular: boolean
  marketing_carrier: string
  max_stop_duration: NullableNumber
  max_stops: NullableNumber
  min_stop_duration: NullableNumber
  multiplier?: NullableNumber
  orig_gate_id: number
  rating: number
  rating_summary?: {
    good?: string[]
    bad?: string[]
  }
  seats?: number | null
  segment: ReadonlyArray<Segment>
  segment_durations: number[]
  segments_airports: Array<string>[]
  segments_time: number[] | number[][]
  sign: string
  stops_airports: string[]
  terms: { [gateId in string | number]: Term }
  xterms: { [gateId in string | number]: { [termCode in string | number]: XTerm } }
  ticket_rating: number
  total_duration: number
  validating_carrier: string
}

export interface Term {
  currency: string
  flights_baggage: Array<string>[]
  flights_handbags: Array<string>[]
  is_charter?: boolean
  price: number
  unified_price: number
  url: number
}

export interface XTerm extends Term {
  debugMultiplier: number
  debugProductivity: number
  fare_codes: Array<string>[]
  fare_codes_key: string
  gate_id: string
}

export interface Terms {
  [key: number]: Term
}

export interface SearchHistory {
  created_at: string
  id: string
  search_params: SearchParams
  ticket: Ticket
}

export interface SearchParams {
  currency: Currency
  destinationCityIata: string
  host: string
  isOneWay: boolean
  isPlacesRestored: boolean
  locale: string
  market: string
  originCityIata: string
  passengers: Passengers
  searchHotels: number
  segments: any
  startSearch: boolean
  tripClass: TripClass
  tripType: string
  trip_class: string
  with_request: boolean
  originName?: string
  destinationName?: string
  destinationCases?: { [key in string]: string }
  originCases?: { [key in string]: string }
}

export enum TripType {
  OneWay = 'oneway',
  RoundTrip = 'roundtrip',
}
