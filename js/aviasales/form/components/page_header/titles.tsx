import * as React from 'react'
import { TabParams } from 'form/types'

interface Props {
  tab?: TabParams
  mainTitleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  classNames: Function
}

const MainTitle = (props: Props) => {
  if (props.tab!.HTMLTitle) {
    return <div dangerouslySetInnerHTML={{ __html: props.tab!.HTMLTitle || '' }} />
  }
  const TagName = props.mainTitleTag || 'h1'
  return (
    <TagName className="header__title" dangerouslySetInnerHTML={{ __html: props.tab!.mainTitle }} />
  )
}

export default (props: Props) => {
  if (!props.tab) {
    return null
  }
  return (
    <div className={props.classNames('titles')}>
      <MainTitle {...props} />
      <strong className="header__title-form">{props.tab!.callToAction}</strong>
    </div>
  )
}
