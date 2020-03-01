import React, { useCallback } from 'react'
import Link from 'shared_components/router/link'
import { cn } from './menu'

import './menu.scss'

const IconBell = require('!!react-svg-loader!./images/icon-bell.svg')
const IconBox = require('!!react-svg-loader!./images/icon-box.svg')
const IconCalendar = require('!!react-svg-loader!./images/icon-calendar.svg')
const IconDirections = require('!!react-svg-loader!./images/icon-directions.svg')
const IconDiscount = require('!!react-svg-loader!./images/icon-discount.svg')
const IconDocument = require('!!react-svg-loader!./images/icon-document.svg')
const IconEnvelope = require('!!react-svg-loader!./images/icon-envelope.svg')
const IconExit = require('!!react-svg-loader!./images/icon-exit.svg')
const IconFlame = require('!!react-svg-loader!./images/icon-flame.svg')
const IconGear = require('!!react-svg-loader!./images/icon-gear.svg')
const IconMedal = require('!!react-svg-loader!./images/icon-medal.svg')
const IconNewspaper = require('!!react-svg-loader!./images/icon-newspaper.svg')
const IconRobot = require('!!react-svg-loader!./images/icon-robot.svg')

export enum MenuIconType {
  Bell = 'bell',
  Box = 'box',
  Calendar = 'calendar',
  Directions = 'directions',
  Discount = 'discount',
  Document = 'document',
  Envelope = 'envelope',
  Exit = 'exit',
  Flame = 'flame',
  Gear = 'gear',
  Medal = 'medal',
  Newspaper = 'newspaper',
  Robot = 'robot',
}

type MenuIconMap = { [key in MenuIconType]: any }

const menuIconMap: MenuIconMap = {
  [MenuIconType.Bell]: IconBell,
  [MenuIconType.Box]: IconBox,
  [MenuIconType.Calendar]: IconCalendar,
  [MenuIconType.Directions]: IconDirections,
  [MenuIconType.Discount]: IconDiscount,
  [MenuIconType.Document]: IconDocument,
  [MenuIconType.Envelope]: IconEnvelope,
  [MenuIconType.Exit]: IconExit,
  [MenuIconType.Flame]: IconFlame,
  [MenuIconType.Gear]: IconGear,
  [MenuIconType.Medal]: IconMedal,
  [MenuIconType.Newspaper]: IconNewspaper,
  [MenuIconType.Robot]: IconRobot,
}

interface MenuItemCommonProps {
  text: string
  icon?: MenuIconType
  notify?: number | boolean
  active?: boolean
  onClick?: () => void
}

interface MenuItemAnchorProps extends MenuItemCommonProps {
  type: 'a'
  url: string
  targetBlank?: boolean
}

interface MenuItemLinkProps extends MenuItemCommonProps {
  type: 'link'
  name: string
}

interface MenuItemButtonProps extends MenuItemCommonProps {
  type: 'button'
  onClick: () => void
}

export type MenuItemProps = MenuItemAnchorProps | MenuItemLinkProps | MenuItemButtonProps

const MenuItem: React.FC<MenuItemProps> = (props) => {
  const { text, icon, notify, active = false, onClick } = props

  const Icon = icon ? menuIconMap[icon] : null

  const renderItemContent = useCallback(
    () => {
      const isBooleanNotify = typeof notify === 'boolean'

      return (
        <>
          {icon && <Icon className={cn('icon')} />}
          <span className={cn('text')}>{text}</span>
          {!!notify && (
            <span className={cn('notify', { '--warning': isBooleanNotify })}>
              {isBooleanNotify ? '!' : notify}
            </span>
          )}
        </>
      )
    },
    [icon, text, notify],
  )

  const commonProps = {
    className: cn('link', { '--active': active }),
    onClick,
  }

  return (
    <li className={cn('item')}>
      {props.type === 'a' && (
        <a
          {...commonProps}
          href={props.url}
          title={text}
          target={props.targetBlank ? '_blank' : undefined}
        >
          {renderItemContent()}
        </a>
      )}
      {props.type === 'link' && (
        <Link {...commonProps} title={renderItemContent()} name={props.name} />
      )}
      {props.type === 'button' && <button {...commonProps}>{renderItemContent()}</button>}
    </li>
  )
}

export default React.memo(MenuItem)
