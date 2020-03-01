import React, { useContext, useMemo } from 'react'
import clssnms from 'clssnms'
import AirlinesContext from '../ticket_context/airlines_context/airlines_context'
import Tooltip from 'shared_components/tooltip'
import TicketIcon from '../ticket_icon/ticket_icon'
import { IconColors } from '../ticket_icon/ticket_icon.types'
import { TicketCarrierIconTypes } from './ticket_carrier.types'
import { getCarrierName } from '../utils/ticket_carrier.utils'

import './ticket_carrier.scss'

const cn = clssnms('ticket-carrier')

const LOGO_SIZE = {
  square: { width: 36, height: 36 },
  rectangular: { width: 99, height: 36 },
}
const SQUARE_LOGO_PATH = '/al_square'
const NIGHT_SQUARE_LOGO_PATH = '/night_square'
const NIGHT_LOGO_PATH = '/night'

export interface TicketCarrierProps {
  carrier: string | TicketCarrierIconTypes
  isSmall?: boolean
  isNightMode?: boolean
  type?: 'logo' | 'icon'
  modifiers?: string[]
  width?: number
  height?: number
  withTooltip?: boolean
}

const arrModifiersToObj = (ar: string[]): { [key: string]: true } =>
  ar.reduce((acc, val) => ({ ...acc, [val]: true }), {})

const TicketCarrier: React.FunctionComponent<TicketCarrierProps> = ({
  carrier,
  isSmall = false,
  isNightMode = false,
  type = 'logo',
  modifiers = [],
  width = isSmall ? LOGO_SIZE.square.width : LOGO_SIZE.rectangular.width,
  height = isSmall ? LOGO_SIZE.square.height : LOGO_SIZE.rectangular.height,
  withTooltip = true,
}) => {
  const Airlines = useContext(AirlinesContext)
  const carrierIata = carrier
  const carrierName = getCarrierName(carrierIata, Airlines.getName)

  const tooltip = useMemo(() => () => <div className={cn('tooltip')}>{carrierName}</div>, [
    carrierName,
  ])

  if (type === 'icon') {
    return (
      <div className={cn('', [...modifiers, `--${type}`])}>
        <TicketIcon
          className={cn('icon')}
          type={carrier as TicketCarrierIconTypes}
          color={IconColors.Grey}
        />
      </div>
    )
  }

  let srcPath = isSmall ? SQUARE_LOGO_PATH : ''
  if (isNightMode) {
    srcPath = isSmall ? NIGHT_SQUARE_LOGO_PATH : NIGHT_LOGO_PATH
  }
  const tooltipVisibilityProps = withTooltip
    ? {}
    : {
        showByProps: true,
        isVisible: false,
      }

  return (
    <Tooltip
      wrapperClassName={cn(null, { ...arrModifiersToObj(modifiers), '--rounded': isSmall })}
      position={'top'}
      tooltip={tooltip}
      showDelay={100}
      {...tooltipVisibilityProps}
    >
      <img
        className={cn('img')}
        {...(isSmall // NOTE: квадратные лого сильно зашакалены ресайзером, поэтому показываем всегда @2x
          ? {
              src: `//pics.avs.io${srcPath}/${width}/${height}/${carrierIata}@2x.png`,
            }
          : {
              src: `//pics.avs.io${srcPath}/${width}/${height}/${carrierIata}.png`,
              srcSet: `//pics.avs.io${srcPath}/${width}/${height}/${carrierIata}@2x.png 2x`,
            })}
        width={width}
        height={height}
        alt={carrierName}
      />
    </Tooltip>
  )
}

export default React.memo(TicketCarrier)
