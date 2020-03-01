import React from 'react'
import bannersInitializer from './banners_initializer'
import VendorResources from 'vendor_resources'

interface IAdsenseMainBannerSequence {
  id: string
  'data-slot': string
  'data-zoneid': string
  'data-size': string
  'data-fallback': string
}

interface Props {
  onClick?: (data?: any) => void
  onRender?: (data?: any) => void
}

interface RenderEventData {
  isEmpty: boolean
  isFallback: boolean
  slotId: string
  unitPath: string
}

declare global {
  interface Window {
    ADSENSE_MAIN_BANNER_SEQUENCE: IAdsenseMainBannerSequence[]
  }
}

const { ADSENSE_MAIN_BANNER_SEQUENCE } = window

class AdsenseBanner extends React.Component<Props> {
  renderedBanner?: RenderEventData

  componentDidMount = async () => {
    await VendorResources.waitForResource('googletagservices')
    this.bannersInitHandler()
  }

  shouldComponentUpdate() {
    return false
  }

  bannersInitHandler = () => bannersInitializer(this.handleBannerRendered)

  handleBannerRendered = (data: RenderEventData) => {
    if (!data.isEmpty) {
      this.renderedBanner = data
    }

    if (this.props.onRender) {
      this.props.onRender(data)
    }
  }

  handleBannerClick = () => {
    if (this.renderedBanner && this.props.onClick) {
      this.props.onClick(this.renderedBanner)
    }
  }

  render() {
    return (
      <div className="adsense-banners --main-block" onClick={this.handleBannerClick}>
        {ADSENSE_MAIN_BANNER_SEQUENCE &&
          ADSENSE_MAIN_BANNER_SEQUENCE.map((banner) => <div key={banner.id} {...banner} />)}
      </div>
    )
  }
}

export default AdsenseBanner
