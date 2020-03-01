import { TicketBadgeProps } from './ticket_badge/ticket_badge'
import { AircraftResponseInfo } from 'shared_components/flight_amenities/flight_amenities.types'
import {
  Gate,
  Airline,
  Airport,
  Passengers,
  TicketData,
  Flight,
  Transfer,
  IncomingBadge,
} from './ticket_incoming_data.types'
import { Currency } from './ticket_context/ticket_currency_context/ticket_currency_context'
import { ReactElement } from 'react'
import { BuyButtonProps } from './buy_button/buy_button'
import { TicketProposalsProps } from './ticket_proposals/ticket_proposals'
import { SplitedBadges } from './utils/ticket_badge.utils'
import { TicketScheduleProps } from './ticket_schedule/ticket_schedule'
import { Hotel } from './ticket_incoming_data.types'
import { TicketHotelInfoProps } from './ticket_hotel_info/ticket_hotel_info'
import { SegmentRouteProps } from './ticket_segment_route/ticket_segment_route'
import { TicketTariffsProps } from './ticket_tariffs/ticket_tariffs'
import { Bags, TariffType } from 'shared_components/types/tariffs'
import { MobileTicketModalType } from './ticket.mobile'
import { TicketFlightProps } from './ticket_flight/ticket_flight'
import { TicketSharingProps } from './ticket_sharing/ticket_sharing'
import { TicketStopProps } from './ticket_stop/ticket_stop'

export type Maybe<T> = T | null
export type Dirty<T> = T | undefined

export enum SearchStatus {
  Inited = 'INITED',
  Started = 'STARTED',
  Shown = 'SHOWN',
  Finished = 'FINISHED',
  Expired = 'EXPIRED',
}

export type TripTransport = 'airplane' | 'boat' | 'taxi' | 'train' | 'bus'

export interface Gates {
  [gateId: string]: Gate
}

export interface Airports {
  [iata: string]: Airport
}

export interface Airlines {
  [airlineIata: string]: Airline
}

export interface FlightInfo {
  [key: string]: AircraftResponseInfo
}

export interface TicketSegment {
  route: Trip[]
  transfers?: Transfer[]
}

export interface Theme {
  brandColor: string
  sideContent?: ReactElement<any> | string
  expandButtonText?: ReactElement<any> | string
}

// type TripClass = 'Y' | 'B'

export interface Trip extends Flight {
  transport: TripTransport
}

export enum ProposalType {
  Airline = 'airline',
  Proposal = 'proposal',
  AirlineWithoutPrice = 'airlineWithoutPrice',
}
export interface Proposal {
  price: number
  currency: Currency
  unifiedPrice: number
  type: ProposalType
  isAssisted?: boolean
  gateId: number
  proposalId: number
  deeplink: string
  worstBags: Bags
  bags?: Bags[][]
  debugProductivity?: number
  debugMultiplier?: number
  debugProposalMultiplier?: number | undefined
  gate: Gate
  isCharter?: boolean
}

export interface AirlineWithoutPrice {
  siteName: string
  deeplink: string
  type: ProposalType.AirlineWithoutPrice
}

export type Proposals = { [tariff in TariffType]: Proposal[] } & {
  priceDifference: number
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
  // segments: {
  //   date: string
  //   depart_date: string
  //   destination: string
  //   destination_cases: {[key: string]: string}
  //   destination_country: string
  //   destination_countryIata: string
  //   destination_country_name: string
  //   destination_iata: string
  //   destination_name: string
  //   destination_type: string
  //   destination_weight: number
  //   direct_flights_days: {start: string, days: string}
  //   origin: string
  //   origin_cases: {[key: string]: string}
  //   origin_country: string
  //   origin_countryIata: string
  //   origin_country_name: string
  //   origin_iata: string
  //   origin_name: string
  //   origin_type: string
  //   origin_weight: number
  //   original_destination: string
  //   original_origin: string
  // }[]
  segments: any[]
  startSearch: boolean
  tripClass: string
  tripType: string
  trip_class: string
  with_request: boolean
  originName?: string
  destinationName?: string
  searchDate?: string
}

