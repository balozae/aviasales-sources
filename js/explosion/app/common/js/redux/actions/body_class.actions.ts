const ADD_BODY_CLASS = 'ADD_BODY_CLASS'
const REMOVE_BODY_CLASS = 'REMOVE_BODY_CLASS'

export const addBodyClass = (className: string) => {
  document.body.classList.add(className)
  return { type: ADD_BODY_CLASS }
}

export const removeBodyClass = (className: string) => {
  document.body.classList.remove(className)
  return { type: REMOVE_BODY_CLASS }
}
