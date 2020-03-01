import React, { FC } from 'react'
import { connect } from 'react-redux'
import ShortPriceView from 'shared_components/price/short_price_view'
const { priceInRubToCurrency } = require('utils_price')

interface StoreProps {
  currency: string
  currencies: { [curr: string]: number }
}

interface OwnProps {
  valueInRubles: number
}

type ShortPriceProps = StoreProps & OwnProps

const ShortPrice: FC<ShortPriceProps> = ({ valueInRubles, currency, currencies }) => {
  const price = priceInRubToCurrency(valueInRubles, currency, currencies)

  return <ShortPriceView value={price} currency={currency} />
}

function mapStateToProps({ currency, currencies = {} }: any): StoreProps {
  return {
    currency,
    currencies,
  }
}

export default connect(mapStateToProps)(ShortPrice)
