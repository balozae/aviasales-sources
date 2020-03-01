// TODO: use enum when https://github.com/babel/babel/issues/8741 will done

export type Dirty<T> = T | undefined

export type Map<T> = { [key: string]: T }

export enum AmenitiesCost {
  No = 'no',
  Free = 'free',
  Paid = 'paid',
}

interface Wifi {
  cost: AmenitiesCost
  type?: string
}

export enum FoodType {
  Food = 'food',
  Meal = 'meal',
}

interface Food {
  cost: AmenitiesCost
  type?: FoodType
  isPremium: boolean
}

export enum EntertainmentType {
  OnDemand = 'on_demand',
  Streaming = 'streaming',
  Entertainment = 'entertainment',
  Overhead = 'overhead',
  Seatback = 'seatback',
  Tablet = 'tablet',
  Livetv = 'livetv',
}

interface Entertainment {
  cost: AmenitiesCost
  type?: EntertainmentType
}

export enum PowerType {
  Adapter = 'adapter',
  PowerUsb = 'power_usb',
  Usb = 'usb',
}

interface Power {
  cost: AmenitiesCost
  type?: PowerType
}

interface Beverage {
  cost: AmenitiesCost
  type?: string
}

export type Amenity = Wifi | Food | Entertainment | Power | Beverage

export interface Amenities {
  wifi: Wifi
  food: Food
  entertainment: Entertainment
  power: Power
  nonAlcoholic: Beverage
  alcoholic: Beverage
}

export interface AircraftResponse {
  name: string
  equipment: string
  popularity: number
  aircraft_info: AircraftResponseInfo
  rating?: number
}

export interface AircraftResponseInfo {
  amenities?: AircraftResponseInfoAmenities
  delay?: AircraftResponseInfoDelay
  seat?: AircraftResponseInfoSeatsInfo
}

export interface AircraftResponseInfoAmenities {
  wifi: AircraftResponseInfoAmentity
  food: AircraftResponseInfoAmentity
  entertainment: AircraftResponseInfoAmentity
  power: AircraftResponseInfoAmentity
  beverage?: AircraftResponseInfoBeverage
  layout?: AircraftResponseInfoLayout
}

interface AircraftResponseInfoLayout {
  quality: string
  summary: string
  row_layout: string
  direct_aisle_access: boolean
  type: string
}

export interface AircraftResponseInfoDelay {
  min?: number
  max?: number
  mean?: number
  ontime_percent?: number
}

export interface AircraftResponseInfoSeatsInfo {
  pitch?: number
  width?: number
  width_description?: SeatWidth
}

interface AircraftResponseInfoAmentity {
  exists: boolean
  summary: string
  paid?: boolean
  type?: string
}

interface AircraftResponseInfoBeverage {
  exists: boolean
  type: string // 'nonalcoholic' | 'premium_alcoholic' | 'alcoholic_and_nonalcoholic'
  quality?: string // 'standard' | 'better' | 'na'
  alcoholic_paid: boolean
  nonalcoholic_paid: boolean
}

export interface AircraftInfo {
  amenities: Amenities
  seats: SeatsInfo
  seatsLayout: string
  delay?: Delay
  rating?: number
  aircraftName?: string
}

export interface Delay {
  ontimePercent: number
  mean: number
  min: number
  max: number
}

export enum SeatWidth {
  Standard = 'standard',
  Wider = 'wider',
}

export interface SeatsInfo {
  pitch: number
  width: number | SeatWidth
}

export interface FlightInfo {
  flightName: string
  airlineName: string
  aircrafts: ReadonlyArray<AircraftResponse>
}
