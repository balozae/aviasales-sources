import React from 'react'
import ReactDOM from 'react-dom'
import Price from 'shared_components/price/price'

const updateCurrencyElements = (store) => {
  const { currentPage, currencies, currency } = store.getState()
  if (currentPage === 'main') {
    const currencyElems = document.querySelectorAll('.currency-element')

    Array.from(currencyElems).forEach((elem) => {
      const valueInRubles = elem.getAttribute('data-value')
      if (valueInRubles) {
        ReactDOM.render(
          <Price currency={currency} value={Number(valueInRubles) / currencies[currency]} />,
          elem,
        )
      }
    })
  }
}

export const updateCurrencyElementsMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'UPDATE_CURRENCIES':
      next(action)
      updateCurrencyElements(store)
      break
    case 'UPDATE_CURRENCY':
      next(action)
      updateCurrencyElements(store)
      break
    default:
      return next(action)
  }
}
