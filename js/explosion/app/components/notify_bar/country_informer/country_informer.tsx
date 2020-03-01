import * as React from 'react'
import GoalKeeper from 'common/bindings/goalkeeper'
import { CountryInformerParams } from './country_informer.types'
import Notify, { cn } from '../notify'
import { NotifyColorType } from '../notify.types'
import { getCountryInformerPath, setCountryInformerState } from './country_informer.utils'

type CountryInformerProps = CountryInformerParams & {
  source: string
  onClose: () => void
}

export default class CountryInformer extends React.Component<CountryInformerProps> {
  path: string
  symbol: string
  query: string

  constructor(props: CountryInformerProps) {
    super(props)

    let query = location.search.replace(/(\?|&)from=(\w{2})/, '')
    if (query.length > 0 && query[0] === '&') {
      query = `?${query.slice(1)}`
    }

    this.query = query
    this.symbol = query.indexOf('?') !== -1 ? '&' : '?'
    this.path = getCountryInformerPath(this.props.links[this.props.source])
  }

  componentDidMount() {
    GoalKeeper.triggerEvent('country_informer', 'div', 'shown', {
      host: this.props.host,
      source: this.props.source,
    })
    setCountryInformerState({
      [this.props.host]: {
        [this.props.source]: true,
      },
    })
  }

  handleInformerClose = () => {
    // clean document cookie for CountryInformer
    document.cookie = 'from=; Max-Age=0'

    GoalKeeper.triggerEvent('country_informer', 'close', 'click', {
      host: this.props.host,
      source: this.props.source,
    })
    setCountryInformerState({
      [this.props.host]: {
        [this.props.source]: false,
      },
    })
    this.props.onClose()
  }

  render() {
    const { back, host, text, source } = this.props

    return (
      <Notify
        onClose={this.handleInformerClose}
        colorType={NotifyColorType.White}
        modifiers={['--country-informer']}
      >
        <div className={cn('flag-icon', ['flag', `--${host}`])} />
        <div className={cn('text')}>{text}</div>
        <a className={cn('button')} href={`${this.path}${this.query}${this.symbol}back=true`}>
          {back[source]}
        </a>
      </Notify>
    )
  }
}
