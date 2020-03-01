import { AdSenseParamsState, AddAdSenseParamsAction } from '../types/ad_sense_params.types'

export const initialState: AdSenseParamsState = Object.freeze({})

export default function(state: AdSenseParamsState = initialState, action: AddAdSenseParamsAction) {
  switch (action.type) {
    case 'ADD_ADSENSE_PARAMS':
      return action.adsenseQuery
    default:
      return state
  }
}
