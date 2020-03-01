import React, { memo, useContext } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import TicketSegmentRoute, { SegmentRouteProps } from '../ticket_segment_route/ticket_segment_route'
import { Trip, Proposal, TripDirectionType, TicketViewProps } from '../ticket.types'
import PlaceContext from '../ticket_context/places_context/places_context'
import TicketStop, { TicketStopProps } from '../ticket_stop/ticket_stop'
import {
  getStopPlaceName,
  getChangesOfAirport,
  getHotelUrl,
} from '../ticket_stop/ticket_stop.utils'
import TicketFlight, { TicketFlightProps } from '../ticket_flight/ticket_flight'
import { Transfer } from '../ticket_incoming_data.types'
import './ticket_segment.scss'

const cn = clssnms('ticket-segment')

export interface SegmentProps {
  segmentIndex: number
  route: Trip[]
  transfers?: Transfer[]
  fixedTrips: TicketViewProps['fixedTrips']
  showPin?: boolean
  searchParams: TicketViewProps['searchParams']
  marker: TicketViewProps['marker']
  mainProposal: Proposal
  isOpen: boolean
  flightInfo: TicketViewProps['flightInfo']
  tripDirectionType: TripDirectionType
  isNightMode?: boolean
  isCompactView?: boolean

  // Callbacks
  onPinClick?: SegmentRouteProps['onPinClick']
  onFlightInfoClick?: TicketFlightProps['onFlightInfoClick']
  onHotelStopClick?: TicketStopProps['onHotelClick']
}

const TicketSegment: React.FC<SegmentProps> = (props) => {
  const { i18n } = useTranslation('ticket')
  const locale = i18n.language
  const { route, tripDirectionType, transfers } = props
  const { airports, getCountryCode } = useContext(PlaceContext)
  const isOneWay = tripDirectionType === TripDirectionType.OneWay

  return (
    <div className={cn(null, { '--compact-view': !!props.isCompactView })}>
      <div className={cn('route')}>
        <TicketSegmentRoute
          segmentIndex={props.segmentIndex}
          trips={route}
          onPinClick={props.onPinClick}
          fixedTrips={props.fixedTrips}
          showPin={props.showPin}
          tripDirectionType={props.tripDirectionType}
          isCompactView={props.isCompactView}
        />
      </div>
      {props.isOpen && (
        <div className={cn('details')}>
          {route.map((flight, index) => {
            const current = flight
            const prev = route[index - 1]
            const transfer: Transfer | undefined = transfers && transfers[index - 1]
            const visaCountry =
              transfer && (transfer.visa_rules.required ? transfer.country_code : null)

            return (
              <div className={cn('item')} key={flight.number}>
                {prev &&
                  current.delay && (
                    <div className={cn('stop')}>
                      <TicketStop
                        key={`stop-${index}`}
                        stopPlace={
                          airports[current.departure]
                            ? getStopPlaceName(airports[current.departure])
                            : current.departure
                        }
                        delay={current.delay}
                        changesOfAirport={getChangesOfAirport(prev.arrival, current.departure)}
                        visaCountry={visaCountry}
                        isRecheckBaggage={transfer && transfer.recheck_baggage}
                        hotelUrl={
                          props.searchParams &&
                          getHotelUrl(
                            airports[prev.arrival],
                            prev,
                            current,
                            props.searchParams,
                            locale,
                            props.marker,
                          )
                        }
                        onHotelClick={props.onHotelStopClick}
                        isCompactView={props.isCompactView}
                      />
                    </div>
                  )}
                <div className={cn('flight')}>
                  <TicketFlight
                    showPin={props.showPin && (!isOneWay || (isOneWay && route.length > 1))}
                    onPinClick={props.onPinClick}
                    fixedTrips={props.fixedTrips}
                    bags={
                      props.mainProposal && props.mainProposal.bags
                        ? props.mainProposal.bags[props.segmentIndex][index]
                        : undefined
                    }
                    key={flight.number}
                    flightInfo={props.flightInfo}
                    flight={flight}
                    isNightMode={props.isNightMode}
                    onFlightInfoClick={props.onFlightInfoClick}
                    isCompactView={props.isCompactView}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

TicketSegment.defaultProps = {
  isOpen: false,
}

export default memo(TicketSegment)
