import React, { memo, useCallback } from 'react'
import clssnms from 'clssnms'
import { format } from 'finity-js'
import { useTranslation, Trans } from 'react-i18next'
import Tooltip from 'shared_components/tooltip'
import TooltipDebugProposal from '../tooltip_debug_proposal/tooltip_debug_proposal'
import TicketPrice from '../ticket_price/ticket_price'
import Button from 'shared_components/button/button'
import { ButtonType, ButtonMod, ButtonSize } from 'shared_components/button/button.types'
import { Dirty, Proposal, SearchParams } from '../ticket.types'
import AssistedTooltip from './assisted_tooltip'
import TicketOriginalCurrencyTooltip from '../ticket_original_currency_tooltip/ticket_original_currency_tooltip'
import './buy_button.scss'

const cn = clssnms('buy-button')

export interface BuyButtonProps {
  origGateId?: number
  strikePrice?: number
  withDebug?: boolean
  proposal?: Proposal
  isSearchExpired?: boolean
  onClick?: (e: React.MouseEvent, proposal: Dirty<Proposal>) => void
  onRefreshClick?: (e: React.MouseEvent, proposal: Dirty<Proposal>) => void
  onContextMenu?: (e: React.MouseEvent, proposal: Dirty<Proposal>) => void
  brandColor?: string
  className?: string
  deeplinkUrl?: string
  getMetaInfo?: (proposal?: Proposal) => void
  isProposalTitleHidden?: boolean
  proposalText?: string
  type?: 'product' | 'favorite'
  actual?: boolean
  searchParams?: SearchParams
}

const BuyButton: React.FC<BuyButtonProps> = memo((props) => {
  const { t } = useTranslation('ticket')
  const {
    proposal,
    getMetaInfo,
    origGateId,
    withDebug,
    type = 'product',
    actual = true,
    searchParams,
  } = props
  const metaInfo = getMetaInfo && JSON.stringify(proposal ? getMetaInfo(proposal) : getMetaInfo())

  const handleBuyBtnClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (props.isSearchExpired) {
        if (props.onRefreshClick) {
          props.onRefreshClick(e, proposal)
        }
        return
      }
      if (props.onClick) {
        props.onClick(e, proposal)
      }
    },
    [props.isSearchExpired, props.onRefreshClick, props.onClick, proposal],
  )

  const handleBuyBtnContextMenuOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (props.onContextMenu) {
        props.onContextMenu(e, proposal)
      }
    },
    [props.onContextMenu, proposal],
  )

  return (
    <TooltipDebugProposal proposal={proposal} origGateId={origGateId} withDebug={withDebug}>
      <div className={cn(null, props.className)}>
        {actual && (
          <TicketOriginalCurrencyTooltip
            originalCurrency={proposal && proposal.currency}
            price={proposal && proposal.price}
            className={cn('tooltip')}
          >
            <Button
              type={ButtonType.Button}
              mod={actual ? ButtonMod.Primary : ButtonMod.Disabled}
              size={ButtonSize.L}
              className={cn('button', { '--with-brand-color': !!props.brandColor })}
              style={{ backgroundColor: props.brandColor }}
              target="_blank"
              href={proposal && proposal.deeplink}
              disabled={!proposal}
              data-metainfo={metaInfo}
              onClick={handleBuyBtnClick}
              onContextMenu={handleBuyBtnContextMenuOpen}
            >
              <ButtonContent
                proposal={proposal}
                strikePrice={props.strikePrice}
                isSearchExpired={props.isSearchExpired}
                type={type}
              />
            </Button>
          </TicketOriginalCurrencyTooltip>
        )}
        {!props.isProposalTitleHidden &&
          proposal &&
          proposal.gate && (
            <span className={cn('proposal')}>
              {t(`ticket:buyButton.buyOn`, { gateLabel: proposal.gate.label })}
            </span>
          )}
        {type === 'favorite' &&
          proposal &&
          searchParams && (
            <FavoriteProposalContent proposal={proposal} searchParams={searchParams} />
          )}
      </div>
    </TooltipDebugProposal>
  )
})

const ButtonContent: React.FC<{
  proposal?: Proposal
  strikePrice?: number
  isSearchExpired?: boolean
  type?: BuyButtonProps['type']
}> = memo(({ proposal, strikePrice, isSearchExpired, type }) => {
  const { t } = useTranslation('ticket')

  if (!proposal) {
    return <span className={cn('text')}>{t(`ticket:buyButton.loading`)}</span>
  }

  if (type === 'favorite') {
    return <span className={cn('text')}>{t(`ticket:buyButton.look`)}</span>
  }

  if (!proposal.price) {
    return <span className={cn('text')}>{t(`ticket:buyButton.findPrice`)}</span>
  }

  if (isSearchExpired) {
    return (
      <>
        <span className={cn('small-price')}>
          <TicketPrice
            valueInRubles={proposal.unifiedPrice}
            originalCurrency={proposal.currency}
            originalValue={proposal.price}
          />
        </span>
        <span className={cn('text')}>{t(`ticket:buyButton.update`)}</span>
      </>
    )
  }

  return (
    <>
      <Trans
        ns="ticket"
        i18nKey="buyButton.buyFor"
        components={[
          <span key="buyButtonText" className={cn('text')} />,
          <ButtonPrice key="buyButtonPrice" proposal={proposal} strikePrice={strikePrice} />,
        ]}
      />
      {proposal.isAssisted && (
        <Tooltip
          position="top"
          showDelay={100}
          tooltip={() => <AssistedTooltip />}
          wrapperClassName={cn('assisted-icon-wrap')}
        >
          <i className={cn('assisted-icon')} data-testid="assisted-tooltip-wrapper" />
        </Tooltip>
      )}
    </>
  )
})

const ButtonPrice: React.FC<{ proposal: Proposal; strikePrice?: number }> = ({
  proposal,
  strikePrice,
}) => {
  return (
    <span className={cn('price')}>
      <TicketPrice
        valueInRubles={proposal.unifiedPrice}
        originalCurrency={proposal.currency}
        originalValue={proposal.price}
      />
      {strikePrice && (
        <del className={cn('small-price')}>
          <TicketPrice valueInRubles={strikePrice} />
        </del>
      )}
    </span>
  )
}

const FavoriteProposalContent: React.FC<{
  proposal: Proposal
  searchParams: SearchParams
}> = memo(({ proposal, searchParams }) => {
  const { t } = useTranslation('ticket')

  return (
    <span className={cn('proposal-text')}>
      {proposal.price ? (
        <Trans ns="ticket" i18nKey="foundWithPrice">
          <TicketPrice
            valueInRubles={proposal.unifiedPrice}
            originalCurrency={proposal.currency}
            originalValue={proposal.price}
          />
        </Trans>
      ) : (
        t('ticket:found')
      )}
      <br />
      {searchParams.searchDate && format(new Date(searchParams.searchDate), 'D MMMM YYYY', true)}
      <br />
      {t('ticket:passengersCount', {
        count:
          searchParams.passengers.adults +
          searchParams.passengers.children +
          searchParams.passengers.infants,
      })}
      , {t(`ticket:tripClass.${searchParams.trip_class}`)}
    </span>
  )
})

export default BuyButton
