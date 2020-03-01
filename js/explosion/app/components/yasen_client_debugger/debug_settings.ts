import cookies from 'oatmeal-cookie'
import localStorageHelper from 'common/bindings/local_storage_helper'

const SECONDS_IN_MONTH = 60 * 60 * 24 * 30

const SETTING_COOKIE_MAP = {
  yasenCache: 'yasen_cache',
  yasenDebug: 'yasen_debug',
}
const SETTING_OPTIONS = [
  'yasenCache',
  'yasenDebug',
  'debugMetrics',
  'debugUrl',
  'debugBags',
  'turnOffAnnoyingPopups',
  'turnOffPrerollTimeout',
]

function getDebugSettingFromClient(name: string) {
  const value = Object.keys(SETTING_COOKIE_MAP).includes(name)
    ? cookies.get(SETTING_COOKIE_MAP[name])
    : localStorageHelper.getItem(name)
  return Boolean(value)
}

export function getDebugSettingsFromClient() {
  const settings = {}
  for (let setting of SETTING_OPTIONS) {
    settings[setting] = getDebugSettingFromClient(setting)
  }
  return settings
}

export function setDebugSettingToClient(name: string, value: string) {
  if (Object.keys(SETTING_COOKIE_MAP).includes(name)) {
    const cookieName = SETTING_COOKIE_MAP[name]
    if (value) {
      cookies.set(cookieName, true, { expires: SECONDS_IN_MONTH, path: '/' })
    } else {
      cookies.expire(cookieName, { path: '/' })
    }
  } else {
    if (value) {
      localStorageHelper.setItem(name, true)
    } else {
      localStorageHelper.removeItem(name)
    }
  }
}

export default {}
