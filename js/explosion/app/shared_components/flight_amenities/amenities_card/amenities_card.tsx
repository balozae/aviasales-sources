import * as React from 'react'
import clssnms from 'clssnms'
import ErrorBoundary from 'shared_components/error_boundary/error_boundary'
import './amenities_card.scss'

const cn = clssnms('amenities-card')

interface Props {
  title: string
  children: React.ReactNode
}

export const AmenitiesCard: React.SFC<Props> = (props) => {
  const { title, children } = props

  return (
    <ErrorBoundary>
      <div className={cn()}>
        <div className={cn('inner')}>
          <div className={cn('header')}>
            <h3 className={cn('title')}>{title}</h3>
          </div>
          <div className={cn('body')}>{children}</div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AmenitiesCard
