import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { AppState } from 'common/js/redux/types/root/explosion'
import TicketUIResolver from 'shared_components/ticket/ticket_ui_resolver/ticket_ui_resolver'
import {
  getTicketUrl,
  getTransportType,
  getTripDirectionType,
  prepareSegments,
  getCarriers,
  isShouldShowCredit,
  getCurrentTicketMobileModal,
  getBadges,
  getScheduleTicketsProps,
} from 'common/js/redux/selectors/ticket.selectors'
import {
  TicketTuple,
  IncomingBadge,
  TicketData,
} from 'shared_components/ticket/ticket_incoming_data.types'
import { getSearchParams } from 'common/js/redux/selectors/search_params.selectors'
import {
  ticketClick,
  ticketTariffChange,
  ticketBuyClick,
  ticketShare,
  ticketShareTooltipShown,
  ticketUrlCopy,
  ticketHotelStopClicked,
  ticketFlightInfoClicked,
  ticketWarningBadgeTooltipShown,
  ticketCreditClick,
  ticketRefreshClick,
  ticketCloseModalClick,
  ticketOpenModalClick,
  ticketPinClick,
  ticketSubscription,
  ticketScheduleClick,
} from 'common/js/redux/actions/ticket.actions'
import {
  Gates,
  TicketMediaQueryTypes,
  Proposals,
  AirlineProposals,
  FlightInfo,
  TripTransport,
  TicketSegment,
  TripDirectionType,
  Proposal,
  AirlineWithoutPrice,
  Trip,
} from 'shared_components/ticket/ticket.types'
import { TariffType } from 'shared_components/types/tariffs'
import { getSearchStatus } from 'common/js/redux/selectors/search.selectors'
import { SearchStatusState } from 'common/js/redux/types/search_status.types'
import { SearchStatus } from 'common/base_types'
import { MIN_SEATS_LEFT } from 'shared_components/ticket/ticket.constants'
import { ProductListProps } from './product_list'
import { SplitedBadges } from 'shared_components/ticket/utils/ticket_badge.utils'
import { getGates } from 'common/js/redux/selectors/gates.selectors'
import { getMetaInfo } from 'shared_components/ticket/utils/common.utils'
import { isNightMode } from 'common/js/redux/selectors/sys.selectors'
import { getDebugBags } from 'common/js/redux/selectors/debug_settings.selectors'
import { getMarker } from 'common/js/redux/selectors/marker.selectors'
import { getFixedFlights } from 'common/js/redux/selectors/fixed_flights.selectors'
import { MobileTicketModalType } from 'shared_components/ticket/ticket.mobile'
import { BuyEvents, TicketBuyData } from 'common/js/redux/types/ticket.types'
import { prepareTicketProposals } from 'common/js/redux/selectors/proposals.selectors'
import { TicketSharingsSocials } from 'shared_components/ticket/ticket_sharing/ticket_sharing.utils'
import {
  getWithTicketSubscription,
  getSubscriptionByTicketSign,
  getTicketSubscriptionActionStatusByTicketSign,
} from 'common/js/redux/selectors/ticket_subscription.selectors'
import { RequestStatus } from 'common/types'
import { TicketScheduleItem } from 'shared_components/ticket/ticket_schedule/ticket_schedule'
import { getTicketBadge } from 'common/js/redux/selectors/tickets_badges.selector'

const MODIFIERS = []

export interface ScheduleTicketProps {
  ticket: TicketTuple
  isScheduleTicket: boolean
  ticketSchedule: ReadonlyArray<TicketScheduleItem>
  selectedScheduleSign: string | undefined
}

interface OwnProps {
  ticketIndex: number
  originalTicket: TicketTuple
  reachGoalData?: object
  mediaQueryType?: TicketMediaQueryTypes
  scheduleTicketsMap: ProductListProps['scheduleTickets']
  selectedScheduleTickets: ProductListProps['selectedScheduleTickets']
  hideIncomingBadge?: boolean
}

type StateProps = ScheduleTicketProps & {
  gates: Gates
  marker: string
  ticketUrl: string
  carriers: string[]
  hasSubscription?: boolean
  fixedTrips: string[]
  isNightMode: boolean
  proposals: Proposals
  getBadges: (mainProposal: Proposal) => SplitedBadges
  incomingBadge?: IncomingBadge
  withSubscription: boolean
  flightInfo: FlightInfo
  debugProposals: boolean
  defaultTariff: TariffType
  segments: TicketSegment[]
  isShouldShowCredit: boolean
  transportType: TripTransport
  searchStatus: SearchStatusState
  tripDirection: TripDirectionType
  airlineProposals: AirlineProposals
  searchParams: AppState['searchParams']
  currentMobileModal?: MobileTicketModalType
  currentSubscriptionTicketActionStatus?: RequestStatus
}

