import Axios from 'axios'
import { TicketsBadgesState } from 'common/js/redux/types/tickets_badges.types'
import rollbar from 'common/utils/rollbar'

const BADGES_ENDPOINT = '/search-api/badges'

const TicketsBadgesFetcher = (chunkId: string, searchId: string): Promise<TicketsBadgesState> => {
  return new Promise((resolve) => {
    Axios.get<TicketsBadgesState>(BADGES_ENDPOINT, {
      params: { chunk_id: chunkId, uuid: searchId },
    })
      .then(({ data }) => resolve(data))
      .catch((error) => rollbar.warn('Cant fetch ticket badges', error))
  })
}

export default TicketsBadgesFetcher
