const serpMetrics = require('analytics/metrics')
import FpsMeter from 'common/js/fps_meter'
import { REACH_GOAL, REACH_GOAL_ONCE, REACH_GOAL_ON_URL, SEND_TIMING } from '../types/metrics.types'
import Cookie from 'common/bindings/cookie'
import { UPDATE_SEARCH_STATUS } from '../types/search_status.types'
import { SearchStatus } from 'common/base_types'
import { UPDATE_SELECTED_SCHEDULE_TICKET } from '../types/selected_schedule_tickets.types'
const fpsMeter = FpsMeter()

const consoleMetrics: boolean = !!Cookie.get('console_metrics')

const r = (fn, event, data?, url?) => {
  if (consoleMetrics) {
    // tslint:disable-next-line:no-console
    console.log('EVENT:', { event, data }, url)
  }
  fn(event, data, url)
}

const reachGoal = (event, data) => {
  serpMetrics.reach_goal(event, { ...data })
}

export default (store) => (next: any) => (action: any) => {
  let sendReachMsg = true
  switch (action.type) {
    case REACH_GOAL:
      r(reachGoal, action.event, action.data)
      break
    case REACH_GOAL_ONCE:
      r(serpMetrics.reach_goal_once, action.event, { ...action.data })
      break
    case REACH_GOAL_ON_URL:
      r(serpMetrics.reach_goal_on_url, action.event, { ...action.data }, action.url)
      break
    case SEND_TIMING:
      r(serpMetrics.send_timing, action.event, action.data)
      break
    case 'SEND_FACEBOOK_PARAMS':
      r(serpMetrics.FBPixel.search, action.params)
      break
    case 'VIEW_FACEBOOK_CONTENT':
      r(serpMetrics.FBPixel.viewContent, action.ticketData, action.searchParams)
      break
    case 'INITIATE_FACEBOOK_CHECKOUT':
      serpMetrics.FBPixel.initiateCheckout(action.ticket, action.params, action.searchParams)
      break
    case UPDATE_SELECTED_SCHEDULE_TICKET:
      const eventData = {
        time: action.ticket[0].segments_time,
        price: action.ticket[1][0].unified_price,
      }
      r(reachGoal, 'schedule_ticket_click_time', eventData)
      break
    case 'GEOIP_ORIGIN_SUBSTITUTION':
      r(reachGoal, action.type, action.origin)
      break
    case UPDATE_SEARCH_STATUS: {
      switch (action.status) {
        case SearchStatus.Started:
          fpsMeter.start()
          break
        case SearchStatus.Finished:
          const { avg } = fpsMeter.finish()
          store.dispatch({ type: SEND_TIMING, event: 'search_results_fps', data: avg })
          break
        default:
          // do nothing
          break
      }
      break
    }
    default:
      sendReachMsg = false
      break
  }
  if (sendReachMsg) {
    // tslint:disable-next-line:no-console
    // console.info('reached', action)
  }
  return next(action)
}
