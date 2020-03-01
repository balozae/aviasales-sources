import React from 'react'

interface Props {
  name: 'IntentMediaIntercard' | 'IntentMediaRail'
  onAdNotRendered: () => void
  isRenderedDelay?: number
}

/*
// Intent Media will call this function event handler when ads are displayed
window.IntentMediaBindings = {
  ads_displayed: function(ad_type: string) {
    // Parameter "ad_type" is a string indicating which type of ad
    // was displayed (e.g. "on_page", "exit_unit", or "overlay")
    // Your code to do something with ​ad_type​ goes here
  }
}
*/

export default class AdIntentMediaComponent extends React.PureComponent<Props> {
  static defaultProps = {
    isRenderedDelay: 7000,
  }

  private ref

  componentDidMount(): void {
    // Intentmedia doesn’t have any callbacks showing that ads hasn’t been rendered.
    // Intentmedia’s support suggest to check whether div is filled or not.
    // Since we don't know the exact moment div considered to be filled, we use timeout to check div’s filling.
    // And if it is not filled, we will fire callback.
    //
    setTimeout(() => {
      if (!(this.ref && this.ref.innerHTML && this.ref.innerHTML.length)) {
        this.props.onAdNotRendered()
      }
    }, this.props.isRenderedDelay)
  }

  createRef = (ref) => (this.ref = ref)

  render() {
    return <div ref={this.createRef} className={this.props.name} />
  }
}
