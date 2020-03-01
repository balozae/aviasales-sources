import React, { PureComponent, memo, useCallback } from 'react'
import { Swipeable } from 'react-swipeable'
import clssnms from 'clssnms'
import { format } from 'finity-js'
import { withTranslation, WithTranslation } from 'react-i18next'
import TicketTariffs from './ticket_tariffs/ticket_tariffs'
import TicketPreview from './ticket_preview/ticket_preview'
import {
  TicketViewProps,
  TicketMediaQueryTypes,
  TripDirectionType,
  TicketSegment,
} from './ticket.types'
import Modal from 'shared_components/modal/modal'
import BuyButton from './buy_button/buy_button'
import TicketPriceMobile from './ticket_price/ticket_price.mobile'
import TicketBadgeList from './ticket_badge/ticket_badge_list'
import TicketSegmentComponent from './ticket_segment/ticket_segment'
import TicketSchedule from './ticket_schedule/ticket_schedule'
import TicketProposals from './ticket_proposals/ticket_proposals'
import TicketSharing from './ticket_sharing/ticket_sharing'
import TicketFavorite from './ticket_favorite/ticket_favorite'
import TicketSubscriptions from './ticket_subscriptions/ticket_subscriptions'
import TicketIncomingBadge from './ticket_incoming_badge/ticket_incoming_badge'
const IconShare = require('!!react-svg-loader!./ticket_sharing/images/icon-share.svg')

import './ticket.mobile.scss'

const cn = clssnms('ticket-mobile')

interface TicketMobileState {
  moreProposalsCount: number
}

export type MobileTicketModalType =
  | 'mainModal'
  | 'proposalsModal'
  | 'sharingModal'
  | undefined
  | null

type TicketMobileProps = TicketViewProps & WithTranslation

class TicketMobile extends PureComponent<TicketMobileProps, TicketMobileState> {
  state = {
    moreProposalsCount: 0,
  }
  currentAbTestVariant?: string

  static getDerivedStateFromProps(
    props: TicketMobileProps,
    state: TicketMobileState,
  ): TicketMobileState {
    return {
      ...state,
      moreProposalsCount: props.proposals[props.currentTariff].length - 1,
    }
  }

  constructor(props: TicketMobileProps) {
    super(props)
  }

  handlePreviewClick = () => {
    if (this.props.onMobilePreviewClick) {
      this.props.onMobilePreviewClick()
    }
  }

  handleProposalsClick = () => {
    if (this.props.onMobileProposalsClick) {
      this.props.onMobileProposalsClick()
    }
  }

  handleSharingClick = () => {
    if (this.props.onMobileSharingClick) {
      this.props.onMobileSharingClick()
    }
  }

  closeModal(modal: MobileTicketModalType) {
    if (this.props.onModalCloseClick) {
      this.props.onModalCloseClick(modal)
    }
  }

  isMainModalOpen = () => !!this.props.currentMobileModal
  isProposalsModalOpen = () => this.props.currentMobileModal === 'proposalsModal'
  isSharingModalOpen = () => this.props.currentMobileModal === 'sharingModal'

  handleMainModalClose = () => this.closeModal('mainModal')
  handleProposalsModalClose = () => this.closeModal('proposalsModal')
  handleSharingModalClose = () => this.closeModal('sharingModal')

