import React, { memo, useCallback } from 'react'
import clssnms from 'clssnms'
import { TariffType, NO_BAGS } from 'shared_components/types/tariffs'
import BagsInfo from './components/ticket_tariffs_bags_info'
import TariffTitle from './components/ticket_tariffs_title'
import { Proposals } from '../ticket.types'

import './ticket_tariffs.scss'

const cn = clssnms('ticket-tariffs')

export interface TicketTariffsProps {
  proposals: Proposals
  currentTariff: TariffType
  onTariffChange: (tariffType: TariffType) => void
  withDebug?: boolean
  withTooltip?: boolean
}

const TicketTariffs: React.SFC<TicketTariffsProps> = (props: TicketTariffsProps) => {
  const { currentTariff, withDebug, proposals, onTariffChange, withTooltip } = props
  const handleTariffClick = useCallback(
    (tariffType: TariffType) => (event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      if (tariffType !== currentTariff) {
        onTariffChange(tariffType)
      }
    },
    [currentTariff, onTariffChange],
  )

  return (
    <div className={cn()}>
      {[TariffType.OtherBaggage, TariffType.HasBaggage].map((tariffType) => {
        const tariff = proposals[tariffType]
        if (!tariff.length) {
          return null
        }
        const { worstBags } = tariff[0]
        const isEmpty = worstBags.baggage.code === NO_BAGS || worstBags.handbags.code === NO_BAGS
        return (
          <div
            key={tariffType}
            onClick={handleTariffClick(tariffType)}
            data-testid={`tariff-${tariffType}`}
            className={cn('item', {
              '--empty': tariffType === 'otherBaggage' && isEmpty,
              'is-selected': tariffType === currentTariff,
            })}
          >
            <BagsInfo
              bags={worstBags}
              tariffType={tariffType}
              withDebug={withDebug}
              withTooltip={withTooltip}
            />
            <div className={cn('title')}>
              <TariffTitle
                tariffType={tariffType}
                worstBags={worstBags}
                priceDifference={proposals.priceDifference}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

TicketTariffs.defaultProps = {
  withTooltip: true,
}

export default memo(TicketTariffs)
