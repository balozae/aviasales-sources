import React from 'react'
import clssnms from 'clssnms'
import { withTranslation, WithTranslation } from 'react-i18next'
import Tooltip from 'shared_components/tooltip'
import SegmentRouteStop from './segment_route_stop/segment_route_stop'
import { PinState, PinSize } from '../pin/pin.types'
import Pin from '../pin/pin'
import { Trip, TripDirectionType, TicketViewProps } from '../ticket.types'
import { durationFormatter, timeFormatter, dateFormatter } from '../ticket.formatters'
import PlacesContext, { PlacesContextProps } from '../ticket_context/places_context/places_context'
import { isPinnedSegment, isPinnedTrip, handleStopPropagation } from '../utils/common.utils'

import './ticket_segment_route.scss'

const IconAirplane = require('!!react-svg-loader!./images/airplane.svg')
const IconBus = require('!!react-svg-loader!./images/bus.svg')
const IconBoat = require('!!react-svg-loader!./images/boat.svg')
const IconTaxi = require('!!react-svg-loader!./images/taxi.svg')
const IconTrain = require('!!react-svg-loader!./images/train.svg')

const tripTransportIconMap = {
  airplane: IconAirplane,
  boat: IconBoat,
  taxi: IconTaxi,
  train: IconTrain,
  bus: IconBus,
}

const cn = clssnms('segment-route')

export interface SegmentRouteProps {
  segmentIndex?: number
  trips: Trip[]
  fixedTrips: TicketViewProps['fixedTrips']
  onPinClick?: (trips: Trip[], isActive: boolean, target: string, segmentIndex?: number) => void
  showPin?: boolean
  tripDirectionType: TripDirectionType
  isCompactView?: boolean
}

class TicketSegmentRoute extends React.PureComponent<SegmentRouteProps & WithTranslation> {
  static defaultProps = {
    fixedTrips: [],
    showPin: false,
  }

  private isOneWay

  constructor(props: SegmentRouteProps & WithTranslation) {
    super(props)
    this.isOneWay = props.tripDirectionType === TripDirectionType.OneWay
  }

  pinClickHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const { onPinClick, trips, segmentIndex = 0 } = this.props

