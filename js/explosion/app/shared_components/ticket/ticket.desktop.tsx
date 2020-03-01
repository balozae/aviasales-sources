import React, { memo, useMemo, useState, useCallback, useRef } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import TicketTariffs from './ticket_tariffs/ticket_tariffs'
import { TicketViewProps } from './ticket.types'
import BuyButton from './buy_button/buy_button'
import TicketProposals from './ticket_proposals/ticket_proposals'
import TicketCarrierList from './ticket_carrier/ticket_carrier_list'
import TicketBadgeList from './ticket_badge/ticket_badge_list'
import TicketSharing from './ticket_sharing/ticket_sharing'
import TicketSegmentComponent from './ticket_segment/ticket_segment'
import TicketSchedule from './ticket_schedule/ticket_schedule'
import TicketHotelInfo from './ticket_hotel_info/ticket_hotel_info'
import { getVisibleProposalsCount } from './utils/ticket_proposals.utils'
import TicketFavorite from './ticket_favorite/ticket_favorite'
import TicketSubscriptions from './ticket_subscriptions/ticket_subscriptions'
import TicketIncomingBadge from './ticket_incoming_badge/ticket_incoming_badge'

import './ticket.desktop.scss'

const cn = clssnms('ticket-desktop')

const TicketDesktop: React.FC<TicketViewProps> = memo((props) => {
  const { isProposalTitleHidden = false, showTariffs = true, actual = true } = props
  const { t } = useTranslation('ticket')
  const [isOpen, setIsOpen] = useState(false)
  const expandButtonRef = useRef<HTMLButtonElement | null>(null)
  const visibleProposalsCount = useMemo(
    () =>
      getVisibleProposalsCount(
        isOpen,
        props.proposalsByTariff,
        !!props.isShouldShowCredit,
        !!props.airlineProposal,
        props.seatsCount,
      ),
    [
      isOpen,
      props.proposalsByTariff,
      props.isShouldShowCredit,
      props.airlineProposal,
      props.seatsCount,
    ],
  )

  const toggleTicket = useCallback(
    () => {
      if (props.isOpenable) {
        props.onTicketClick(!isOpen)
        setIsOpen(!isOpen)
      }
    },
    [props.isOpenable, props.onTicketClick, isOpen, setIsOpen],
  )

  const handleClickOnTicket = useCallback(
    (event: React.MouseEvent) => {
      const isExpandButtonClick = event.target === expandButtonRef.current

      if (!isOpen && !isExpandButtonClick) {
        toggleTicket()
      }
    },
    [toggleTicket, isOpen, expandButtonRef],
  )

  return (
    <div
      className={cn(null, [
        isOpen && '--is-opened',
        props.isFavorite && '--is-favorite',
        props.hasSubscription && '--has-subscription',
        ...props.modifiers,
      ])}
      onClick={handleClickOnTicket}
    >
      {props.withBuyCol && (
        <div className={cn('side-content')}>
          {showTariffs && (
            <div className={cn('tariffs')}>
              <TicketTariffs
                currentTariff={props.currentTariff}
                proposals={props.proposals}
                withDebug={props.debugProposals}
                onTariffChange={props.onTariffChange}
              />
            </div>
          )}
          <div className={cn('side-container')} key={props.currentTariff}>
            {props.showRemainingSeatsCount &&
              props.seatsCount && (
                <div className={cn('remaining-tickets')}>
                  {t('ticket:remainingTickets', { count: props.seatsCount })}
                </div>
              )}
            <div className={cn('buy-button')}>
              <BuyButton
                origGateId={props.origGateId}
                getMetaInfo={props.getMetaInfo}
                proposal={props.mainProposal}
                withDebug={props.debugProposals}
                isSearchExpired={props.isSearchExpired}
                onClick={props.onBuyButtonClick}
                onContextMenu={props.onBuyButtonContextMenu}
                onRefreshClick={props.onRefreshClick}
                isProposalTitleHidden={isProposalTitleHidden}
                type={props.buyButtonType}
                actual={actual}
                searchParams={props.searchParams}
                strikePrice={props.strikePrice}
              />
            </div>
            {props.isShouldShowCredit && (
              <a className={cn('credit')} href="#" onClick={props.onCreditClick}>
                {t('ticket:buyOnCredit')}
              </a>
            )}
            <div className={cn('proposals')}>
              <TicketProposals
                origGateId={props.origGateId}
                getMetaInfo={props.getMetaInfo}
                airlineProposal={props.airlineProposal}
                proposals={props.proposalsByTariff}
                withDebug={props.debugProposals}
                visibleProposalsCount={visibleProposalsCount}
                onProposalClick={props.onProposalClick}
                isSearchExpired={props.isSearchExpired}
                onRefreshClick={props.onRefreshClick}
              />
            </div>
            {props.hotelInfo &&
              props.searchParams &&
              props.mainProposal && (
                <TicketHotelInfo
                  getMetaInfo={props.getMetaInfo}
                  hotel={props.hotelInfo}
                  segments={props.segments}
                  deeplink={props.mainProposal.deeplink}
                  passengers={props.searchParams.passengers}
                  onDeeplinkClick={props.onHotelInfoClick}
                  mainProposal={props.mainProposal}
                />
              )}
            {props.sideExtraContent && (
              <div className={cn('extra-content')}>{props.sideExtraContent}</div>
            )}
          </div>
        </div>
      )}
      <div className={cn('content')}>
        <div className={cn('header')}>
          <div className={cn('carriers')}>
            <TicketCarrierList carriers={props.carriers} isNightMode={props.isNightMode} />
          </div>
          <div className={cn('badges-wrap')}>
            {props.badges.other &&
              props.badges.other.length && (
                <div className={cn('badges')}>
                  <TicketBadgeList badges={props.badges.other} />
                </div>
              )}
            {props.badges.warning &&
              props.badges.warning.length && (
                <div className={cn('badges')}>
                  <TicketBadgeList
                    badges={props.badges.warning}
                    onTooltip={props.onWarningBadgeTooltip}
                  />
                </div>
              )}
          </div>
          {props.withFavorite && (
            <TicketFavorite
              sign={props.sign}
              isFavorite={props.isFavorite}
              onFavoriteClick={props.onFavoriteClick}
            />
          )}
          {props.withSubscription && (
            <div className={cn('subs')}>
              <TicketSubscriptions
                sign={props.sign}
                hasSubscription={props.hasSubscription}
                onSubscriptionClick={props.onSubscriptionClick}
              />
            </div>
          )}
          {props.withSharing && (
            <div className={cn('share')}>
              <TicketSharing
                onTicketShare={props.onTicketShare}
                onTooltipShow={props.onShareTooltipShow}
                onTicketUrlCopy={props.onTicketUrlCopy}
                ticketUrl={props.ticketUrl}
              />
            </div>
          )}
        </div>
        <div className={cn('body')}>
          {props.ticketSchedule &&
            props.ticketSchedule.length > 0 &&
            props.isScheduleTicket && (
              <div className={cn('schedule')}>
                <TicketSchedule
                  schedule={props.ticketSchedule}
                  onScheduleClick={props.onScheduleClick}
                  selectedScheduleSign={props.selectedScheduleSign}
                  ticketTransportType={props.ticketTransportType}
                />
              </div>
            )}
          <div className={cn('segments-wrap')}>
            {props.segments.map((segment, index) => (
              <div className={cn('segment')} key={index}>
                <TicketSegmentComponent
                  segmentIndex={index}
                  isOpen={isOpen}
                  fixedTrips={props.fixedTrips}
                  onPinClick={props.onPinClick}
                  showPin={props.showPin}
                  tripDirectionType={props.tripDirectionType}
                  searchParams={props.searchParams}
                  marker={props.marker}
                  mainProposal={props.mainProposal}
                  flightInfo={props.flightInfo}
                  onFlightInfoClick={props.onFlightInfoClick}
                  onHotelStopClick={props.onHotelStopClick}
                  isNightMode={props.isNightMode}
                  route={segment.route}
                />
              </div>
            ))}
          </div>
        </div>
        {props.incomingBadge && (
          <div className={cn('outer-badge')}>
            <TicketIncomingBadge {...props.incomingBadge} />
          </div>
        )}
      </div>
      {props.isOpenable && (
        <button ref={expandButtonRef} className={cn('expand-button')} onClick={toggleTicket} />
      )}
    </div>
  )
})

export default TicketDesktop
