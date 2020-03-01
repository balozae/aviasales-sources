import React, { memo } from 'react'
import clssnms from 'clssnms'
import Price from 'shared_components/price/price'
import ShortPriceView from 'shared_components/price/short_price_view'

import './trip_dates_price.scss'

const cn = clssnms('trip_dates_price')

interface TripDatesPriceProps {
  value: number
  currency: string
  isLow?: boolean
  isShort?: boolean
}

const TripDatesPrice: React.FC<TripDatesPriceProps> = ({ value, currency, isLow, isShort }) => {
  const priceProps = { value, currency }
  return (
    <div className={cn(null, { '--low': !!isLow })}>
      {isShort ? <ShortPriceView {...priceProps} /> : <Price {...priceProps} />}
    </div>
  )
}

export default memo(TripDatesPrice)
