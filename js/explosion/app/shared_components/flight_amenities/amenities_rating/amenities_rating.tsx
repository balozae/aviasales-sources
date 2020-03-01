import * as React from 'react'
import clssnms from 'clssnms'
import { useTranslation, Trans } from 'react-i18next'
import { AmenitiesRating } from './amenities_rating.types'
import './amenities_rating.scss'

const cn = clssnms('amenities-rating')

interface Props {
  rating: number
}

export default function(props: Props): React.ReactElement<Props> {
  useTranslation('amenities')
  let ratingType: AmenitiesRating = AmenitiesRating.Awful

  if (props.rating > 8) {
    ratingType = AmenitiesRating.Excellent
  } else if (props.rating > 6) {
    ratingType = AmenitiesRating.Good
  } else if (props.rating > 4) {
    ratingType = AmenitiesRating.Normal
  } else if (props.rating > 2) {
    ratingType = AmenitiesRating.Bad
  }

  return (
    <div className={cn()}>
      <div className={cn('icon', `--${ratingType}`)} />
      <span className={cn('text')}>
        <Trans
          ns="amenities"
          i18nKey="rating"
          values={{ rating: props.rating }}
          components={[
            <span key="ratingLabel" className={cn('label')} />,
            <span key="ratingValue" className={cn('value')} />,
          ]}
        />
      </span>
    </div>
  )
}
