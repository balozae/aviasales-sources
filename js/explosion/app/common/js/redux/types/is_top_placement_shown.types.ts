export const SET_TOP_PLACEMENT_SHOWN = 'SET_TOP_PLACEMENT_SHOWN'
export const REMOVE_TOP_PLACEMENT_SHOWN = 'REMOVE_TOP_PLACEMENT_SHOWN'

export type SetTopPlacementShownAction = {
  type: typeof SET_TOP_PLACEMENT_SHOWN
}
export type RemoveTopPlacementShownAction = {
  type: typeof REMOVE_TOP_PLACEMENT_SHOWN
}

export type IsTopPlacementShownActions = SetTopPlacementShownAction | RemoveTopPlacementShownAction

export type IsTopPlacementShownState = boolean
