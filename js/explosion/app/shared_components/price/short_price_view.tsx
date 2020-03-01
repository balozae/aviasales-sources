import React, { FC, useCallback, memo } from 'react'
import i18next from 'i18next'
import Price from './price'
import classnames from 'classnames'

const { formatCurrency } = require('utils_price')

interface ShortPriceViewProps {
  value: number
  currency: string
  className?: string
  showCurrency?: boolean
}

function getShortPrice(price: number): string {
  if (price >= 1e9) {
    return i18next.t('common:billionsShort', { value: Math.round(price / 1e8) / 10 }) + ' '
  } else if (price >= 1e6) {
    return i18next.t('common:millionsShort', { value: Math.round(price / 1e5) / 10 }) + ' '
  } else {
    return formatCurrency(price)
  }
}

const ShortPriceView: FC<ShortPriceViewProps> = ({ value, currency, className, showCurrency }) => {
  const formatFn = useCallback((val) => val, [])
  const shortPrice = getShortPrice(value)

  return (
    <Price
      className={classnames([!showCurrency && '--short', className])}
      value={shortPrice}
      currency={currency}
      formatCurrencyFn={formatFn}
    />
  )
}

export default memo(ShortPriceView)
