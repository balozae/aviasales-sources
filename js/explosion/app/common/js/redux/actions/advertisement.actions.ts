import {
  AdvertisementActions,
  SET_NEXT_ADVERTISEMENT,
  RESET_ADVERTISEMENT,
} from '../types/advertisement.types'

export const setNextAdvertisement = (index: string): AdvertisementActions => ({
  type: SET_NEXT_ADVERTISEMENT,
  index,
})

export const resetAdvertisement = (): AdvertisementActions => ({ type: RESET_ADVERTISEMENT })
