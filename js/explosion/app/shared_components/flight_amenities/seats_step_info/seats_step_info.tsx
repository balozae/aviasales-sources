import * as React from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import ValueRange from '../value_range/value_range'
import { SeatsInfo } from '../flight_amenities.types'
import AmenitiesCard from '../amenities_card/amenities_card'
import QualityInfoIcon from '../quality_info_icon/quality_info_icon'
import { CompleteInfo, SeatsSizeType } from './seats_step_info.types'
import './seats_step_info.scss'
import AverageArrowIcon from '!!react-svg-loader!./images/arrow-average.svg'
import NarrowArrowIcon from '!!react-svg-loader!./images/arrow-narrow.svg'
import WideArrowIcon from '!!react-svg-loader!./images/arrow-wide.svg'

const cn = clssnms('seats-step-info')

const ARROWS = {
  average: <AverageArrowIcon className={cn('schema-arrow-icon')} />,
  narrow: <NarrowArrowIcon className={cn('schema-arrow-icon')} />,
  wide: <WideArrowIcon className={cn('schema-arrow-icon')} />,
}

interface Props {
  seatsInfo: SeatsInfo
}

const SeatsStepInfo: React.SFC<Props> = React.memo(({ seatsInfo }) => {
  const { t } = useTranslation('amenities')
  const { pitch, label, size, quality } = getCompleteInfo(seatsInfo, t)

  return (
    <AmenitiesCard title={label}>
      <div className={cn(null, { '--unknown': !pitch })}>
        <div className={cn('schema', `--${size}`)}>
          <div className={cn('schema-arrow')}>{ARROWS[size]}</div>
          <div className={cn('schema-view')}>
            <div className={cn('schema-seat')} />
            <div className={cn('schema-seat')} />
          </div>
        </div>
        <div className={cn('value')}>
          {quality && (
            <span className={cn('value-icon')}>
              <QualityInfoIcon blockClassMod={quality} />
            </span>
          )}
          {!!pitch && t('amenities:centimetersShort', { cm: pitch })}
        </div>
        {!!pitch && <ValueRange range={[68, 75, 82, 89]} value={pitch} />}
      </div>
    </AmenitiesCard>
  )
})

const getCompleteInfo = (seatsInfo: SeatsInfo, t: i18next.TFunction): CompleteInfo => {
  if (!seatsInfo || !seatsInfo.pitch) {
    return {
      label: t('amenities:seatsStep.unknown'),
      size: SeatsSizeType.Narrow,
    }
  }

  const pitchInt = Math.round(seatsInfo.pitch)
  if (pitchInt < 75) {
    return {
      pitch: pitchInt,
      label: t('amenities:seatsStep.narrow'),
      size: SeatsSizeType.Narrow,
      quality: 'bad',
    }
  }

  if (pitchInt < 82) {
    return {
      pitch: pitchInt,
      label: t('amenities:seatsStep.average'),
      size: SeatsSizeType.Average,
      quality: 'good',
    }
  }

  return {
    pitch: pitchInt,
    label: t('amenities:seatsStep.wide'),
    size: SeatsSizeType.Wide,
    quality: 'good',
  }
}

export default SeatsStepInfo
