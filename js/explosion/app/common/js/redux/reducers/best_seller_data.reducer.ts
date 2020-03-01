import { BestSellerDataState, AddBestSellerDataAction } from '../types/best_seller_data.types'

export const initialState: BestSellerDataState = Object.freeze({})

export default function(
  state: BestSellerDataState = initialState,
  action: AddBestSellerDataAction,
) {
  switch (action.type) {
    case 'ADD_BEST_SELLER_DATA':
      return action.bestSellerData
    default:
      return state
  }
}
