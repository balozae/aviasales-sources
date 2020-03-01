export const MINIMUM_PRICE_DELTA = 10

export const getPriceClassName = (
  isSearchFinished: boolean,
  expectedPrice: number | undefined,
  ticketPrice: number | undefined,
  isNotFound: boolean,
): string => {
  if (!isSearchFinished) {
    return ''
  }

  if (isNotFound) {
    return ''
  }

  // NOTE: in the case when we don't receive a ticket price,
  // we show the user that the ticket has been successfully found
  // and don't focus on the price
  // (color will be changed to blue)
  if (!(ticketPrice && expectedPrice)) {
    return '--price-unknown'
  }

  const priceDelta = expectedPrice - ticketPrice

  switch (false) {
    case !(-MINIMUM_PRICE_DELTA < priceDelta && priceDelta < MINIMUM_PRICE_DELTA):
      return '--price-equal'
    case priceDelta < 0:
      return '--price-cheaper'
    case priceDelta > 0:
      return '--price-expensive'
    default:
      return ''
  }
}
