import React, { useCallback } from 'react'
import clssnms from 'clssnms'
import { getDatesMonthRange, format, parse, addMonths } from 'finity-js'
import { useTranslation } from 'react-i18next'
import { getArrayOfTranslationsByKey } from 'finity_facade'
import SelectArrowsIcon from '!!react-svg-loader!./images/icon-select-arrows.svg'

import './calendar_caption.scss'

const cn = clssnms('calendar-caption')

export interface CalendarCaptionProps {
  captionIndex: number
  numberOfMonths: number
  date: Date
  minDate: Date
  maxDate: Date
  onMonthChange: (date: Date) => void
}

const CalendarCaption: React.FC<CalendarCaptionProps> = ({
  captionIndex,
  numberOfMonths,
  date,
  minDate,
  maxDate,
  onMonthChange,
}) => {
  useTranslation()
  const monthsTranslations = getArrayOfTranslationsByKey('months') as any

  // NOTE: if numberOfMonths prop of DayPicker > 0 we have
  // to calculate correct state for each month's caption
  let minDateForIndex = addMonths(minDate, captionIndex)
  let maxDateForIndex = addMonths(maxDate, 1 - numberOfMonths + captionIndex)
  const months = getDatesMonthRange(minDateForIndex, maxDateForIndex)

  const handleMonthChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const currentMonth = parse(event.target.value, 'YYYY-MM')
      // NOTE: we have to subtract "captionIndex" from "currentMonth" number
      // because parent component saves only first month value in it's state
      onMonthChange(addMonths(currentMonth, -captionIndex))
    },
    [onMonthChange, captionIndex],
  )

  return (
    <div className={cn()}>
      <div className={cn('wrap')}>
        <p className={cn('text')}>
          {`${monthsTranslations[date.getMonth()]} ${date.getFullYear()}`} <SelectArrowsIcon />
        </p>
        <select
          className={cn('select')}
          value={format(date, 'YYYY-MM')}
          onChange={handleMonthChange}
        >
          {months.map((month, i) => {
            const monthValue = format(month, 'YYYY-MM')
            const monthText = monthsTranslations[month.getMonth()]

            return (
              <React.Fragment key={monthValue}>
                {(i === 0 || month.getFullYear() !== months[i - 1].getFullYear()) && (
                  <option disabled={true}>{month.getFullYear()}</option>
                )}
                <option value={monthValue}>{monthText}</option>
              </React.Fragment>
            )
          })}
        </select>
      </div>
    </div>
  )
}

export default CalendarCaption
