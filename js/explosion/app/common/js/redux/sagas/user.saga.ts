import {
  ACTIVATE_USER_EMAIL,
  ACTIVATE_USER_EMAIL_FAILURE,
  ActivateUserEmailAction,
} from 'user_account/types/user_info.types'
import { fork, takeLeading, put, call } from '@redux-saga/core/effects'
import guestia from 'guestia/client'
import { EmailInfo } from 'guestia_client/lib/types'
import { updateUserInfo } from 'user_account/actions/user_info.actions'
import rollbar from 'common/utils/rollbar'

function* activateUserEmail() {
  yield takeLeading(ACTIVATE_USER_EMAIL, function*({ email }: ActivateUserEmailAction) {
    try {
      const emailInfo: EmailInfo = yield call(() => guestia.activateEmail(email))
      yield put(updateUserInfo({ email_info: emailInfo }))
    } catch (error) {
      yield put({ type: ACTIVATE_USER_EMAIL_FAILURE })
      rollbar.error('Error during email activation. activateUserEmail saga', error)
    }
  })
}

export default function* userSaga() {
  yield fork(activateUserEmail)
}
