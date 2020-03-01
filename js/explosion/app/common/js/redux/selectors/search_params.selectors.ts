import { createSelector } from 'reselect'
import {
  SearchParams as FormParams,
  PlaceField,
  Place,
} from 'form/components/avia_form/avia_form.types'
import { SearchParams } from 'shared_components/ticket/ticket.types'
import TripParams from 'utils/trip_params.coffee'
import { TripClass } from 'common/types'
import { AppState } from '../types/root/explosion'

export const getSearchParams = (state: AppState) => state.searchParams

export const mapSearchParamsToFormParams = createSelector(
  (searchParams: SearchParams) => searchParams,
  (searchParams): FormParams => {
    return {
      ...searchParams,
      tripClass: searchParams.tripClass as TripClass,
      segments: searchParams.segments.map((segment) => {
        return {
          [PlaceField.Origin]: searchPlaceToForm(PlaceField.Origin, segment) as Place,
          [PlaceField.Destination]: searchPlaceToForm(PlaceField.Destination, segment) as Place,
          date: new Date(segment.date),
          id: Math.random()
            .toString(36)
            .substring(7),
        }
      }),
    }
  },
)

export const isOpenJaw = createSelector(
  (params: FormParams) => params,
  (params: FormParams) => TripParams.isOpenJaw(params.segments) as boolean,
)

export const currentSearchFormParamsSelector = createSelector(
  getSearchParams,
  mapSearchParamsToFormParams,
)

const searchPlaceToForm = (type: PlaceField, segment) => {
  return Object.keys(segment).reduce((acc, segmentKey) => {
    const value = segment[segmentKey]
    const keyPrefix = `${type}_`
    const key = segmentKey.replace(keyPrefix, '')
    if (SEARCH_PLACE_TO_FORM[key]) {
      const formKey = SEARCH_PLACE_TO_FORM[key]
      return { ...acc, [formKey]: value }
    } else if (segmentKey.indexOf(keyPrefix) === 0) {
      return { ...acc, [key]: value }
    }
    return acc
  }, {})
}

const SEARCH_PLACE_TO_FORM = {
  iata: 'iata',
  city_iata: 'cityIata',
  name: 'name',
  country: 'country',
  country_name: 'countryName',
  cases: 'cases',
}
