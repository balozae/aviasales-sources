import React from 'react'
import Flagr from './Flagr'

export function withFlagr(instance: Flagr, keys: string[]) {
  return function<ComponentProps extends object>(Comment: React.ComponentType<ComponentProps>) {
    return class WithFlagr extends React.Component<ComponentProps> {
      state = { _v: 0 }

      componentDidMount(): void {
        instance.on('update', this.updateHandler)
      }

      componentWillMount(): void {
        instance.off('update', this.updateHandler)
      }

      updateHandler = (updatedKeys) => {
        if (updatedKeys.some((key) => keys.indexOf(key) !== -1)) {
          this.setState({ _v: Math.random() })
        }
      }

      render() {
        return <Comment {...this.props} _v={this.state._v} />
      }
    }
  }
}

export default {}
