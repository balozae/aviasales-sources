import React from 'react'
import clssnms from 'clssnms'
import VendorResources from 'vendor_resources'

const cn = clssnms('adfox-banner')

import './adfox_banner.scss'

declare global {
  interface Window {
    Ya?: {
      adfoxCode?: {
        createAdaptive: Function
      }
    }
  }
}

interface Props {
  onClick?: (data?: any) => void
  onRender?: (data?: any) => void
}

enum AdfoxAdaptiveKey {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'phone',
}

class AdfoxBanner extends React.PureComponent<Props> {
  private readonly RESOURCE_ID = 'adfox'
  private readonly OWNER_ID = 327101
  private readonly ADFOX_BANNERS_PARAMS = {
    [AdfoxAdaptiveKey.Desktop]: {
      containerId: 'adfox_15717453806773822',
      params: { pp: 'g', ps: 'dqer', p2: 'govw' },
    },

    [AdfoxAdaptiveKey.Tablet]: {
      containerId: 'adfox_1571745451105127',
      params: { pp: 'g', ps: 'dqer', p2: 'govx' },
    },

    [AdfoxAdaptiveKey.Mobile]: {
      containerId: 'adfox_157174550222496848',
      params: { pp: 'g', ps: 'dqer', p2: 'govy' },
    },
  }
  private blockIds: { [key in AdfoxAdaptiveKey]?: string } = {}

  constructor(props: Props) {
    super(props)

    VendorResources.loadScript('https://yastatic.net/pcode/adfox/loader.js', {
      id: this.RESOURCE_ID,
      crossorigin: 'anonymous',
    })
  }

  componentDidMount = async () => {
    await VendorResources.waitForResource(this.RESOURCE_ID)
    this.initBanner()
  }

  handleBannerRender = (data?: any) => {
    if (this.props.onRender) {
      this.props.onRender(data)
    }
  }

  initBanner = () => {
    if (window.Ya && window.Ya.adfoxCode) {
      Object.keys(this.ADFOX_BANNERS_PARAMS).forEach((key) => {
        const { containerId, params } = this.ADFOX_BANNERS_PARAMS[key]

        window.Ya!.adfoxCode!.createAdaptive(
          {
            ownerId: this.OWNER_ID,
            containerId,
            params,
            onLoad: (data?: any) => {
              this.blockIds[key] = data.bundleParams.blockId
            },
            onRender: () =>
              this.handleBannerRender({ responsive: key, blockId: this.blockIds[key] }),
          },
          [key],
          { tabletWidth: 1023, phoneWidth: 767, isAutoReloads: false },
        )
      })
    }
  }

  render() {
    return (
      <>
        {Object.keys(this.ADFOX_BANNERS_PARAMS).map((key) => (
          <div key={key} className={cn()} id={this.ADFOX_BANNERS_PARAMS[key].containerId} />
        ))}
      </>
    )
  }
}

export default AdfoxBanner
