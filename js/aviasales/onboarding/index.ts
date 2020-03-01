import Cookie from 'oatmeal-cookie'
import './onboarding.scss'

const ONBOARDING_COOKIE_NAME = 'is-onboarding-shown'

const documentElement = document.documentElement
const isOnboardingFoldable = documentElement && !documentElement.classList.contains('--en')

const OnboardingCookie = {
  get: () => !!Cookie.get(ONBOARDING_COOKIE_NAME),
  set: () =>
    Cookie.set(ONBOARDING_COOKIE_NAME, true, {
      expires: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    }),
}
const onFirstIntersection = (container: HTMLElement, cb: () => void) => {
  new IntersectionObserver(
    ([entry], observer) => {
      if (entry && entry.isIntersecting && entry.intersectionRatio > 0.5) {
        cb()
        observer.unobserve(container)
      }
    },
    {
      threshold: 0.5,
    },
  ).observe(container)
}

export default (container: HTMLElement) => {
  const isOnboardingShown = OnboardingCookie.get()

  container.classList.toggle('--minimized', isOnboardingShown)

  if (isOnboardingShown) {
    const opener = container.querySelector('.onboarding__inner')
    if (opener) {
      opener.addEventListener('click', () => {
        container.classList.toggle('--minimized', !isOnboardingShown)
        OnboardingCookie.set()
      })
    }
  } else if (isOnboardingFoldable) {
    onFirstIntersection(container, () => {
      OnboardingCookie.set()
    })
  }
}
