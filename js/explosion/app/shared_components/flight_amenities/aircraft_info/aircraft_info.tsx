import * as React from 'react'
import clssnms from 'clssnms'
import { useTranslation, Trans } from 'react-i18next'
import { AircraftInfo } from '../flight_amenities.types'
import AmenitiesList from '../amenities_list/amenities_list'
import AmenitiesRating from '../amenities_rating/amenities_rating'
import SeatsLayout from '../seats_layout/seats_layout'
import SeatsStepInfo from '../seats_step_info/seats_step_info'
import SeatsWidthInfo from '../seats_width_info/seats_width_info'
import './aircraft_info.scss'

const cn = clssnms('aircraft-info')

interface Props {
  aircraft: AircraftInfo
  isCompactView?: boolean
}

export default function AmenitiesInfo(props: Props) {
  const { t } = useTranslation('amenities')

  return (
    <div className={cn(null, { '--compact-view': !!props.isCompactView })}>
      <div className={cn('top-block')}>
        {!!props.aircraft.aircraftName && (
          <div className={cn('aircraft-name')}>{props.aircraft.aircraftName}</div>
        )}
        {!!props.aircraft.rating && (
          <div className={cn('rating')}>
            <AmenitiesRating rating={props.aircraft.rating} />
          </div>
        )}
      </div>
      <div className={cn('delay-texts')}>
        <div className={cn('delay')}>
          <Trans
            ns="amenities"
            i18nKey="averageDelay"
            values={{
              minutes: props.aircraft.delay
                ? t('amenities:minutes', { value: props.aircraft.delay.mean })
                : t('amenities:unknown'),
            }}
            components={[<span key="delayLabel" className={cn('delay-label')} />]}
          />
        </div>
        <div className={cn('delay-percent')}>
          <Trans
            ns="amenities"
            i18nKey="delayPercent"
            values={{
              value: props.aircraft.delay
                ? `${Math.round(100 - props.aircraft.delay.ontimePercent * 100)}%`
                : t('amenities:unknown'),
            }}
            components={[<span key="delayPercentLabel" className={cn('delay-percent-label')} />]}
          />
        </div>
      </div>
      <div className={cn('cards-wrapper')}>
        <div className={cn('amenity-card', '--list')}>
          <AmenitiesList amenities={props.aircraft.amenities} />
        </div>
        <div className={cn('amenity-card')}>
          <SeatsLayout layout={props.aircraft.seatsLayout} />
        </div>
        <div className={cn('amenity-card')}>
          <SeatsStepInfo seatsInfo={props.aircraft.seats} />
        </div>
        <div className={cn('amenity-card')}>
          <SeatsWidthInfo seatsInfo={props.aircraft.seats} />
        </div>
      </div>
    </div>
  )
}
