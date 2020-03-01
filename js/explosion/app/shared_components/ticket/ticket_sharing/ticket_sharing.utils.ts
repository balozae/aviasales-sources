interface ShareParams {
  url: string
  text: string
}

type SharingFunc = (params: ShareParams, callback?: () => void) => void

const facebook: SharingFunc = (params, callback) => {
  const encodedUrl = encodeURIComponent(params.url)

  share(`http://www.facebook.com/sharer.php?u=${encodedUrl}`, callback)
}

const twitter: SharingFunc = (params, callback) => {
  const encodedUrl = encodeURIComponent(params.url)
  const encodedText = encodeURIComponent(params.text)

  share(`http://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, callback)
}

const vk: SharingFunc = (params, callback) => {
  const encodedUrl = encodeURIComponent(params.url)

  share(`http://vkontakte.ru/share.php?url=${encodedUrl}`, callback)
}

const telegram: SharingFunc = (params, callback) => {
  const encodedUrl = encodeURIComponent(params.url)
  const encodedText = encodeURIComponent(params.text)

  share(`https://telegram.me/share/url?url=${encodedUrl}&text=${encodedText}`, callback)
}

const share = (url: string, callback?: () => void) => {
  const windowEl = window.open(url, '_blank', 'width=740,height=440')

  const interval = setInterval(() => {
    if (windowEl && windowEl.closed) {
      clearInterval(interval)
      if (callback) {
        callback()
      }
    }
  }, 500)
}

export enum TicketSharingsSocials {
  Vk = 'vk',
  Facebook = 'facebook',
  Twitter = 'twitter',
  Telegram = 'telegram',
}

const sharings = {
  facebook,
  twitter,
  vk,
  telegram,
}

export default sharings
