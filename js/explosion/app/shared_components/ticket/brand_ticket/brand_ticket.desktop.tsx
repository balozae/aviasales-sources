import React, { memo, useContext, useCallback } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import BuyButton from '../buy_button/buy_button'
import TicketCarrierList from '../ticket_carrier/ticket_carrier_list'
import TicketSegmentComponent from '../ticket_segment/ticket_segment'
import { BrandTicketProps } from './brand_ticket.types'

const cn = clssnms('ticket-desktop')

const BrandTicket = memo((props: BrandTicketProps) => {
  const { t } = useTranslation('ticket')
  const sideContent =
    props.theme && props.theme.sideContent ? props.theme.sideContent : t('ticket:advertisement')
  const expandButtonText =
    props.theme && props.theme.expandButtonText
      ? props.theme.expandButtonText
      : t('ticket:advertisement')
  const handleTicketClick = useCallback(
    () => {
      props.onTicketClick(false)
    },
    [props.onTicketClick],
  )

  return (
    <div className={cn(null, ['--brand-ticket', ...props.modifiers])} onClick={handleTicketClick}>
      <div className={cn('side-content')}>
        <div className={cn('side-container')}>
          <div className={cn('buy-button')}>
            <BuyButton
              origGateId={props.origGateId}
              proposal={props.mainProposal}
              brandColor={props.theme && props.theme.brandColor}
              withDebug={props.debugProposals}
              strikePrice={props.strikePrice}
              isSearchExpired={false} // NOTE: skip expired search logic for buy button and continue redirect
            />
            <span className={cn('advertisement-label')}>{sideContent}</span>
          </div>
        </div>
      </div>
      <div className={cn('content')}>
        <div className={cn('header')}>
          <div className={cn('carriers')}>
            <TicketCarrierList carriers={props.carriers} isNightMode={props.isNightMode} />
          </div>
        </div>
        <div className={cn('body')}>
          {props.segments.map((segment, index) => (
            <div className={cn('segment')} key={index}>
              <TicketSegmentComponent
                segmentIndex={index}
                mainProposal={props.mainProposal}
                flightInfo={{}}
                isOpen={false}
                fixedTrips={[]}
                showPin={false}
                tripDirectionType={props.tripDirectionType}
                searchParams={props.searchParams}
                marker={props.marker}
                isNightMode={props.isNightMode}
                {...segment}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn('expand-button', '--with-brand-color')}
        style={{ backgroundColor: props.theme && props.theme.brandColor }}
      >
        <div className={cn('expand-button-text')}>{expandButtonText}</div>
      </div>
    </div>
  )
})

export default BrandTicket
