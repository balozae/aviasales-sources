function testCSSVariablesSafari() {
  const color = 'rgb(255, 198, 0)'
  const el = document.createElement('span')
  try {
    el.style.setProperty('--color', color)
    el.style.setProperty('background', 'var(--color)')
    document.body.appendChild(el)

    const styles = getComputedStyle(el)
    var doesSupport = styles.backgroundColor === color
    document.body.removeChild(el)
    return doesSupport
  } catch (_) {
    return false
  }
}

const testCSSVariables = (() => {
  let doesSupport
  return () => {
    if (typeof doesSupport === 'undefined') {
      doesSupport =
        (window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', '0')) ||
        testCSSVariablesSafari()
    }
    return doesSupport
  }
})()

export default testCSSVariables
