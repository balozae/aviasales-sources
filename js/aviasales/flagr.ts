import '@babel/polyfill'
import cookie from 'oatmeal-cookie'
import instance from 'common/utils/flagr_client_instance'

declare global {
  interface Window {
    updatedData?: {
      keys: any
      isAll: any
    }
  }
}

const basicContext = {
  lang: (document.documentElement.getAttribute('lang') || 'ru').toLowerCase(),
  host: (document.documentElement.getAttribute('data-host') || 'RU').toLowerCase(),
  market: (document.documentElement.getAttribute('data-market') || 'ru').toLowerCase(),
  currency: (document.documentElement.getAttribute('data-currency') || 'RUB').toLowerCase(),
  domain: window.location.hostname.replace('www.', '').toLowerCase(),
  auid: cookie.get('auid'),
}

function flagrUpdatedFunction(keys: any, isAll: any) {
  window.updatedData = { keys, isAll }
  instance.off('update', flagrUpdatedFunction)
}

export const flagrInitProccess = instance
  .on('update', flagrUpdatedFunction)
  .updateBasicContext(basicContext)
