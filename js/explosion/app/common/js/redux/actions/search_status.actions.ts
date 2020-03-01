import { SearchStatus } from 'common/base_types'
import { UPDATE_SEARCH_STATUS } from '../types/search_status.types'

export const updateSearchStatus = (status: SearchStatus) => ({
  type: UPDATE_SEARCH_STATUS,
  status,
})
