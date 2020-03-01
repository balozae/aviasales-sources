import React, { MouseEventHandler } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { withTranslation, Trans, WithTranslation } from 'react-i18next'
import cookie from 'oatmeal-cookie'
import clssnms from 'clssnms'
import Tooltip from 'components/tooltip'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

import './product_filter_hint.scss'

const classNames = clssnms('product-filter-hint')

interface StateProps {
  isHidden: boolean
}

interface DispatchProps {
  expandFilter: (filter: string) => void
  reachGoal: (name: string, filter?: string) => void
}

type ComponentProps = DispatchProps & WithTranslation

class ProductFilterHint extends React.Component<ComponentProps, StateProps> {
  state = {
    isHidden: !!cookie.get('hide_show_more_info'),
  }

  handleCloseClick: MouseEventHandler<HTMLElement> = () => {
    this.props.reachGoal('SHOW_MORE_INFO_CLOSE')
    this.setState({ isHidden: true })

    cookie.set('hide_show_more_info', 1, { expires: 30 * 24 * 60 * 60, path: '/' })
  }

  triggerFilterFunc = (filter: string): MouseEventHandler<HTMLAnchorElement> => () => {
    this.props.reachGoal('SHOW_MORE_INFO_FILTER', filter)
    this.props.expandFilter(filter)
  }

  renderTooltop = () => (
    <div className={classNames('tooltip')}>{this.props.t('product_filter_hint:tooltip')}</div>
  )

  render() {
    if (this.state.isHidden) {
      return null
    }

    return (
      <div className={classNames()}>
        <div className={classNames('info')}>
          <i className={classNames('help')} />
          <div className={classNames('title')}>{this.props.t('product_filter_hint:title')}</div>

          <div className={classNames('text')}>
            <Trans ns="product_filter_hint" i18nKey="text">
              <a onClick={this.triggerFilterFunc('stops')} />
              <a onClick={this.triggerFilterFunc('stopsDuration')} />
              <a onClick={this.triggerFilterFunc('departureArrival')} />
              <a onClick={this.triggerFilterFunc('gates')} />
              <a onClick={this.triggerFilterFunc('airlines')} />
            </Trans>
          </div>

          <Tooltip
            wrapperClassName={classNames('dismiss-tooltip-wrapper')}
            tooltip={this.renderTooltop}
          >
            <i className={classNames('dismiss')} onClick={this.handleCloseClick} />
          </Tooltip>
        </div>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    expandFilter: (filter) => dispatch({ type: 'EXPAND_FILTER', filter }),
    reachGoal: (name, data) => dispatch(reachGoal(name, data)),
  }
}

export default connect<{}, DispatchProps, {}>(
  null,
  mapDispatchToProps,
)(withTranslation('product_filter_hint')(ProductFilterHint))
