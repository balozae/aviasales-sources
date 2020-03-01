import guestia from 'guestia/client'
import { setUserSetting } from 'user_account/actions/user_settings.actions'
import { UPDATE_SEARCH_STATUS } from '../types/search_status.types'
import { SET_SYS_STATE } from '../types/sys_state.types'
import { SearchStatus } from 'common/base_types'

const castCheapestTicket = ([ticket, terms]) => {
  const cheapestTerm = terms.reduce(
    (cheapest, term) => (term.unified_price < cheapest.unified_price ? term : cheapest),
    terms[0],
  )
  return {
    ...ticket,
    terms: { [cheapestTerm.gate_id]: cheapestTerm },
    xterms: { [cheapestTerm.gate_id]: cheapestTerm },
  }
}

export default (store) => (next: any) => (action: any) => {
  switch (action.type) {
    case SET_SYS_STATE:
      store.dispatch(setUserSetting('sysState', action.state))
      if (window.initTheme) {
        window.initTheme(action.state)
      }
      break
    case UPDATE_SEARCH_STATUS:
      if (action.status === SearchStatus.Finished) {
        const { searchId, searchParams, cheapestTicket, searchHistory } = store.getState()
        if (cheapestTicket && searchId && searchParams) {
          guestia.saveSearch(
            searchId,
            searchParams,
            castCheapestTicket(cheapestTicket),
            // (error, search) => {
            //   if (search && search.id) {
            //     store.dispatch(updateSearchHistory({ searches: searchHistory.concat([search]) }))
            //   }
            // },
          )
        }
      }
      break
    default:
      break
  }
  return next(action)
}
