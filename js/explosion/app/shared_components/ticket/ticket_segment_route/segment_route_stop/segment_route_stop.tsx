import React, { memo, useContext } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import Tooltip from 'shared_components/tooltip'
import { Trip } from '../../ticket.types'
import { durationFormatter } from '../../ticket.formatters'
import PlacesContext from '../../ticket_context/places_context/places_context'
import { handleStopPropagation } from '../../utils/common.utils'

const cn = clssnms('segment-route')

export type StopProps = {
  tripIn: Trip
  tripOut: Trip
}

const SegmentRouteStop: React.FC<StopProps> = memo((props) => {
  const duration = props.tripOut.delay
  const iatas = isAirportChange(props)
    ? [props.tripIn.arrival, props.tripOut.departure]
    : [props.tripIn.arrival]

  return (
    <Tooltip
      wrapperClassName={cn('stop', {
        '--change-airport': isAirportChange(props),
      })}
      showDelay={100}
      fixPosition={{ top: -3 }}
      wrapperProps={{
        style: {
          flexGrow: duration,
        },
        'data-iatas': iatas.join('\u2009\u002D\u2009'),
        onClick: handleStopPropagation,
      }}
      tooltip={() => (
        <div className={cn('tooltip')}>
          <SegmentRouteStopTooltip {...props} />
        </div>
      )}
    />
  )
})

const SegmentRouteStopTooltip: React.FC<StopProps> = memo((props) => {
  const { t } = useTranslation('ticket')
  const places = useContext(PlacesContext)
  const { transport: arrivalTransport, arrival } = props.tripIn
  const { transport: departureTransport, departure, delay: layoverDelay } = props.tripOut

  const [place, city, delay] = [
    places.getPlaceName(arrival),
    places.getCityName(arrival),
    durationFormatter(layoverDelay),
  ]

  let transportPair = 'default'

  if (
    arrivalTransport !== departureTransport ||
    (arrivalTransport === 'airplane' && departureTransport === 'airplane')
  ) {
    transportPair = `${arrivalTransport}_${departureTransport}`
  }

  if (isAirportChange(props)) {
    return (
      <>
        {t(`ticket:transfer.place_change.${transportPair}`, {
          from_place: places.getPlaceName(arrival),
          to_place: places.getPlaceName(departure),
          delay,
          city,
        })}
      </>
    )
  } else {
    return place === city ? (
      <>{t(`ticket:transfer.${transportPair}_short`, { delay, place })}</>
    ) : (
      <>{t(`ticket:transfer.${transportPair}`, { delay, place, city })}</>
    )
  }
})

const isAirportChange = (props: StopProps) => props.tripIn.arrival !== props.tripOut.departure

export default SegmentRouteStop
