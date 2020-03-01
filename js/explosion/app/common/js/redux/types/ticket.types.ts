import { TariffType } from 'shared_components/types/tariffs'
import { Proposal, AirlineWithoutPrice, Trip } from 'shared_components/ticket/ticket.types'
import { TicketTuple, TicketData } from 'shared_components/ticket/ticket_incoming_data.types'
import { TicketSharingsSocials } from 'shared_components/ticket/ticket_sharing/ticket_sharing.utils'
import { MobileTicketModalType } from 'shared_components/ticket/ticket.mobile'

export const TICKET_CLICKED = 'TICKET_CLICKED'
export const TICKET_TARIFF_CHANGE = 'TICKET_TARIFF_CHANGE'
export const TICKET_BUY_CLICK = 'TICKET_BUY_CLICK'
export const TICKET_SHARE = 'TICKET_SHARE'
export const TICKET_SHARE_TOOLTIP_SHOWN = 'TICKET_SHARE_TOOLTIP_SHOWN'
export const TICKET_URL_COPY = 'TICKET_URL_COPY'
export const TICKET_HOTEL_STOP_CLICKED = 'TICKET_HOTEL_STOP_CLICKED'
export const TICKET_FLIGHT_INFO_CLICKED = 'TICKET_FLIGHT_INFO_CLICKED'
export const TICKET_WARNING_BADGE_TOOLTIP_SHOWN = 'TICKET_WARNING_BADGE_TOOLTIP_SHOWN'
export const TICKET_CREDIT_CLICK = 'TICKET_CREDIT_CLICK'
export const TICKET_REFRESH_CLICK = 'TICKET_REFRESH_CLICK'
export const TICKET_OPEN_MODAL_CLICK = 'TICKET_OPEN_MODAL_CLICK'
export const TICKET_CLOSE_MODAL_CLICK = 'TICKET_CLOSE_MODAL_CLICK'
export const TICKET_PIN_CLICK = 'TICKET_PIN_CLICK'
export const TICKET_SUBSCRIPTION_CLICK = 'TICKET_SUBSCRIPTION_CLICK'
export const TICKET_SCHEDULE_CLICK = 'TICKET_SCHEDULE_CLICK'
export const TICKET_SHOW_CONFIRM = 'TICKET_SHOW_CONFIRM'

export interface TicketScheduleClickAction {
  type: typeof TICKET_SCHEDULE_CLICK
  ticket: TicketTuple
  sign: string
}

export interface TicketSubscriptionClickAction {
  type: typeof TICKET_SUBSCRIPTION_CLICK
  hasSubscription: boolean
  ticket: TicketTuple
}

export interface TicketPinClickAction {
  type: typeof TICKET_PIN_CLICK
  trips: Trip[]
  isActive: boolean
  target: string
  segmentIndex: number
}

export interface TicketCloseModalClickAction {
  type: typeof TICKET_CLOSE_MODAL_CLICK
  ticketIndex: number
  ticketData: TicketData
  modal: MobileTicketModalType
}

export interface TicketOpenModalClickAction {
  type: typeof TICKET_OPEN_MODAL_CLICK
  ticketIndex: number
  ticketData: TicketData
  modal: MobileTicketModalType
}

export interface TicketRefreshClickAction {
  type: typeof TICKET_REFRESH_CLICK
}

export interface TicketCreditClickAction {
  type: typeof TICKET_CREDIT_CLICK
  ticket: TicketTuple
}

export interface TicketWarningBadgeTooltipShownAction {
  type: typeof TICKET_WARNING_BADGE_TOOLTIP_SHOWN
  key: string
}

export interface TicketFlightInfoClickedAction {
  type: typeof TICKET_FLIGHT_INFO_CLICKED
  isOpened: boolean
}

export interface TicketHotelStopClickedAction {
  type: typeof TICKET_HOTEL_STOP_CLICKED
}

export interface TicketUrlCopyAction {
  type: typeof TICKET_URL_COPY
  isCopyCommandSupported: boolean
}

export interface TicketShareTooltipShownAction {
  type: typeof TICKET_SHARE_TOOLTIP_SHOWN
  ticket: TicketTuple
}

export interface TicketShareAction {
  type: typeof TICKET_SHARE
  network: TicketSharingsSocials
  ticketIndex: number
}

export interface TicketBuyData {
  proposal: Proposal | AirlineWithoutPrice
  shouldShowConfirm: boolean
  eventType: BuyEvents
  ticket: TicketTuple
  currentTariff: TariffType
  ticketIndex: number
  isOpen: boolean
  wasOpened: boolean
  reachGoalData?: object
}

export interface TicketBuyClickAction {
  type: typeof TICKET_BUY_CLICK
  data: TicketBuyData
  event: React.MouseEvent
}

export interface TicketTariffChangeAction {
  type: typeof TICKET_TARIFF_CHANGE
  currentTariff: TariffType
}

export interface TicketClickAction {
  type: typeof TICKET_CLICKED
  isOpenAction: boolean
  ticketData: TicketData
  ticketIndex: number
}

export type TicketActions =
  | TicketClickAction
  | TicketTariffChangeAction
  | TicketBuyClickAction
  | TicketShareAction
  | TicketUrlCopyAction
  | TicketShareTooltipShownAction
  | TicketHotelStopClickedAction
  | TicketFlightInfoClickedAction
  | TicketWarningBadgeTooltipShownAction
  | TicketCreditClickAction
  | TicketRefreshClickAction
  | TicketCloseModalClickAction
  | TicketOpenModalClickAction
  | TicketPinClickAction
  | TicketSubscriptionClickAction
  | TicketScheduleClickAction

export enum BuyEvents {
  BuyButton = 'BUY_BUTTON',
  AirlineLogo = 'LOGO',
  Proposal = 'PROPOSAL',
  ContextMenu = 'CONTEXTMENU',
}
