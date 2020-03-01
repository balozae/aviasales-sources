import * as React from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import AmenitiesCard from '../amenities_card/amenities_card'
import { Map } from '../flight_amenities.types'
import { SeatSize } from './seats_layout.types'
import AirplaneImg from '!!react-svg-loader!./images/airplane.svg'
import './seats_layout.scss'

interface Props {
  layout: string
}

const cn = clssnms('seats-layout')

export default function SeatsLayout(props: Props): React.ReactElement<Props> {
  const { t } = useTranslation('amenities')

  let layout: number[] = props.layout.split('_').map((str) => parseInt(str, 10))
  let seatsCount: number = layout.reduce(summ, 0)
  let seatSize: SeatSize = SeatSize.Small

  function renderRow(i: number): React.ReactElement<{}> {
    const key = `layout_${props.layout}_row_${i}`

    return (
      <div key={`layout_${props.layout}_row_${i}`} className={cn('row')}>
        {layout.map(renderSeats.bind(null, key))}
      </div>
    )
  }

  function renderSeats(key: string, seatCount: number, i: number): React.ReactElement<{}> {
    key += `_group_${i}_size_${seatCount}`

    return (
      <div key={key} className={cn('group')}>
        {makeRange(seatCount).map(renderSeat.bind(this, key))}
      </div>
    )
  }

  function renderSeat(key: string, i: number): React.ReactElement<{}> {
    key += `_seat_${i}`

    return <div key={key} className={cn('seat', `--${seatSize}`)} />
  }

  let cardTitle = t('amenities:planeScheme')

  const rows: Map<number> = {
    small: 5,
    medium: 4,
    large: 3,
  }

  if (seatsCount <= 4) {
    seatSize = SeatSize.Large
  } else if (seatsCount <= 6) {
    seatSize = SeatSize.Medium
  }

  if (layout.length < 2) {
    layout = []
    cardTitle = t('amenities:planeSchemeAdsent')
  }

  return (
    <AmenitiesCard title={cardTitle}>
      <div className={cn('list')}>
        {makeRange(rows[seatSize]).map(renderRow)}
        <AirplaneImg className={cn('airplane')} />
      </div>
    </AmenitiesCard>
  )
}

function summ(a: number, b: number): number {
  return a + b
}

function makeRange(size: number): number[] {
  let result: number[] = []

  for (let i: number = 0; i < size; i++) {
    result.push(i)
  }

  return result
}
