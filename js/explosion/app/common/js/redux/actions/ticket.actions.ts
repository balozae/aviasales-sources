import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { AppState } from '../types/root/explosion'
import {
  TicketActions,
  TICKET_CLICKED,
  TICKET_TARIFF_CHANGE,
  TICKET_BUY_CLICK,
  TicketBuyData,
  TICKET_SHARE,
  TICKET_SHARE_TOOLTIP_SHOWN,
  TICKET_URL_COPY,
  TICKET_HOTEL_STOP_CLICKED,
  TICKET_FLIGHT_INFO_CLICKED,
  TICKET_WARNING_BADGE_TOOLTIP_SHOWN,
  TICKET_CREDIT_CLICK,
  TICKET_REFRESH_CLICK,
  TICKET_OPEN_MODAL_CLICK,
  TICKET_CLOSE_MODAL_CLICK,
  TICKET_PIN_CLICK,
  TICKET_SUBSCRIPTION_CLICK,
  TICKET_SCHEDULE_CLICK,
} from '../types/ticket.types'
import { TariffType } from 'shared_components/types/tariffs'
import { TicketSharingsSocials } from 'shared_components/ticket/ticket_sharing/ticket_sharing.utils'
import { MobileTicketModalType } from 'shared_components/ticket/ticket.mobile'
import { Trip } from 'shared_components/ticket/ticket.types'
import { TicketTuple, TicketData } from 'shared_components/ticket/ticket_incoming_data.types'
import { getSearchFinished } from '../selectors/search.selectors'
import { reachGoal } from './metrics.actions'
import { getSearchParams } from '../selectors/search_params.selectors'

export const ticketScheduleClick = (ticket: TicketTuple, sign: string): TicketActions => ({
  type: TICKET_SCHEDULE_CLICK,
  ticket,
  sign,
})

export const ticketSubscription = (
  hasSubscription: boolean,
  ticket: TicketTuple,
): TicketActions => ({
  type: TICKET_SUBSCRIPTION_CLICK,
  hasSubscription,
  ticket,
})

export const ticketPinClick = (
  trips: Trip[],
  isActive: boolean,
  target: string,
  segmentIndex: number,
): TicketActions => ({
  type: TICKET_PIN_CLICK,
  trips,
  isActive,
  target,
  segmentIndex,
})

export const ticketOpenModalClick = (
  ticketIndex: number,
  ticketData: TicketData,
  modal: MobileTicketModalType,
): TicketActions => ({
  type: TICKET_OPEN_MODAL_CLICK,
  ticketIndex,
  ticketData,
  modal,
})

export const ticketCloseModalClick = (
  ticketIndex: number,
  ticketData: TicketData,
  modal: MobileTicketModalType,
): TicketActions => ({
  type: TICKET_CLOSE_MODAL_CLICK,
  ticketIndex,
  ticketData,
  modal,
})

export const ticketRefreshClick = (): TicketActions => ({
  type: TICKET_REFRESH_CLICK,
})

export const ticketCreditClick = (ticket: TicketTuple): TicketActions => ({
  type: TICKET_CREDIT_CLICK,
  ticket,
})

export const ticketWarningBadgeTooltipShown = (key: string): TicketActions => ({
  type: TICKET_WARNING_BADGE_TOOLTIP_SHOWN,
  key,
})

export const ticketFlightInfoClicked = (isOpened: boolean): TicketActions => ({
  type: TICKET_FLIGHT_INFO_CLICKED,
  isOpened,
})

export const ticketHotelStopClicked = (): TicketActions => ({
  type: TICKET_HOTEL_STOP_CLICKED,
})

export const ticketUrlCopy = (isCopyCommandSupported: boolean) => ({
  type: TICKET_URL_COPY,
  isCopyCommandSupported,
})

export const ticketShareTooltipShown = (ticket: TicketTuple): TicketActions => ({
  type: TICKET_SHARE_TOOLTIP_SHOWN,
  ticket,
})

export const ticketShare = (
  network: TicketSharingsSocials,
  ticketIndex: number,
): TicketActions => ({
  type: TICKET_SHARE,
  network,
  ticketIndex,
})

export const ticketClick = (
  isOpenAction: boolean,
  ticketData: TicketData,
  ticketIndex: number,
): TicketActions => ({
  type: TICKET_CLICKED,
  isOpenAction,
  ticketData,
  ticketIndex,
})

export const ticketTariffChange = (currentTariff: TariffType): TicketActions => ({
  type: TICKET_TARIFF_CHANGE,
  currentTariff,
})

export const ticketBuyClick = (event: React.MouseEvent, data: TicketBuyData): TicketActions => ({
  type: TICKET_BUY_CLICK,
  data,
  event,
})

// TODO: remove
export const expandTicket = (
  ticketIndex: number,
  ticketData: TicketData,
): ThunkAction<any, AppState, void, AnyAction> => (dispatch, getState) => {
  const isSearchFinished = getSearchFinished(getState())
  const searchParams = getSearchParams(getState())

  dispatch({ type: 'VIEW_FACEBOOK_CONTENT', ticketData, searchParams })
  dispatch(
    reachGoal('EXPAND_TICKET', {
      ticket_position: ticketIndex,
      search_finished: isSearchFinished,
    }),
  )
}

export const collapseTicket = (
  ticketIndex: number,
  ticketSign: string,
): ThunkAction<any, AppState, void, AnyAction> => (dispatch, getState) => {
  const isSearchFinished = getSearchFinished(getState())
  dispatch(
    reachGoal('COLLAPSE_TICKET', {
      ticket_position: ticketIndex,
      search_finished: isSearchFinished,
    }),
  )
}
