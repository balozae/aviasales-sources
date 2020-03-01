import React, { useEffect, memo } from 'react'
import ErrorInformer from '../error_informer'
import { ErrorInformerIconType } from '../error_informer.types'
import { useTranslation } from 'react-i18next'

interface InitedSearchInformerProps {
  reachGoal: (event: string, data?: any) => void
}

const InitedSearchInformer: React.FC<InitedSearchInformerProps> = (props) => {
  useEffect(() => {
    props.reachGoal('INITED_SEARCH_INFORMER_IS_SHOWN')
  }, [])

  const { t } = useTranslation('error_informer')

  return (
    <ErrorInformer iconType={ErrorInformerIconType.Good}>
      <h2 dangerouslySetInnerHTML={{ __html: t(`error_informer:inited_search.title`) }} />
      <p dangerouslySetInnerHTML={{ __html: t(`error_informer:inited_search.description`) }} />
    </ErrorInformer>
  )
}

export default memo(InitedSearchInformer)
