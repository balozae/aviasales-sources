import {
  fork,
  take,
  takeEvery,
  takeLeading,
  put,
  select,
  delay,
  race,
} from '@redux-saga/core/effects'
import { EmailStatus } from 'guestia_client/lib/types'
import {
  ACTIVATE_EMAIL_SUBMIT,
  ActivateEmailSubmitAction,
  ACTIVATE_EMAIL_POPUP_CLOSE,
  ACTIVATE_EMAIL_POPUP_SUCCESS_CLOSE,
} from 'user_account/types/ticket_subscriptions.types'
import { activateUserEmail } from 'user_account/actions/user_info.actions'
import { removePopup, addPopup } from '../actions/popups.actions'
import { PopupType } from '../types/popups.types'
import { reachGoal } from '../actions/metrics.actions'
import { showSubscriptionsInformer } from '../actions/subscriptions_informer.actions'
import {
  showEmailChangeNotify,
  hideEmailChangeNotify,
} from '../actions/email_change_notify.actions'
import {
  UPDATE_EMAIL,
  UpdateEmailAction,
  SEND_CONFIRM_EMAIL,
} from '../types/ticket_subscriptions.types'
import {
  getUserCandidateEmail,
  getUserEmailActivationStatus,
} from 'user_account/selectors/user.selectors'
import { UPDATE_USER_INFO, ACTIVATE_USER_EMAIL_FAILURE } from 'user_account/types/user_info.types'

function* emailPopupSuccessClose() {
  yield takeEvery(ACTIVATE_EMAIL_POPUP_SUCCESS_CLOSE, function*() {
    yield put(removePopup(PopupType.ActivateEmail))
    yield put(reachGoal('activate-email-popup--success--close'))
    yield put(showSubscriptionsInformer() as any)
  })
}

function* emailPopupSubmit() {
  yield takeEvery(ACTIVATE_EMAIL_SUBMIT, function*({ email }: ActivateEmailSubmitAction) {
    yield put(activateUserEmail(email))

    const { error } = yield race({
      success: take(UPDATE_USER_INFO),
      error: take(ACTIVATE_USER_EMAIL_FAILURE),
    })

    if (error) {
      return
    }

    const emailActivationStatus = yield select(getUserEmailActivationStatus)
    if (emailActivationStatus === EmailStatus.Active) {
      yield put(removePopup(PopupType.ActivateEmail))
      yield put(showSubscriptionsInformer() as any)
    } else {
      yield put(addPopup({
        popupType: PopupType.ActivateEmail,
        params: { showSuccess: true },
      }) as any)
    }
    yield put(reachGoal('activate-email-popup--submit'))
  })
}

function* emailPopupClose() {
  yield takeEvery(ACTIVATE_EMAIL_POPUP_CLOSE, function*() {
    yield put(removePopup(PopupType.ActivateEmail, 'cancelled'))
    yield put(reachGoal('activate-email-popup--cancel'))
  })
}

function* changeEmail() {
  yield takeEvery(UPDATE_EMAIL, function*({ email }: UpdateEmailAction) {
    yield put(activateUserEmail(email))

    const { error } = yield race({
      success: take(UPDATE_USER_INFO),
      error: take(ACTIVATE_USER_EMAIL_FAILURE),
    })

    if (error) {
      yield put(showEmailChangeNotify('error'))
      yield delay(5000)
      yield put(hideEmailChangeNotify())
      return
    }

    const emailActivationStatus = yield select(getUserEmailActivationStatus)
    yield put(reachGoal('update-email-in-subscription--submit'))
    if (emailActivationStatus === EmailStatus.Pending) {
      yield put(showEmailChangeNotify('success'))
      yield delay(10000)
      yield put(hideEmailChangeNotify())
    }
  })
}

function* sendConfirmEmail() {
  yield takeLeading(SEND_CONFIRM_EMAIL, function*() {
    const email = yield select(getUserCandidateEmail)
    if (email) {
      yield put(activateUserEmail(email))

      const { error } = yield race({
        success: take(UPDATE_USER_INFO),
        error: take(ACTIVATE_USER_EMAIL_FAILURE),
      })

      if (error) {
        return
      }

      yield put(reachGoal('send-confirm-email--submit'))
      yield put(showEmailChangeNotify('success'))
      yield delay(10000)
      yield put(hideEmailChangeNotify())
    }
  })
}

export default function* ticketSubscriptionEmailPopupSaga() {
  yield fork(emailPopupSubmit)
  yield fork(emailPopupClose)
  yield fork(emailPopupSuccessClose)
  yield fork(changeEmail)
  yield fork(sendConfirmEmail)
}
