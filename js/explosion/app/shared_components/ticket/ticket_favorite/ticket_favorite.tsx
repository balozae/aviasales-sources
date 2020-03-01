import React, { useCallback, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'shared_components/tooltip'
import clssnms from 'clssnms'
import './ticket_favorite.scss'

const FavoriteIcon = require('!!react-svg-loader!./ticket_favorite.svg')

const cn = clssnms('ticket-favorite')

interface TicketFavoriteProps {
  sign?: string
  isFavorite?: boolean
  onFavoriteClick?: (isFavorite: boolean, sign?: string) => void
  withTooltip?: boolean
}

const TicketFavorite: React.FC<TicketFavoriteProps> = ({
  sign,
  isFavorite,
  onFavoriteClick,
  withTooltip = true,
}) => {
  const { t } = useTranslation('ticket')
  const tooltipText = isFavorite
    ? t(`ticket:favoritesTooltip.remove`)
    : t(`ticket:favoritesTooltip.add`)
  const [animateFavoriteIcon, setAnimateFavoriteIcon] = useState(false)

  const tooltip = useMemo(() => () => <div className={cn('tooltip')}>{tooltipText}</div>, [
    tooltipText,
  ])

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!isFavorite) {
        setAnimateFavoriteIcon(true)
        // we need to reset animate class after animation is done
        window.setTimeout(() => setAnimateFavoriteIcon(false), 500)
      }

      if (onFavoriteClick) {
        onFavoriteClick(!!isFavorite, sign)
      }
    },
    [isFavorite, onFavoriteClick, sign],
  )

  const tooltipVisibilityProps = withTooltip
    ? {}
    : {
        showByProps: true,
        isVisible: false,
      }

  return (
    <Tooltip
      wrapperClassName={cn(null, { '--is-active': !!isFavorite })}
      tooltip={tooltip}
      {...tooltipVisibilityProps}
    >
      <button onClick={handleFavoriteClick} className={cn('button')}>
        <span className={cn('icon-wrap')}>
          <FavoriteIcon className={cn('icon')} />
          <FavoriteIcon className={cn('icon', { '--animate': animateFavoriteIcon })} />
        </span>
      </button>
    </Tooltip>
  )
}

export default React.memo(TicketFavorite)
