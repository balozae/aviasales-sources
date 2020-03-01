import React, { useContext } from 'react'
import clssnms from 'clssnms'
import Tooltip from 'shared_components/tooltip'
import TicketCarrier from './ticket_carrier'
import AirlinesContext from '../ticket_context/airlines_context/airlines_context'
import { getCarrierName } from '../utils/ticket_carrier.utils'

import './ticket_carrier_list.scss'

const cn = clssnms('ticket-carrier-list')

const MAX_LOGOS = 5

export interface TicketCarrierListProps {
  carriers: string[]
  isNightMode?: boolean
  maxLogos?: number
  modifiers?: string[]
  withTooltip?: boolean
}

const TicketCarrierList: React.FunctionComponent<TicketCarrierListProps> = ({
  carriers,
  isNightMode = false,
  maxLogos = MAX_LOGOS,
  modifiers,
  withTooltip = true,
}) => {
  const Airlines = useContext(AirlinesContext)

  if (!carriers || !carriers.length) {
    return null
  }
  const tooltipVisibilityProps = withTooltip
    ? {}
    : {
        showByProps: true,
        isVisible: false,
      }

  const carriersList = [...carriers]
  const showRounded: boolean = carriers.length > 1

  // NOTE: carriersList is updated here after splice
  const carriersRest: string[] =
    carriersList.length > maxLogos ? carriersList.splice(maxLogos - 1) : []
  const carriersRestNames: string = carriersRest
    .map((key) => getCarrierName(key, Airlines.getName))
    .join(', ')

  return (
    <ul className={cn()}>
      {carriersList.map((carrierKey, i) => (
        <li key={carrierKey + i} className={cn('item')}>
          <TicketCarrier
            carrier={carrierKey}
            isSmall={showRounded}
            isNightMode={isNightMode}
            modifiers={modifiers}
            withTooltip={withTooltip}
          />
        </li>
      ))}
      {carriersRestNames && (
        <li key="carriersMore" data-testid="carriersMore" className={cn('item')}>
          <Tooltip
            wrapperClassName={cn('more')}
            position={'top'}
            tooltip={() => <div className={cn('tooltip')}>{carriersRestNames}</div>}
            showDelay={100}
            {...tooltipVisibilityProps}
          >
            +{carriersRest.length}
          </Tooltip>
        </li>
      )}
    </ul>
  )
}

export default React.memo(TicketCarrierList)
