import React, { SyntheticEvent } from 'react'
import viewport from 'browser-viewport'
import FormTabComponent from './form_tab'
import { FormType } from 'form/types'
import { FormTabs } from './form_tab.types'
import clssnms from 'clssnms'
import './form_tabs.scss'

const cn = clssnms('form-tabs')

interface OwnProps {
  tabs: FormTabs
  showOnSticky?: boolean
}

interface StateProps {
  activeTab: FormType
  showHotelDiscount?: boolean
}

interface DispatchProps {
  onInnerTabClick?: (formId: FormType, event: SyntheticEvent) => void
  onOuterTabClick?: (formId: FormType, event: SyntheticEvent) => void
  updateActiveTab: (formId: FormType) => void
  addBodyClass: (className: string) => void
  removeBodyClass: (className: string) => void
}

type Props = OwnProps & StateProps & DispatchProps

class FormTabsComponent extends React.PureComponent<Props> {
  static defaultProps = {
    activeTab: 'avia' as FormType,
    onInnerTabClick: () => {
      //
    },
    onOuterTabClick: () => {
      //
    },
  }

  static checkActiveTab(activeTab: string, tab: string) {
    return activeTab === tab || (activeTab === 'multiway' && tab === 'avia')
  }

  componentDidMount() {
    this.setActiveFormBodyClass()
  }

  componentDidUpdate(prevProps: Props) {
    this.setActiveFormBodyClass(prevProps.activeTab)
  }

  setActiveFormBodyClass(prevForm?: FormType) {
    if (prevForm !== this.props.activeTab) {
      if (prevForm) {
        this.props.removeBodyClass(`page--${prevForm}`)
      }
      this.props.addBodyClass(`page--${this.props.activeTab}`)
    }
  }

  handleTabClick = (formTab: FormType, event: React.MouseEvent) => {
    event.preventDefault()
    this.props.updateActiveTab(formTab)
    viewport.scrollTop(0, 300)
  }

  render() {
    return (
      <ul
        className={cn(null, {
          '--show-on-sticky': !!this.props.showOnSticky,
        })}
      >
        {this.props.tabs.map((tab) => (
          <FormTabComponent
            {...tab}
            showDiscountLabel={tab.showDiscountLabel && this.props.showHotelDiscount}
            key={tab.tabName}
            isActive={FormTabsComponent.checkActiveTab(this.props.activeTab, tab.tabName)}
            onInnerTab={this.handleTabClick}
            onOuterTab={this.props.onOuterTabClick}
          />
        ))}
      </ul>
    )
  }
}

export default FormTabsComponent
