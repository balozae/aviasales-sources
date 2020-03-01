import React, { memo, useContext, useState, useCallback, useMemo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { Bags } from 'shared_components/types/tariffs'
import { aircraftInfoAdapter } from 'shared_components/flight_amenities/flight_amenities.utils'
import AircraftInfo from 'shared_components/flight_amenities/aircraft_info/aircraft_info'
import TicketCarrier from '../ticket_carrier/ticket_carrier'
import Pin from '../pin/pin'
import { PinSize, PinState } from '../pin/pin.types'
import BagsInfo from '../ticket_tariffs/components/ticket_tariffs_bags_info'
import { Trip, TicketViewProps } from '../ticket.types'
import { getRatingModifier, getTicketFlightDateWithWeekday } from './ticket_flight.utils'
import { durationFormatter } from '../ticket.formatters'
import PlacesContext from '../ticket_context/places_context/places_context'
import { SegmentRouteProps } from '../ticket_segment_route/ticket_segment_route'
import { isPinnedTrip } from '../utils/common.utils'
import { prepareOneTicketCarrier } from '../utils/ticket_carrier.utils'

import './ticket_flight.scss'

const cn = clssnms('ticket-flight')

const FlightRating = memo(({ flight }: { flight: Trip }) => {
  if (!flight.rating) {
    return null
  }
  const modifier = getRatingModifier(flight.rating)

  return <span className={cn('flight-info-rating', modifier)}>{flight.rating.toFixed(1)}</span>
})

export interface TicketFlightProps {
  showPin?: boolean
  onPinClick?: SegmentRouteProps['onPinClick']
  flight: Trip
  fixedTrips: TicketViewProps['fixedTrips']
  flightInfo: TicketViewProps['flightInfo']
  onFlightInfoClick?: (opened: boolean) => void
  bags?: Bags
  isNightMode?: boolean
  isCompactView?: boolean
}

const TicketFlight: React.FC<TicketFlightProps> = ({
  showPin,
  onPinClick,
  fixedTrips,
  flight,
  bags,
  flightInfo,
  isNightMode = false,
  isCompactView = false,
  onFlightInfoClick,
}) => {
  const { t } = useTranslation('ticket')
  const { getPlace, getPlaceName } = useContext(PlacesContext)
  const carrier = flight.marketing_carrier ? flight.marketing_carrier : flight.operating_carrier
  const flightNumber = `${carrier}-${flight.number}`
  const aircraftName = flight.aircraft ? flight.aircraft.replace(' ', '\xA0') : ''
  const [departureAirport, arrivalAirport] = [flight.departure, flight.arrival].map((iata) => {
    const place = getPlace(iata)
    return place ? place.name : ''
  })
  const isPinned = isPinnedTrip(flight, fixedTrips)
  const flightCarrier = useMemo(() => prepareOneTicketCarrier(flight), [flight])

  let currentFlightInfo = flightInfo
    ? flightInfo[`${flight.trip_class}${carrier}${flight.number}`]
    : null

  const handlePin = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (onPinClick) {
        onPinClick([flight], isPinned, 'pin')
      }
    },
    [onPinClick, flight, isPinned],
  )

  const showFlightInfo = currentFlightInfo && Object.keys(currentFlightInfo).length > 0

  const [isOpenedFlightInfo, setFlightInfoState] = useState(false)

  const toggleFlightInfo = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      if (onFlightInfoClick) {
        onFlightInfoClick(!isOpenedFlightInfo)
      }
      setFlightInfoState(!isOpenedFlightInfo)
    },
    [onFlightInfoClick, setFlightInfoState, isOpenedFlightInfo],
  )

  const flightInfoText = showFlightInfo
    ? t(`ticket:flight.flightInfo`)
    : t(`ticket:flight.flight`, { flightNumber })
  const flightInfoClickabled = showFlightInfo ? '--clickable' : ''
  const flightInfoOpenned = isOpenedFlightInfo ? '--openedInfo' : ''

  return (
    <div
      data-testid="flight"
      className={cn(null, { '--pinned': isPinned, '--compact-view': isCompactView })}
    >
      <div className={cn('header')}>
        {showPin && (
          <div className={cn('pin')}>
            <Pin
              size={PinSize.NORMAL}
              state={isPinned ? PinState.ACTIVE : PinState.INACTIVE}
              tooltip={t('ticket:pinTooltip.airplane')}
              onClick={handlePin}
            />
          </div>
        )}
        <span className={cn('title')}>{t(`ticket:flight.flight`, { flightNumber })}</span>
        <span className={cn('duration')}>{durationFormatter(flight.duration)}</span>
      </div>
      <div className={cn('leg')}>
        <div className={cn('carrier')}>
          <TicketCarrier
            type="logo"
            carrier={flightCarrier}
            isSmall={!isCompactView} // need not small for compact view
            width={isCompactView ? 69 : 36}
            height={isCompactView ? 25 : 36}
            isNightMode={isNightMode}
          />
        </div>
        <div className={cn('route')}>
          <div className={cn('route-info')}>
            <span className={cn('departure-time')}>{flight.departure_time}</span>
            <span className={cn('iata')}>{flight.departure}</span>
            <span className={cn('name')}>{departureAirport}</span>
            <span className={cn('departure-date')}>
              {getTicketFlightDateWithWeekday(flight.local_departure_timestamp)}
            </span>
          </div>
          {flight.technical_stops &&
            flight.technical_stops.map(({ airport_code: iata }) => (
              <div key={iata} className={cn('route-info', ['--tech-stop'])}>
                <span className={cn('departure-time')} />
                <span className={cn('iata')}>{iata}</span>
                <span className={cn('name')}>
                  {getPlaceName(iata)}, {t(`ticket:flight.techStop`)}
                </span>
                <span className={cn('departure-date')} />
              </div>
            ))}
          <div className={cn('route-info')}>
            <span className={cn('departure-time')}>{flight.arrival_time}</span>
            <span className={cn('iata')}>{flight.arrival}</span>
            <span className={cn('name')}>{arrivalAirport}</span>
            <span className={cn('departure-date')}>
              {getTicketFlightDateWithWeekday(flight.local_arrival_timestamp)}
            </span>
          </div>
        </div>
      </div>
      <div className={cn('footer')}>
        <div
          className={cn('flight-info-label', [flightInfoClickabled, flightInfoOpenned])}
          onClick={toggleFlightInfo}
        >
          <FlightRating flight={flight} />
          {flightInfoText}
        </div>
        {bags && (
          <div className={cn('bags')}>
            <BagsInfo bags={bags} />
          </div>
        )}
      </div>
      {showFlightInfo &&
        isOpenedFlightInfo && (
          <div className={cn('amenities-wrapper')}>
            <AircraftInfo
              aircraft={aircraftInfoAdapter(currentFlightInfo!, aircraftName, flight.rating)}
              isCompactView={isCompactView}
            />
          </div>
        )}
    </div>
  )
}

export default memo(TicketFlight)
