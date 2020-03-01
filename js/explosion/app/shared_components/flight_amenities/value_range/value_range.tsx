import * as React from 'react'
import clssnms from 'clssnms'
import PointIcon from '!!react-svg-loader!./point_icon.svg'
import './value_range.scss'

const cn = clssnms('value-range')

interface Props {
  range: number[]
  value: number
}

const ValueRange: React.SFC<Props> = (props) => {
  const { range, value } = props

  const rangeValue = (() => {
    if (value > range[3]) {
      return range[3]
    }

    if (value < range[0]) {
      return range[0]
    }

    return value
  })()

  const pointLeft = ((rangeValue - range[0]) / (range[3] - range[0])) * 100 - 5

  return (
    <div className={cn()}>
      <div className={cn('label')}>
        <span>{range[1]}</span>
        <span>{range[2]}</span>
      </div>
      <div className={cn('range')} />
      <PointIcon className={cn('point')} style={{ left: `${pointLeft}px` }} />
    </div>
  )
}

export default ValueRange
