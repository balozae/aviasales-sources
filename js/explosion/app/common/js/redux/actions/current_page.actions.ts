import {
  CurrentPageActionTypes,
  UPDATE_CURRENT_PAGE,
  CurrentPageState,
} from '../types/current_page.types'
import { setIntentTargetingAndRefresh } from './advertisements/intent.actions'

const parsePathname = (): CurrentPageState => {
  if (window.location.pathname === '/') {
    return 'main'
  } else if (window.location.pathname.indexOf('/search') === 0) {
    return 'search'
  } else {
    return 'content'
  }
}

export const updateCurrentPage = (page: CurrentPageState): CurrentPageActionTypes => ({
  type: UPDATE_CURRENT_PAGE,
  page,
})

export const parsePathnameAndUpdateCurrentPage = () => async (dispatch) => {
  const page = parsePathname()
  await dispatch(updateCurrentPage(page))
  dispatch(setIntentTargetingAndRefresh())
}
