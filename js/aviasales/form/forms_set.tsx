import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { getPageData } from 'common/js/redux/utils'
import { DEFAULT_PAGE_HEADER_PARAMS } from 'form/constants'
import store from 'common/js/redux/store'
import { loaded } from 'common/js/redux/actions/i18n.actions'
import { checkOfflineStatus } from 'common/js/redux/actions/offline.actions'
import { PageHeaderParams } from 'form/types'
import FormTabsHelper from 'form/components/form_tabs/form_tabs_helper'
import AviasaleasApp from '../aviasales_app/aviasales_app'
import { withTranslation } from 'react-i18next'
import cookie from 'oatmeal-cookie'
import { parse } from 'query-string'
import i18next from 'i18next'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import './form.scss'
import './css/forms_set.scss'
import { updateBrowserHistory } from 'common/js/redux/actions/browser_history.actions'
import { historyAPI } from './history_api'
import TripParams from 'utils/trip_params.coffee'
import { pageLoadStartSearch } from 'common/js/redux/actions/start_search/page_load_start_search.actions'
import TinyEmitter from 'common/bindings/dispatcher'
import { SearchParams } from './components/avia_form/avia_form.types'
import {
  startSearchFromStandaloneNodes,
  startSearchBySearchLinkClick,
} from 'common/js/redux/actions/start_search/start_search.actions'
import { loadIntentScript } from 'common/js/redux/actions/advertisements/intent.actions'
import { sendTiming } from 'common/js/redux/actions/metrics.actions'

const getValue = (id) => {
  const input = window.document.getElementById(id) as HTMLInputElement
  if (input) {
    return {
      value: input.value,
      hasFocus: document.activeElement === input,
    }
  }
}

declare global {
  interface Window {
    env: string
    isMainPage: boolean
    isSearchPage: boolean
    isUserPage: boolean
    codeVersion: string
  }
}

class FormsSetRoot extends React.PureComponent {
  private params: PageHeaderParams

  constructor(props: any) {
    super(props)

    store.dispatch(checkOfflineStatus() as any)
    store.dispatch(sendTiming('page_header_before_render', Math.round(performance.now())))
    const origin = getValue('origin')
    const destination = getValue('destination')
    const pageData = getPageData()

    delete pageData.i18n

    // initialInputValues will be undefined on search page where the form is not prerendered
    const initialInputValues = origin && destination && { origin, destination }

    this.params = {
      ...DEFAULT_PAGE_HEADER_PARAMS,
      ...pageData,
      initialInputValues,
    }

    i18next.on('loaded', () => {
      store.dispatch(loaded() as any)
    })

    historyAPI.listen((location, action) => {
      store.dispatch(updateBrowserHistory(location, action))
    })

    TinyEmitter.on('start_search', (params: SearchParams) => {
      store.dispatch(startSearchFromStandaloneNodes(params))
    })

    const tripParams = TripParams.getNormalizedParams()
    if (tripParams.startSearch) {
      store.dispatch(pageLoadStartSearch())
    }

    if (store.getState().currentPage !== 'main') {
      store.dispatch(loadIntentScript())
    }

    _eachElement('form[data-action="search"]', (el: HTMLElement) => {
      el.addEventListener('submit', (e: Event) => {
        if (e && e.target) {
          const target = e.target as HTMLLinkElement
          e.preventDefault()
          store.dispatch(startSearchBySearchLinkClick(target.getAttribute('action')!))
        }
      })
    })
  }

  render() {
    const tabsData = {
      avia: this.params.avia,
      multiway: this.params.multiway,
      hotel: this.params.hotel,
      cars: this.params.cars,
      insurance: this.params.insurance,
    }

    const tabs = FormTabsHelper(flagr.get('avs-feat-formTabs').tabs, tabsData)

    return (
      <Provider store={store}>
        <AviasaleasApp tabs={tabs} pageParams={this.params} initTime={performance.now()} />
      </Provider>
    )
  }
}

const FormsSetRootWithFlagr = withFlagr(flagr, ['avs-feat-formTabs'])(FormsSetRoot)
const FormsSetRootWithFlagrWithTranslations = withTranslation(['form_tabs'])(FormsSetRootWithFlagr)

function setLocaleSelectorFlags() {
  try {
    const { search } = window.location
    const query = parse(search)

    if (typeof query.showLanguages !== 'undefined') {
      cookie.set('showLanguages', true)
    }
  } catch (e) {
    //
  }
}

const _eachElement = (selector: string, func: Function) => {
  const elements = document.querySelectorAll(selector)
  if (elements && elements.length) {
    for (const key in elements) {
      if (elements.hasOwnProperty(key) && elements[key] && typeof elements[key] === 'object') {
        setTimeout(func(elements[key]), 0)
      }
    }
  }
}

export default class FormsSetWidget {
  constructor(element: HTMLElement) {
    setLocaleSelectorFlags()
    ReactDOM.render(<FormsSetRootWithFlagrWithTranslations />, element)
  }
}
