import { ThunkAction } from 'redux-thunk'
import { AppState } from '../../types/root/explosion'
import { AnyAction } from 'redux'
import { Place, PlaceField, SearchParams } from 'form/components/avia_form/avia_form.types'
import AutocompleteFetcher from 'form/components/autocomplete/autocomplete_fetcher'
import { Dirty } from 'common/base_types'
import { startSearch } from './start_search.actions'
import { isEmptyPlace } from 'form/components/avia_form/utils'

export const pageLoadStartSearch = (): ThunkAction<any, AppState, any, AnyAction> => async (
  dispatch,
  getState,
) => {
  const state = getState()

  const activeForm = state.pageHeader.activeForm
  const params = state[`${activeForm}Params`] as SearchParams
  const actionUrl = state.pageHeader.tabs[activeForm]!.action!

  const segments = await suggestFuzzySegments(params.segments)

  dispatch(startSearch({ ...params, segments }, actionUrl))
}

const suggestFuzzySegments = async (
  segments: SearchParams['segments'],
): Promise<SearchParams['segments']> => {
  const places = segments.map(async (segment) => {
    const [origin, destination]: [Dirty<Place>, Dirty<Place>] = await Promise.all([
      suggestFuzzyPlace(segment[PlaceField.Origin]),
      suggestFuzzyPlace(segment[PlaceField.Destination]),
    ])
    return { ...segment, origin, destination }
  })

  return await Promise.all(places)
}

export const suggestFuzzyPlace = async (place?: Place): Promise<Dirty<Place>> => {
  if (!place) {
    return
  }
  if (isEmptyPlace(place)) {
    const fetcher = new AutocompleteFetcher({ allowOpenSearch: false, stopCancellation: true })
    const query = place.name
    const [result, suggestions] = await fetcher.performRequest(query)

    if (result === 'ok') {
      return AutocompleteFetcher.getSuggestion(suggestions, query)
    }
  }
  return { ...place, iata: place.iata.toUpperCase() }
}
