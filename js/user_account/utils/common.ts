import axios from 'axios'
import guestia from 'guestia/client'
import { API_PROMOS_SHORT } from 'user_account/constants/api'
import { AppState } from 'user_account/types/app.types'
import { filterKnownAirportsIatas } from './airports'
import { filterKnownCitiesIatas } from './cities'

export const fetchUserPromosCount = async () => {
  const settingPromos = guestia.getSettings('pageview_promos')
  const settingPartners = guestia.getSettings('pageview_partners')
  const url = `${API_PROMOS_SHORT}?our=${settingPromos}&them=${settingPartners}`

  try {
    const { data: { our = 0, them = 0 } = {} } = await axios.get(url)
    return our + them
  } catch {
    // nothing to catch
  }
}

export const splitCommonIatasByTypes = (state: AppState, iatas) => {
  /**
   * Because iatas array may have both Airports and Cities iatas type,
   * we need to filter known Airports iatas from Cities and same for Cities iatas
   */
  const citiesIatas = filterKnownAirportsIatas(state, iatas)
  const airportsIatas = filterKnownCitiesIatas(state, iatas)

  return {
    citiesIatas,
    airportsIatas,
  }
}
