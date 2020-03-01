import React from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import ValueRange from '../value_range/value_range'
import { SeatsInfo, SeatWidth } from '../flight_amenities.types'
import AmenitiesCard from '../amenities_card/amenities_card'
import QualityInfoIcon from '../quality_info_icon/quality_info_icon'
import { CompleteInfo } from './seats_width_info.types'
import './seats_width_info.scss'
import ArrowIcon from '!!react-svg-loader!./images/arrow-frontview.svg'

const cn = clssnms('seats-width-info')

interface Props {
  seatsInfo: SeatsInfo
}

const SeatsWidthInfo: React.SFC<Props> = ({ seatsInfo }) => {
  const { t } = useTranslation('amenities')

  const { width, label, quality } = getCompleteInfo(seatsInfo, t)

  return (
    <AmenitiesCard title={label}>
      <div className={cn(null, { '--unknown': !width })}>
        <div className={cn('schema')}>
          <ArrowIcon className={cn('schema-arrow')} />
          <div className={cn('schema-view')}>
            <div className={cn('schema-seat')} />
            <div className={cn('splitter')} />
            <div className={cn('schema-seat')} />
            <div className={cn('splitter')} />
            <div className={cn('schema-seat')} />
          </div>
        </div>
        <div className={cn('value')}>
          {quality && (
            <span className={cn('value-icon')}>
              <QualityInfoIcon blockClassMod={quality} />
            </span>
          )}
          {!!width && t('amenities:centimetersShort', { cm: width })}
        </div>
        {!!width && (
          <div className={cn('scale')}>
            <ValueRange range={[40, 43, 46, 49]} value={width} />
          </div>
        )}
      </div>
    </AmenitiesCard>
  )
}

const getCompleteInfo = (seatsInfo: SeatsInfo, t: i18next.TFunction): CompleteInfo => {
  let widthInt: number = 40

  if (!seatsInfo || !seatsInfo.width) {
    return {
      label: t('amenities:seatsWidth.unknown'),
    }
  }

  switch (seatsInfo.width) {
    case SeatWidth.Standard:
      widthInt = 45
      break
    case SeatWidth.Wider:
      widthInt = 48
      break
    default:
      widthInt = Math.round(seatsInfo.width)
  }

  if (widthInt < 43) {
    return {
      width: widthInt,
      label: t('amenities:seatsWidth.narrow'),
      quality: 'bad',
    }
  }

  if (widthInt < 46) {
    return {
      width: widthInt,
      label: t('amenities:seatsWidth.average'),
      quality: 'good',
    }
  }

  return {
    width: widthInt,
    label: t('amenities:seatsWidth.wide'),
    quality: 'good',
  }
}

export default SeatsWidthInfo
