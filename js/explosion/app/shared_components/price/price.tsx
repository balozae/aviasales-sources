import React, { memo } from 'react'
import clssnms from 'clssnms'
const { formatCurrency } = require('utils_price')
const { getCurrenciesList } = require('common/utils/currencies')

import './price.scss'

const cn = clssnms('price')

export type PriceProps = {
  value: number | string
  currency: string
  formatCurrencyFn?: Function
  className?: string
}

const Price: React.FC<PriceProps & React.HTMLAttributes<HTMLSpanElement>> = ({
  value,
  currency,
  formatCurrencyFn,
  className = '',
  ...other
}) => {
  const price = formatCurrencyFn
    ? formatCurrencyFn(value)
    : formatCurrency(value, { exponent: 0, thousandsSeparator: ' ', decimalMark: '.' })

  return (
    <span className={cn(null, [`--${currency}`, className])} {...other}>
      {price}
      {!getCurrenciesList()[currency] && (
        <span className={cn('code')}> {currency.toUpperCase()}</span>
      )}
    </span>
  )
}

export default memo(Price)
