import { SearchParamsInHistory, SearchParams } from 'form/components/avia_form/avia_form.types'
import { formatSegmentDateToString } from 'form/components/avia_form/utils'
import { historyAPI } from 'form/history_api'

export const updateURLWithSearch = (url: string, params: SearchParams) => () => {
  const isSameSearch = window.location.pathname === url
  const historyFunc = isSameSearch ? 'replace' : 'push'
  historyAPI[historyFunc](url, {
    type: 'search',
    params: formatSearchParamsForHistory(params),
  })
}

const formatSearchParamsForHistory = (params: SearchParams): SearchParamsInHistory => {
  if (!params || !params.segments) {
    return params as SearchParamsInHistory
  }

  const newSegments = params.segments.map((segment) => ({
    ...segment,
    date: formatSegmentDateToString(segment.date),
  }))
  return {
    ...params,
    segments: newSegments,
  }
}
