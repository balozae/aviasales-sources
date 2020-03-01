import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'clssnms'
import Slider, { SliderRangeProps } from 'shared_components/slider/slider_range'
import Button from 'shared_components/button/button'
import { ButtonMod } from 'shared_components/button/button.types'

import './trip_duration_range_slider.scss'

const cn = classNames('trip-duration-range-slider')

interface OwnProps {
  clearBtnText?: string
  onCancelClick: () => void
  onConfirmClick: () => void
  onChange: (values: number[]) => void
}

export type TripDurationRangeSliderProps = Exclude<SliderRangeProps, 'renderLabel' | 'onChange'> &
  OwnProps

const TripDurationRangeSlider: React.FC<TripDurationRangeSliderProps> = ({
  minValue,
  maxValue,
  range,
  onChange,
  onCancelClick,
  onConfirmClick,
  clearBtnText,
}) => {
  const { t } = useTranslation('trip_duration')

  const handleOnChange = useCallback((values) => onChange(values), [onChange])
  const handleCancel = useCallback(() => onCancelClick(), [onCancelClick])
  const handleConfirm = useCallback(() => onConfirmClick(), [onConfirmClick])

  const renderLabel = useMemo(
    () => (value: number, type: 'min' | 'max') => (
      <>
        {type === 'min' && (
          <span className={cn('label')}>{t('trip_duration:range.from', { value })}</span>
        )}
        {type === 'max' && (
          <span className={cn('label')}>{t('trip_duration:range.to', { value })}</span>
        )}
      </>
    ),
    [t],
  )

  return (
    <div className={cn()}>
      <p className={cn('title')}>{t('trip_duration:durationHeader')}</p>
      <div className={cn('slider')}>
        <Slider
          renderLabel={renderLabel}
          minValue={minValue}
          maxValue={maxValue}
          range={range}
          onChange={handleOnChange}
        />
      </div>
      <div className={cn('buttons')}>
        {clearBtnText && (
          <Button
            className={cn('btn-cancel')}
            mod={ButtonMod.PrimaryOutline}
            onClick={handleCancel}
          >
            {clearBtnText}
          </Button>
        )}
        <Button className={cn('btn-confirm')} mod={ButtonMod.Secondary} onClick={handleConfirm}>
          {t('trip_duration:ready')}
        </Button>
      </div>
    </div>
  )
}

export default React.memo(TripDurationRangeSlider)
