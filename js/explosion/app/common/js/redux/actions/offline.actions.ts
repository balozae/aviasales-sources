import axios from 'axios'

// Actions
export const SET_OFFLINE = 'SET_OFFLINE'

/**
 * Check offline status
 * Check internet connection
 *
 */
export const checkOfflineStatus = () => (dispatch) => {
  const browserStatusIsOffline = window.navigator.onLine === false
  // window.navigator.onLine can be false when network is available
  // Recheck
  if (browserStatusIsOffline) {
    axios.get('/search').catch(() => dispatch(setOffline(true)))
  }
}

/**
 * Set offline status to redux
 *
 * @param isOffline
 */
export const setOffline = (isOffline: boolean) => ({
  type: SET_OFFLINE,
  payload: { isOffline },
})
