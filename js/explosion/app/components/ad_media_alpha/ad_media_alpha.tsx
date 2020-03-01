import React from 'react'
import { connect } from 'react-redux'
import './ad_media_alpha.scss'
import i18next from 'i18next'
import flagr from 'common/utils/flagr_client_instance'

// https://travel-exchange.mediaalpha.com/help/hotel-lead-representation.html
type HotelLeadRepresentation = Object

declare global {
  interface Window {
    MediaAlphaExchange: HotelLeadRepresentation
    MediaAlphaExchange__load: (placeholderId: string) => void
  }
}

// NOTE: These are default placements' IDs for RU market.
// All placement's IDs are stored at Flagr
// http://flagr.production.k8s.int.avs.io/#/flags/27
export const AD_MA_PLACEMENTS = {
  bottom_inline: {
    placement_id: 'OBe5C8wHCfcjJTk9O4IiFkV6sp5TuA',
  },
  extra_content: {
    placement_id: 'FOt1zTFxS_zUy909UUTLkkeHm0tX7w',
  },
  preroll: {
    placement_id: '4GCVL0uQwS-2gFsxmOR2aF0iriLw5Q',
  },
  product_3: {
    placement_id: '4i6eQ1CeaSyzqdYoXSUbx1z-TC7NsQ',
  },
}

interface AdData {
  destination: string
  check_in_date: string
  check_out_date: string | null
  num_adults: number
  num_children: number
}

interface OwnProps {
  placement: keyof typeof AD_MA_PLACEMENTS
  onAdNotRendered?: () => void
}

interface StateProps {
  data: AdData
}

type Props = OwnProps & StateProps

class AdMediaAlpha extends React.PureComponent<Props> {
  static scriptLoadPromise: Promise<void>

  loadScript = () => {
    if (!AdMediaAlpha.scriptLoadPromise) {
      AdMediaAlpha.scriptLoadPromise = new Promise((resolve) => {
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://travel.mediaalpha.com/js/serve.js'
        // script.src = 'https://travel-test.mediaalpha.com/js/serve.js'
        document.body.appendChild(script)
        script.onload = () => resolve()
      })
    }
    return AdMediaAlpha.scriptLoadPromise
  }

  loadAd = async () => {
    await this.loadScript()

    const { check_in_date, check_out_date, num_adults, num_children, destination } = this.props.data
    const placements = flagr.get('avs-feat-mediaAlphaPlacementsIds') as typeof AD_MA_PLACEMENTS

    if (placements[this.props.placement]) {
      window.MediaAlphaExchange = {
        data: {
          check_in_date,
          check_out_date,
          destination,
          rooms: [
            {
              num_adults,
              num_children,
            },
          ],
        },
        locale: i18next.language,
        type: 'ad_unit',
        version: '17',
        placement_id: placements[this.props.placement].placement_id,
        _design_conf: placements,
      }

      if (!window.MediaAlphaExchange__load) {
        if (this.props.onAdNotRendered) {
          this.props.onAdNotRendered()
        }
      } else {
        window.MediaAlphaExchange__load(this.props.placement)
      }
    } else {
      console.warn('Placement can be only one of the following:', Object.keys(placements))
    }
  }

  componentDidMount() {
    if (flagr.is('avs-feat-mediaAlpha')) {
      this.loadAd()
    } else {
      if (this.props.onAdNotRendered) {
        this.props.onAdNotRendered()
      }
    }
  }

  render() {
    if (!flagr.is('avs-feat-mediaAlpha')) {
      return null
    }

    return <div id={this.props.placement} className="ad-ma" />
  }
}

const mapStateToProps = ({ searchParams }) => ({
  data: {
    num_adults: searchParams.passengers.adults,
    num_children: searchParams.passengers.children,
    destination: searchParams.segments[0].destination,
    check_in_date: searchParams.segments[0].date,
    check_out_date: searchParams.segments.length > 1 ? searchParams.segments[1].date : null,
  } as AdData,
})

export default connect<StateProps>(mapStateToProps)(AdMediaAlpha)
