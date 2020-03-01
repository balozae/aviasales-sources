import React from 'react'
import { useSelector } from 'react-redux'
import { format } from 'finity-js'
import { AppState } from 'common/js/redux/types/root/explosion'
import { CurrenciesState } from 'common/js/redux/types/currencies.types'
import { CalendarPricesState } from 'common/js/redux/types/calendar_prices.types'
import { getCurrency, getCurrencies } from 'common/js/redux/selectors/currencies.selectors'
import { getCalendarPrices } from 'common/js/redux/selectors/calendar_prices.selectors'
import TripDatesPrice from 'shared_components/trip_duration/trip_dates_price/trip_dates_price'
// @ts-ignore
import { priceInRubToCurrency } from 'utils_price'

interface MonthPriceContainerProps {
  month: Date
}

const MonthPriceContainer: React.FC<MonthPriceContainerProps> = ({ month }) => {
  const currencies = useSelector<AppState, CurrenciesState>(getCurrencies)
  const currency = useSelector<AppState, string>(getCurrency)
  const { year } = useSelector<AppState, CalendarPricesState>(getCalendarPrices)
  const formattedMonth = `${format(month, 'YYYY-MM')}-01`

  const price = priceInRubToCurrency(year[formattedMonth], currency, currencies)

  return price ? <TripDatesPrice currency={currency} value={price} isLow={true} /> : null
}

export default MonthPriceContainer
