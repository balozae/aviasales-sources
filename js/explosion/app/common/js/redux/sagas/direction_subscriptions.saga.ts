import { takeEvery, takeLatest, put, select, race, take, fork } from '@redux-saga/core/effects'
import {
  SAVE_DIRECTION_SUBSCRIPTION,
  DIRECTION_SUBSCRIPTIONS_POPUP_SHOW,
  DirectionSubscriptionPopupShowAction,
  DIRECTION_SUBSCRIPTIONS_POPUP_PROCEED,
  DIRECTION_SUBSCRIPTIONS_POPUP_CLOSE,
} from '../types/direction_subscriptions.types'
import {
  getIsAuthorized,
  getUserEmailActivationStatus,
} from 'user_account/selectors/user.selectors'
import { PopupType } from '../types/popups.types'
import { USER_INFO_SUCCESS } from 'user_account/types/user_info.types'
import { getDirectionSubscriptionsGoalData } from 'components/direction_subscriptions/direction_subscriptions.selector'
import { reachGoal } from '../actions/metrics.actions'
import { EmailStatus, EmailInfo } from 'guestia_client/lib/types'
import {
  ACTIVATE_EMAIL_SUBMIT,
  ACTIVATE_EMAIL_POPUP_CLOSE,
} from 'user_account/types/ticket_subscriptions.types'
import { createWoodySubscription } from 'common/js/redux/actions/woody_subscriptions.actions'
import { getWoodySubscriberParams } from '../selectors/woody_subscriptions.selectors'
import rollbar from 'common/utils/rollbar'
import { addPopup, removePopup } from '../actions/popups.actions'

function* saveDirectionSubscriptionSaga() {
  yield takeEvery(SAVE_DIRECTION_SUBSCRIPTION, function*() {
    const isAuthorized = yield select(getIsAuthorized)

    if (!isAuthorized) {
      yield put(addPopup({
        popupType: PopupType.LoginForm,
        params: { from: 'direction-subscription' },
      }) as any)

      const { cancel } = yield race({
        auth: take(USER_INFO_SUCCESS),
        cancel: take('REMOVE_POPUP'),
      })

      if (cancel) {
        return
      }

      yield put(removePopup(PopupType.LoginForm))
    }
    const userEmailActivationStatus: EmailInfo['activation_status'] = yield select(
      getUserEmailActivationStatus,
    )

    if (userEmailActivationStatus === EmailStatus.NotActive) {
      yield put(addPopup({
        popupType: PopupType.ActivateEmail,
      }) as any)

      const { cancel } = yield race({
        success: take(ACTIVATE_EMAIL_SUBMIT),
        cancel: take(ACTIVATE_EMAIL_POPUP_CLOSE),
      })

      if (cancel) {
        return
      }
    }

    try {
      const woodySubscriberParams = yield select(getWoodySubscriberParams)
      const directionSubscriptionsGoalData = yield select(getDirectionSubscriptionsGoalData)
      yield put(createWoodySubscription(woodySubscriberParams) as any)
      yield put(
        reachGoal('PROPHET_SUBSCRIBE_POPUP_EMAIL_INPUT_SUBMIT', directionSubscriptionsGoalData),
      )
    } catch (error) {
      rollbar.error(
        'Error during createWoodySubscription fn in saveDirectionSubscriptionSaga',
        error,
      )
    }
  })
}

function* directionSubscriptionsPopupShowSaga() {
  yield takeLatest(DIRECTION_SUBSCRIPTIONS_POPUP_SHOW, function*({
    interactionType,
  }: DirectionSubscriptionPopupShowAction) {
    const userEmailActivationStatus: EmailInfo['activation_status'] = yield select(
      getUserEmailActivationStatus,
    )

    // straight proceed to activateEmail flow
    if (userEmailActivationStatus === EmailStatus.NotActive) {
      yield put({
        type: SAVE_DIRECTION_SUBSCRIPTION,
      })
      return
    }

    yield put(addPopup({
      popupType: PopupType.DirectionSubscriptions,
      params: { type: interactionType },
    }) as any)
    yield put(reachGoal('direction-subscriptions-popup--shown', { type: interactionType }))

    const { cancel } = yield race({
      success: take(DIRECTION_SUBSCRIPTIONS_POPUP_PROCEED),
      cancel: take(DIRECTION_SUBSCRIPTIONS_POPUP_CLOSE),
    })

    yield put(removePopup(PopupType.DirectionSubscriptions))

    if (cancel) {
      yield put(reachGoal('direction-subscriptions-popup--closed', { type: interactionType }))
      return
    }

    yield put(reachGoal('direction-subscriptions-popup--proceed', { type: interactionType }))
    yield put({
      type: SAVE_DIRECTION_SUBSCRIPTION,
    })
  })
}

export default function* directionSubscriptionsSaga() {
  yield fork(saveDirectionSubscriptionSaga)
  yield fork(directionSubscriptionsPopupShowSaga)
}
