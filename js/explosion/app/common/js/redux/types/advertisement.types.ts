export const SET_NEXT_ADVERTISEMENT = 'SET_NEXT_ADVERTISEMENT'
export const RESET_ADVERTISEMENT = 'RESET_ADVERTISEMENT'

interface SetNextAdvertisementAction {
  type: typeof SET_NEXT_ADVERTISEMENT
  index: string
}

interface ResetAdvertisementAction {
  type: typeof RESET_ADVERTISEMENT
}

export type AdvertisementActions = SetNextAdvertisementAction | ResetAdvertisementAction

export type AdvertisementState = {
  type: string
  placement?: string
  id?: string
  size?: number[] | number[][]
  metricsName?: string
  zoneid?: number
}
