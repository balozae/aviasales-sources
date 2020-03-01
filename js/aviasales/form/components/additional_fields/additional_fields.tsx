import React, { useCallback, useState, useMemo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import Dropdown from 'shared_components/dropdown/dropdown'
import PassengersControl from './passengers_control.coffee'
import CustomRadio from 'shared_components/form_controls/custom_radio/custom_radio'
import { TripClass } from '../../../../common/types'
import './additional_fields.scss'
import flagr from 'common/utils/flagr_client_instance'

const cn = clssnms('additional-fields')
const EVENT_CATEGORY = {
  avia: 'avia_form',
  multiway: 'multiwayForm',
  hotel: 'hotel',
}

interface AdditionalFieldsProps {
  adults: number
  children: number
  onPassengersChange: (type: string, value: number) => void
  formType: 'avia' | 'multiway' | 'hotel'
  childrenAge?: number[]
  infants?: number
  tripClass?: string
  onChildrenAgeChange?: (index: number, value: number) => void
  onTripClassChange?: (value: TripClass) => void
  reachGoal?: (event: string, data?: any) => void
}

const AdditionalFields: React.FC<AdditionalFieldsProps> = (props) => {
  const [isOpened, setIsOpened] = useState(false)
  const { t } = useTranslation()
  const {
    adults,
    children,
    onPassengersChange,
    formType,
    childrenAge,
    infants,
    tripClass,
    onChildrenAgeChange,
    onTripClassChange,
    reachGoal,
  } = props

  const reachGoalFunc = useCallback(
    (event: string, data?: any) => {
      if (reachGoal) {
        reachGoal(`${EVENT_CATEGORY[formType]}--${event}`, data)
      }
    },
    [reachGoal, formType],
  )

  const getPassengersCount = useMemo(() => adults + children + (infants || 0), [
    adults,
    children,
    infants,
  ])

  const handleDropdown = useCallback(
    (isShown: boolean) => {
      setIsOpened(isShown)
      const eventType = isShown ? 'open' : 'close'
      reachGoalFunc(`passengersDropdown--${eventType}`)
    },
    [setIsOpened, reachGoalFunc],
  )

  const handleTripClassChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value as TripClass
      if (onTripClassChange) {
        onTripClassChange(value)
      }
      reachGoalFunc('tripClass--click', { tripClass: value })
    },
    [onTripClassChange, reachGoalFunc],
  )

  const handleDoneButtonClick = useCallback(
    (event) => {
      event.preventDefault()
      setIsOpened(false)
    },
    [setIsOpened],
  )

  const handleCloseDropdown = useCallback(() => handleDropdown(false), [handleDropdown])
  const handleToggleDropdown = useCallback(() => handleDropdown(!isOpened), [
    handleDropdown,
    isOpened,
  ])

  const tripClasses = flagr.get('avs-feat-tripClasses').tripClasses

  const dropdownContent = (
    <div className={cn('inner-wrap')}>
      <PassengersControl
        adults={adults}
        children={children}
        infants={infants}
        onChange={onPassengersChange}
        onChildrenAgeChange={onChildrenAgeChange}
        childrenAge={childrenAge}
        eventCategory={EVENT_CATEGORY[formType]}
        isHotel={formType === 'hotel'}
      />
      {formType !== 'hotel' && (
        <div className={cn('trip-class')}>
          {tripClasses.map((tripClassObj) => {
            return (
              <div key={tripClassObj.code}>
                <CustomRadio
                  value={tripClassObj.code}
                  inputId={`additional-fields-${tripClassObj.code}`}
                  name={tripClassObj.name}
                  caption={t('additional_form_fields:tripClasses.codes.' + tripClassObj.code)}
                  active={tripClass === tripClassObj.code}
                  modifiers={['--additional-fields', `--${tripClassObj.name.toLowerCase()}`]}
                  onChange={handleTripClassChange}
                />
              </div>
            )
          })}
        </div>
      )}
      <button className={cn('done-button')} onClick={handleDoneButtonClick}>
        {t('avia_form:done')}
      </button>
    </div>
  )

  const labelText =
    formType === 'hotel'
      ? t('hotels_form:guestsTitle')
      : t('additional_form_fields:passengersAndClass')

  return (
    <Dropdown
      visible={isOpened}
      dropdownContent={dropdownContent}
      onClose={handleCloseDropdown}
      hideArrow={true}
      modalHeader={t('additional_form_fields:passengers')}
      contentClassName={cn('dropdown-inner', { [`--${formType}`]: true })}
    >
      <div
        className={cn(null, {
          '--is-opened': isOpened,
          [`--${formType}`]: true,
        })}
        onClick={handleToggleDropdown}
      >
        <div className={cn('label-hint')}>{labelText}</div>
        {formType === 'avia' || formType === 'multiway' ? (
          <>
            <div className={cn('label')}>
              {t('additional_form_fields:passengersLabelCount', { count: getPassengersCount })}
            </div>
            <div className={cn('label', { '--is-gray': true })}>
              {t(`additional_form_fields:tripClasses.codes.${tripClass}`).toLowerCase()}
            </div>
          </>
        ) : (
          <div className={cn('label', { '--is-hotel': true })}>
            {t('hotels_form:guestsCount', { count: getPassengersCount })}
          </div>
        )}
      </div>
    </Dropdown>
  )
}

export default AdditionalFields
