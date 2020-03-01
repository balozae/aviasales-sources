import { Place, PlaceField, Segment, PlaceType } from 'form/components/avia_form/avia_form.types'
import { getPlace, isEmptyPlace, updateSegmentPlace } from 'form/components/avia_form/utils'
import rollbar from 'common/utils/rollbar'
import { fetchGeoIp } from 'common/utils/geo_ip'
import { NAVBAR_WITH_OFFSET_HEIGHT, FORM_FIELDS_HEIGHT } from './constants'

export const setGeoipOrigin = async (
  locale: string,
  segments: ReadonlyArray<Segment>,
): Promise<ReadonlyArray<Segment> | undefined> => {
  const origin = getPlace(segments, PlaceField.Origin)
  if (!isEmptyPlace(origin)) {
    return
  }
  const origins = await fetchGeoIp(locale)
  if (origins && origins.length) {
    const geoipOrigin = { ...origins[0], type: PlaceType.City } as Place
    return updateSegmentPlace(PlaceField.Origin, geoipOrigin, segments)
  }
  return
}

export const getPossibleParams = (segments: ReadonlyArray<Segment> = []) => {
  const element = document.querySelector('[data-destination-cities]')
  if (!element) {
    return {}
  }
  try {
    const data = element.getAttribute('data-destination-cities')!
    const destinations: ReadonlyArray<Place> = JSON.parse(data).map(({ city_name: name, iata }) => {
      return { iata, name, type: PlaceType.City, cityIata: iata } as Place
    })
    const origin = getPlace(segments, PlaceField.Origin)
    const destination = destinations[0].iata === origin.iata ? destinations[1] : destinations[0]
    if (!destination) {
      return {}
    }

    return {
      segments: updateSegmentPlace(PlaceField.Destination, destination, segments),
    }
  } catch (error) {
    rollbar.warn('JSON.parse error in getPossibleParams', error)
  }
  return {}
}

export const scrollTripDurationPickerIntoView = (
  tripDurationEl: HTMLDivElement,
  formEl: HTMLFormElement,
) => {
  const rect = tripDurationEl.getBoundingClientRect()

  // Do not scroll if daypicker is fully in viewport
  if (rect.top > 0 && rect.bottom < window.innerHeight) {
    return
  }

  // Scroll to form if viewport doesn't fit full daypicker
  if (rect.height > window.innerHeight - NAVBAR_WITH_OFFSET_HEIGHT - FORM_FIELDS_HEIGHT) {
    const formOffset = formEl.getBoundingClientRect().top + window.pageYOffset
    return window.scrollTo({
      top: formOffset - NAVBAR_WITH_OFFSET_HEIGHT,
      behavior: 'smooth',
    })
  }

  // Daypicker in the bottom of viewport if viewport fits full daypicker
  let scrollPosition =
    rect.top + document.documentElement.scrollTop - (window.innerHeight - rect.height) + 10

  window.scrollTo({ top: scrollPosition, behavior: 'smooth' })
}
