import Resizer from 'shared_components/resizer'
import throttle from 'utils/throttle.coffee'

interface Classes {
  stickyHeader: string
  hideHeader: string
  hideMultiway: string
  stickyOff: string
  stickyTabs: string
}

interface Params {
  classes?: Classes
  showExplosion: boolean
  tabsRef?: React.RefObject<HTMLDivElement>
  onStickyHeaderChange?: (isSticky: boolean) => void
  onStickyTabsChange?: (isSticky: boolean) => void
}

const DEFAULT_CLASSES: Classes = {
  stickyHeader: 'is-sticky-header',
  stickyOff: '--sticky-off',
  hideHeader: '--hide-header',
  hideMultiway: '--hide-multiway',
  stickyTabs: 'is-sticky',
}

const HEADER_STICKY_HEIGHT = 50
const STICKY_TABS_MARGIN = -40

export default class ScrollListener {
  classes: Classes = DEFAULT_CLASSES
  scrollTimeout: number
  lastScrollY: number = 0
  isShowHeader: boolean = true
  isShowMultiway: boolean = true
  showExplosion: boolean = false
  isStickyHeader: boolean = false
  isStickyTabs: boolean = false
  params: Params

  setStickyTabs = throttle(() => {
    if (this.params.tabsRef && this.params.tabsRef.current && this.params.onStickyTabsChange) {
      if (this.params.tabsRef.current.getBoundingClientRect().top <= STICKY_TABS_MARGIN) {
        if (!this.isStickyTabs && this.params.onStickyTabsChange) {
          document.body.classList.add(this.classes.stickyTabs)
          this.params.onStickyTabsChange(true)
        }
        this.isStickyTabs = true
      } else {
        if (this.isStickyTabs && this.params.onStickyTabsChange) {
          document.body.classList.remove(this.classes.stickyTabs)
          this.params.onStickyTabsChange(false)
        }
        this.isStickyTabs = false
      }
    }
  }, 100)

  constructor(params: Params) {
    this.updateParams(params)
    this.params = params
    window.addEventListener('scroll', this.handleScroll)
  }

  unsubscribe() {
    window.removeEventListener('scroll', this.handleScroll)
    window.cancelAnimationFrame(this.scrollTimeout)
    document.body.classList.remove(this.classes.hideHeader)
    document.body.classList.remove(this.classes.hideMultiway)
  }

  updateParams(params: Partial<Params>) {
    const classes = params.classes ? params.classes : {}
    this.classes = { ...DEFAULT_CLASSES, ...classes }
    if (params.showExplosion !== undefined) {
      this.showExplosion = params.showExplosion
    }
  }

  private handleScroll = (event: Event) => {
    this.setStickyTabs()
    if (!this.showExplosion) {
      return
    }
    if (Resizer.matches('tablet, desktop')) {
      const scrollY = window.scrollY || window.pageYOffset
      if (scrollY > HEADER_STICKY_HEIGHT) {
        document.body.classList.add(this.classes.stickyHeader)
        if (!this.isStickyHeader && this.params.onStickyHeaderChange) {
          this.params.onStickyHeaderChange(true)
        }
        this.isStickyHeader = true
      } else {
        document.body.classList.remove(this.classes.stickyHeader)
        if (this.isStickyHeader && this.params.onStickyHeaderChange) {
          this.params.onStickyHeaderChange(false)
        }
        this.isStickyHeader = false
      }
    }
    window.cancelAnimationFrame(this.scrollTimeout)
    return (this.scrollTimeout = window.requestAnimationFrame(() => {
      let isDownScrolling
      if (
        this.lastScrollY === window.pageYOffset ||
        Math.abs(window.pageYOffset - this.lastScrollY) < 30
      ) {
        return
      } else if (this.lastScrollY < window.pageYOffset) {
        isDownScrolling = true
      } else {
        isDownScrolling = false
      }
      let isShowHeader = true
      let isShowMultiway = false
      if (window.pageYOffset > 0 && isDownScrolling) {
        isShowHeader = false
      }
      if (window.pageYOffset < 100) {
        isShowMultiway = true
      }
      if (this.isShowHeader !== isShowHeader) {
        this.isShowHeader = isShowHeader
        if (!isShowHeader) {
          document.body.classList.add(this.classes.hideHeader)
        } else {
          document.body.classList.remove(this.classes.hideHeader)
        }
      }
      if (this.isShowMultiway !== isShowMultiway) {
        this.isShowMultiway = isShowMultiway
        if (isShowMultiway) {
          document.body.classList.remove(this.classes.hideMultiway)
        } else {
          document.body.classList.add(this.classes.hideMultiway)
        }
      }
      return (this.lastScrollY = window.pageYOffset)
    }))
  }
}
