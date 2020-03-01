export const getTopLevelDomain = () => {
  const arr = window.location.hostname.split('.')
  // NOTE: example co.tz or ru
  const tld = arr.length > 3 ? arr.slice(-2).join('.') : arr[arr.length - 1]
  return tld
}

export const getDomainName = () => {
  const arr = window.location.hostname.split('.')
  // NOTE: example aviasales.co.tz or aviasales.ru
  const name = arr.length > 3 ? arr.slice(-3).join('.') : arr.slice(-2).join('.')
  return name
}
