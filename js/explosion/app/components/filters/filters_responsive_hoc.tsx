import React from 'react'
import { connect } from 'react-redux'
import { withTranslation, WithTranslation } from 'react-i18next'
import defaultResizer, { MediaQueryTypes } from 'shared_components/resizer'
import Modal from 'shared_components/modal/modal'
import ModalDefaultHeader from 'shared_components/modal/modal_default_header/modal_default_header'
import clssnms from 'clssnms'
import Button from 'shared_components/button/button'
import { ButtonType, ButtonMod, ButtonSize } from 'shared_components/button/button.types'
import { resetFilters } from 'common/js/redux/actions/filters.actions'

import './styles/filters_modal.scss'

const cn = clssnms('filters-modal')

const mediaQueryModesMapping = {
  mobile: MediaQueryTypes.Mobile,
  mobileLandscape: MediaQueryTypes.Mobile,
  tablet: MediaQueryTypes.Mobile,
  desktop: MediaQueryTypes.Desktop,
}

interface StateProps {
  isFiltersChangedByUser: boolean
  changedFilters: string[]
}

interface DispatchProps {
  resetFilters: () => void
}

type ResponsiveFiltersHOCProps = StateProps & DispatchProps

interface ResponsiveFiltersHOCState {
  mediaQueryType: string
  isFilterModalOpen: boolean
}

export default (WrappedComponent: React.ComponentType): React.ComponentType => {
  class ResponsiveFiltersHOC extends React.Component<
    ResponsiveFiltersHOCProps & WithTranslation,
    ResponsiveFiltersHOCState
  > {
    mediaQueryModes: string = 'mobile, tablet, desktop'

    state: ResponsiveFiltersHOCState = {
      mediaQueryType:
        mediaQueryModesMapping[defaultResizer.currentMode() || MediaQueryTypes.Desktop],
      isFilterModalOpen: false,
    }

    componentDidMount() {
      defaultResizer.onMode(this.mediaQueryModes, this.hanleMediaQueryTypeChange)
    }

    componentWillUnmount() {
      defaultResizer.offMode(this.mediaQueryModes, this.hanleMediaQueryTypeChange)
    }

    hanleMediaQueryTypeChange = (meadiaQueryKey: string) => {
      this.setState({ mediaQueryType: mediaQueryModesMapping[meadiaQueryKey] })
    }

    openModal = () => {
      this.setState({ isFilterModalOpen: true })
    }

    closeModal = () => {
      this.setState({ isFilterModalOpen: false })
    }

    resetFilters = () => {
      this.props.resetFilters()
    }

    getHeaderContent = () => {
      const { t } = this.props

      return (
        <ModalDefaultHeader
          title={t('filters:filters')}
          onClose={this.closeModal}
          extraContent={
            <button className={cn('reset')} onClick={this.resetFilters}>
              {t('filters:resetAllFiltersShort')}
            </button>
            // tslint:disable-next-line:jsx-curly-spacing
          }
        />
      )
    }

    render() {
      const { t } = this.props
      const changedFiltersLength = this.props.changedFilters.length

      if (this.state.mediaQueryType === MediaQueryTypes.Mobile) {
        return (
          <>
            <Modal
              visible={this.state.isFilterModalOpen}
              onClose={this.closeModal}
              header={this.getHeaderContent()}
              footer={
                <div className={cn('footer', { '--hidden': !this.props.isFiltersChangedByUser })}>
                  <Button
                    type={ButtonType.Button}
                    mod={ButtonMod.Primary}
                    size={ButtonSize.L}
                    className={cn('apply')}
                    onClick={this.closeModal}
                  >
                    {t('filters:applyFilters')}
                  </Button>
                </div>
                // tslint:disable-next-line:jsx-curly-spacing
              }
              animationType={'up'}
              keepMounted={true}
            >
              <WrappedComponent {...this.props} />
            </Modal>
            <button type="button" className={cn('open')} onClick={this.openModal}>
              <i className={cn('open-icon')}>
                {changedFiltersLength > 0 && (
                  <span className={cn('open-count')}>{changedFiltersLength}</span>
                )}
              </i>
              <span className={cn('open-text')}>{t('filters:filters')}</span>
            </button>
          </>
        )
      }

      return <WrappedComponent {...this.props} />
    }
  }

  const mapStateToProps = (state): StateProps => ({
    isFiltersChangedByUser: state.filters.isFiltersChangedByUser,
    changedFilters: state.filters.changedFilters,
  })

  const mapDispatchToProps = (dispatch): DispatchProps => ({
    resetFilters: () => dispatch(resetFilters()),
  })

  return connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation('filters')(ResponsiveFiltersHOC))
}
