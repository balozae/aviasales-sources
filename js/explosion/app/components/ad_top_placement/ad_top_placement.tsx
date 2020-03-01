import React from 'react'
import clssnms from 'clssnms'
import TicketUIResolver from 'shared_components/ticket/ticket_ui_resolver/ticket_ui_resolver'
import { connect } from 'react-redux'
import { AppState } from 'common/js/redux/types/root/explosion'
import { Dispatch } from 'redux'
import {
  Proposal,
  SearchStatus,
  TicketMediaQueryTypes,
  Gates,
  FlightInfo,
  TripTransport,
  TripDirectionType,
  TicketSegment,
  Proposals,
} from 'shared_components/ticket/ticket.types'
import { getMetaInfo } from 'shared_components/ticket/utils/common.utils'
import { MIN_SEATS_LEFT } from 'shared_components/ticket/ticket.constants'
import { TopPlacementTicket, TopPlacementCampaign } from './ad_top_placement.types'
import {
  getTopPlacementTicket,
  getHeaviestTopPlacementCampaign,
} from 'common/js/redux/selectors/ad_top_placement.selectors'
import { getSearchStatus } from 'common/js/redux/selectors/search.selectors'
import { getMarker } from 'common/js/redux/selectors/marker.selectors'
import { getGates } from 'common/js/redux/selectors/gates.selectors'
import { isNightMode } from 'common/js/redux/selectors/sys.selectors'
import { getSearchParams } from 'common/js/redux/selectors/search_params.selectors'
import { TariffType } from 'shared_components/types/tariffs'
import { prepareTicketProposals } from 'common/js/redux/selectors/proposals.selectors'
import {
  getTransportType,
  prepareSegments,
  getTripDirectionType,
  getBadges,
  getCarriers,
} from 'common/js/redux/selectors/ticket.selectors'
import VisaSideContent from './visa_side_content'
import { SplitedBadges } from 'shared_components/ticket/utils/ticket_badge.utils'
import { ticketRefreshClick } from 'common/js/redux/actions/ticket.actions'
import { topPlacementTicketClick } from 'common/js/redux/actions/top_placement_ticket.actions'
import { getFlightInfo } from 'common/js/redux/selectors/flight_info.selectors'

const cn = clssnms('ad-top-placement')

interface OwnProps {
  mediaQueryType?: TicketMediaQueryTypes
}
interface StateProps {
  topPlacementTicket: TopPlacementTicket
  heaviestTopPlacementCampaign: TopPlacementCampaign
  searchStatus: SearchStatus
  gates: Gates
  searchParams: AppState['searchParams']
  flightInfo: FlightInfo
  isNightMode: boolean
  marker: string
  transportType: TripTransport
  tripDirection: TripDirectionType
  segments: TicketSegment[]
  cheaperTariffKey: TariffType
  proposals: Proposals
  carriers: string[]
  badges: SplitedBadges
}
interface DispatchProps {
  onRefreshClick: typeof ticketRefreshClick
  onTopPlacementClick: typeof topPlacementTicketClick
}

export type AdTopPlacementProps = OwnProps & StateProps & DispatchProps

const MODIFIERS = []
const noop = () => void 0

export class AdTopPlacement extends React.Component<AdTopPlacementProps> {
  getMetaInfo = (proposal?: Proposal) => {
    const ticket = this.props.topPlacementTicket.ticket_info
    const [ticketData] = ticket

    return this.props.searchStatus === SearchStatus.Expired
      ? {}
      : getMetaInfo({
          proposal,
          ticketData,
          gates: this.props.gates,
        })
  }

  handleTopPlacementClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    this.props.onTopPlacementClick()
  }

  handleRefreshClick = (event: React.MouseEvent) => {
    event.preventDefault()
    this.props.onRefreshClick()
  }

  render() {
    const ticket = this.props.topPlacementTicket.ticket_info
    const { proposals, cheaperTariffKey } = this.props
    const [ticketData] = ticket

    const [mainProposal, ...proposalsByTariff] = proposals[cheaperTariffKey]
    return (
      <div className={cn()} onClickCapture={this.handleTopPlacementClick}>
        <TicketUIResolver
          /**
           *  FLAGS
           */
          withBuyCol={true}
          isOpenable={false}
          withSharing={false}
          withFavoriteOnMobilePreview={false}
          showPin={false}
          withFavorite={false}
          isFavorite={false}
          /**
           * BRAND TICKET PROPS
           */
          isBrandTicket={true}
          theme={{
            brandColor: this.props.heaviestTopPlacementCampaign.data.main_color,
            sideContent: this.props.heaviestTopPlacementCampaign.data.meta ? (
              <VisaSideContent
                {...this.props.heaviestTopPlacementCampaign.data.meta}
                isNightMode={this.props.isNightMode}
                mediaQueryType={this.props.mediaQueryType}
              />
            ) : (
              undefined
            ),
            expandButtonText:
              this.props.heaviestTopPlacementCampaign.data.meta &&
              this.props.heaviestTopPlacementCampaign.data.meta.expand_button_text,
          }}
          strikePrice={this.props.topPlacementTicket.strike_price}
          /**
           *  TICKET DATA
           */
          ticketUrl=""
          sign={ticketData.sign}
          ticketTransportType={this.props.transportType}
          tripDirectionType={this.props.tripDirection}
          getMetaInfo={this.getMetaInfo}
          showRemainingSeatsCount={Boolean(ticketData.seats && ticketData.seats < MIN_SEATS_LEFT)}
          seatsCount={ticketData.seats}
          badges={this.props.badges}
          carriers={this.props.carriers}
          marker={this.props.marker}
          segments={this.props.segments}
          origGateId={ticketData.orig_gate_id}
          ticketSchedule={null}
          flightInfo={this.props.flightInfo}
          /**
           *  PROPOSALS DATA
           */
          currentTariff={cheaperTariffKey}
          airlineProposal={null}
          proposalsByTariff={proposalsByTariff}
          mainProposal={mainProposal}
          proposals={this.props.proposals}
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
          isShouldShowCredit={false}
          /**
           *  CALLBACKS
           */
          onRefreshClick={this.handleRefreshClick}
          onTicketClick={noop}
          onTariffChange={noop}
        />
      </div>
    )
  }
}
const mapStateToProps = (state: AppState, props: OwnProps): StateProps => {
  // bang because we check it in ad_top_placement.container
  const topPlacementTicket = getTopPlacementTicket(state)!

  const ticket = topPlacementTicket.ticket_info

  const [proposals, airlineProposals, defaultTariff, cheaperTariffKey] = prepareTicketProposals(
    state,
    ticket[0],
  )
  const [mainProposal] = proposals[defaultTariff]

  return {
    cheaperTariffKey,
    proposals,
    topPlacementTicket,
    marker: getMarker(),
    gates: getGates(state),
    flightInfo: getFlightInfo(state),
    isNightMode: isNightMode(state),
    segments: prepareSegments(ticket[0]),
    searchParams: getSearchParams(state),
    searchStatus: getSearchStatus(state),
    carriers: getCarriers(ticket[0].segment),
    transportType: getTransportType(ticket[0]),
    badges: getBadges(state, ticket[0], mainProposal),
    tripDirection: getTripDirectionType(state, ticket[0].segment),
    heaviestTopPlacementCampaign: getHeaviestTopPlacementCampaign(state)!,
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps): DispatchProps => {
  return {
    onRefreshClick: () => dispatch(ticketRefreshClick()),
    onTopPlacementClick: () => dispatch(topPlacementTicketClick()),
  }
}

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(AdTopPlacement)
