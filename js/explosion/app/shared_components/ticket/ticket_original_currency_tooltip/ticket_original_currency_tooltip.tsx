import React, { memo, useContext } from 'react'
import TicketPrice from '../ticket_price/ticket_price'
import TicketCurrencyContext, {
  Currency,
} from '../ticket_context/ticket_currency_context/ticket_currency_context'
import Tooltip from 'shared_components/tooltip'

export interface TicketOriginalCurrencyTooltipProps {
  className: string
  originalCurrency?: Currency
  price?: number
  children?: React.ReactNode
}

const TicketOriginalCurrencyTooltip: React.FC<TicketOriginalCurrencyTooltipProps> = ({
  className,
  originalCurrency,
  price = 0,
  children,
}) => {
  const { currency } = useContext(TicketCurrencyContext)
  return (
    <Tooltip
      position="right"
      tooltip={() => {
        if (!originalCurrency || originalCurrency.toLowerCase() === currency.toLowerCase()) {
          return null
        }
        return (
          <div className={className} data-testid="original-currency-tooltip">
            <TicketPrice originalValue={Math.round(price)} originalCurrency={originalCurrency} />
          </div>
        )
      }}
      showDelay={1000}
    >
      {children}
    </Tooltip>
  )
}

export default memo(TicketOriginalCurrencyTooltip)
