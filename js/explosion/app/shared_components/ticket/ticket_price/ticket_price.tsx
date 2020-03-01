import React, { useContext, memo } from 'react'
import TicketCurrencyContext from '../ticket_context/ticket_currency_context/ticket_currency_context'
import PriceWithLogic, {
  PriceWithLogicConditionalProps,
  PriceWithLogicBasicProps,
} from 'shared_components/price/price_with_logic'

export type TicketPriceProps = Omit<PriceWithLogicBasicProps, 'currency' | 'currencies'> &
  PriceWithLogicConditionalProps

const TicketPrice: React.FC<TicketPriceProps> = (props) => {
  const { currency, currencies } = useContext(TicketCurrencyContext)

  return <PriceWithLogic {...props} currency={currency} currencies={currencies} />
}

export default memo(TicketPrice)
