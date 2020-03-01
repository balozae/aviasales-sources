import { DeviceOSTypes } from './ad_mobile.types'

const osTypeToVersionRegexMap = {
  [DeviceOSTypes.WindowsPhone]: /Windows\sPhone\s(.*?)\;/i,
  [DeviceOSTypes.IOS]: /OS\s([0-9]\_[0-9])/i,
  [DeviceOSTypes.Android]: /Android\s(.*?)\;/i,
}

export const getDeviceOSType = (): string => {
  if (/(Windows Phone|iemobile|WPDesktop)/i.test(navigator.userAgent)) {
    return DeviceOSTypes.WindowsPhone
  }

  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    return DeviceOSTypes.IOS
  }

  if (/android/i.test(navigator.userAgent)) {
    return DeviceOSTypes.Android
  }

  return 'unknown-os'
}

export const getDeviceOSVersion = (osType): string => {
  const regex = osTypeToVersionRegexMap[osType]

  if (regex && navigator.userAgent.match(regex) != null) {
    return navigator.userAgent.match(regex)![1]
  }

  return '7.1' // NOTE: don't know why exactly this version, just copied from PWA
}
