import React, { memo } from 'react'
import TicketDesktop from '../ticket.desktop'
import { Theme, TicketMediaQueryTypes, TicketViewProps } from '../ticket.types'
import BrandTicketDesktop from '../brand_ticket/brand_ticket.desktop'
import BrandTicketMobile from '../brand_ticket/brand_ticket.mobile'
import TicketMobile from '../ticket.mobile'

import '../ticket.common.scss'

interface BrandTicketSpecialProps {
  isBrandTicket?: boolean
  theme?: Theme
}

export type TicketUIResolverProps = TicketViewProps &
  BrandTicketSpecialProps & {
    mediaQueryType?: TicketMediaQueryTypes
  }

const TicketUIResolver: React.FC<TicketUIResolverProps> = memo((props) => {
  if (props.isBrandTicket) {
    const brandTicketProps = {
      origGateId: props.origGateId,
      theme: props.theme,
      onTicketClick: props.onTicketClick,
      debugProposals: props.debugProposals || false,
      mainProposal: props.mainProposal,
      isSearchExpired: props.isSearchExpired,
      carriers: props.carriers,
      segments: props.segments,
      seatsCount: props.seatsCount,
      showRemainingSeatsCount: props.showRemainingSeatsCount,
      searchParams: props.searchParams,
      marker: props.marker,
      tripDirectionType: props.tripDirectionType,
      strikePrice: props.strikePrice,
      isNightMode: props.isNightMode,
      modifiers: props.modifiers,
    }

    if (props.mediaQueryType === TicketMediaQueryTypes.Mobile) {
      return <BrandTicketMobile {...brandTicketProps} />
    }
    return <BrandTicketDesktop {...brandTicketProps} />
  }

  if (props.mediaQueryType === TicketMediaQueryTypes.Mobile) {
    return <TicketMobile {...props} />
  }
  return <TicketDesktop {...props} />
})

export default TicketUIResolver