  render() {
    const props = this.props
    const state = this.state
    const { t } = props

    const {
      showTariffs = true,
      actual = true,
      withFavoriteOnMobilePreview = true,
      withSubscriptionOnMobilePreview = true,
    } = props

    return (
      <div className={cn(null, [this.isMainModalOpen() && '--is-opened', ...props.modifiers])}>
        <div className={cn('preview')} onClick={this.handlePreviewClick}>
          <TicketPreview
            mainProposal={props.mainProposal}
            carriers={props.carriers}
            segments={props.segments}
            isNightMode={props.isNightMode}
            withBuyCol={props.withBuyCol}
            withFavorite={props.withFavorite && withFavoriteOnMobilePreview}
            withSubscription={props.withSubscription && withSubscriptionOnMobilePreview}
            sign={props.sign}
            isFavorite={props.isFavorite}
            hasSubscription={props.hasSubscription}
            onFavoriteClick={props.onFavoriteClick}
            onSubscriptionClick={props.onSubscriptionClick}
            incomingBadge={props.incomingBadge}
            strikePrice={props.strikePrice}
          />
        </div>
        <Modal
          onClose={this.handleMainModalClose}
          header={
            <TicketMobileHeader
              onCloseClick={this.handleMainModalClose}
              onShareClick={this.handleSharingClick}
              withSharing={props.withSharing}
              withFavorite={props.withFavorite}
              withSubscription={props.withSubscription}
              sign={props.sign}
              isFavorite={props.isFavorite}
              hasSubscription={props.hasSubscription}
              onFavoriteClick={props.onFavoriteClick}
              onSubscriptionClick={props.onSubscriptionClick}
              shouldCloseOnFavoriteClick={props.buyButtonType === 'favorite' ? true : false}
            >
              {t('ticket:mobileMainTitle', {
                route: getTripRoute(props.segments, props.tripDirectionType),
              })}
            </TicketMobileHeader>
            // tslint:disable-next-line:jsx-curly-spacing
          }
          footer={
            props.withBuyCol && (
              <div className={cn('buy-button')}>
                <BuyButton
                  getMetaInfo={props.getMetaInfo}
                  proposal={props.mainProposal}
                  withDebug={props.debugProposals}
                  isSearchExpired={props.isSearchExpired}
                  onClick={props.onBuyButtonClick}
                  onContextMenu={props.onBuyButtonContextMenu}
                  onRefreshClick={props.onRefreshClick}
                  isProposalTitleHidden={true}
                  type={props.buyButtonType}
                  actual={actual}
                />
              </div>
            )
            // tslint:disable-next-line:jsx-curly-spacing
          }
          fixedHeader={true}
          fixedFooter={true}
          visible={this.isMainModalOpen()}
          animationType={'right'}
        >
          <Swipeable
            className={cn('modal', { '--is-opened': this.isMainModalOpen() })}
            onSwipedRight={this.handleMainModalClose}
            trackMouse={true}
            delta={50}
          >
            {showTariffs && (
              <div className={cn('tariffs')}>
                <TicketTariffs
                  currentTariff={props.currentTariff}
                  proposals={props.proposals}
                  withDebug={props.debugProposals}
                  onTariffChange={props.onTariffChange}
                  withTooltip={false}
                />
              </div>
            )}
            <div className={cn('modal-body')}>
              <div className={cn('remaining-tickets')}>
                {props.showRemainingSeatsCount &&
                  props.seatsCount &&
                  t('ticket:remainingTickets', { count: props.seatsCount })}
              </div>
              <div className={cn('price')}>
                {props.mainProposal && props.mainProposal.price ? (
                  <TicketPriceMobile
                    mainProposal={props.mainProposal}
                    strikePrice={props.strikePrice}
                    modifiers={['--large']}
                    proposalLabel={props.mainProposal.gate.label}
                    isProposalTitleHidden={props.isProposalTitleHidden}
                  />
                ) : null}
                {props.buyButtonType === 'favorite' &&
                  props.searchParams && (
                    <span className={cn('proposal-text')}>
                      {t('ticket:found')}
                      <br />
                      {props.searchParams.searchDate &&
                        format(new Date(props.searchParams.searchDate), 'D MMMM YYYY', true)}
                      <br />
                      {t('ticket:passengersCount', {
                        count:
                          props.searchParams.passengers.adults +
                          props.searchParams.passengers.children +
                          props.searchParams.passengers.infants,
                      })}
                      , {t(`ticket:tripClass.${props.searchParams.trip_class}`)}
                    </span>
                  )}
              </div>
              {state.moreProposalsCount > 0 && (
                <button className={cn('proposal-select')} onClick={this.handleProposalsClick}>
                  {t('ticket:mobileProposalsSelect', {
                    count: state.moreProposalsCount,
                  })}
                </button>
              )}
              <div className={cn('badges')}>
                {props.badges.other &&
                  props.badges.other.length && (
                    <div className={cn('badges-list')}>
                      <TicketBadgeList badges={props.badges.other} modifiers={['--indent-large']} />
                    </div>
                  )}
                {props.badges.warning &&
                  props.badges.warning.length && (
                    <div className={cn('badges-list')}>
                      <TicketBadgeList
                        badges={props.badges.warning}
                        onTooltip={props.onWarningBadgeTooltip}
                        modifiers={['--indent-large']}
                      />
                    </div>
                  )}
              </div>
              {props.incomingBadge &&
                props.incomingBadge.description && (
                  <div className={cn('incoming-badge')}>
                    <TicketIncomingBadge {...props.incomingBadge} isFullView={true} />
                  </div>
                )}
              {props.sideExtraContent && (
                <div className={cn('extra-content')}>{props.sideExtraContent}</div>
              )}
              <div className={cn('segment-list')}>
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
                {props.segments.map((segment, index) => (
                  <div className={cn('segment')} key={index}>
                    <TicketSegmentComponent
                      segmentIndex={index}
                      isOpen={this.isMainModalOpen()}
                      fixedTrips={props.fixedTrips}
                      onPinClick={props.onPinClick}
                      showPin={false}
                      tripDirectionType={props.tripDirectionType}
                      searchParams={props.searchParams}
                      marker={props.marker}
                      mainProposal={props.mainProposal}
                      flightInfo={props.flightInfo}
                      onFlightInfoClick={props.onFlightInfoClick}
                      onHotelStopClick={props.onHotelStopClick}
                      isNightMode={props.isNightMode}
                      isCompactView={true}
                      {...segment}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Swipeable>
        </Modal>
        <Modal
          header={t('ticket:mobileProposalsTitle')}
          fixedHeader={true}
          visible={this.isProposalsModalOpen()}
          animationType={'right'}
          onClose={this.handleProposalsModalClose}
          withDefaultHeader={true}
        >
          <Swipeable
            className={cn('modal')}
            onSwipedRight={this.handleProposalsModalClose}
            trackMouse={true}
            delta={50}
          >
            <TicketProposals
              getMetaInfo={props.getMetaInfo}
              airlineProposal={props.airlineProposal}
              proposals={props.proposalsByTariff}
              withDebug={props.debugProposals}
              onProposalClick={props.onProposalClick}
              isSearchExpired={props.isSearchExpired}
              onRefreshClick={props.onRefreshClick}
              mediaQueryType={TicketMediaQueryTypes.Mobile}
            />
          </Swipeable>
        </Modal>
        {props.withSharing && (
          <Modal
            header={t('ticket:mobileSharingTitle')}
            fixedHeader={true}
            visible={this.isSharingModalOpen()}
            animationType={'right'}
            onClose={this.handleSharingModalClose}
            withDefaultHeader={true}
          >
            <Swipeable
              className={cn('modal', '--sharing')}
              onSwipedRight={this.handleSharingModalClose}
              trackMouse={true}
              delta={50}
            >
              <TicketSharing
                onTicketShare={props.onTicketShare}
                onTooltipShow={props.onShareTooltipShow}
                onTicketUrlCopy={props.onTicketUrlCopy}
                ticketUrl={props.ticketUrl}
                mediaQueryType={TicketMediaQueryTypes.Mobile}
              />
            </Swipeable>
          </Modal>
        )}
      </div>
    )
  }
}

const getTripRoute = (segments: TicketSegment[], directionType: TripDirectionType) => {
  const [firstSegment, lastSegment] = [segments[0], segments[segments.length - 1]]

  if (directionType === TripDirectionType.Multiway) {
    const [firstTrip, lastTrip] = [
      firstSegment.route[0],
      lastSegment.route[lastSegment.route.length - 1],
    ]
    return `${firstTrip.departure}...${lastTrip.arrival}`
  } else {
    const [firstTrip, lastTrip] = [
      firstSegment.route[0],
      firstSegment.route[firstSegment.route.length - 1],
    ]
    return `${firstTrip.departure} - ${lastTrip.arrival}`
  }
}

const TicketMobileHeader: React.FC<{
  onCloseClick: () => void
  onShareClick?: () => void
  withSharing?: boolean
  withSubscription?: boolean
  withFavorite?: boolean
  shouldCloseOnFavoriteClick?: boolean
  shouldCloseOnSubscriptionClick?: boolean
  sign?: string
  isFavorite?: boolean
  hasSubscription?: boolean
  onFavoriteClick?: (isFavorite: boolean, sign?: string) => void
  onSubscriptionClick?: (isFavorite: boolean, sign?: string) => void
}> = memo((props) => {
  const handleFavoriteClick = useCallback(
    (isFavorite, sign) => {
      if (!props.onFavoriteClick) {
        return
      }

      if (props.shouldCloseOnFavoriteClick) {
        props.onCloseClick()
        // NOTE: some hack to make something with ticket only after modal and overlay disappear
        // @ts-ignore
        setTimeout(() => props.onFavoriteClick(isFavorite, sign), 0)
      } else {
        props.onFavoriteClick(isFavorite, sign)
      }
    },
    [props.shouldCloseOnFavoriteClick, props.onCloseClick, props.onFavoriteClick],
  )

  const handleSubscriptionClick = useCallback(
    (hasSubscription, sign) => {
      if (!props.onSubscriptionClick) {
        return
      }

      if (props.shouldCloseOnSubscriptionClick) {
        props.onCloseClick()
        // NOTE: some hack to make something with ticket only after modal and overlay disappear
        // @ts-ignore
        setTimeout(() => props.onSubscriptionClick(hasSubscription, sign), 0)
      } else {
        props.onSubscriptionClick(hasSubscription, sign)
      }
    },
    [props.shouldCloseOnFavoriteClick, props.onCloseClick, props.onFavoriteClick],
  )

  return (
    <div className={cn('header')}>
      <button className={cn('header-arrow')} onClick={props.onCloseClick} />
      <h3 className={cn('header-title')}>{props.children}</h3>
      <div className={cn('header-icons')}>
        {props.withFavorite && (
          <div className={cn('header-favorite')}>
            <TicketFavorite
              sign={props.sign}
              isFavorite={props.isFavorite}
              onFavoriteClick={handleFavoriteClick}
              withTooltip={false}
            />
          </div>
        )}
        {props.withSubscription && (
          <div className={cn('header-subs')}>
            <TicketSubscriptions
              sign={props.sign}
              hasSubscription={props.hasSubscription}
              onSubscriptionClick={handleSubscriptionClick}
              withTooltip={false}
            />
          </div>
        )}
        {props.withSharing && (
          <button className={cn('header-share')}>
            <IconShare className={cn('header-share-icon')} onClick={props.onShareClick} />
          </button>
        )}
      </div>
    </div>
  )
})

export default withTranslation('ticket')(TicketMobile)
