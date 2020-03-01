import i18next from 'i18next'
import AutocompleteFetcher from 'form/components/autocomplete/autocomplete_fetcher.ts'
import { setCurrentLocale } from 'finity_facade'
import flagr from 'common/utils/flagr_client_instance'
import { getFormTypeToUpdate } from 'form/components/avia_form/utils'
import Cookies from 'oatmeal-cookie'
import { i18nActions, CHANGE_USER_LANGUAGE } from '../types/i18n.types'
import { restartSearch } from './start_search/start_search.actions'
import { updateActiveFormParams } from './form_params.actions'
import { Segment } from 'form/components/avia_form/avia_form.types'

const changeLanguageAction = (): i18nActions => ({
  type: CHANGE_USER_LANGUAGE,
})

/**
 * On i18next language changed
 *
 * @param lang
 */
export const languageChanged = (lang: string) => async (dispatch) => {
  setCurrentLocale()

  if (!!window.isSearchPage) {
    await dispatch(changeFormParams(lang))
    dispatch(restartSearch())
  } else {
    dispatch(changeFormParams(lang))
  }
}

/**
 * Change language
 *
 * @param lang
 */
export const changeLanguage = (lang: string) => (dispatch) => {
  if (lang !== i18next.language) {
    i18next.changeLanguage(lang)
    flagr.updateBasicContext({ lang })
    Cookies.set('custom_lang', lang, { path: '/' })
    window.location.reload()
    dispatch(languageChanged(lang))
    dispatch(changeLanguageAction())
  }
}

/**
 * i18next loaded
 *
 */
export const loaded = () => (dispatch) => {
  setCurrentLocale()
}

/**
 * Update form params depends lang
 *
 * @param lang
 */
export const changeFormParams = (lang: string) => async (dispatch, getState) => {
  const state = getState()
  const activeForm = getFormTypeToUpdate(state.pageHeader)

  if (!activeForm) {
    return
  }

  const formParams = state[`${activeForm}Params`]

  const fetcher = new AutocompleteFetcher({
    allowOpenSearch: true,
    locale: lang,
    stopCancellation: true,
  })

  const segments = await Promise.all<Segment>(
    formParams.segments.map(async (segment) => {
      const originIata = segment.origin.iata
      const destinationIata = segment.destination.iata
      const getSuggestions = async (iata: string) => {
        const [result, suggestions] = await fetcher.performRequest(iata)
        if (result === 'ok') {
          return AutocompleteFetcher.getSuggestion(suggestions, iata)
        }
      }

      const [origin, destination] = await Promise.all([
        getSuggestions(originIata),
        getSuggestions(destinationIata),
      ])

      return {
        ...segment,
        origin,
        destination,
      }
    }),
  )

  dispatch(updateActiveFormParams({ segments }))
}