interface DispatchProps {
  onTicketClick: (isOpenAction: boolean, ticketData: TicketData) => void
  onTariffChange: typeof ticketTariffChange
  onBuyClick: typeof ticketBuyClick
  onTicketShare: typeof ticketShare
  onTicketShareTooltipShown: typeof ticketShareTooltipShown
  onTicketUrlCopy: typeof ticketUrlCopy
  onHotelStopClick: typeof ticketHotelStopClicked
  onFlightInfoClick: typeof ticketFlightInfoClicked
  onWarningBadgeTooltip: typeof ticketWarningBadgeTooltipShown
  onCreditClick: typeof ticketCreditClick
  onRefreshClick: typeof ticketRefreshClick
  openModalClick: typeof ticketOpenModalClick
  closeModalClick: typeof ticketCloseModalClick
  onPinClick: typeof ticketPinClick
  onSubscriptionClick?: typeof ticketSubscription
  onScheduleClick: typeof ticketScheduleClick
}

type ProductTicketContainerProps = OwnProps & StateProps & DispatchProps

interface ProductTicketContainerState {
  currentTariff: TariffType
  hasSubscription?: boolean
}

class ProductTicketContainer extends React.Component<
  ProductTicketContainerProps,
  ProductTicketContainerState
> {
  ticketWasOpened: boolean = false
  ticketIsOpen: boolean = false

  static getDerivedStateFromProps = (
    props: ProductTicketContainerProps,
    state: ProductTicketContainerState,
  ): Partial<ProductTicketContainerState> => {
    const currentTariff =
      props.proposals[state.currentTariff].length > 0 ? state.currentTariff : props.defaultTariff
    const newState: Partial<ProductTicketContainerState> = { currentTariff }

    if (
      props.hasSubscription !== state.hasSubscription &&
      props.currentSubscriptionTicketActionStatus !== RequestStatus.Pending
    ) {
      newState.hasSubscription = props.hasSubscription
    }

    return newState
  }

  constructor(props: ProductTicketContainerProps) {
    super(props)
    this.state = {
      currentTariff: props.defaultTariff,
      hasSubscription: props.hasSubscription,
    }
  }

  handleTicketClick = (isOpenAction: boolean) => {
    this.ticketWasOpened = true
    this.ticketIsOpen = isOpenAction

    this.props.onTicketClick(isOpenAction, this.props.ticket[0])
  }

  handleTariffChange = (currentTariff: TariffType) => {
    this.props.onTariffChange(currentTariff)
    this.setState({ currentTariff })
  }

  handleBuyClick = (
    e: React.MouseEvent,
    proposal: Proposal | AirlineWithoutPrice,
    eventType: BuyEvents,
  ) => {
    const { ticket, ticketIndex } = this.props
    const { currentTariff } = this.state
    const shouldShowConfirm = false
    this.props.onBuyClick(e, {
      proposal,
      eventType,
      shouldShowConfirm,
      ticket,
      currentTariff,
      ticketIndex,
      wasOpened: this.ticketWasOpened,
      isOpen: this.ticketIsOpen,
      reachGoalData: this.props.reachGoalData,
    })
  }

  handleBuyButtonClick = (e: React.MouseEvent, proposal: Proposal) =>
    this.handleBuyClick(e, proposal, BuyEvents.BuyButton)
  handleBuyButtonContextMenu = (e: React.MouseEvent, proposal: Proposal) =>
    this.handleBuyClick(e, proposal, BuyEvents.ContextMenu)
  handleProposalClick = (e: React.MouseEvent, proposal: Proposal | AirlineWithoutPrice) =>
    this.handleBuyClick(e, proposal, BuyEvents.Proposal)
  handleHotelInfoClick = (e: React.MouseEvent, proposal: Proposal) =>
    this.handleBuyClick(e, proposal, BuyEvents.Proposal)

  handleTicketShare = (network: TicketSharingsSocials) =>
    this.props.onTicketShare(network, this.props.ticketIndex)

  handleRefreshClick = (event: React.MouseEvent) => {
    event.preventDefault()
    this.props.onRefreshClick()
  }

  handleTicketShareTooltip = () => this.props.onTicketShareTooltipShown(this.props.ticket)

  handleCreditClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    event.stopPropagation()
    this.props.onCreditClick(this.props.ticket)
  }

  handleModalOpenerClick = (modal: MobileTicketModalType) =>
    this.props.openModalClick(this.props.ticketIndex, this.props.ticket[0], modal)

  handleMobilePreviewClick = () => this.handleModalOpenerClick('mainModal')
  handleMobileProposalsClick = () => this.handleModalOpenerClick('proposalsModal')
  handleMobileSharingClick = () => this.handleModalOpenerClick('sharingModal')

  handleModalCloseClick = (modal: MobileTicketModalType) =>
    this.props.closeModalClick(this.props.ticketIndex, this.props.ticket[0], modal)

  handleScheduleClick = (sign: string) => this.props.onScheduleClick(this.props.ticket, sign)

  handleSubscriptionClick = (hasSubscription: boolean) => {
    if (this.props.currentSubscriptionTicketActionStatus === RequestStatus.Pending) {
      return
    }
    this.setState({ hasSubscription: !hasSubscription })

    if (this.props.onSubscriptionClick) {
      this.props.onSubscriptionClick(hasSubscription, this.props.ticket)
    }
  }

  getMetaInfo = (proposal?: Proposal) => {
    const { ticket, gates, searchStatus } = this.props
    return searchStatus === SearchStatus.Expired
      ? {}
      : getMetaInfo({
          proposal,
          ticketData: ticket[0],
          gates,
        })
  }

  render() {
    const { ticketUrl, ticket, proposals } = this.props
    const { currentTariff, hasSubscription } = this.state
    const [ticketData] = ticket

    const [mainProposal, ...proposalsByTariff] = proposals[currentTariff]

    return (
      <TicketUIResolver
        /**
         *  FLAGS
         */
        withBuyCol={true}
        isOpenable={true}
        withSharing={true}
        withSubscription={this.props.withSubscription}
        withSubscriptionOnMobilePreview={false}
        showPin={true}
        hasSubscription={hasSubscription}
        isBrandTicket={false}
        isScheduleTicket={this.props.isScheduleTicket}
        /**
         *  TICKET DATA
         */
        ticketUrl={ticketUrl}
        sign={ticketData.sign}
        ticketTransportType={this.props.transportType}
        tripDirectionType={this.props.tripDirection}
        getMetaInfo={this.getMetaInfo}
        showRemainingSeatsCount={Boolean(ticketData.seats && ticketData.seats < MIN_SEATS_LEFT)}
        seatsCount={ticketData.seats}
        badges={this.props.getBadges(mainProposal)}
        carriers={this.props.carriers}
        marker={this.props.marker}
        segments={this.props.segments}
        hotelInfo={ticketData.hotel}
        fixedTrips={this.props.fixedTrips}
        origGateId={ticketData.orig_gate_id}
        ticketSchedule={this.props.ticketSchedule}
        selectedScheduleSign={this.props.selectedScheduleSign}
        incomingBadge={this.props.hideIncomingBadge ? undefined : this.props.incomingBadge}
        /**
         *  PROPOSALS DATA
         */
        currentTariff={currentTariff}
        airlineProposal={this.props.airlineProposals[currentTariff]}
        proposalsByTariff={proposalsByTariff}
        mainProposal={mainProposal}
        proposals={proposals}
        debugProposals={this.props.debugProposals}
        /**
         *  SEARCH DATA
         */
        searchParams={this.props.searchParams || undefined}
        isSearchExpired={this.props.searchStatus === SearchStatus.Expired}
        /**
         *  COMMON PROPS
         */
        mediaQueryType={this.props.mediaQueryType}
        modifiers={MODIFIERS}
        isNightMode={this.props.isNightMode}
        flightInfo={this.props.flightInfo}
        isShouldShowCredit={this.props.isShouldShowCredit}
        currentMobileModal={this.props.currentMobileModal}
        /**
         *  CALLBACKS
         */
        onTicketClick={this.handleTicketClick}
        onTariffChange={this.handleTariffChange}
        onBuyButtonClick={this.handleBuyButtonClick}
        onBuyButtonContextMenu={this.handleBuyButtonContextMenu}
        onProposalClick={this.handleProposalClick}
        onHotelInfoClick={this.handleHotelInfoClick}
        onTicketShare={this.handleTicketShare}
        onShareTooltipShow={this.handleTicketShareTooltip}
        onTicketUrlCopy={this.props.onTicketUrlCopy}
        onHotelStopClick={this.props.onHotelStopClick}
        onFlightInfoClick={this.props.onFlightInfoClick}
        onWarningBadgeTooltip={this.props.onWarningBadgeTooltip}
        onCreditClick={this.handleCreditClick}
        onRefreshClick={this.handleRefreshClick}
        onMobilePreviewClick={this.handleMobilePreviewClick}
        onMobileProposalsClick={this.handleMobileProposalsClick}
        onMobileSharingClick={this.handleMobileSharingClick}
        onModalCloseClick={this.handleModalCloseClick}
        onPinClick={this.props.onPinClick}
        onScheduleClick={this.handleScheduleClick}
        onSubscriptionClick={this.handleSubscriptionClick}
      />
    )
  }
}

