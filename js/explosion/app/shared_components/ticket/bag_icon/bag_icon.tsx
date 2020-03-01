import React, { memo } from 'react'
import clssnms from 'clssnms'
import { UNKNOWN, BagType } from 'shared_components/types/tariffs'

import './bag_icon.scss'

const cn = clssnms('bag-icon')

const BaggageIcon = require('!!react-svg-loader!./images/baggage_icon.svg')
const HandbagsIcon = require('!!react-svg-loader!./images/handbags_icon.svg')

interface BagIconProps {
  type: BagType
  weight?: number | string
  amount: number
  dimensions?: string
}

const BagIcon: React.SFC<BagIconProps> = memo((props: BagIconProps) => {
  const isUnknown: boolean = props.weight === UNKNOWN && props.amount === 0

  const iconProps = {
    className: cn('', {
      [`--${props.type}`]: true,
      '--unknown': isUnknown,
      '--without-baggage': props.amount === 0 && !isUnknown,
      '--with-dimensions':
        !!props.dimensions && (typeof props.weight !== 'number' || props.weight === 0),
      '--more-than-one': props.amount >= 1,
    }),
    ['data-weight']: getWeightLabel(props),
  }

  return props.type === BagType.Baggage ? (
    <BaggageIcon {...iconProps} />
  ) : (
    <HandbagsIcon {...iconProps} />
  )
})

const getWeightLabel = (props: BagIconProps) => {
  if (parseInt(props.weight as string, 10) > 0 && props.dimensions) {
    return props.weight
  }

  if (props.dimensions) {
    return ''
  }

  if (props.weight === UNKNOWN && props.amount) {
    return 'x' + props.amount
  }

  if (props.weight === UNKNOWN) {
    return '?'
  }

  if (parseInt(props.weight as string, 10)) {
    return props.weight
  }

  return null
}

export default BagIcon
