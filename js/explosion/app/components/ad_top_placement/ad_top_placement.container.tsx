import React, { useEffect } from 'react'
import { TopPlacementCampaign } from './ad_top_placement.types'
import { TicketMediaQueryTypes, SearchStatus } from 'shared_components/ticket/ticket.types'
import { connect } from 'react-redux'
import { AppState } from 'common/js/redux/types/root/explosion'
import { getSearchStatus } from 'common/js/redux/selectors/search.selectors'
import {
  getTopPlacementTicket,
  getHeaviestTopPlacementCampaign,
  getIsTopPlacementShown,
  getIsTopPlacementTicketFiltered,
} from 'common/js/redux/selectors/ad_top_placement.selectors'
import { TopPlacementTicketState } from 'common/js/redux/types/top_placement_ticket.types'
import AdTopPlacement from './ad_top_placement'
import { Dispatch } from 'redux'
import { topPlacementTicketShown } from 'common/js/redux/actions/top_placement_ticket.actions'

interface OwnProps {
  onAdNotRendered: () => void
  mediaQueryType?: TicketMediaQueryTypes
}

interface StateProps {
  topPlacementTicket: TopPlacementTicketState
  heaviestTopPlacementCampaign: TopPlacementCampaign | null
  searchStatus: SearchStatus
  isTopPlacementShown: boolean
  isTopPlacementTicketFiltered: boolean
}

interface DispatchProps {
  topPlacementTicketShown: typeof topPlacementTicketShown
}

type AdTopPlacementContainerProps = OwnProps & StateProps & DispatchProps

const AdTopPlacementContainer: React.FC<AdTopPlacementContainerProps> = (props) => {
  useIfNotRendered(props)

  useIfShown(props)

  if (
    !(
      props.heaviestTopPlacementCampaign &&
      props.topPlacementTicket &&
      props.topPlacementTicket.ticket_info
    ) ||
    props.isTopPlacementTicketFiltered
  ) {
    return null
  }

  return <AdTopPlacement mediaQueryType={props.mediaQueryType} />
}

const useIfShown = (props: AdTopPlacementContainerProps) => {
  useEffect(
    () => {
      if (
        props.heaviestTopPlacementCampaign &&
        props.topPlacementTicket &&
        props.topPlacementTicket.ticket_info &&
        !props.isTopPlacementShown &&
        !props.isTopPlacementTicketFiltered
      ) {
        props.topPlacementTicketShown()
      }
    },
    [props.heaviestTopPlacementCampaign, props.topPlacementTicket, props.isTopPlacementShown],
  )
}

const useIfNotRendered = (props: AdTopPlacementContainerProps) => {
  useEffect(
    () => {
      if (
        !props.heaviestTopPlacementCampaign ||
        (props.searchStatus === SearchStatus.Finished && !props.topPlacementTicket)
      ) {
        props.onAdNotRendered()
      }
    },
    [props.searchStatus, props.heaviestTopPlacementCampaign],
  )
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    searchStatus: getSearchStatus(state),
    topPlacementTicket: getTopPlacementTicket(state),
    heaviestTopPlacementCampaign: getHeaviestTopPlacementCampaign(state),
    isTopPlacementShown: getIsTopPlacementShown(state),
    isTopPlacementTicketFiltered: getIsTopPlacementTicketFiltered(state),
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps): DispatchProps => {
  return {
    topPlacementTicketShown: () => dispatch(topPlacementTicketShown()),
  }
}

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(AdTopPlacementContainer)
