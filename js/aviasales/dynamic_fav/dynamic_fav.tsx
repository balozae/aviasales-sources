import React from 'react'
import { connect } from 'react-redux'
import { SearchStatus } from 'common/base_types'

export interface DynamicFavProps {
  searchStatus: SearchStatus
}

const DEFAULT_FAV = '/favicon.ico'

const mapSearchStatusToFavicon = {
  [SearchStatus.Expired]: '/favicon_expired.ico',
  [SearchStatus.Finished]: '/favicon_finished.ico',
}

class DynamicFav extends React.Component<DynamicFavProps> {
  fav: HTMLLinkElement | null = document.querySelector('[rel="icon"]')

  componentDidMount() {
    this.updateFav(SearchStatus.Inited)
  }

  componentDidUpdate(prevProps: DynamicFavProps) {
    if (prevProps.searchStatus !== this.props.searchStatus) {
      this.updateFav(this.props.searchStatus)
    }
  }

  updateFav(searchStatus: SearchStatus) {
    if (this.fav) {
      this.fav.href = mapSearchStatusToFavicon[searchStatus] || DEFAULT_FAV
    }
  }

  render() {
    return null
  }
}

const mapStateToProps = ({ searchStatus }) => {
  return {
    searchStatus,
  }
}

export default connect<DynamicFavProps>(mapStateToProps)(DynamicFav)
