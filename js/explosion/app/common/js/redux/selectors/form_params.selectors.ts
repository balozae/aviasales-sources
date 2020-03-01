import { AppState } from '../types/root/explosion'
import { createSelector } from 'reselect'
import { PlaceField, DateType } from 'form/components/avia_form/avia_form.types'
import { getPlace, getDate } from 'form/components/avia_form/utils'

export const getAviaFormParams = (state: AppState) => state.aviaParams

export const getActiveForm = (state: AppState) => state.pageHeader.activeForm

export const getAviaFormPlace = createSelector(
  (state: AppState, type: PlaceField) => type,
  getAviaFormParams,
  (type, params) => getPlace(params.segments, type),
)

export const getAviaFormDate = createSelector(
  (state: AppState, type: DateType) => type,
  getAviaFormParams,
  (type, params) => getDate(params.segments, type),
)
