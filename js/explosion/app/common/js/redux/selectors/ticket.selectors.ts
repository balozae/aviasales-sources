import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'
import { AppState } from '../types/root/explosion'
import {
  TicketTuple,
  TicketData,
  Segment,
  RawProposal,
} from 'shared_components/ticket/ticket_incoming_data.types'
import { createUrl } from 'common/js/ticket_url_creator'
import { getSearchId } from './search.selectors'
import { getCurrencies } from './currencies.selectors'
import { TariffType } from 'shared_components/types/tariffs'
import { Proposal } from 'shared_components/ticket/ticket.types'
import { getTicketTransportType } from 'shared_components/ticket/utils/ticket_common.utils'
import { getTripDirectionType as getTicketTripDirectionType } from 'shared_components/ticket/utils/common.utils'
import { prepareTicketSegments } from 'shared_components/ticket/ticket_segment/ticket_segment.utils'
import { getAirports } from './airports.selectors'
import {
  splitBadgesByValueType,
  prepareBadgesData,
  SplitedBadges,
} from 'shared_components/ticket/utils/ticket_badge.utils'
import { getFlightInfo } from './flight_info.selectors'
import { prepareTicketCarriers } from 'shared_components/ticket/utils/ticket_carrier.utils'
import { getCreditPartner } from './credit_partner.selectors'
import {
  shouldShowCredit,
  isScheduleTicket,
  getScheduleTicketGroupKey,
} from 'components/product_list/product_list.utils'
import { getCurrentMobileModal } from './browser_history.selectors'
import { prepareTicketProposals } from './proposals.selectors'
import { ScheduleTicketsIterator } from '../types/selected_schedule_tickets.types'
import { ScheduleTicketProps } from 'components/product_list/product_ticket'
import { prepareTicketSchedule } from 'shared_components/ticket/utils/ticket_schedule.utils'
import { getTicketShortUrl } from './ticket_short_urls.selectors'
import { TicketBadgeProps } from 'shared_components/ticket/ticket_badge/ticket_badge'

export const getIsScheduleTicket = createSelector(
  (ticketData: TicketData) => ticketData,
  (ticketData) => isScheduleTicket(ticketData),
)

export const getScheduleTicketsProps = createSelector(
  (ticket: TicketTuple) => getIsScheduleTicket(ticket[0]),
  (originalTicket: TicketTuple) => originalTicket,
  (_ot: TicketTuple, scheduleTicketsMap: ScheduleTicketsIterator<ReadonlyArray<TicketTuple>>) =>
    scheduleTicketsMap,
  (
    _ot: TicketTuple,
    _s: ScheduleTicketsIterator<TicketTuple[]>,
    selectedScheduleTickets: ScheduleTicketsIterator<TicketTuple>,
  ) => selectedScheduleTickets,
  (isSchedule, ticket, scheduleTickets, selectedScheduleTickets): ScheduleTicketProps => {
    let replacedTicket = ticket
    let resultScheduleTicketsByGroupKey: ReadonlyArray<TicketTuple> = []
    let selectedScheduleSign: string | undefined = undefined
    if (!isSchedule) {
      return {
        ticket: replacedTicket,
        ticketSchedule: [],
        selectedScheduleSign,
        isScheduleTicket: false,
      }
    }
    const groupKey = getScheduleTicketGroupKey(ticket[0])
    Object.keys(scheduleTickets).forEach((key) => {
      if (groupKey === key) {
        const scheduleTicketsByGroupKey = scheduleTickets[key]
        const selectedTicket = selectedScheduleTickets[key]
        if (scheduleTicketsByGroupKey) {
          resultScheduleTicketsByGroupKey = scheduleTicketsByGroupKey
        }
        if (scheduleTicketsByGroupKey && scheduleTicketsByGroupKey.length && selectedTicket) {
          replacedTicket = selectedTicket
          selectedScheduleSign = selectedTicket[0].sign
        }
      }
    })

    return {
      ticket: replacedTicket,
      ticketSchedule: prepareTicketSchedule(resultScheduleTicketsByGroupKey),
      selectedScheduleSign,
      isScheduleTicket: true,
    }
  },
)

export const getTicketUrl = createSelector(
  (_state: AppState, ticket: TicketTuple) => ticket,
  getTicketShortUrl,
  getSearchId,
  getCurrencies,
  (ticket, shortUrl, searchId, currencyRates) => {
    if (shortUrl) {
      return shortUrl
    }
    const [ticketData, proposals] = ticket
    return createUrl({
      ticket: ticketData,
      unified_price: proposals[0] ? proposals[0].unified_price : null,
      searchId: searchId!,
      currencyRates,
    })
  },
)

export const getCarriers = createSelector(
  (segments: Segment[]) => segments,
  (segments) => prepareTicketCarriers(segments),
)

