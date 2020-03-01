import i18next from 'i18next'

// TODO Has to change dynamically
const locale = (document.documentElement.getAttribute('data-host') || 'RU').toLowerCase()

/**
 * Returns language matching
 * RevertMatching flag reverts value
 *
 * @param languages {Array<string> | string}
 * @param revertMatching {boolean}
 * @returns {boolean}
 */
export function isCurrentLanguage(
  languages: Array<string> | string,
  revertMatching: boolean = false,
): boolean {
  const languagesArr = Array.isArray(languages) ? languages : [languages]
  const isExists = languagesArr.indexOf(i18next.language) !== -1

  return revertMatching ? !isExists : isExists
}

/**
 * Returns locale matching
 * RevertMatching flag reverts value
 *
 * @param locales {Array<string> | string}
 * @param revertMatching {boolean}
 * @returns {boolean}
 */
export function isCurrentLocale(
  locales: Array<string> | string,
  revertMatching: boolean = false,
): boolean {
  const localesArr = Array.isArray(locales) ? locales : [locales]
  const isExists = localesArr.indexOf(locale) !== -1

  return revertMatching ? !isExists : isExists
}

/**
 * Transforms string to lower case when language is in then array
 *
 * @param languages {Array<string> | string}
 * @param str {string}
 * @param revertMatching {boolean}
 * @returns {string}
 */
export function toLowerCase(
  languages: Array<string> | string,
  str: string,
  revertMatching: boolean = false,
): string {
  if (isCurrentLanguage(languages, revertMatching)) {
    if (typeof str.toLowerCase === 'function') {
      return str.toLowerCase()
    }

    return str
  }

  return str
}

/**
 * Transforms dates to lower case
 *
 * @param str {string}
 * @returns {string}
 */
export function dateToLowerCase(str: string): string {
  return toLowerCase('en', str, true)
}

/**
 * Returns first day of week
 *
 * @returns {string}
 */
export function getWeekFirstDay(): number {
  return isCurrentLocale(['en', 'us', 'tz']) ? 0 : 1
}
