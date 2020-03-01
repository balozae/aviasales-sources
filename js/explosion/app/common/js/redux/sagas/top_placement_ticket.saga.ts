import { fork, takeEvery, select, put } from '@redux-saga/core/effects'
import {
  TOP_PLACEMENT_TICKET_CLICK,
  TopPlacementTicketClickAction,
  TOP_PLACEMENT_TICKET_SHOWN,
} from '../types/top_placement_ticket.types'
import { getSearchStatus } from '../selectors/search.selectors'
import { SearchStatus } from 'shared_components/ticket/ticket.types'
import { restartSearch } from '../actions/start_search/start_search.actions'
import {
  getTopPlacementTicket,
  getHeaviestTopPlacementCampaign,
  getTopPlacementMetricsData,
} from '../selectors/ad_top_placement.selectors'
import { reachGoal } from '../actions/metrics.actions'
import { getDeeplinkFn } from '../selectors/deeplink.selectors'
import { AppState } from '../types/root/explosion'
import {
  TopPlacementTicket,
  TopPlacementCampaign,
} from 'components/ad_top_placement/ad_top_placement.types'
import { setIsTopPlacementShown } from '../actions/is_top_placement_shown.actions'

function* topPlacementTicketClick() {
  yield takeEvery(TOP_PLACEMENT_TICKET_CLICK, function*(action: TopPlacementTicketClickAction) {
    const searchStatus = yield select(getSearchStatus)
    if (searchStatus === SearchStatus.Expired) {
      // @ts-ignore
      yield put(restartSearch())
      return false
    }
    const topPlacementTicket: TopPlacementTicket = yield select(getTopPlacementTicket)
    const heaviestTopPlacementCampaign: TopPlacementCampaign = yield select(
      getHeaviestTopPlacementCampaign,
    )
    const proposal = topPlacementTicket.ticket_info[1][0]
    const metricsData = yield select(getTopPlacementMetricsData)
    yield put(reachGoal('TOP_PLACEMENT_CLICK', metricsData))
    const buildDeeplink: ReturnType<typeof getDeeplinkFn> = yield select((state: AppState) =>
      getDeeplinkFn(state, topPlacementTicket.ticket_info[0], heaviestTopPlacementCampaign.data),
    )
    const win = window.open(buildDeeplink(proposal), '_blank')
    if (win) {
      win.focus()
    }
  })
}

function* topPlacementTicketShown() {
  yield takeEvery(TOP_PLACEMENT_TICKET_SHOWN, function*() {
    yield put(setIsTopPlacementShown())
    const heaviestTopPlacementCampaign = yield select(getHeaviestTopPlacementCampaign)
    if (heaviestTopPlacementCampaign.data.pixel_adriver) {
      const img = new Image()
      let url = heaviestTopPlacementCampaign.data.pixel_adriver
      url.replace('http://', 'https://')
      url = url.replace('%rnd%', Math.floor(Math.random() * 1000000000).toString())
      img.setAttribute('src', url)
    }
    const metricsData = yield select(getTopPlacementMetricsData)
    yield put(reachGoal('TOP_PLACEMENT_SHOW', metricsData))
  })
}

export default function* topPlacementTicketSaga() {
  yield fork(topPlacementTicketClick)
  yield fork(topPlacementTicketShown)
}
