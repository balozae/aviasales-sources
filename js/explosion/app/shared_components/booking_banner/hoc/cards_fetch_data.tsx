import React from 'react'
import { stringify } from 'query-string'
import { format } from 'finity-js'
import axios from 'axios'
import {
  CardsFetchDataInputProp,
  CardsFetchDataOutputProps,
  CardsFetchDataState,
} from './cards_fetch_data.types'
import i18next from 'i18next'

export default function<ComponentProps extends object>(
  Component: React.ComponentType<ComponentProps>,
) {
  return class CardsFetchData extends React.PureComponent<
    CardsFetchDataInputProp &
      Pick<ComponentProps, Exclude<keyof ComponentProps, keyof CardsFetchDataOutputProps>>,
    CardsFetchDataState
  > {
    state: CardsFetchDataState = {
      cards: null,
      prevSearchUrl: null,
      locationName: null,
      currencies: {},
    }

    private isLoading = false

    get dateFrom() {
      return this.props.dateFrom instanceof Date
        ? format(this.props.dateFrom, 'YYYY-MM-DD')
        : this.props.dateFrom
    }

    get dateTo() {
      return this.props.dateTo && this.props.dateTo instanceof Date
        ? format(this.props.dateTo, 'YYYY-MM-DD')
        : this.props.dateTo
    }

    componentDidMount(): void {
      this.loadData()
      this.loadCurrenciesRate()
    }

    componentDidUpdate() {
      if (
        !this.isLoading &&
        this.state.prevSearchUrl &&
        this.state.prevSearchUrl !== this.getUrl()
      ) {
        this.loadData()
      }
    }

    getUrl() {
      const API_URL = `https://api-web.hotellook.com/best_hotels/get`
      const params = stringify({
        iata: this.props.iata,
        date_from: this.dateFrom,
        date_to: this.dateTo,
        adults: this.props.adults || 1,
        children: this.props.children || 0,
        infants: this.props.infants || 0,
        photo_width: 230 * 2, // 2x for
        photo_height: 150 * 2, // r e t i n a
        channel: 'as_web',
        min_count: 2,
        max_count: 2,
        locale: i18next.language,
      })

      return `${API_URL}?${params}`
    }

    async loadCurrenciesRate() {
      try {
        const { data } = await axios.get('/currency.json')
        this.setState({ currencies: data })
      } catch (e) {
        //
      }
    }

    async loadData() {
      try {
        this.isLoading = true
        const searchUrl = this.getUrl()
        const { data } = await axios.get(searchUrl)
        const cards = data.best_hotels.slice(0, this.props.hotelsCount || 3).map((hotel) => ({
          id: hotel.id,
          image: hotel.photo_url,
          rating: hotel.rating,
          price: hotel.price_from,
          title: hotel.name,
          stars: hotel.stars,
        }))

        this.setState({
          cards: cards,
          prevSearchUrl: searchUrl,
          locationName: data.location_name,
        })
      } catch (e) {
        //
      } finally {
        this.isLoading = false
      }
    }

    getCurrencyRate() {
      return this.state.currencies[this.props.currency]
    }
    render() {
      if (!this.state.cards) {
        return null
      }
      const currencyRate = this.getCurrencyRate()
      const spreadProps = {
        ...this.props,
        cards: this.state.cards || [],
        currency: this.props.currency || 'rub',
        currencyRate: currencyRate ? currencyRate : 1,
        locationName: this.state.locationName,
      } as ComponentProps & CardsFetchDataOutputProps & CardsFetchDataInputProp

      return <Component {...spreadProps} />
    }
  }
}
