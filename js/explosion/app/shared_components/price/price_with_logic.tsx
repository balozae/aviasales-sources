import React, { memo } from 'react'
import Price, { PriceProps } from './price'

export type PriceWithLogicConditionalProps =
  | {
      valueInRubles: number
      originalValue?: number
      originalCurrency?: string
    }
  | {
      valueInRubles?: number
      originalValue: number
      originalCurrency: string
    }

export type PriceWithLogicBasicProps = {
  currency: string
  currencies: { [key in string]: number }
} & Omit<PriceProps, 'value' | 'currency'>

export const PriceWithLogic: React.FC<
  PriceWithLogicBasicProps & PriceWithLogicConditionalProps
> = ({ currency, currencies, valueInRubles, originalValue, originalCurrency, ...otherProps }) => {
  let value = 0
  let priceCurrency = currency
  let currencyRate = currencies && currencies[priceCurrency] ? 1 / currencies[priceCurrency] : 1

  // NOTE: В компоненты может быть два типа поведения:

  // 1. Нужно отобразить цену в валюте, которая текущая в контексте `currency` (выбрана юзером).
  // В этом кейсе в пропсах обязательны `valueInRubles`
  // и опционально могут быть `originalValue` и `originalCurrency`
  // Тут есть два подкейса:

  // 1.1 Если передана валюта `originalCurrency` совпадает c текущей выбраной валютой `currency`
  // то рендерим `originalValue` с `originalCurrency`
  // https://aviasales.atlassian.net/browse/HEL-918
  // см. тест: "should render TicketPrice component with original price if original currency is equals to user currency"

  // 1.2 Если валюты не совпадают -
  // считаем цену исходя из цены `valueInRubles` и текущей выбраной валюты `currency`,
  // рендерим полученое значения с `currency`
  // см. тест "should render TicketPrice component" и "should render TicketPrice component with usd currency"

  // 2. Нужно отобразить цену в оригинальной валюте.
  // В этом кейсе в пропсах обязательны `originalValue` и `originalCurrency`
  // и не должно быть `valueInRubles`
  // рендерим `originalValue` c `originalCurrency`

  // ??? см. тест: "should render price with user currency even if prop.originalCurrency exists"

  if (valueInRubles) {
    if (currency === originalCurrency && originalValue) {
      value = originalValue
    } else {
      value = valueInRubles! * currencyRate
    }
  } else {
    value = originalValue!
    priceCurrency = originalCurrency!
  }

  return !!value ? (
    <Price
      value={value}
      currency={priceCurrency}
      formatCurrencyFn={otherProps.formatCurrencyFn}
      className={otherProps.className}
      data-testid="price-with-logic"
    />
  ) : null
}

export default memo(PriceWithLogic)
