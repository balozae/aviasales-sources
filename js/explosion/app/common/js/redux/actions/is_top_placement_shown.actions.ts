import {
  IsTopPlacementShownActions,
  RemoveTopPlacementShownAction,
  SET_TOP_PLACEMENT_SHOWN,
  REMOVE_TOP_PLACEMENT_SHOWN,
} from '../types/is_top_placement_shown.types'

export const setIsTopPlacementShown = (): IsTopPlacementShownActions => ({
  type: SET_TOP_PLACEMENT_SHOWN,
})

export const removeTopPlacementShown = (): RemoveTopPlacementShownAction => ({
  type: REMOVE_TOP_PLACEMENT_SHOWN,
})