    if (onPinClick) {
      onPinClick(trips, this.isActiveSegment(), 'segment', segmentIndex)
    }
  }

  getSegmentPinState = () => {
    if (this.isActiveSegment()) {
      return PinState.ACTIVE
    }

    if (this.isFlightPinned()) {
      return PinState.PARTIAL
    }

    return PinState.INACTIVE
  }

  isActiveSegment = () => {
    const { trips, fixedTrips } = this.props

    return isPinnedSegment(trips, fixedTrips)
  }

  isFlightPinned = () => {
    const { trips, fixedTrips } = this.props

    return trips.some((trip) => isPinnedTrip(trip, fixedTrips))
  }

  renderEndpoint(kind: 'origin' | 'destination', time: string, city: string, dateStr: string) {
    const { t, showPin } = this.props
    const pinState = this.getSegmentPinState()

    return (
      <div className={cn('endpoint', kind)}>
        {showPin &&
          !this.isOneWay &&
          kind === 'origin' && (
            <div className={cn('pin')}>
              <Pin
                state={pinState}
                size={PinSize.BIG}
                tooltip={t('ticket:pinTooltip.segment')}
                onClick={this.pinClickHandler}
              />
            </div>
          )}
        <div className={cn('time')}>{time}</div>
        <div className={cn('city')}>{city}</div>
        <div className={cn('date')}>{dateStr}</div>
      </div>
    )
  }

  renderPathEndpoint(type: 'departure' | 'arrival', trip: Trip, places: PlacesContextProps) {
    const { t } = this.props
    const iata = type === 'departure' ? trip.departure : trip.arrival
    const timestamp =
      type === 'departure' ? trip.local_departure_timestamp : trip.local_arrival_timestamp
    const place = places.getPlaceName(iata)
    const city = places.getCityName(iata)
    const _tPlace =
      place === city ? t('ticket:placeShort', { place }) : t('ticket:place', { place, city })
    const TransportIcon = tripTransportIconMap[trip.transport] || null
    const tooltipContent = t(`ticket:${type}.${trip.transport}`, {
      place: _tPlace,
      time: timeFormatter(timestamp),
    })
    const tooltipFixPosition = type === 'departure' ? { left: 10 } : { left: -10 }

    return (
      <Tooltip
        wrapperClassName={cn('path-endpoint', [`--${type}`, `--${trip.transport}`])}
        showDelay={200}
        fixPosition={tooltipFixPosition}
        wrapperProps={{ onClick: handleStopPropagation }}
        tooltip={() => <div className={cn('tooltip')}>{tooltipContent}</div>}
      >
        <TransportIcon className={cn('path-endpoint-icon')} />
        <span className={cn('path-endpoint-iata')}>{iata}</span>
      </Tooltip>
    )
  }

  renderTechStopsText = (stops: Trip['technical_stops'], places: PlacesContextProps) => {
    const { t } = this.props

    if (stops && stops.length) {
      const stopsTexts = stops.map(({ airport_code: iata }) => {
        const place = places.getPlaceName(iata)
        const city = places.getCityName(iata)
        const _tPlace =
          place === city ? t('ticket:placeShort', { place }) : t('ticket:placeV2', { place, city })

        return `${_tPlace}`
      })

      return t('ticket:techStops', {
        stopsCount: stopsTexts.length,
        stopsText: stopsTexts.join(', '),
      })
    }

    return null
  }

  renderConnector({
    trip,
    pinable,
    onClick,
    places,
  }: {
    trip: Trip
    pinable?: boolean
    onClick: (e: React.MouseEvent) => void
    places: PlacesContextProps
  }) {
    const { t } = this.props
    const techStopsText = this.renderTechStopsText(trip.technical_stops, places)

    return pinable ? (
      <Tooltip
        tooltip={() => (
          <div className={cn('tooltip')}>
            {t(`ticket:tripDuration`, { duration: durationFormatter(trip.duration) })}
            {techStopsText && (
              <>
                <br />({techStopsText})
              </>
            )}
            <br />
            {t(
              `ticket:pinTooltip.${trip.transport === 'airplane' ? 'airplane' : 'otherTransport'}`,
            )}
          </div>
        )}
        wrapperClassName={cn('connector', {
          '--is-pinned': isPinnedTrip(trip, this.props.fixedTrips),
          '--pinable': true,
        })}
        wrapperProps={{
          style: {
            flexGrow: trip.duration,
          },
          onClick,
        }}
        fixPosition={{ top: -5 }}
      />
    ) : (
      <div
        className={cn('connector')}
        style={{ flexGrow: trip.duration }}
        onClick={handleStopPropagation}
      />
    )
  }

  handleConnectorClick = (event, trip) => {
    event.preventDefault()
    event.stopPropagation()

    const { onPinClick, showPin } = this.props

    if (onPinClick && showPin) {
      onPinClick([trip], isPinnedTrip(trip, this.props.fixedTrips), 'connector')
    }
  }

  renderHeader(departureCity?: string, arrivalCity?: string) {
    const { t, tripDirectionType, segmentIndex } = this.props

    if (tripDirectionType === TripDirectionType.OneWay) {
      return null
    }

    let title = `${departureCity} — ${arrivalCity}`
    if (tripDirectionType === TripDirectionType.RoundTrip) {
      const directionKey = segmentIndex === 0 ? 'forth' : 'back'
      title = t(`ticket:tripDirection.${directionKey}`, { route: title })
    }

    return (
      <div className={cn('header')}>
        <h3 className={cn('title')}>{title}</h3>
      </div>
    )
  }

  render() {
    const { t, trips, showPin, isCompactView } = this.props
    const [firstTrip, lastTrip] = [trips[0], trips[trips.length - 1]]
    let duration = 0

    if (lastTrip.arrival_timestamp && firstTrip.departure_timestamp) {
      duration = (lastTrip.arrival_timestamp - firstTrip.departure_timestamp) / 60
    } else {
      duration = trips.reduce((acc, current) => acc + current.delay + current.duration, 0)
    }

    return (
      <PlacesContext.Consumer>
        {(places) => {
          const segmentDepartureCity = places.getCityName(firstTrip.departure)
          const segmentArrivalCity = places.getCityName(lastTrip.arrival)

          if (isCompactView) {
            return (
              <div className={cn(null, '--compact-view')}>
                {this.renderHeader(segmentDepartureCity, segmentArrivalCity)}
                <div className={cn('body')}>
                  <div className={cn('duration')}>
                    {t('ticket:tripDuration', {
                      duration: durationFormatter(duration),
                    })}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div className={cn()}>
              {this.renderHeader(segmentDepartureCity, segmentArrivalCity)}
              <div className={cn('body')}>
                {this.renderEndpoint(
                  'origin',
                  firstTrip.departure_time,
                  segmentDepartureCity,
                  dateFormatter(firstTrip.local_departure_timestamp),
                )}

                <div className={cn('route_wrap')}>
                  <div className={cn('duration')}>
                    {t('ticket:tripDuration', {
                      duration: durationFormatter(duration),
                    })}
                  </div>
                  <div className={cn('path')}>
                    {trips.map((trip, index) => {
                      return (
                        <React.Fragment key={index}>
                          {index === 0 && this.renderPathEndpoint('departure', trip, places)}

                          {this.renderConnector({
                            trip,
                            pinable:
                              showPin && (!this.isOneWay || (this.isOneWay && trips.length > 1)),
                            onClick: (event) => this.handleConnectorClick(event, trip),
                            places,
                          })}

                          {index < trips.length - 1 ? (
                            <SegmentRouteStop tripIn={trip} tripOut={trips[index + 1]} />
                          ) : (
                            this.renderPathEndpoint('arrival', trip, places)
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>

                {this.renderEndpoint(
                  'destination',
                  lastTrip.arrival_time,
                  segmentArrivalCity,
                  dateFormatter(lastTrip.local_arrival_timestamp),
                )}
              </div>
            </div>
          )
        }}
      </PlacesContext.Consumer>
    )
  }
}

export default withTranslation('ticket')(TicketSegmentRoute)
