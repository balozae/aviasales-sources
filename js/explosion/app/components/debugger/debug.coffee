import dispatcher from 'dispatcher'
import reduce from 'lodash/reduce'
import { UNSAFE_sendTiming } from 'common/js/redux/actions/DEPRECATED_metrics.actions'

DUMP_METRICS_TIMEOUT = 15000
log_info = {}

dispatcher.on('benchmark_info', (event, {func, time}) ->
  log_info["function_#{func}"] or= []
  log_info["function_#{func}"].push(time)
)

setInterval(->
  for k, v of log_info
    UNSAFE_sendTiming(k, reduce(v, ((a, m, i, p) -> a + m / p.length), 0))
  log_info = {}
, DUMP_METRICS_TIMEOUT)

export default ->
  # set timeout bacause domContentLoadedEventEnd is not reachable on DOMContentLoaded event
  setTimeout(->
    if window.performance?.timing
      timing = window.performance.timing
      groups =
        'Connection': [timing.connectEnd - timing.connectStart]
        'Response': [timing.responseEnd - timing.responseStart]
        'Domain Lookup': [timing.domainLookupEnd - timing.domainLookupStart]
        'Load Event': [timing.loadEventEnd - timing.loadEventStart]
        'Unload Event': [timing.unloadEventEnd - timing.unloadEventStart]
        'DOMContentLoaded Event':  [timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart]
      log_info[k] = v for k, v of groups
  , 1000)
