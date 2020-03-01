import React from 'react'
import { connect } from 'react-redux'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

export interface DocumentObserverProps {
  reachGoal: (event: string, data?: any) => void
}

class DocumentObserver extends React.Component<DocumentObserverProps> {
  componentDidMount() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  componentWillUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }

  handleVisibilityChange = () => {
    if (document.visibilityState) {
      this.props.reachGoal('tab-visibility--change', { state: document.visibilityState })
    }
  }

  render() {
    return null
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reachGoal: (name, data) => dispatch(reachGoal(name, data)),
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(DocumentObserver)
