import React from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { Modifiers } from 'react-day-picker'
import { MonthPrice } from 'common/js/redux/types/calendar_prices.types'
import { AppState } from 'common/js/redux/types/root/explosion'
import { CurrenciesState } from 'common/js/redux/types/currencies.types'
import { getDayPrice } from 'common/js/redux/selectors/calendar_prices.selectors'
import { getCurrencies, getCurrency } from 'common/js/redux/selectors/currencies.selectors'
import { TripDurationInput } from 'shared_components/trip_duration/trip_duration.types'
import CalendarDayWithPrice from 'shared_components/calendar/calendar_day/calendar_day_with_price'

interface CalendarDayWithPriceContainerProps {
  date: Date
  modifiers: Modifiers
  activeInput: TripDurationInput
}

const CalendarDayWithPriceContainer: React.FC<CalendarDayWithPriceContainerProps> = (props) => {
  const currencies = useSelector<AppState, CurrenciesState>(getCurrencies)
  const currency = useSelector<AppState, string>(getCurrency)
  const priceItem = useSelector<AppState, MonthPrice>(
    (state) => getDayPrice(state, props),
    shallowEqual,
  )

  return (
    <CalendarDayWithPrice
      date={props.date}
      modifiers={props.modifiers}
      priceItem={priceItem}
      currencies={currencies}
      currency={currency}
    />
  )
}

export default CalendarDayWithPriceContainer
