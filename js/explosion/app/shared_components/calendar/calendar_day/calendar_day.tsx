import React from 'react'
import clssnms from 'clssnms'

import './calendar_day.scss'

const cn = clssnms('calendar-day')

interface ICalendarDayProps {
  day: string | number
  children?: React.ReactNode
  selected?: boolean
  disabled?: boolean
  estimated?: boolean
  bounded?: boolean
  testId?: string
}

const CalendarDay: React.FC<ICalendarDayProps> = ({
  day,
  selected = false,
  disabled = false,
  estimated = false,
  bounded = false,
  testId,
  children,
}) => {
  return (
    <div
      className={cn(null, {
        '--selected': selected,
        '--disabled': disabled,
        '--estimated': estimated,
        '--bounded': bounded,
      })}
      data-testid={testId}
    >
      <div className={cn('date')}>{day}</div>
      {children && <div className={cn('content')}>{children}</div>}
    </div>
  )
}

export default CalendarDay
