import React from 'react'
import clssnms from 'clssnms'
import { TypographyProps, TypographyFont } from '../typography.types'

import './heading.scss'

const cn = clssnms('tg-heading')

export type HeadingSize = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingProps extends TypographyProps {
  size?: HeadingSize
  font?: TypographyFont
}

const Heading: React.FC<HeadingProps> = ({
  size = 1,
  font = 'rubik',
  tag,
  className,
  children,
  noResize,
  ...other
}) => {
  const tagName = tag || (`h${size}` as keyof React.ReactHTML)

  return React.createElement(tagName, {
    children,
    className: cn(null, {
      [className as string]: true,
      [`tg-heading-${size}`]: true,
      [`--font-${font}`]: true,
      '--no-resize': !!noResize,
    }),
    ...other,
  })
}

export default React.memo(Heading)
