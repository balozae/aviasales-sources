import React from 'react'
import clssnms from 'clssnms'
import { TypographyProps } from '../typography.types'

import './text.scss'

const cn = clssnms('tg-text')

export interface TextProps extends TypographyProps {
  modifier?: 'regular' | 'small' | 'xsmall' | 'allcaps'
}

const Text: React.FC<TextProps> = ({
  modifier = 'regular',
  tag,
  className,
  children,
  noResize,
  ...other
}) => {
  const tagName = tag || 'span'

  return React.createElement(tagName, {
    children,
    className: cn(null, {
      [className as string]: true,
      [`--${modifier}`]: true,
      '--no-resize': !!noResize,
    }),
    ...other,
  })
}

export default React.memo(Text)
