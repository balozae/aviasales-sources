import './explosion_polyfills'
import * as React from 'react'
import ErrorBoundary from 'shared_components/error_boundary/error_boundary'
import { ErrorType } from 'shared_components/error_boundary/error_boundary.types'
import CommonErrorInformer from '../error_informer/common/common'
import { ServerErrorType } from 'components/error_informer/error_informer.types'
import 'components/travelpayouts_bar/travelpayouts_bar'
import '../request/dispatcher_interaction'
import 'common/css/main.scss'
import './explosion.scss'

const Amberdata = require('amberdata/amberdata').default

const App = require('app/app').default
const spy = require('common/js/spy')
const debug = require('../debugger/debug').default

export default class Explosion extends React.Component {
  componentWillMount() {
    Amberdata()
    spy()
    debug()
  }

  render() {
    return (
      <div className={'explosion'}>
        <ErrorBoundary
          replaceTo={<CommonErrorInformer error={ServerErrorType.SearchFailed} />}
          errorType={ErrorType.Critical}
          errorText="Something is going wrong with the Explosion"
        >
          <App />
        </ErrorBoundary>
      </div>
    )
  }
}
