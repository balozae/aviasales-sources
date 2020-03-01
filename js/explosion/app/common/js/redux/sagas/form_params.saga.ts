import { fork, takeEvery, put, select } from '@redux-saga/core/effects'
import { UPDATE_ACTIVE_FORM_PARAMS, UpdateActiveFormParams } from '../types/form_params.types'
import { getActiveForm } from '../selectors/form_params.selectors'
import { FormType } from 'form/types'
import { updateAviaParams } from '../actions/avia_params.actions'
import { updateMultiwayParams } from '../actions/multiway_params.actions'

function* updateActiveFormParamsSaga() {
  yield takeEvery(UPDATE_ACTIVE_FORM_PARAMS, function*({ params }: UpdateActiveFormParams) {
    const activeForm: FormType = yield select(getActiveForm)
    if (activeForm === 'avia') {
      yield put(updateAviaParams(params))
    }
    if (activeForm === 'multiway') {
      yield put(updateMultiwayParams(params))
    }
  })
}

export default function* formParamsSaga() {
  yield fork(updateActiveFormParamsSaga)
}
