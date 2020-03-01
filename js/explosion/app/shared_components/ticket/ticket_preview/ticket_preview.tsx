import React, { memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { timeFormatter, durationFormatter } from '../ticket.formatters'
import TicketCarrierList from '../ticket_carrier/ticket_carrier_list'
import { Trip, Proposal, TicketSegment, Theme, TicketViewProps } from '../ticket.types'
import TicketPriceMobile from '../ticket_price/ticket_price.mobile'
import TicketFavorite from '../ticket_favorite/ticket_favorite'
import TicketSubscriptions from '../ticket_subscriptions/ticket_subscriptions'
import TicketIncomingBadge from '../ticket_incoming_badge/ticket_incoming_badge'

import './ticket_preview.scss'

const cn = clssnms('ticket-preview')

export interface TicketPreviewProps {
  mainProposal: Proposal
  carriers: string[]
  segments: TicketSegment[]
  isNightMode?: boolean
  theme?: Theme
  strikePrice?: number
  withBuyCol?: boolean
  withFavorite?: boolean
  withSubscription?: boolean
  sign?: string
  isFavorite?: boolean
  hasSubscription?: boolean
  onFavoriteClick?: (isFavorite: boolean, sign?: string) => void
  onSubscriptionClick?: (hasSubscription: boolean, sign?: string) => void
  incomingBadge?: TicketViewProps['incomingBadge']
}

const TicketPreview: React.FC<TicketPreviewProps> = memo((props) => {
  const { t } = useTranslation('ticket')
  const expandButtonText =
    props.theme && props.theme.expandButtonText
      ? props.theme.expandButtonText
      : t('ticket:advertisement')
  const isAssisted = props.mainProposal && props.mainProposal.isAssisted

  return (
    <div
      className={cn(null, {
        '--brand-ticket': !!props.theme,
        '--is-favorite': !!props.isFavorite,
        '--has-subscription': !!props.hasSubscription,
      })}
    >
      <div className={cn('header')}>
        {props.withFavorite && (
          <TicketFavorite
            sign={props.sign}
            isFavorite={props.isFavorite}
            onFavoriteClick={props.onFavoriteClick}
            withTooltip={false}
          />
        )}
        {props.withSubscription && (
          <TicketSubscriptions
            sign={props.sign}
            hasSubscription={props.hasSubscription}
            onSubscriptionClick={props.onSubscriptionClick}
            withTooltip={false}
          />
        )}
        {props.withBuyCol && props.mainProposal && props.mainProposal.price ? (
          <TicketPriceMobile mainProposal={props.mainProposal} strikePrice={props.strikePrice} />
        ) : null}
        <div className={cn('carriers')}>
          <TicketCarrierList
            carriers={props.carriers}
            isNightMode={props.isNightMode}
            modifiers={['--size-s']}
            maxLogos={isAssisted ? 2 : 3}
            withTooltip={false}
          />
        </div>
      </div>
      {props.theme &&
        props.theme.sideContent && (
          <div className={cn('brand-content')}>{props.theme.sideContent}</div>
        )}
      <div className={cn('body')}>
        {props.segments.map((segment, index) => (
          <PreviewSegment key={index} segment={segment} />
        ))}
      </div>
      {props.theme && (
        <div className={cn('brand-bar')} style={{ backgroundColor: props.theme.brandColor }}>
          <div className={cn('brand-bar-text')}>{expandButtonText}</div>
        </div>
      )}
      {props.incomingBadge && (
        <div className={cn('outer-badge')}>
          <TicketIncomingBadge {...props.incomingBadge} />
        </div>
      )}
    </div>
  )
})

TicketPreview.defaultProps = {
  withBuyCol: true,
}

interface TicketPreviewSegmentProps {
  segment: TicketSegment
}

const PreviewSegment: React.FC<TicketPreviewSegmentProps> = memo(({ segment }) => {
  const { t } = useTranslation('ticket')
  const [firstTrip, lastTrip] = [segment.route[0], segment.route[segment.route.length - 1]]
  let stops =
    segment.route.length > 1 ? getRouteStops(segment.route) : [t('ticket:mobileDirectFlight')]
  const departureTime = timeFormatter(firstTrip.local_departure_timestamp)
  const arrivalTime = timeFormatter(lastTrip.local_arrival_timestamp)
  const stopsTitle =
    stops.length > 1
      ? t('ticket:mobileStopsWithCount', { count: stops.length })
      : t('ticket:mobileStops')
  // show maximum 2 stops
  if (stops.length > 2) {
    stops.splice(1, stops.length, `${stops[1]}...`)
  }

  let duration = 0

  if (lastTrip.arrival_timestamp && firstTrip.departure_timestamp) {
    duration = ((lastTrip.arrival_timestamp - firstTrip.departure_timestamp) / 60) | 0
  } else {
    duration = segment.route.reduce((acc, current) => acc + current.delay + current.duration, 0)
  }

  return (
    <div className={cn('segment')}>
      <div className={cn('flight')}>
        <p className={cn('flight-label')}>
          {firstTrip.departure} – {lastTrip.arrival}
        </p>
        <p className={cn('flight-value')}>
          {departureTime} – {arrivalTime}
        </p>
      </div>
      <div className={cn('flight')}>
        <p className={cn('flight-label')}>{t('ticket:mobileflightDuration')}</p>
        <p className={cn('flight-value')}>{durationFormatter(duration)}</p>
      </div>
      <div className={cn('flight')}>
        <p className={cn('flight-label')}>{stopsTitle}</p>
        <p className={cn('flight-value')}>{stops.join(', ')}</p>
      </div>
    </div>
  )
})

const getRouteStops = (trips: Trip[]) => {
  const result = trips
    .map((trip: Trip, index: number) => {
      if (index < trips.length - 1) {
        return isAirportChange(trip, trips[index + 1])
          ? [trip.arrival, trips[index + 1].departure].join('\u2009\u002D\u2009')
          : trip.arrival
      }
    })
    .filter(Boolean)

  return result
}

const isAirportChange = (tripIn: Trip, tripOut: Trip) => tripIn.arrival !== tripOut.departure

export default TicketPreview
