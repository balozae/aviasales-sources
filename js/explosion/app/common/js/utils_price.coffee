{DEFAULT_CURRENCY, CURRENCIES_SIGNS} = require('common/utils/currencies')

$thinsp = '\u2009'
$zwsp = '\u200B'

priceInCurrency = ({price, priceInRub, currency, toCurrency, currencies}) ->
  _priceInCurrency = if toCurrency is DEFAULT_CURRENCY
    priceInRub
  else if price and currency is toCurrency
    price
  else
    priceInRub / currencies[toCurrency]
  Math.round(_priceInCurrency)

formatCurrency = (amount, options = {}) ->
  {exponent = 0, thousandsSeparator = ' ', decimalMark = '.'} = options
  value = parseFloat(amount).toFixed(exponent).replace('.', decimalMark)
  sep = if thousandsSeparator is ' '
    $thinsp
  else
    thousandsSeparator + $zwsp
  value.replace(/\B(?=(\d{3})+(?!\d))/g, sep)

priceInRubToCurrency = (price, toCurrency, currencies) ->
  priceInCurrency({price, priceInRub: price, currency: DEFAULT_CURRENCY, toCurrency, currencies})

formatPriceWithSign = (price, toCurrency, currencies) ->
  price = priceInCurrency({price, priceInRub: price, currency: DEFAULT_CURRENCY, toCurrency, currencies})
  if CURRENCIES_SIGNS.before[toCurrency]
    "#{CURRENCIES_SIGNS.before[toCurrency]}#{formatCurrency(price)}"
  else
    "#{formatCurrency(price)}#{CURRENCIES_SIGNS.after[toCurrency]}"
    
priceWithSign = (price, toCurrency) ->
  if CURRENCIES_SIGNS.before[toCurrency]
    "#{CURRENCIES_SIGNS.before[toCurrency]}#{formatCurrency(price)}"
  else
    "#{formatCurrency(price)}#{CURRENCIES_SIGNS.after[toCurrency]}"
    
module.exports =
  priceInCurrency: priceInCurrency
  formatCurrency: formatCurrency
  formatPriceWithSign: formatPriceWithSign
  priceInRubToCurrency: priceInRubToCurrency
  priceWithSign: priceWithSign
