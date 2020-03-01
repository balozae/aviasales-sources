import { takeEvery, put, call, select } from '@redux-saga/core/effects'
import {
  TICKET_SHARE,
  TicketShareAction,
  TICKET_SHARE_TOOLTIP_SHOWN,
  TICKET_URL_COPY,
  TicketUrlCopyAction,
  TicketShareTooltipShownAction,
} from '../../types/ticket.types'
import { reachGoal } from '../../actions/metrics.actions'
import { createShortUrl } from 'common/js/ticket_url_creator'
import { addTicketShortUrl } from '../../actions/ticket_short_urls.actions'
import { AppState } from '../../types/root/explosion'
import { getTicketShortUrl } from '../../selectors/ticket_short_urls.selectors'
import { getTicketUrl } from '../../selectors/ticket.selectors'

export function* ticketShare() {
  yield takeEvery(TICKET_SHARE, function*({ network, ticketIndex }: TicketShareAction) {
    yield put(reachGoal('SOCIAL_SHARE_TICKET', { network, ticket_index: ticketIndex }))
  })
}

export function* ticketShareTooltipShown() {
  yield takeEvery(TICKET_SHARE_TOOLTIP_SHOWN, function*({ ticket }: TicketShareTooltipShownAction) {
    yield put(reachGoal('SHOW_SOCIAL_SHARE_TICKET'))
    const { sign } = ticket[0]
    const prevShortUrl = yield select((state: AppState) => getTicketShortUrl(state, ticket))
    if (!prevShortUrl) {
      const ticketUrl = yield select((state: AppState) => getTicketUrl(state, ticket))
      const shortUrl = yield call(createShortUrl, { url: ticketUrl, title: ticketUrl })
      if (shortUrl && typeof shortUrl === 'string') {
        yield put(addTicketShortUrl(sign, shortUrl))
      }
    }
  })
}

export function* ticketUrlCopy() {
  yield takeEvery(TICKET_URL_COPY, function*({ isCopyCommandSupported }: TicketUrlCopyAction) {
    const metricsName = isCopyCommandSupported
      ? 'SOCIAL_SHARE_SUPPORTED_BROWSER_CLICK'
      : 'EXPANSOCIAL_SHARE_UNSUPPORTED_BROWSER_CLICKD_TICKET'
    yield put(reachGoal(metricsName))
  })
}