const mapStateToProps = (
  state: AppState,
  { originalTicket, scheduleTicketsMap, selectedScheduleTickets }: OwnProps,
): StateProps => {
  const { ticket, ...scheduleTicketsProps } = getScheduleTicketsProps(
    originalTicket,
    scheduleTicketsMap,
    selectedScheduleTickets,
  )
  const [proposals, airlineProposals, defaultTariff] = prepareTicketProposals(state, ticket[0])
  return {
    ...scheduleTicketsProps,
    ticket,
    proposals,
    airlineProposals,
    defaultTariff,
    marker: getMarker(),
    gates: getGates(state),
    flightInfo: state.flightInfo,
    isNightMode: isNightMode(state),
    fixedTrips: getFixedFlights(state),
    searchParams: getSearchParams(state),
    searchStatus: getSearchStatus(state),
    segments: prepareSegments(ticket[0]),
    incomingBadge: getTicketBadge(state, originalTicket[0].sign),
    debugProposals: getDebugBags(state),
    ticketUrl: getTicketUrl(state, ticket),
    carriers: getCarriers(ticket[0].segment),
    transportType: getTransportType(ticket[0]),
    withSubscription: getWithTicketSubscription(state),
    isShouldShowCredit: isShouldShowCredit(state, ticket[1]),
    getBadges: (mainProposal) => getBadges(state, ticket[0], mainProposal),
    tripDirection: getTripDirectionType(state, ticket[0].segment),
    hasSubscription: !!getSubscriptionByTicketSign(state, ticket[0].sign),
    currentMobileModal: getCurrentTicketMobileModal(state, ticket[0].sign),
    currentSubscriptionTicketActionStatus: getTicketSubscriptionActionStatusByTicketSign(
      state,
      ticket[0].sign,
    ),
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps): DispatchProps => {
  return {
    onTicketClick: (isOpenAction: boolean, ticketData: TicketData) =>
      dispatch(ticketClick(isOpenAction, ticketData, props.ticketIndex)),
    onTariffChange: (currentTariff: TariffType) => dispatch(ticketTariffChange(currentTariff)),
    onBuyClick: (e: React.MouseEvent, data: TicketBuyData) => dispatch(ticketBuyClick(e, data)),
    onTicketShare: (network: TicketSharingsSocials, ticketIndex: number) =>
      dispatch(ticketShare(network, ticketIndex)),
    onTicketShareTooltipShown: (ticket: TicketTuple) => dispatch(ticketShareTooltipShown(ticket)),
    onTicketUrlCopy: (isCopyCommandSupported: boolean) =>
      dispatch(ticketUrlCopy(isCopyCommandSupported)),
    onHotelStopClick: () => dispatch(ticketHotelStopClicked()),
    onFlightInfoClick: (isOpened: boolean) => dispatch(ticketFlightInfoClicked(isOpened)),
    onWarningBadgeTooltip: (key: string) => dispatch(ticketWarningBadgeTooltipShown(key)),
    onCreditClick: (ticket: TicketTuple) => dispatch(ticketCreditClick(ticket)),
    onRefreshClick: () => dispatch(ticketRefreshClick()),
    openModalClick: (index: number, ticketData: TicketData, modal: MobileTicketModalType) =>
      dispatch(ticketOpenModalClick(index, ticketData, modal)),
    closeModalClick: (index: number, ticketData: TicketData, modal: MobileTicketModalType) =>
      dispatch(ticketCloseModalClick(index, ticketData, modal)),
    onPinClick: (trips: Trip[], isActive: boolean, target: string, segmentIndex: number) =>
      dispatch(ticketPinClick(trips, isActive, target, segmentIndex)),
    onSubscriptionClick: (hasSubscription: boolean, ticket: TicketTuple) =>
      dispatch(ticketSubscription(hasSubscription, ticket)),
    onScheduleClick: (ticket: TicketTuple, sign: string) =>
      dispatch(ticketScheduleClick(ticket, sign)),
  }
}

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ProductTicketContainer)
