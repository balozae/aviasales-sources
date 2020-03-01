import React, { memo } from 'react'
import ErrorInformer, { cn } from '../error_informer'
import Button from 'shared_components/button/button'
import { ButtonType, ButtonMod, ButtonSize } from 'shared_components/button/button.types'
import { ErrorInformerIconType } from '../error_informer.types'
import { TripClass } from 'common/types'
import { useTranslation } from 'react-i18next'

interface TripClassesInformerProps {
  tripClass: TripClass
  onChangeTripClass: (type: string) => any
}

const DATA = {
  title: {
    [TripClass.FirstClass]: 'first_class',
    [TripClass.PremiumEconomy]: 'premium_economy',
  },
  buttons: [
    { type: TripClass.Business, i18nKey: 'business_class' },
    { type: TripClass.Economy, i18nKey: 'economy_class' },
  ],
}

const TripClassesInformer: React.FC<TripClassesInformerProps> = (props) => {
  const { tripClass } = props

  const { t } = useTranslation('error_informer')

  const handleClick = (type: TripClass) => (e: React.MouseEvent) => {
    e.preventDefault()
    props.onChangeTripClass(type)
  }

  const title = t(`error_informer:trip_classes.title.${DATA.title[tripClass]}`)

  return (
    <ErrorInformer iconType={ErrorInformerIconType.Ticket}>
      <h2 dangerouslySetInnerHTML={{ __html: title }} />
      <p dangerouslySetInnerHTML={{ __html: t(`error_informer:trip_classes.description`) }} />
      <div className={cn('btn-container')}>
        {DATA.buttons.map(({ type, i18nKey }) => (
          <Button
            key={type}
            type={ButtonType.Button}
            mod={ButtonMod.SecondaryOutline}
            size={ButtonSize.L}
            className={cn('tripclass-btn')}
            onClick={handleClick(type)}
          >
            {t(`error_informer:trip_classes.button.${i18nKey}`)}
          </Button>
        ))}
      </div>
    </ErrorInformer>
  )
}

export default memo(TripClassesInformer)
