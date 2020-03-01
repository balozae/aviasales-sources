import React, { memo } from 'react'
import ErrorInformer from '../error_informer'
import { ServerErrorType } from '../error_informer.types'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
interface CommonErrorInformerProps {
  error: ServerErrorType
}

const CommonErrorInformer: React.FC<CommonErrorInformerProps> = (props) => {
  const { t } = useTranslation('error_informer')
  const errorTexts: { title: string; description: string } = i18next.exists(
    `error_informer:${props.error}`,
  )
    ? t(`error_informer:${props.error}`, { returnObjects: true })
    : t('error_informer:search_failed', { returnObjects: true })

  return (
    <ErrorInformer>
      <h2 dangerouslySetInnerHTML={{ __html: errorTexts.title }} />
      <p dangerouslySetInnerHTML={{ __html: errorTexts.description }} />
    </ErrorInformer>
  )
}

export default memo(CommonErrorInformer)
