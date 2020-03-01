import React from 'react'
import clssnms from 'clssnms'
import cookies from 'oatmeal-cookie'
import axios from 'axios'
import Markerable from 'common/utils/markerable.coffee'
import { getDeviceOSType, getDeviceOSVersion } from './ad_mobile.utils'
import i18next from 'i18next'
import { fetchGeoIp } from 'common/utils/geo_ip'

import './ad_mobile.scss'

const cn = clssnms('ad-mobile')

export interface AdMobileProps {
  searchParams: any
  onAdNotRendered?: () => void
}

interface AdMobileState {
  bannerURL: string
}

class AdMobile extends React.Component<AdMobileProps, AdMobileState> {
  static API_URL = `https://mobile-ads.aviasales.ru/v1/search_results/suitable_campaign_search`

  state: AdMobileState = {
    bannerURL: '',
  }

  componentDidMount() {
    this.loadData()
  }

  handleAdNotRendered = () => {
    if (this.props.onAdNotRendered) {
      this.props.onAdNotRendered()
    }
  }

  getRequestData = async () => {
    const searchParams = this.props.searchParams || {}
    const deviceOSType = getDeviceOSType()
    const deviceOSVersion = getDeviceOSVersion(deviceOSType)
    const origins = await fetchGeoIp()
    const geoLocation = origins && origins[0] ? origins[0].iata : 'RU'

    const params = JSON.stringify({
      client_info: {
        app: 'pwa.aviasales',
        app_version: '1.0',
        app_id: 'pwa.aviasales',
        sdk: true,
        os: deviceOSType,
        os_version: deviceOSVersion,
        platform: 'phone',
        resolution: {
          height: window.screen.height,
          width: window.screen.width,
        },
        token: cookies.get('auid'), // NOTE: pass 'CkIGrFmzxDskN0LWMF4IAg==' as token value for dev testing
        segments: searchParams.segments,
        passengers: searchParams.passengers,
        trip_class: searchParams.tripClass,
        currency: searchParams.currency,
        lang: i18next.language,
        marker: Markerable.marker(),
        geo_location: geoLocation,
        host: window.location.host,
      },
      emplacement: 'search_results',
    })

    return params
  }

  async loadData() {
    try {
      const requestData = await this.getRequestData()
      const { data } = await axios.post(AdMobile.API_URL, requestData, {
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
      })

      if (data != null && data.url) {
        this.setState({
          bannerURL: data.url,
        })
      } else {
        this.handleAdNotRendered()
      }
    } catch (e) {
      this.handleAdNotRendered()
    }
  }

  render() {
    if (!this.state.bannerURL) {
      return null
    }

    return (
      <div className={cn()}>
        <iframe src={this.state.bannerURL} frameBorder={0} className={cn('container')} />
      </div>
    )
  }
}

export default AdMobile
