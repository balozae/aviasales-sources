import axios from 'axios'

const cachedResponse = {}

export const checkEmailAndPassToCallback = async (
  callback: (isEmailExist?: boolean) => void,
  email?: string,
) => {
  if (email) {
    const isEmailExist = await loadEmailCheck(email)
    callback(isEmailExist)
  } else {
    callback()
  }
}

const loadEmailCheck = async (email: string): Promise<boolean | undefined> => {
  if (cachedResponse[email] != null) {
    return cachedResponse[email]
  }

  try {
    const { data } = await axios.get<{ exist: boolean }>(`/search-api/email/check?email=${email}`)
    if (data && data.exist != null) {
      cachedResponse[email] = data.exist
      return data.exist
    }
  } catch (error) {
    console.error(error)
  }
}
