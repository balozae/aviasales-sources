import React, { useMemo, memo, useCallback } from 'react'
import clssnms from 'clssnms'
import { PinState, PinSize } from './pin.types'
import Tooltip from 'shared_components/tooltip'

import './pin.scss'

const PinIcon = require('!!react-svg-loader!./images/pin.svg')
const cn = clssnms('pin')

export interface PinProps {
  state: PinState
  size: PinSize
  tooltip: string
  onClick: (e: React.MouseEvent) => void
}

const Pin: React.FC<PinProps> = memo(({ tooltip, size, state, onClick }) => {
  const tooltipElement = useMemo(() => () => <span className={cn('tooltip')}>{tooltip}</span>, [
    tooltip,
  ])
  const handleClick = useCallback((event: React.MouseEvent) => onClick(event), [onClick])

  return (
    <Tooltip
      wrapperClassName={cn(null, [`--${size}`, `--${state}`])}
      wrapperProps={{
        title: tooltip,
        onClick: handleClick,
        role: 'pin',
      }}
      tooltip={tooltipElement}
    >
      <PinIcon className={cn('icon')} />
    </Tooltip>
  )
})

export default Pin
