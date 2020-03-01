export default function loadScript(url: string, callback?: () => void) {
  let script = document.createElement('script')
  script.src = url
  if (callback) {
    script.onload = callback
  }
  document.head!.appendChild(script)
}
