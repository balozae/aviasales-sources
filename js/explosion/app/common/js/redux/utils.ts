import { DEFAULT_PAGE_HEADER_PARAMS } from 'form/constants'

export const getPageData = () => {
  const element = document.querySelector('[is=forms_set]')
  if (!element) {
    return DEFAULT_PAGE_HEADER_PARAMS
  }
  const data = element.getAttribute('data-react-props')
  if (!data) {
    return DEFAULT_PAGE_HEADER_PARAMS
  }
  return JSON.parse(data) || {}
}
