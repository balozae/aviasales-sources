import { fork, takeEvery, put } from '@redux-saga/core/effects'
import { SET_ERROR } from '../types/error.types'
import { updateSearchStatus } from '../actions/search_status.actions'
import { SearchStatus } from 'common/base_types'

function* setError() {
  yield takeEvery(SET_ERROR, function*() {
    yield put(updateSearchStatus(SearchStatus.Finished))
  })
}

export default function* errorSaga() {
  yield fork(setError)
}
