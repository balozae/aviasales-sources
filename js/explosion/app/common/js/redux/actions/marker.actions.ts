import { UPDATE_MARKER, MarkerActionTypes } from '../types/marker.types'

export const updateMarker = (): MarkerActionTypes => ({
  type: UPDATE_MARKER,
})
