import { ThunkAction } from 'redux-thunk'
import axios, { AxiosResponse } from 'axios'
import rollbar from 'common/utils/rollbar'
import jsonp from 'jsonp'
import qs from 'query-string'
import {
  FETCH_WOOODY_SUBSCRIPTIONS_REQUEST,
  FETCH_WOOODY_SUBSCRIPTIONS_FAILURE,
  FETCH_WOOODY_SUBSCRIPTIONS_SUCCESS,
  CREATE_WOODY_SUBSCRIPTION_REQUEST,
  CREATE_WOODY_SUBSCRIPTION_FAILURE,
  CREATE_WOODY_SUBSCRIPTION_SUCCESS,
  RESET_WOODY_CREATION_STATUS,
  RESET_WOODY_SUBSCRIPTIONS,
  WoodySubscriptionsActionTypes as ActionTypes,
  WoodySubscription,
  WoodyResponse,
  WoodySubscriberParams,
} from '../types/woody_subscriptions.types'
import { getUserEmailForSubscription } from 'user_account/selectors/user.selectors'
import { AppState } from '../types/root/explosion'

const WOODY_HOST = 'https://woody.aviasales.ru'

const fetchRequestAction = (): ActionTypes => ({
  type: FETCH_WOOODY_SUBSCRIPTIONS_REQUEST,
})

const fetchFailureAction = (): ActionTypes => ({
  type: FETCH_WOOODY_SUBSCRIPTIONS_FAILURE,
})

const fetchSuccessAction = (data: WoodySubscription[]): ActionTypes => ({
  type: FETCH_WOOODY_SUBSCRIPTIONS_SUCCESS,
  data,
})

const createRequestAction = (): ActionTypes => ({
  type: CREATE_WOODY_SUBSCRIPTION_REQUEST,
})

const createFailureAction = (): ActionTypes => ({
  type: CREATE_WOODY_SUBSCRIPTION_FAILURE,
})

const createSuccessAction = (data: WoodySubscription[]): ActionTypes => ({
  type: CREATE_WOODY_SUBSCRIPTION_SUCCESS,
  data,
})

export const resetWoodyCreationStatus = (): ActionTypes => ({
  type: RESET_WOODY_CREATION_STATUS,
})

export const fetchWoodySubscriptions = (): ThunkAction<void, AppState, void, ActionTypes> => async (
  dispatch,
  getState,
) => {
  try {
    const email = getUserEmailForSubscription(getState())

    if (!email) {
      return
    }

    dispatch(fetchRequestAction())
    const url = getFetchRequestUrl(email)
    const {
      data: { subscriptions = [] },
    }: AxiosResponse<WoodyResponse> = await axios.get(url)

    if (subscriptions) {
      dispatch(fetchSuccessAction(subscriptions))
    }
  } catch (err) {
    dispatch(fetchFailureAction())
    rollbar.error('Cant fetch subscription', err)
    console.error('Cant fetch subscription', err)
  }
}

export const createWoodySubscription = (
  subscriberParams: WoodySubscriberParams,
): ThunkAction<void, AppState, void, ActionTypes> => async (dispatch) => {
  dispatch(createRequestAction())

  const { params, email } = subscriberParams
  const paramsString = qs.stringify({
    email,
    subscription: JSON.stringify({ raw_rules: params }),
  })
  const url = `${WOODY_HOST}/subscriptions/create.jsonp?${paramsString}`

  const reqPromise = new Promise((resolve, reject) => {
    jsonp(url, null, async (err, data: WoodyResponse) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })

  try {
    const { subscriptions } = await reqPromise.then((data: WoodyResponse) => data)

    if (subscriptions.length) {
      const sorted: WoodySubscription[] = subscriptions.sort((a, b) => a.id - b.id)
      dispatch(createSuccessAction(sorted))
    }
  } catch (err) {
    dispatch(createFailureAction())
    rollbar.error('Can not create subscription', err)
    console.error('Can not create subscription', err)
  }
}

function getFetchRequestUrl(email: string): string {
  const params = [`email=${email}`, 'if_exists=true'].join('&')
  return `${WOODY_HOST}/subscriptions?${params}`
}

export const resetWoodySubscriptions = (): ActionTypes => ({ type: RESET_WOODY_SUBSCRIPTIONS })
