import React, { useMemo } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import TicketConfirm from 'shared_components/ticket/ticket_confirm/ticket_confirm'
import { IconTypes } from 'shared_components/ticket/ticket_icon/ticket_icon.types'
import { AppState } from 'common/js/redux/types/root/explosion'
import { getPopupDataByType } from 'common/js/redux/selectors/popups.selectors'
import { PopupType } from 'common/js/redux/types/popups.types'
import { removePopup } from 'common/js/redux/actions/popups.actions'

interface ConfirmData {
  hasTransit: boolean
  country?: string[] | undefined
}

interface VisaTicketConfirmProps {
  visible: boolean
  data?: ConfirmData
  onConfirm: () => void
  onCancel: () => void
}

const VisaTicketConfirm: React.FC<VisaTicketConfirmProps> = ({
  data = {} as ConfirmData,
  visible,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation()
  const countries = data.country

  const preparedTitle = useMemo(
    (): string => {
      if (!countries || !countries.length) {
        return ''
      }

      if (countries.length === 1) {
        return t('ticket:needVisaPopup.titleSingleCountry', {
          country: countries[0],
        })
      }

      if (countries.length >= 2) {
        return t('ticket:needVisaPopup.titleTwoOrMoreCountries', {
          countryOrCountries: countries.slice(0, -1).join(', '),
          lastCountry: countries[countries.length - 1],
        })
      }

      return ''
    },
    [countries, t],
  )

  return (
    <TicketConfirm
      visible={visible}
      title={preparedTitle}
      icon={IconTypes.Visa}
      header={t('ticket:needVisaPopup.header')}
      text={data.hasTransit ? t('ticket:needVisaPopup.transitZone') : undefined}
      confirmText={t('ticket:needVisaPopup.confirmText')}
      cancelText={t('ticket:needVisaPopup.cancelText')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

const mapStateToProps = (state: AppState) => {
  const popupData = getPopupDataByType(state, PopupType.VisaConfirm)
  return {
    visible: !!popupData,
    data: popupData,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onConfirm: () => dispatch(removePopup(PopupType.VisaConfirm, 'confirmed')),
    onCancel: () => dispatch(removePopup(PopupType.VisaConfirm, 'cancelled')),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VisaTicketConfirm)
