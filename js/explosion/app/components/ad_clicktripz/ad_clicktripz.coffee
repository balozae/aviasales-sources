import React from 'react'
import {div} from 'react-dom-factories'
import './ad_clicktripz.scss'

class AdClicktripz extends React.Component
  @displayName: 'AdClicktripz'

  componentDidMount: ->
    # NOTE: debugging variables for ct external script
    #       and ct show only on search.aviasales.ru, u can rewite /etc/hosts for debug
    # window.CT_DEBUG = true
    # window.CT_LOG_DEBUG = true
    script = document.createElement('script')
    script.async = true
    script.id = 'clicktripz-ad'
    script.src = '//static.clicktripz.com/custom/aviasales_ru/cti_aviasales_ru.js'
    document.body.appendChild(script)

  componentWillUnmount: ->
    script = document.querySelector('#clicktripz-ad')
    clicktripzFormContainer = document.querySelector('#_clicktripz_forms_container')
    clicktripzScript = document.querySelector('script[src="http://static.clicktripz.com/scripts/js/ct.js"]')
    script.parentNode.removeChild(script) if script
    clicktripzFormContainer.parentNode.removeChild(clicktripzFormContainer) if clicktripzFormContainer
    clicktripzScript.parentNode.removeChild(clicktripzScript) if clicktripzScript
    # NOTE: ct check this variable on next render
    delete window.CTI_LOADED

  render: ->
    div
      className: 'ad-clicktripz'
      id: 'ru-aviasales-third-footer'

export default AdClicktripz
