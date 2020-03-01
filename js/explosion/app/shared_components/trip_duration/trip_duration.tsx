import React, { useState } from 'react'
import clssnms from 'clssnms'
import defaultResizer, { useResizerOnEnter } from 'shared_components/resizer'
import TripDurationDesktop from './trip_duration.desktop'
import TripDurationMobile from './trip_duration.mobile'
import {
  TripDurationTab,
  TripDurationDepartValue,
  TripDurationReturnValue,
  TripDurationValue,
  TripDurationInput,
} from './trip_duration.types'
import { Modifiers } from 'react-day-picker'

export const cn = clssnms('trip-duration')

export interface TripDurationProps {
  className?: string
  activeInput?: TripDurationInput
  departureTabs: ReadonlyArray<TripDurationTab>
  returnTabs: ReadonlyArray<TripDurationTab>

  onDepartureDateSelect: (date?: TripDurationDepartValue) => void
  onReturnDateSelect: (date?: TripDurationReturnValue) => void
  onActiveInputChanged?: (activeInput?: TripDurationInput, month?: Date) => void
  onReturnResetClick?: () => void
  onWithoutReturnClick?: () => void
  onTabChange?: (tab: TripDurationTab) => void
  onMonthsConfirmClick?: () => void
  onMonthChange?: (month: Date, type?: 'prev' | 'next') => void
  onPriceSwitcherChange?: (checked: boolean, tab: TripDurationTab, month?: Date) => void
  onMonthsMount?: () => void

  formatInputValue?: (date?: TripDurationValue) => string

  fromMonth: Date
  toMonth: Date

  rangeDaysDurationBoundaries?: { min: number; max: number }
  rangeDaysDurationMin?: number
  rangeDaysDurationMax?: number

  departureValue?: TripDurationValue
  returnValue?: TripDurationValue

  returnDateIsRequired?: boolean
  showPriceSwitcher?: boolean
  priceSwitcherChecked?: boolean
  isLoading?: boolean
  errors?: { [key in TripDurationInput]?: { message: string } }

  renderCalendarDay?: (date: Date, modifiers: Modifiers) => React.ReactNode
  renderMonthPrice?: (month: string) => React.ReactNode

  dropdownHeaderTitle?: string
  clearBtnText?: string
  clearBtnTextShort?: string
  departurePlaceholder?: string
  returnPlaceholder?: string
  modalTitle?: string

  testIds?: { [key: string]: string }
  onComponentDidMount?: (dropdownRef: React.RefObject<HTMLDivElement>) => void
}

const mediaQueryModesMapping = {
  mobile: 'mobile',
  mobileLandscape: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
}

const TripDuration: React.FC<TripDurationProps> = (props) => {
  const mediaQueryType = useResponsive()

  const commonProps = {
    activeInput: props.activeInput,
    onActiveInputChanged: props.onActiveInputChanged,
    onDepartureDateSelect: props.onDepartureDateSelect,
    onReturnDateSelect: props.onReturnDateSelect,
    onReturnResetClick: props.onReturnResetClick,
    onWithoutReturnClick: props.onWithoutReturnClick,
    onMonthChange: props.onMonthChange,
    formatInputValue: props.formatInputValue,
    fromMonth: props.fromMonth,
    toMonth: props.toMonth,
    returnDateIsRequired: props.returnDateIsRequired,
    departureValue: props.departureValue,
    returnValue: props.returnValue,
    errors: props.errors,
    departurePlaceholder: props.departurePlaceholder,
    returnPlaceholder: props.returnPlaceholder,
    renderCalendarDay: props.renderCalendarDay,
    dropdownHeaderTitle: props.dropdownHeaderTitle,
    clearBtnText: props.clearBtnText,
    className: props.className,
    priceSwitcherChecked: props.priceSwitcherChecked,
    isLoading: props.isLoading,
  }

  const desktopProps = {
    ...commonProps,
    departureTabs: props.departureTabs,
    returnTabs: props.returnTabs,
    renderMonthPrice: props.renderMonthPrice,
    onTabChange: props.onTabChange,
    onMonthsConfirmClick: props.onMonthsConfirmClick,
    onPriceSwitcherChange: props.onPriceSwitcherChange,
    onMonthsMount: props.onMonthsMount,
    rangeDaysDurationBoundaries: props.rangeDaysDurationBoundaries,
    rangeDaysDurationMin: props.rangeDaysDurationMin,
    rangeDaysDurationMax: props.rangeDaysDurationMax,
    showPriceSwitcher: props.showPriceSwitcher,
    testIds: props.testIds,
    onComponentDidMount: props.onComponentDidMount,
  }

  const mobileProps = {
    ...commonProps,
    modalTitle: props.modalTitle,
    clearBtnTextShort: props.clearBtnTextShort,
    mediaQueryType,
  }

  return mediaQueryType === 'desktop' ? (
    <TripDurationDesktop {...desktopProps} />
  ) : (
    <TripDurationMobile {...mobileProps} />
  )
}

const useResponsive = () => {
  const [mediaQueryType, setMediaQueryType] = useState(
    mediaQueryModesMapping[defaultResizer.currentMode() || 'desktop'],
  )
  const handleMediaQueryTypeChange = (meadiaQueryKey: string) => {
    setMediaQueryType(mediaQueryModesMapping[meadiaQueryKey])
  }
  useResizerOnEnter(handleMediaQueryTypeChange)

  return mediaQueryType
}

export default TripDuration