export const getTransportType = createSelector(
  (ticket: TicketData) => ticket,
  (ticket) => getTicketTransportType(ticket),
)

export const prepareSegments = createSelector(
  (ticket: TicketData) => ticket,
  (ticket) => prepareTicketSegments(ticket),
)

export const getTripDirectionType = createSelector(
  (state: AppState, segments: Segment[]) => segments,
  getAirports,
  (segments, airports) => getTicketTripDirectionType(segments, airports),
)

export const getBadgesByTariff = createSelector(
  (_s: AppState, ticketData: TicketData) => ticketData,
  prepareTicketProposals,
  getFlightInfo,
  (_s: AppState, _t: TicketData, currentTariff: TariffType) => currentTariff,
  (ticketData, [proposals], flightInfo, currentTariff): TicketBadgeProps[] => {
    const mainProposal = proposals[currentTariff][0]
    if (!mainProposal) {
      return []
    }
    return prepareBadgesData({
      ticket: ticketData,
      segment: ticketData.segment[0],
      flightInfo,
      isCharter: !!mainProposal.isCharter,
    })
  },
)

export const getBadges = createCachedSelector(
  (state: AppState, ticketData: TicketData) => ticketData,
  (state: AppState, ticketData: TicketData, mainProposal: Proposal) => mainProposal,
  getFlightInfo,
  (ticketData, mainProposal, flightInfo): SplitedBadges => {
    if (!mainProposal) {
      return {}
    }
    return splitBadgesByValueType(
      prepareBadgesData({
        ticket: ticketData,
        flightInfo,
        segment: ticketData.segment[0],
        isCharter: !!mainProposal.isCharter,
      }),
    )
  },
)((state, ticketData) => ticketData.sign)

export const isShouldShowCredit = createSelector(
  (state: AppState, proposals: RawProposal[]) => proposals,
  getCreditPartner,
  (proposals, creditPartner) => shouldShowCredit(creditPartner, proposals),
)

export const getCurrentTicketMobileModal = createCachedSelector(
  (state: AppState, ticketSign: string) => ticketSign,
  getCurrentMobileModal,
  (ticketSign, currentMobileModal) =>
    (currentMobileModal &&
      currentMobileModal.ticketSign === ticketSign &&
      ticketSign &&
      currentMobileModal.modal) ||
    undefined,
)((_state, sign) => sign)

export const getWithAgencyCheaperAirlinePlate = createSelector(
  prepareTicketProposals,
  (_s: AppState, _t: TicketData, currentTariff: TariffType) => currentTariff,
  ([proposals, airlineProposals], currentTariff) => {
    const airlineProposal = airlineProposals[currentTariff]

    return !!(
      airlineProposal &&
      (airlineProposal as Proposal).unifiedPrice &&
      proposals[currentTariff].length > 0 &&
      (airlineProposal as Proposal).unifiedPrice > proposals[currentTariff][0].unifiedPrice
    )
  },
)

export const getBuyClickTicketEventData = createSelector(
  (state: AppState, ticket: TicketTuple) => getIsScheduleTicket(ticket[0]),
  (state: AppState, ticket: TicketTuple) => getWithAgencyCheaperAirlinePlate(state, ticket[0]),
  (state: AppState, ticket: TicketTuple, currentTariff: TariffType) =>
    getBadgesByTariff(state, ticket[0], currentTariff),
  (_s: AppState, ticket: TicketTuple) => ticket,
  (_s: AppState, _t: TicketTuple, currentTariff: TariffType) => currentTariff,
  (_s: AppState, _t: TicketTuple, _c: TariffType, ticketIndex: number) => ticketIndex,
  (_s: AppState, _t: TicketTuple, _c: TariffType, _i: number, isOpen: boolean) => isOpen,
  (_s: AppState, _t: TicketTuple, _c: TariffType, _i: number, _o: boolean, wasOpened: boolean) =>
    wasOpened,
  (
    isSchedule,
    withAgencyCheaperAirlinePlate,
    badges,
    [ticketData, rawProposals],
    currentTariff,
    ticketIndex,
    isOpen,
    wasOpened,
  ) => ({
    cheaperTariffKey: ticketData.tariffs.cheaperTariffKey,
    is_direct: ticketData.is_direct,
    validating_carrier: ticketData.validating_carrier,
    ticket_position: ticketIndex,
    max_stops: ticketData.max_stops,
    recommend: ticketData.recommend,
    tariff_key: currentTariff,
    with_agency_cheaper_airline_plate: withAgencyCheaperAirlinePlate,
    opened: isOpen,
    opened_before: wasOpened,
    badges: badges.map((badge) => badge.valueKey),
    segment: ticketData.segment,
    is_schedule_ticket: isSchedule,
    segments_time: ticketData.segments_time,
    original_ticket_time: ticketData.segments_time,
    original_ticket_price: rawProposals[0].unified_price,
  }),
)
