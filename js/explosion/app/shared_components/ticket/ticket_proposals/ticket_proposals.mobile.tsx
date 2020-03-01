import React, { useCallback, memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { Proposal, ProposalType, AirlineWithoutPrice } from '../ticket.types'
import TicketPrice from '../ticket_price/ticket_price'
import { TicketProposalsProps } from './ticket_proposals'

import './ticket_proposals.mobile.scss'

const AssistedIcon = require('!!react-svg-loader!./images/assisted_icon.svg')
const cn = clssnms('ticket-proposals-mobile')

export type TicketProposalsMobileProps = Pick<
  TicketProposalsProps,
  'proposals' | 'getMetaInfo' | 'onProposalClick'
> & {
  airlineWithoutPrice?: AirlineWithoutPrice | null
  airlineProposal: Proposal | null
  onAirlineWithoutPriceClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

const TicketProposalsMobile: React.FC<TicketProposalsMobileProps> = (props) => {
  const { t } = useTranslation('ticket')
  const { airlineProposal, airlineWithoutPrice, getMetaInfo, onAirlineWithoutPriceClick } = props
  const airlineWithoutPriceMetaInfo = JSON.stringify(getMetaInfo())
  let isAirlineProposalRendered = !!(airlineProposal || airlineWithoutPrice)

  return (
    <ul className={cn()}>
      {airlineWithoutPrice && (
        <li className={cn('item', '--airline')} key="airlineProposal">
          <a
            href={airlineWithoutPrice.deeplink}
            onClick={onAirlineWithoutPriceClick}
            data-metainfo={airlineWithoutPriceMetaInfo}
            target="_blank"
          >
            <span className={cn('name')}>
              {t('ticket:buyOnWebsite', { siteName: airlineWithoutPrice.siteName })}
            </span>
          </a>
        </li>
      )}
      {airlineProposal && (
        <ProposalItemMobile
          key={airlineProposal.proposalId}
          isAirline={true}
          proposal={airlineProposal}
          getMetaInfo={props.getMetaInfo}
          onProposalClick={props.onProposalClick}
        />
      )}
      {props.proposals.map((proposal) => {
        const isAirline = !isAirlineProposalRendered && proposal.type === ProposalType.Airline
        if (isAirline) {
          isAirlineProposalRendered = true
        }
        return (
          <ProposalItemMobile
            key={proposal.proposalId}
            isAirline={isAirline}
            proposal={proposal}
            getMetaInfo={props.getMetaInfo}
            onProposalClick={props.onProposalClick}
          />
        )
      })}
    </ul>
  )
}

const ProposalItemMobile: React.FC<{
  proposal: Proposal
  isAirline?: boolean
  getMetaInfo: TicketProposalsMobileProps['getMetaInfo']
  onProposalClick?: TicketProposalsMobileProps['onProposalClick']
}> = memo((props) => {
  const { t } = useTranslation('ticket')
  const { proposal, getMetaInfo } = props
  const gateName = proposal.gate && proposal.gate.label
  const metaInfo = JSON.stringify(getMetaInfo(proposal))

  const handleProposalClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (props.onProposalClick) {
        props.onProposalClick(event, proposal)
      }
    },
    [props.onProposalClick, proposal],
  )

  return (
    <li
      key={proposal.gateId}
      className={cn('item', {
        '--assisted': !!proposal.isAssisted,
        '--airline': !!props.isAirline,
      })}
    >
      <a
        href={proposal.deeplink}
        onClick={handleProposalClick}
        target="_blank"
        data-metainfo={metaInfo}
      >
        <span className={cn('name')}>
          {proposal.isAssisted && <AssistedIcon className={cn('assisted-icon')} />}
          {gateName}
        </span>
        <span className={cn('price')}>
          <TicketPrice
            valueInRubles={proposal.unifiedPrice}
            originalValue={proposal.price}
            originalCurrency={proposal.currency}
          />
        </span>
      </a>
    </li>
  )
})

export default memo(TicketProposalsMobile)
