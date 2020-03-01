import { AppState } from 'user_account/types/app.types'

export const getAirportsData = (state: AppState) => state.airportsDenormalized.data
