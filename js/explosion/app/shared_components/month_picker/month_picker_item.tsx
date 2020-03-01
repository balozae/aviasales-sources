import React, { memo, useCallback, useMemo } from 'react'
import clssnms from 'clssnms'
import { MonthCell } from './month_picker.types'
import { MonthPickerProps } from './month_picker'
import { keyToTuple } from './month_picker.utils'
import { useTranslation } from 'react-i18next'

const cn = clssnms('month-picker')

interface MonthPickerItemProps extends MonthCell {
  onClick: MonthPickerProps['onSelect']
  getChild?: MonthPickerProps['getItemChild']
}

const MonthPickerItem = memo((props: MonthPickerItemProps) => {
  const { t } = useTranslation('common')

  const handleItemClick = useCallback(
    () => {
      if (props.onClick) {
        props.onClick(props.month, props.isSelected)
      }
    },
    [props.month, props.isSelected, props.onClick],
  )

  const child = useMemo(
    () => {
      if (props.getChild) {
        return props.getChild(props.month)
      }
    },
    [props.getChild, props.month],
  )

  const [year, month] = useMemo(() => keyToTuple(props.month), [props.month])

  const monthString = useMemo(
    () => {
      const months = t(`dateTime.months`, { returnObjects: true })
      return months[month - 1]
    },
    [t, month],
  )

  return (
    <div className={cn('item', { '--is-selected': props.isSelected })} onClick={handleItemClick}>
      <div className={cn('item-label')}>
        <div className={cn('item-year')}>{year}</div>
        <div className={cn('item-month')}>{monthString}</div>
        {child && (
          <div data-testid={`month-${props.month}-child`} className={cn('item-child')}>
            {child}
          </div>
        )}
      </div>
    </div>
  )
})

export default MonthPickerItem
