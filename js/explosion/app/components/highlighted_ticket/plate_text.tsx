import React, { memo, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Price from 'react_components/price/price.coffee'
import { MINIMUM_PRICE_DELTA } from './highlighted_ticket.utils'

interface HighlightedTicketPlateTextProps {
  expectedPrice?: number
  ticketPrice?: number
  isSearchFinished: boolean
  isNotFound: boolean
}

const HighlightedTicketPlateText: React.FC<HighlightedTicketPlateTextProps> = (props) => {
  const { ticketPrice, expectedPrice, isSearchFinished, isNotFound } = props
  const { t } = useTranslation('highlighted_ticket')

  const getContent = useMemo(
    () => {
      if (!isSearchFinished) {
        return <>{t('highlighted_ticket:loading')}</>
      }

      if (ticketPrice && isSearchFinished && expectedPrice) {
        const priceDelta = expectedPrice - ticketPrice
        if (-MINIMUM_PRICE_DELTA < priceDelta && priceDelta < MINIMUM_PRICE_DELTA) {
          return <>{t('highlighted_ticket:priceNotChanged')}</>
        } else if (priceDelta < 0) {
          return (
            <Trans
              ns="highlighted_ticket"
              i18nKey="priceChangedUp"
              components={[<Price key="priceUp" valueInRubles={Math.abs(priceDelta)} />]}
            />
          )
        } else {
          return (
            <Trans
              ns="highlighted_ticket"
              i18nKey="priceChangedDown"
              components={[<Price key="priceDown" valueInRubles={Math.abs(priceDelta)} />]}
            />
          )
        }
      } else if (isNotFound) {
        return (
          <Trans
            ns="highlighted_ticket"
            i18nKey="ticketsBoughtUp"
            components={[
              expectedPrice ? (
                <Price key="priceBoughtUp" valueInRubles={Math.abs(expectedPrice)} />
              ) : (
                <></>
              ),
            ]}
          />
        )
      }

      return <>{t('highlighted_ticket:yourTicket')}</>
    },
    [ticketPrice, expectedPrice, isSearchFinished, isNotFound],
  )

  return <span data-testid="hightlighted-ticket-plate-text">{getContent}</span>
}

export default memo(HighlightedTicketPlateText)
