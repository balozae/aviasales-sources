import {
  AdvertisementState,
  AdvertisementActions,
  SET_NEXT_ADVERTISEMENT,
  RESET_ADVERTISEMENT,
} from '../types/advertisement.types'

const ADVERTISEMENTS_ORDER: { [key: string]: Array<AdvertisementState> } = {
  product_0: [
    {
      type: 'AdDoubleClick',
      placement: '/68258039/729x250-Top-ASnew',
      id: 'google_tag_id_doubleclick_small',
      size: [729, 250],
      metricsName: 'first_place',
    },
    {
      type: 'AdTopPlacement',
    },
    {
      type: 'AdSense',
    },
  ],
  product_3: [
    {
      type: 'AdDoubleClick',
      placement: '/68258039/729x250-Ticket-ASnew',
      id: 'google_tag_id_doubleclick_big',
      size: [729, 250],
      metricsName: 'third_place',
    },
    {
      type: 'AdMediaAlpha',
    },
  ],
  preroll: [
    {
      type: 'AdDoubleClick',
      placement: '/68258039/AS-300x500-new',
      id: 'awesome_preroll_block',
      size: [[300, 500], [300, 600]],
      metricsName: 'preroll',
    },
    {
      type: 'AdDoubleClick',
      placement: '/68258039/AS_300x500_Preloader_s2',
      id: 'div-gpt-ad-1507278765129-0',
      size: [[300, 600], [300, 500]],
      metricsName: 'preroll',
    },
    {
      type: 'AdMediaAlpha',
    },
  ],
  extra_content: [
    {
      type: 'AdDoubleClick',
      id: 'left-col-rek',
      size: [160, 600],
      placement: '/68258039/160x600-AS',
      metricsName: 'search_results-right',
      zoneid: 926725,
    },
    {
      type: 'AdDoubleClick',
      id: 'left-col-rek2',
      size: [160, 600],
      placement: '/68258039/160x600-AS_s2',
      metricsName: 'search_results-right',
    },
    {
      type: 'AdDoubleClick',
      id: 'left-col-rek3',
      size: [160, 600],
      placement: '/68258039/160x600-AS_s3',
      metricsName: 'search_results-right',
    },
    {
      type: 'AdMediaAlpha',
    },
  ],
}

let _initialState = {}
let advertisements, index
for (index in ADVERTISEMENTS_ORDER) {
  advertisements = ADVERTISEMENTS_ORDER[index]
  _initialState[index] = advertisements[0]
}

export const initialState: AdvertisementState = Object.freeze(_initialState) as AdvertisementState

export default function(state: AdvertisementState = initialState, action: AdvertisementActions) {
  switch (action.type) {
    case SET_NEXT_ADVERTISEMENT: {
      const advertisementList = ADVERTISEMENTS_ORDER[action.index]
      const nextAdIndex = advertisementList.indexOf(state[action.index]) + 1
      // TODO Че это?
      advertisements = { ...state }
      if (nextAdIndex > advertisementList.length - 1) {
        advertisements[action.index] = null
      } else {
        advertisements[action.index] = advertisementList[nextAdIndex]
      }
      return advertisements
    }
    case RESET_ADVERTISEMENT: {
      return initialState
    }
    default:
      return state
  }
}
