import {
  IsTopPlacementShownState,
  SET_TOP_PLACEMENT_SHOWN,
  REMOVE_TOP_PLACEMENT_SHOWN,
  IsTopPlacementShownActions,
} from '../types/is_top_placement_shown.types'

export const initialState: IsTopPlacementShownState = false

export default function(
  state: IsTopPlacementShownState = initialState,
  action: IsTopPlacementShownActions,
) {
  switch (action.type) {
    case SET_TOP_PLACEMENT_SHOWN:
      return true
    case REMOVE_TOP_PLACEMENT_SHOWN:
      return false
    default:
      return state
  }
}
