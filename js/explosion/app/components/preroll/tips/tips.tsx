import * as React from 'react'
import clssnms from 'clssnms'
import { useTranslation, Trans, TransProps } from 'react-i18next'
import './tips.scss'

const classNames = clssnms('preroll-tips')

export interface Tip {
  icon: string
  title: string | Partial<TransProps>
  details: string | Partial<TransProps>
}

export interface TipVariants {
  assisted: Tip
  train: Tip
  hotel: Tip
  // favorites: Tip
}

export type TipKey = keyof TipVariants

export interface Props {
  tipKey: TipKey
}

export const TIP_VARIANTS: TipVariants = {
  assisted: {
    icon: require('./images/icon_assisted.svg'),
    title: {
      i18nKey: 'preroll:tips.assisted.title',
    },
    details: {
      i18nKey: 'preroll:tips.assisted.details',
      components: [
        // tslint:disable-next-line: jsx-wrap-multiline
        <i key="assisted-tip-icon" className={classNames('lightning-icon')} />,
      ],
    },
  },
  train: {
    icon: require('./images/icon_train.svg'),
    title: 'preroll:tips.train.title',
    details: 'preroll:tips.train.details',
  },
  hotel: {
    icon: require('./images/icon_hotel.svg'),
    title: 'preroll:tips.hotel.title',
    details: 'preroll:tips.hotel.details',
  },
  // favorites: {
  //   icon: require('./images/icon_favorites.svg'),
  //   title: 'preroll:tips.favorites.title',
  //   details: 'preroll:tips.favorites.details',
  // },
}

function PrerollTip({ tipKey }: Props) {
  const { t } = useTranslation('preroll')
  const { icon, title, details } = TIP_VARIANTS[tipKey]

  return (
    <div className={classNames()} data-testid="preroll-tip">
      <div className={classNames('wrap')}>
        <img className={classNames('tip-logo')} src={icon} />
        <span className={classNames('tip-title')}>
          {typeof title === 'object' ? <Trans ns="preroll" {...title} /> : t(title)}
        </span>
        <span className={classNames('tip-details')}>
          {typeof details === 'object' ? <Trans ns="preroll" {...details} /> : t(details)}
        </span>
      </div>
    </div>
  )
}

export default PrerollTip