export type AirlineProposals = { [tariff in TariffType]: Proposal | AirlineWithoutPrice | null }

export interface BuyData {
  proposal: Proposal
  proposals: Proposals
  airlineProposals: AirlineProposals
  ticketData: TicketData
  currentTariff: TariffType
  badgesData: TicketBadgeProps[]
  withAgencyCheaperAirlinePlate: boolean
  isOpen: boolean
  wasOpened: boolean
}

export enum TripDirectionType {
  OneWay = 'oneway',
  RoundTrip = 'roundtrip',
  Multiway = 'multiway',
}

export enum TicketMediaQueryTypes {
  Desktop = 'desktop',
  Mobile = 'mobile',
}

export interface TicketViewProps {
  // Required
  ticketUrl: string
  ticketSchedule: TicketScheduleProps['schedule'] | null
  tripDirectionType: TripDirectionType
  ticketTransportType: TripTransport
  currentTariff: TariffType
  proposals: Proposals
  mainProposal: Proposal
  proposalsByTariff: Proposal[]
  isSearchExpired: boolean
  airlineProposal: AirlineWithoutPrice | Proposal | null
  carriers: string[]
  badges: SplitedBadges
  segments: TicketSegment[]
  showRemainingSeatsCount: boolean
  modifiers: string[] | []
  // Optional
  theme?: Theme
  origGateId?: number
  debugProposals?: boolean
  withSharing?: boolean
  withBuyCol?: boolean
  flightInfo?: FlightInfo
  fixedTrips?: string[]
  showPin?: boolean
  onScheduleClick?: TicketScheduleProps['onScheduleClick']
  isShouldShowCredit?: boolean
  searchParams?: SearchParams
  marker?: string
  isNightMode?: boolean
  selectedScheduleSign?: TicketScheduleProps['selectedScheduleSign']
  strikePrice?: number
  isOpenable?: boolean
  isScheduleTicket?: boolean
  currentMobileModal?: MobileTicketModalType
  isFavorite?: boolean
  hasSubscription?: boolean
  withSubscription?: boolean
  withFavorite?: boolean
  withFavoriteOnMobilePreview?: boolean
  withSubscriptionOnMobilePreview?: boolean
  buyButtonType?: BuyButtonProps['type']
  sign?: string
  actual?: boolean
  showTariffs?: boolean
  seatsCount?: number | null
  hotelInfo?: Hotel
  isProposalTitleHidden?: boolean
  sideExtraContent?: React.ReactNode
  incomingBadge?: IncomingBadge
  // Callbacks
  getMetaInfo: (proposal?: Proposal) => void
  onTariffChange: TicketTariffsProps['onTariffChange']
  onTicketClick: (isOpenAction: boolean) => void
  onTicketShare?: TicketSharingProps['onTicketShare']
  onShareTooltipShow?: TicketSharingProps['onTooltipShow']
  onTicketUrlCopy?: TicketSharingProps['onTicketUrlCopy']
  onHotelStopClick?: TicketStopProps['onHotelClick']
  onFlightInfoClick?: TicketFlightProps['onFlightInfoClick']
  onWarningBadgeTooltip?: TicketBadgeProps['onTooltip']
  onCreditClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  onRefreshClick?: (e: React.MouseEvent, proposal: Dirty<Proposal>) => void
  onMobileProposalsClick?: () => void
  onMobileSharingClick?: () => void
  onMobilePreviewClick?: () => void
  onModalCloseClick?: (modal: MobileTicketModalType) => void
  onFavoriteClick?: (isFavorite: boolean, sign?: string) => void
  onSubscriptionClick?: (hasSubscription: boolean, sign?: string) => void
  onBuyButtonClick?: BuyButtonProps['onClick']
  onBuyButtonContextMenu?: BuyButtonProps['onContextMenu']
  onProposalClick?: TicketProposalsProps['onProposalClick']
  onHotelInfoClick?: TicketHotelInfoProps['onDeeplinkClick']
  onPinClick?: SegmentRouteProps['onPinClick']
}
