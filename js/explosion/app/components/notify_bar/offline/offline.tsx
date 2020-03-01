import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import Notify, { cn } from '../notify'
import { NotifyColorType } from '../notify.types'

const reloadPage = () => window.location.reload()

const NotifyOffline = () => {
  const { t } = useTranslation('notify_offline')

  return (
    <Notify colorType={NotifyColorType.Red}>
      <div className={cn('text')}>{t('notify_offline:description')}</div>
      <button className={cn('button')} onClick={reloadPage}>
        {t('notify_offline:button')}
      </button>
    </Notify>
  )
}

export default () => {
  return (
    <Suspense fallback={null}>
      <NotifyOffline />
    </Suspense>
  )
}
