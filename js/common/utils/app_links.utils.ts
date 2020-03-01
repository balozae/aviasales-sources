import flagr from './flagr_client_instance'
import { stringify } from 'querystring'
const markerHelper = require('explosion/app/common/js/marker.coffee')

export function getLink(type: 'ios' | 'android', extra: { [key: string]: any } = {}): string {
  const linkEntity = flagr.get('avs-feat-appLinks')[type]
  const marker = markerHelper.get()
  const basic = marker
    ? {
        af_sub1: `${marker}`,
      }
    : {}

  const params = stringify(Object.assign({}, linkEntity.params, basic, extra))

  return `${linkEntity.host}?${params}`
}

export default {}
