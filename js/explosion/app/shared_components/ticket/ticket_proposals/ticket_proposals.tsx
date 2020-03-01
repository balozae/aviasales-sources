import React, { memo, useCallback } from 'react'
import { Proposal, ProposalType, AirlineWithoutPrice, TicketMediaQueryTypes } from '../ticket.types'
import TicketProposalsDesktop from './ticket_proposals.desktop'
import TicketProposalsMobile from './ticket_proposals.mobile'

export interface TicketProposalsProps {
  origGateId?: number
  mediaQueryType?: TicketMediaQueryTypes
  withDebug?: boolean
  airlineProposal: Proposal | AirlineWithoutPrice | null
  proposals: ReadonlyArray<Proposal>
  visibleProposalsCount?: number
  getMetaInfo: (proposal?: Proposal) => void
  isSearchExpired?: boolean
  onProposalClick?: (
    event: React.MouseEvent<HTMLAnchorElement>,
    proposal: Proposal | AirlineWithoutPrice | null,
  ) => void
  onMoreProposalsClick?: Function
  onRefreshClick?: (e: React.MouseEvent, proposal: Proposal | undefined) => void
}

const TicketProposals: React.FC<TicketProposalsProps> = (props) => {
  const airlineWithoutPrice =
    props.airlineProposal && props.airlineProposal.type === ProposalType.AirlineWithoutPrice
      ? (props.airlineProposal as AirlineWithoutPrice)
      : null

  const airlineProposal =
    !airlineWithoutPrice && props.airlineProposal ? (props.airlineProposal as Proposal) : null

  const handleAirlineWithoutPriceClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.stopPropagation()
      if (props.onProposalClick) {
        props.onProposalClick(event, airlineWithoutPrice)
      }
    },
    [props.onProposalClick, airlineWithoutPrice],
  )

  const handleProposalClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, proposal) => {
      event.stopPropagation()

      if (props.isSearchExpired) {
        event.preventDefault()
        if (props.onRefreshClick) {
          props.onRefreshClick(event, proposal)
        }
        return
      }

      if (props.onProposalClick) {
        props.onProposalClick(event, proposal)
      }
    },
    [props.isSearchExpired, props.onRefreshClick, props.onProposalClick],
  )

  if (props.mediaQueryType === TicketMediaQueryTypes.Mobile) {
    return (
      <TicketProposalsMobile
        airlineWithoutPrice={airlineWithoutPrice}
        airlineProposal={airlineProposal}
        proposals={props.proposals}
        getMetaInfo={props.getMetaInfo}
        onAirlineWithoutPriceClick={handleAirlineWithoutPriceClick}
        onProposalClick={handleProposalClick}
      />
    )
  }

  return (
    <TicketProposalsDesktop
      origGateId={props.origGateId}
      withDebug={props.withDebug}
      airlineWithoutPrice={airlineWithoutPrice}
      airlineProposal={airlineProposal}
      proposals={props.proposals}
      visibleProposalsCount={props.visibleProposalsCount!}
      getMetaInfo={props.getMetaInfo}
      onAirlineWithoutPriceClick={handleAirlineWithoutPriceClick}
      onProposalClick={handleProposalClick}
      onMoreProposalsClick={props.onMoreProposalsClick}
    />
  )
}

export default memo(TicketProposals)
