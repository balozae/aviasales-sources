import * as React from 'react'
import clssnms from 'clssnms'
import './quality_info_icon.scss'

const cn = clssnms('quality-info-bullet')

interface Props {
  blockClassMod: 'bad' | 'good'
}

const QualityInfoBullet: React.SFC<Props> = (props) => {
  const { blockClassMod } = props

  return <i className={cn(null, `--${blockClassMod}`)} />
}

export default QualityInfoBullet
