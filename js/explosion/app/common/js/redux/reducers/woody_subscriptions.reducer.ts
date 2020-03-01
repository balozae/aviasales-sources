import { RequestStatus } from 'common/types'
import {
  FETCH_WOOODY_SUBSCRIPTIONS_REQUEST,
  FETCH_WOOODY_SUBSCRIPTIONS_FAILURE,
  FETCH_WOOODY_SUBSCRIPTIONS_SUCCESS,
  CREATE_WOODY_SUBSCRIPTION_REQUEST,
  CREATE_WOODY_SUBSCRIPTION_FAILURE,
  CREATE_WOODY_SUBSCRIPTION_SUCCESS,
  RESET_WOODY_CREATION_STATUS,
  RESET_WOODY_SUBSCRIPTIONS,
  WoodySubscriptionsState as SubscriptionsState,
  WoodySubscriptionsActionTypes as ActionTypes,
} from '../types/woody_subscriptions.types'

const initialState: SubscriptionsState = {
  data: [],
  fetchingStatus: RequestStatus.Idle,
  creationStatus: RequestStatus.Idle,
}

export const woodySubscriptions = (
  state: SubscriptionsState = initialState,
  action: ActionTypes,
): SubscriptionsState => {
  switch (action.type) {
    case FETCH_WOOODY_SUBSCRIPTIONS_REQUEST:
      return {
        ...state,
        fetchingStatus: RequestStatus.Pending,
      }
    case FETCH_WOOODY_SUBSCRIPTIONS_SUCCESS:
      return {
        ...state,
        data: action.data,
        fetchingStatus: RequestStatus.Success,
      }
    case FETCH_WOOODY_SUBSCRIPTIONS_FAILURE:
      return {
        ...state,
        fetchingStatus: RequestStatus.Failure,
      }
    case CREATE_WOODY_SUBSCRIPTION_REQUEST:
      return {
        ...state,
        creationStatus: RequestStatus.Pending,
      }
    case CREATE_WOODY_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        data: action.data,
        creationStatus: RequestStatus.Success,
      }
    case CREATE_WOODY_SUBSCRIPTION_FAILURE:
      return {
        ...state,
        creationStatus: RequestStatus.Failure,
      }
    case RESET_WOODY_CREATION_STATUS:
      return {
        ...state,
        creationStatus: RequestStatus.Idle,
      }
    case RESET_WOODY_SUBSCRIPTIONS:
      return initialState
    default:
      return state
  }
}

export default woodySubscriptions
