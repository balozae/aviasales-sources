// tslint:disable-next-line:max-line-length
const shortUrlRegex = /([a-z\u0430-\u044F]{3})(\d{4})([a-z\u0430-\u044F]{3})(\d{4}|-)?(?:([a-z\u0430-\u044F]{3})(\d{4}|-)?)?(?:([a-z\u0430-\u044F]{3})(\d{4}|-)?)?(?:([a-z\u0430-\u044F]{3})(\d{4}|-)?)?(?:([a-z\u0430-\u044F]{3})(\d{4}|-)?)?(?:([a-z\u0430-\u044F]{3})(\d{4})?)?(b|f|y|c|w)?(\d)(\d)?(\d)?/i

export const getUrlAction = (url: string) =>
  url.replace(new RegExp('(/|)' + shortUrlRegex.source, 'i'), '')

export default shortUrlRegex
