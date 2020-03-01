import FormTabs from './form_tabs'
import { connect } from 'react-redux'
import { updatePageHeader } from 'common/js/redux/actions/page_header.actions'
import { addBodyClass, removeBodyClass } from 'common/js/redux/actions/body_class.actions'

const mapStateToProps = (state) => ({
  activeTab: state.pageHeader.activeForm,
})

const mapDispatchToProps = (dispatch) => ({
  updateActiveTab: (formType) => dispatch(updatePageHeader({ activeForm: formType })),
  addBodyClass: (className) => dispatch(addBodyClass(className)),
  removeBodyClass: (className) => dispatch(removeBodyClass(className)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FormTabs)
