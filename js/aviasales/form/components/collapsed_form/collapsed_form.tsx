import React, { useContext, useState, useEffect, memo, useRef, useLayoutEffect } from 'react'
import clssnms from 'clssnms'
import { format } from 'finity-js'
import { SearchParams, PlaceField } from '../avia_form/avia_form.types'
import Button from 'shared_components/button/button'
import { ButtonType, ButtonMod, ButtonSize } from 'shared_components/button/button.types'
import debounce from 'common/bindings/debounce'
import { isValidSegment } from 'common/js/redux/actions/start_search/start_search.utils'
import { useTranslation } from 'react-i18next'
import { dateToLowerCase } from 'shared_components/l10n/l10n'

const IconPencil = require('!!react-svg-loader!./pencil.svg')
const cssVars = require('./collapsed_form.scss')
const segmentWidth = +cssVars.segmentWidth

const cn = clssnms('collapsed-form')
const FREE_SPACE = 100

export interface CollapsedFormProps {
  formParams: SearchParams
  onEditClick: (source: 'edit-button' | 'collapsed-plate' | 'collapse') => void
}

export const CollapsedForm: React.FC<CollapsedFormProps> = memo((props) => {
  const { t } = useTranslation('avia_form')
  const [hiddenItems, setHiddenItems] = useState({})
  const wrapRef: React.RefObject<HTMLDivElement> = useRef(null)
  const { segments } = props.formParams
  useHiddenItems(wrapRef, hiddenItems, segments, setHiddenItems)
  const hiddenItemsCount = Object.keys(hiddenItems).length

  return (
    <div className={cn()}>
      <div
        className={cn('segments-wrap', { '--with-hidden-items': !!hiddenItemsCount })}
        onClick={() => props.onEditClick('collapsed-plate')}
        ref={wrapRef}
      >
        <div className={cn('icons-wrap')}>
          {!!hiddenItemsCount && (
            <span className={cn('hidden-items-count')}>+ {hiddenItemsCount}</span>
          )}
          <IconPencil className={cn('edit-icon')} onClick={props.onEditClick} />
        </div>
        {segments.map((segment, i) => {
          const origin = segment[PlaceField.Origin]!
          const destination = segment[PlaceField.Destination]!
          if (hiddenItems[i] || !isValidSegment(segment, true)) {
            return null
          }
          return (
            <div key={i} className={cn('segment')}>
              <div className={cn('segment-route')}>
                {origin.iata} – {destination.iata}
              </div>
              <div className={cn('segment-date')}>
                {dateToLowerCase(format(segment.date as Date, 'DD MMMM', true))}
              </div>
            </div>
          )
        })}
      </div>
      <div className={cn('button-wrap')}>
        <Button
          type={ButtonType.Button}
          mod={ButtonMod.Primary}
          className={cn('edit-button')}
          onClick={() => props.onEditClick('edit-button')}
          size={ButtonSize.L}
        >
          {t('avia_form:collapsedFormEditButtonText')}
        </Button>
      </div>
    </div>
  )
})

const useHiddenItems = (
  wrapRef: React.RefObject<HTMLDivElement>,
  hiddenItems: Object,
  segments: SearchParams['segments'],
  setHiddenItems: Function,
) => {
  useLayoutEffect(() => recalcHiddenItems(wrapRef, hiddenItems, segments, setHiddenItems), [])
  const handleResize = () => recalcHiddenItems(wrapRef, hiddenItems, segments, setHiddenItems)
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
}

const recalcHiddenItems = debounce(
  (
    wrapRef: React.RefObject<HTMLDivElement>,
    hiddenItems: Object,
    segments: SearchParams['segments'],
    setHiddenItems: Function,
  ) => {
    try {
      const width = wrapRef.current!.getBoundingClientRect().width - FREE_SPACE
      const newHiddenItems = { ...hiddenItems }
      segments.forEach((_, index) => {
        const position = segmentWidth * (index + 1)
        if (position > width && !hiddenItems[index]) {
          newHiddenItems[index] = true
          return
        }
        if (position < width && hiddenItems[index]) {
          delete newHiddenItems[index]
        }
      })
      setHiddenItems(newHiddenItems)
    } catch {
      // That's okay
    }
  },
  100,
)
