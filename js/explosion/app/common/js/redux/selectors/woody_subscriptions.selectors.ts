import { createSelector } from 'reselect'
import markerable from 'common/bindings/markerable'
import { WoodySubscription, WoodySubscriberParams } from '../types/woody_subscriptions.types'
import { getUserEmailForSubscription } from 'user_account/selectors/user.selectors'
import { AppState } from '../types/root/explosion'

const getWoodySubscriptions = (state: AppState): WoodySubscription[] =>
  state.woodySubscriptions.data

const getSegmentsFromSearchParams = (state: AppState) =>
  state.searchParams && state.searchParams.segments

const getCurrency = (state: AppState) => {
  if (state.userSettings.currency) {
    return state.userSettings.currency
  }

  if (state.searchParams && state.searchParams.currency) {
    return state.searchParams.currency
  }

  return 'rub'
}

export const getWoodySubscriberParams = createSelector(
  [getSegmentsFromSearchParams, getUserEmailForSubscription, getCurrency],
  (segments, userEmail, currency): WoodySubscriberParams | null => {
    if (!segments || !userEmail) {
      return null
    }

    const { origin, originName, destination, destinationName } = segments[0]
    const departDate = segments[0].date
    const returnDate = segments[1] ? segments[1].date : null

    return {
      email: userEmail,
      params: {
        marker: markerable.marker(),
        origin: {
          iata: origin,
          name: originName || origin,
        },
        destination: {
          iata: destination,
          name: destinationName || destination,
        },
        depart_date: departDate,
        return_date: returnDate,
        one_way: !returnDate,
        currency,
      },
    }
  },
)

export const hasSameWoodySubscriptions = createSelector(
  [getSegmentsFromSearchParams, getWoodySubscriptions],
  (segments, subscriptions): boolean => {
    if (!subscriptions.length || !segments) {
      return false
    }

    const { origin, destination } = segments[0]
    const departDate = segments[0].date
    const returnDate = segments[1] ? segments[1].date : undefined

    const filterFunc = (subs) =>
      subs.origin &&
      subs.destination &&
      origin === subs.origin.iata &&
      destination === subs.destination.iata &&
      departDate === subs.depart_date &&
      returnDate === subs.return_date

    return subscriptions.some(filterFunc)
  },
)
