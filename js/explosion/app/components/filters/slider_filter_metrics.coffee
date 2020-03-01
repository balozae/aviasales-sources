import store from 'common/js/redux/store'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'

export default (Component) ->
  Component::metricsSend = (prefix, value) ->
    store.dispatch(reachGoal("#{prefix}_FILTER_CLICK", value: value))
  Component
