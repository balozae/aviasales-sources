import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { getTariffTitleType } from '../ticket_tariffs.utils'
import { TariffTitleType } from '../ticket_tariffs.types'
import TicketPrice from '../../ticket_price/ticket_price'
import { TariffType, Bags } from 'shared_components/types/tariffs'

const TariffTitle = ({
  tariffType,
  worstBags,
  priceDifference,
}: {
  tariffType: TariffType
  worstBags: Bags
  priceDifference: number
}): React.ReactElement<HTMLDivElement> | null => {
  const titleType = getTariffTitleType(tariffType, worstBags, priceDifference)
  const { t } = useTranslation('ticket')

  switch (titleType) {
    // NOTE: translation is unnecessary for symbols
    case TariffTitleType.PriceIncrease:
      return priceDifference ? (
        <>
          + <TicketPrice valueInRubles={Math.abs(priceDifference)} />
        </>
      ) : null
    case TariffTitleType.PriceDecrease:
      // NOTE: NoDiff translation return title "has baggage"
      return <>{t(`ticket:tariffs.${TariffTitleType.NoDiff}`)}</>
    default:
      return (
        <>
          {t(`ticket:tariffs.${titleType}`) ||
            t(`ticket:tariffs.${TariffTitleType.UnknownAll}`) ||
            ''}
        </>
      )
  }
}

export default memo(TariffTitle)
