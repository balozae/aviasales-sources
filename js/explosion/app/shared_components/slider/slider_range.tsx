import React, { memo, useMemo, useState, useCallback } from 'react'
import clssnms from 'clssnms'
import Slider, { SliderProps } from './slider'
import { SliderEventCb } from './slider.types'
import { withTranslation, WithTranslation, Trans } from 'react-i18next'
import { dateToLowerCase } from 'shared_components/l10n/l10n'

import './slider_range.scss'

const cn = clssnms('slider-range')

export type SliderRangeProps = Omit<SliderProps, 'start'> & {
  minValue: number
  maxValue: number
  renderLabel?: (value: number, type: 'min' | 'max') => React.ReactNode
}

const SliderRange: React.FC<SliderRangeProps> = ({
  minValue,
  maxValue,
  renderLabel,
  className,
  onUpdate,
  ...otherProps
}) => {
  const values = useMemo(() => [minValue, maxValue], [minValue, maxValue])
  const [labelsValues, setLabelsValues] = useState(values)
  const handleUpdate = useCallback<SliderEventCb>(
    (newValues, ...args) => {
      setLabelsValues(newValues)
      if (onUpdate) {
        onUpdate(newValues, ...args)
      }
    },
    [onUpdate],
  )

  return (
    <div className={cn('', className)}>
      {renderLabel &&
        typeof renderLabel === 'function' && (
          <div className={cn('labels')}>
            <div className={cn('label', '--min')}>{renderLabel(labelsValues[0], 'min')}</div>
            <div className={cn('label', '--max')}>{renderLabel(labelsValues[1], 'max')}</div>
          </div>
        )}
      <Slider {...otherProps} start={values} className={cn('slider')} onUpdate={handleUpdate} />
    </div>
  )
}

export default memo(SliderRange)

/**
 * if you need default labels 'from' and 'to'
 * you should use this component as a value wrapper
 * see example in slider.stories.tsx
 */
const SliderRangeFromToLabelComponent: React.FC<
  {
    type: 'min' | 'max'
  } & WithTranslation
> = ({ type, children }) => {
  const i18nKey = type === 'min' ? 'minRangeLabel' : 'maxRangeLabel'

  if (typeof children === 'string') {
    children = dateToLowerCase(children)
  }

  // Note: kinda hack for Trans component to not pass a number as a child
  if (typeof children === 'number') {
    children = String(children)
  }

  return (
    <Trans i18nKey={i18nKey} ns="common">
      {children}
    </Trans>
  )
}

export const SliderRangeFromToLabel = withTranslation()(SliderRangeFromToLabelComponent)
