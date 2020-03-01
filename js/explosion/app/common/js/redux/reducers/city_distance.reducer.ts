import { CityDistanceState, AddCityDistanceAction } from '../types/city_distance.types'

export const initialState: CityDistanceState = null

export default function(state: CityDistanceState = initialState, action: AddCityDistanceAction) {
  switch (action.type) {
    case 'ADD_CITY_DISTANCE':
      return action.cityDistance
    default:
      return state
  }
}
