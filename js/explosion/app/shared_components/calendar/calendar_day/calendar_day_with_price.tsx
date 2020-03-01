import React from 'react'
import clssnms from 'clssnms'
import { Modifiers } from 'react-day-picker'
import { format } from 'finity-js'
import { isMobile } from 'shared_components/resizer'
import Tooltip from 'shared_components/tooltip/tooltip'
import CalendarDay from 'shared_components/calendar/calendar_day/calendar_day'
import { MonthPrice } from 'common/js/redux/types/calendar_prices.types'
import TripDatesPrice from 'shared_components/trip_duration/trip_dates_price/trip_dates_price'
// @ts-ignore
import { priceInRubToCurrency } from 'utils_price'

import './calendar_day_with_price.scss'

const classNames = clssnms('calendar-day-with-price')

interface CalendarDayWithPriceProps {
  date: Date
  modifiers: Modifiers
  priceItem?: MonthPrice
  currencies: { [key in string]: number }
  currency: string
}

const CalendarDayWithPrice: React.FC<CalendarDayWithPriceProps> = ({
  date,
  modifiers,
  priceItem,
  currencies,
  currency,
}) => {
  let price

  if (priceItem) {
    price = priceInRubToCurrency(priceItem.price, currency, currencies)
  }

  const calendarDayContent = (
    <CalendarDay day={date.getDate()} {...modifiers}>
      {priceItem ? (
        <TripDatesPrice value={price} currency={currency} isLow={priceItem.isMin} isShort={true} />
      ) : (
        <span className="calendar-day__empty-child" />
      )}
    </CalendarDay>
  )

  return isMobile() || !priceItem ? (
    calendarDayContent
  ) : (
    <Tooltip
      position="bottom"
      tooltip={() => (
        <div className={classNames('day-tooltip')}>
          <div className={classNames('day-tooltip-price')}>
            <TripDatesPrice value={price} currency={currency} />
          </div>
          <div className={classNames('day-tooltip-date')}>
            <span>{format(priceItem!.departDate, 'D MMM')}</span>
            {priceItem!.returnDate && ` — ${format(priceItem!.returnDate, 'D MMM')}`}
          </div>
        </div>
      )}
      showDelay={100}
    >
      {calendarDayContent}
    </Tooltip>
  )
}

export default React.memo(CalendarDayWithPrice)
