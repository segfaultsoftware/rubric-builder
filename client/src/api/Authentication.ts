import { getCookie, setCookie } from 'typescript-cookie';

export const saveJWTinCookie = ({response}: {response: Response}) => {
  const jwt_token = response.headers.get('authorization');
  if (jwt_token) {
    setCookie('jwt_token', jwt_token, {
      expires: 7,
      path: '/',
      secure: true,
      sameSite: 'strict'
    });
  }
}

export const injectJWTFromCookies = (headers: Headers) => {
  const jwt = getCookie('jwt_token');
  if (jwt) {
    headers.set('Authorization', jwt);
  }
  return headers;
}