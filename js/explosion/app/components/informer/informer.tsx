import React from 'react'
import clssnms from 'clssnms'
import Button from 'shared_components/button/button'
import { ButtonMod, ButtonType } from 'shared_components/button/button.types'
import Tooltip from 'components/tooltip/tooltip'
import { InformerIcon } from './informer.types'
const IconRecommendation = require('!!react-svg-loader!./images/icon-recommendation.svg')
const IconBlog = require('!!react-svg-loader!./images/icon-blog.svg')
const IconFilter = require('!!react-svg-loader!./images/icon-filter.svg')
const IconInfo = require('!!react-svg-loader!assets/images/icon-info.svg')
const IconArchive = require('!!react-svg-loader!assets/images/icon-archive.svg')

import './informer.scss'

const cn = clssnms('informer')

const iconComponentMap = {
  [InformerIcon.Recommendation]: IconRecommendation,
  [InformerIcon.Blog]: IconBlog,
  [InformerIcon.Filter]: IconFilter,
  [InformerIcon.Archive]: IconArchive,
}

export interface InformerProps {
  title: React.ReactNode
  action: {
    content: React.ReactNode
    onAction?: () => void
    url?: string
    mod?: ButtonMod
  }
  icon: InformerIcon
  classMod?: string
  infoTooltip?: React.ReactNode
  className?: string
}

const Informer: React.SFC<InformerProps> = (props) => {
  const { title, action, icon, children, classMod, infoTooltip, className } = props
  const IconComponent = iconComponentMap[icon]

  return (
    <div className={cn(null, { [`--${classMod}`]: !!classMod, [className!]: !!className })}>
      <IconComponent className={cn('icon')} />
      <div className={cn('content')}>
        <div className={cn('heading')}>
          <p className={cn('title')}>{title}</p>
          {infoTooltip && (
            <Tooltip tooltip={() => infoTooltip} position="right" wrapperClassName={cn('tooltip')}>
              <IconInfo className={cn('tooltip-icon')} />
            </Tooltip>
          )}
        </div>
        {!!children && <div className={cn('text-wrapper')}>{children}</div>}
      </div>
      <div className={cn('action')}>
        <Button
          className={cn('action-btn')}
          mod={action.mod || ButtonMod.SecondaryOutline}
          type={ButtonType.Button}
          href={action.url}
          onClick={action.onAction}
          data-testid="informer-btn-main"
        >
          {action.content}
        </Button>
      </div>
    </div>
  )
}

export default Informer
