import React from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { addPopup } from 'redux/actions/popups.actions'
import { updateSearchStatus } from 'redux/actions/search_status.actions'
import { getEmailFromUserInfoData } from 'user_account/selectors/user.selectors'

const IDDQD = '7368688168'
const EXPIRE = '698880738269'

class IDDQDObserver extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    userEmail: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleKeyPressIDDQD = this.handleKeyPressIDDQD.bind(this, [])
    this.handleKeyPressExpire = this.handleKeyPressExpire.bind(this, [])
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPressIDDQD)
    document.addEventListener('keydown', this.handleKeyPressExpire)
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPressIDDQD)
    document.removeEventListener('keydown', this.handleKeyPressExpire)
  }

  handleKeyPressIDDQD(keyPressed, event) {
    keyPressed.push(event.keyCode)
    if (keyPressed.length > 5) {
      keyPressed.shift()
    }
    if (keyPressed.join('') === IDDQD) {
      if (
        /localhost|.*\.avs\.io|.*\.beta\.aviasales\.ru/.test(window.location.hostname) ||
        // ENV — webpack define plugin variable
        // eslint-disable-next-line
        ENV === 'dev' ||
        this.props.userEmail.includes('@aviasales.ru')
      ) {
        this.props.dispatch(addPopup({ popupType: 'iddqd' }))
      }
    }
  }

  handleKeyPressExpire(keyPressed, event) {
    keyPressed.push(event.keyCode)
    if (keyPressed.length > 6) {
      keyPressed.shift()
    }
    if (keyPressed.join('') === EXPIRE) {
      this.props.dispatch(updateSearchStatus('EXPIRED'))
    }
  }

  render() {
    return null
  }
}

const mapStateToProps = (state) => ({
  userEmail: getEmailFromUserInfoData(state),
})

export default connect(mapStateToProps)(IDDQDObserver)
