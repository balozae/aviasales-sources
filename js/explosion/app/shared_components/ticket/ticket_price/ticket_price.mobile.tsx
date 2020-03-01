import React, { memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import TicketPrice from './ticket_price'
import { TicketViewProps } from '../ticket.types'

import './ticket_price.mobile.scss'

const cn = clssnms('ticket-price-mobile')

export type TicketPriceMobileProps = Pick<
  TicketViewProps,
  'strikePrice' | 'mainProposal' | 'theme'
> & {
  modifiers?: string[]
  proposalLabel?: string
  isProposalTitleHidden?: boolean
}

const TicketPriceMobile: React.FC<TicketPriceMobileProps> = (props) => {
  const { t } = useTranslation('ticket')
  const isAssisted = props.mainProposal && props.mainProposal.isAssisted

  if (!props.mainProposal) {
    return null
  }

  return (
    <div
      className={cn(null, [
        !!isAssisted && '--assisted',
        !!props.strikePrice && '--double-price',
        ...(props.modifiers || []),
      ])}
      style={props.theme ? { color: props.theme.brandColor } : {}}
    >
      <TicketPrice
        valueInRubles={props.mainProposal.unifiedPrice}
        originalCurrency={props.mainProposal.currency}
        originalValue={props.mainProposal.price}
      />
      {props.strikePrice && (
        <del className={cn('small')}>
          <TicketPrice valueInRubles={props.strikePrice} />
        </del>
      )}
      {!props.isProposalTitleHidden &&
        props.proposalLabel && (
          <p className={cn('proposal')}>
            {t(`ticket:buyButton.buyOn`, { gateLabel: props.proposalLabel })}
          </p>
        )}
    </div>
  )
}

export default memo(TicketPriceMobile)
