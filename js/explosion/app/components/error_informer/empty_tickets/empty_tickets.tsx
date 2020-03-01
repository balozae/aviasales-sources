import React, { memo } from 'react'
import ErrorInformer from '../error_informer'
import { useTranslation } from 'react-i18next'

const EmptyTicketsInformer: React.FC = () => {
  const { t } = useTranslation('error_informer')
  const TEXT_LIST = t(`error_informer:empty_tickets.textList`, { returnObjects: true })

  return (
    <ErrorInformer>
      <h2 dangerouslySetInnerHTML={{ __html: t(`error_informer:empty_tickets.title`) }} />
      <p dangerouslySetInnerHTML={{ __html: t(`error_informer:empty_tickets.description`) }} />
      <ul>
        {Array.isArray(TEXT_LIST)
          ? TEXT_LIST.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))
          : TEXT_LIST}
      </ul>
    </ErrorInformer>
  )
}

export default memo(EmptyTicketsInformer)
