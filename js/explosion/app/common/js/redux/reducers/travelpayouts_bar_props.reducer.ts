import {
  TravelpayoutsBarPropsState,
  SetTravelpayoutsBarPropsAction,
} from '../types/travelpayouts_bar_props.types'

export const initialState: TravelpayoutsBarPropsState = Object.freeze({
  isShow: false,
  affMarker: null,
})

export default function(
  state: TravelpayoutsBarPropsState = initialState,
  action: SetTravelpayoutsBarPropsAction,
) {
  switch (action.type) {
    case 'SET_TRAVELPAYOUTS_BAR_PROPS':
      return action.props
    default:
      return state
  }
}
