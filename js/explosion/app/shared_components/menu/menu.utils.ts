import { MenuIconType } from './menu_item'

export const getIconTypeFromLinkName = (name: string) => {
  switch (name) {
    case 'history':
      return MenuIconType.Box
    case 'subscriptions':
      return MenuIconType.Bell
    case 'documents':
      return MenuIconType.Document
    case 'promos':
      return MenuIconType.Discount
    case 'direction_subscriptions':
      return MenuIconType.Envelope
    case 'settings':
      return MenuIconType.Gear
    case 'exit':
      return MenuIconType.Exit
    case 'calendar':
      return MenuIconType.Calendar
    case 'map':
      return MenuIconType.Directions
    case 'hot':
      return MenuIconType.Flame
    case 'bot':
      return MenuIconType.Robot
    case 'blog':
      return MenuIconType.Newspaper
    default:
      return undefined
  }
}
