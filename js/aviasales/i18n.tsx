import i18n from 'i18next'
import Xhr from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'
import I18nEndings from 'i18next-endings-postprocessor'
import { SelectListData } from 'navbar/locale_selector/select_list/select_list.types'

declare global {
  interface Window {
    i18nextResources: Object
    availableLangs: SelectListData
  }
}

let lang = 'ru'
let i18nextResources = {}

try {
  lang = document.documentElement.lang ? document.documentElement.lang : lang
  i18nextResources = window.i18nextResources ? window.i18nextResources : i18nextResources
} catch (e) {
  //
}

declare let THIS_HOST: string

export const options: i18n.InitOptions = {
  fallbackLng: 'ru',
  defaultNS: 'common',
  ns: ['common'],
  lng: lang,
  whitelist: ['ru', 'en', 'uk', 'th', 'kk', 'uz', 'az'],
  load: 'currentOnly',
  postProcess: ['endings'],
  interpolation: {
    escapeValue: false, // not needed for react!!
  },
  react: {
    useSuspense: false,
    // @ts-ignore
    transSupportBasicHtmlNodes: true,
    // @ts-ignore
    transKeepBasicHtmlNodesFor: ['br', 'a', 'sup', 'b'],
  },
}

export const init = (
  override: Partial<i18n.InitOptions> = {},
  useXhr: boolean = true,
): Promise<i18n.TFunction> => {
  if (i18n.isInitialized) {
    return Promise.resolve(i18n.t)
  }
  if (useXhr) {
    i18n.use(
      new Xhr(null, {
        loadPath: `${THIS_HOST}/i18n/{{lng}}/{{ns}}.json`,
      }),
    )
  }

  const instance = i18n
    .use(initReactI18next)
    .use(new I18nEndings())
    .init({
      ...options,
      ...override,
      react: {
        ...options.react,
        ...override.react,
      },
    })

  Object.keys(i18nextResources).map((ns) => {
    const data = i18nextResources[ns]
    i18n.addResourceBundle(lang, ns, data)
  })

  return instance
}

// @ts-ignore
window.i18next = i18n

i18n.on('missingKey', function(lngs, namespace, key) {
  try {
    if (window.Rollbar) {
      return window.Rollbar.info('Missing Key', {
        lngs,
        namespace,
        key,
      })
    }
  } catch (e) {
    //
  }
})

export default {}
