import store from 'common/js/redux/store'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'

export default (Component) ->
  Component::metricsSend = (prefix, changes, conversion) ->
    postfix = 'FILTER_CLICK'
    conversion or= (value) -> value
    if 'only' of changes
      store.dispatch(reachGoal([prefix, 'ONLY', postfix].join('_'), {value: conversion(changes.only)}))
    else if 'all' of changes
      store.dispatch(reachGoal([prefix, 'ALL', postfix].join('_'), {checked: changes.all}))
    else
      for key, value of changes
        store.dispatch(reachGoal([prefix, postfix].join('_'), {checked: value, value: conversion(key)}))
  Component
