import React, { useCallback, useContext, memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { Proposal, ProposalType, AirlineWithoutPrice } from '../ticket.types'
import TicketPrice from '../ticket_price/ticket_price'
import TooltipDebugProposal from '../tooltip_debug_proposal/tooltip_debug_proposal'
import Tooltip from 'shared_components/tooltip'
import TicketCurrencyContext from '../ticket_context/ticket_currency_context/ticket_currency_context'
import { TicketProposalsProps } from './ticket_proposals'

import './ticket_proposals.desktop.scss'
import AssistedTooltip from 'shared_components/ticket/buy_button/assisted_tooltip'

const AssistedIcon = require('!!react-svg-loader!./images/assisted_icon.svg')
const cn = clssnms('ticket-proposals-desktop')

export type TicketProposalsDesktopProps = Pick<
  TicketProposalsProps,
  | 'origGateId'
  | 'withDebug'
  | 'proposals'
  | 'getMetaInfo'
  | 'onProposalClick'
  | 'onMoreProposalsClick'
> & {
  visibleProposalsCount: number
  airlineWithoutPrice?: AirlineWithoutPrice | null
  airlineProposal: Proposal | null
  onAirlineWithoutPriceClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

const TicketProposalsDesktop: React.FC<TicketProposalsDesktopProps> = (props) => {
  const { t } = useTranslation('ticket')
  const { airlineProposal, airlineWithoutPrice, getMetaInfo, onAirlineWithoutPriceClick } = props
  const airlineWithoutPriceMetaInfo = JSON.stringify(getMetaInfo())
  let isAirlineProposalRendered = !!(airlineProposal || airlineWithoutPrice)

  const handleMoreProposalsClick = useCallback(
    () => {
      if (props.onMoreProposalsClick) {
        props.onMoreProposalsClick()
      }
    },
    [props.onMoreProposalsClick],
  )

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
        <ProposalItemDesktop
          key={airlineProposal.proposalId}
          origGateId={props.origGateId}
          withDebug={props.withDebug}
          isAirline={true}
          proposal={airlineProposal}
          getMetaInfo={props.getMetaInfo}
          onProposalClick={props.onProposalClick}
        />
      )}
      {props.visibleProposalsCount > 0 &&
        [...new Array(props.visibleProposalsCount)].map((_, index) => {
          const proposal = props.proposals[index]
          if (!proposal) {
            return null
          }
          const isAirline = !isAirlineProposalRendered && proposal.type === ProposalType.Airline
          if (isAirline) {
            isAirlineProposalRendered = true
          }
          return (
            <ProposalItemDesktop
              key={proposal.proposalId}
              origGateId={props.origGateId}
              withDebug={props.withDebug}
              isAirline={isAirline}
              proposal={proposal}
              getMetaInfo={props.getMetaInfo}
              onProposalClick={props.onProposalClick}
            />
          )
        })}
      {props.visibleProposalsCount >= 0 &&
        props.proposals.length - props.visibleProposalsCount > 0 && (
          <li key="show-all" className={cn('item', '--all')} onClick={handleMoreProposalsClick}>
            <span>
              {t('ticket:moreProposals', {
                count: props.proposals.length - props.visibleProposalsCount,
              })}
            </span>
          </li>
        )}
    </ul>
  )
}

const ProposalItemDesktop: React.FC<{
  origGateId?: number
  proposal: Proposal
  isAirline?: boolean
  withDebug?: TicketProposalsDesktopProps['withDebug']
  getMetaInfo: TicketProposalsDesktopProps['getMetaInfo']
  onProposalClick?: TicketProposalsDesktopProps['onProposalClick']
}> = memo((props) => {
  const { t } = useTranslation('ticket')
  const { currency } = useContext(TicketCurrencyContext)
  const { proposal, getMetaInfo, withDebug, origGateId } = props
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
      <TooltipDebugProposal withDebug={withDebug} proposal={proposal} origGateId={origGateId}>
        <a
          href={proposal.deeplink}
          onClick={handleProposalClick}
          target="_blank"
          data-metainfo={metaInfo}
        >
          <span className={cn('name')}>
            {proposal.isAssisted && (
              <Tooltip
                position="top"
                wrapperClassName={cn('assisted-tooltip-wrapper')}
                tooltip={() => (proposal.isAssisted ? <AssistedTooltip /> : null)}
              >
                <AssistedIcon className={cn('assisted-icon')} />
              </Tooltip>
            )}
            {gateName}
          </span>
          <span className={cn('price')}>
            <Tooltip
              position="right"
              tooltip={() => {
                if (currency.toLowerCase() === proposal.currency.toLowerCase()) {
                  return null
                }
                return (
                  <div className={cn('gate-price-tooltip')}>
                    <TicketPrice
                      originalValue={proposal.price}
                      originalCurrency={proposal.currency}
                    />
                  </div>
                )
              }}
            >
              <TicketPrice
                valueInRubles={proposal.unifiedPrice}
                originalValue={proposal.price}
                originalCurrency={proposal.currency}
              />
            </Tooltip>
          </span>
        </a>
      </TooltipDebugProposal>
    </li>
  )
})

export default memo(TicketProposalsDesktop)
