import * as React from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'

import './app_info.scss'

const classNames = clssnms('app-info')

const RATING_NUMBER = 4.8
const Star = () => <div className={classNames('star')} />

function AppInfo({ appIconClassName = '' }: { appIconClassName: string }) {
  const { t } = useTranslation('preroll')

  return (
    <div className={classNames()}>
      <div className={classNames('application')}>
        <div className={classNames('aviasales-logo', appIconClassName)} />
        <div className={classNames('rating-wrap')}>
          <div className={classNames('rating')}>
            <span className={classNames('rating-number')}>{RATING_NUMBER}</span>
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>
          <div className={classNames('reviews')}>{t('preroll:appReviews')}</div>
        </div>
      </div>
    </div>
  )
}

export default AppInfo
