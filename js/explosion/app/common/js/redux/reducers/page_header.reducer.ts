import update from 'immutability-helper'
import { TabParams, FormType } from 'form/types'
import { Segment } from 'form/components/avia_form/avia_form.types'
import TripParams from 'utils/trip_params.coffee'
import Markerable from 'common/bindings/markerable'
import { getPageData } from 'common/js/redux/utils'
import { DEFAULT_AVAILABLE_TABS, DEFAULT_BRAND_NAME } from 'form/constants'
import {
  PageHeaderState,
  UPDATE_PAGE_HEADER,
  UPDATE_TAB_PARAMS,
  PageHeaderActions,
} from '../types/page_header.types'

export const initialState = Object.freeze(getInitialState())

export default (state = initialState, action: PageHeaderActions): PageHeaderState => {
  switch (action.type) {
    case UPDATE_PAGE_HEADER:
      const newState: PageHeaderState = {
        ...state,
        ...action.data,
        prevActiveForm: state.activeForm,
      }
      // NOTE: use multiway form after hotel form if been multiway form before hotel chosen
      if (
        state.activeForm === 'hotel' &&
        action.data.activeForm &&
        action.data.activeForm === 'avia' &&
        state.prevActiveForm === 'multiway'
      ) {
        newState.activeForm = 'multiway'
      }
      return newState
    case UPDATE_TAB_PARAMS:
      const tab = state.tabs[action.tab]
      return update(state, { tabs: { [action.tab]: { $set: { ...tab, ...action.params } } } })
    default:
      return state
  }
}

function prepareTab(props: any, type: FormType): TabParams {
  const params = props[type] || {}
  return {
    type,
    HTMLTitle: params.HTMLTitle,
    callToAction: params.callToAction,
    mainTitle: params.mainTitle,
    action: params.action,
    link: params.link,
    showFormHint: false,
  }
}

function getActiveForm(segments: Segment[]): FormType {
  const forms: { [key in string]: FormType } = {
    avia: 'avia',
    hotel: 'hotel',
    multi: 'multiway',
  }
  const id = window.location.hash.substr(1)
  const tab = forms[id] || undefined
  if (TripParams.isOpenJaw(segments) && ~['avia', undefined].indexOf(tab)) {
    return 'multiway'
  }
  return tab
}

function getInitialState(): PageHeaderState {
  const pageData = getPageData()
  const tripParams = TripParams.getNormalizedParams()

  return {
    tabs: {
      avia: prepareTab(pageData, 'avia'),
      hotel: prepareTab(pageData, 'hotel'),
      cars: prepareTab(pageData, 'cars'),
      insurance: prepareTab(pageData, 'insurance'),
      multiway: prepareTab(pageData, 'multiway'),
    },
    availableTabs: pageData.availableTabs || DEFAULT_AVAILABLE_TABS,
    showHeader: pageData.showHeader,
    activeForm: getActiveForm(tripParams.segments) || pageData.activeForm,
    mainTitleTag: pageData.mainTitleTag,
    marker: Markerable.marker(),
    brandName: pageData.brandName || DEFAULT_BRAND_NAME,
    countryInformer: pageData.countryInformer,
  }
}
