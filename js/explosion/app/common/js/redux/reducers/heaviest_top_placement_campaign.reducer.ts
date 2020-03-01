import {
  HeaviestTopPlacementCampaignState,
  AddHeaviestTopPlacementCampaignAction,
} from '../types/heaviest_top_placement_campaign.types'

export const initialState: HeaviestTopPlacementCampaignState = null

export default function(
  state: HeaviestTopPlacementCampaignState = initialState,
  action: AddHeaviestTopPlacementCampaignAction,
) {
  switch (action.type) {
    case 'ADD_HEAVIEST_TOP_PLACEMENT_CAMPAIGN':
      return action.heaviestTopPlacementCampaign
    default:
      return state
  }
}
