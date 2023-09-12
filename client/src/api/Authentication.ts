import { getCookie, setCookie } from 'typescript-cookie'

export const saveJWTinCookie = ({ response }: { response: Response }): void => {
  const jwtToken = response.headers.get('authorization')
  if (jwtToken) {
    setCookie('jwt_token', jwtToken, {
      expires: 7,
      path: '/',
      secure: true,
      sameSite: 'strict'
    })
  }
}

export const injectJWTFromCookies = (headers: Headers): Headers => {
  const jwt = getCookie('jwt_token')
  if (jwt) {
    headers.set('Authorization', jwt)
  }
  return headers
}
