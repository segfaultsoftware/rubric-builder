import {injectJWTFromCookies, saveJWTinCookie} from "./Authentication";

export class FetchNotOkError extends Error {
  payload: object

  constructor(message: string, payload: object) {
    super(message)
    this.name = this.constructor.name
    this.payload = payload
  }
}

export const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

export const snakeCaseKeys = (obj: {[key: string]: any}) => {
  const returnObj: {[key: string]: any} = {}

  for(let camel in obj) {
    returnObj[camelToSnakeCase(camel)] = obj[camel]
  }

  return returnObj
}

export const snakeToCamelCase = (str: string) => str.replace(/(_([a-z]))/g, letter => letter[1].toUpperCase())
export const camelCaseKeys = (obj: {[key: string]: any}) => {
  const returnObj: {[key: string]: any} = {}

  for(let snake in obj) {
    returnObj[snakeToCamelCase(snake)] = obj[snake]
  }

  return returnObj
}

async function handleResponse(response: Response) {
  const text = await response.text()
  const json = text.length ? JSON.parse(text) : {}
  if (!response.ok) {
    throw new FetchNotOkError(response.statusText, {message: text});
  }

  saveJWTinCookie({ response });

  return json;
}


interface RequestOptions {
  body?: object
  useJIT?: boolean
}

const defaultRequestOptions: RequestOptions = {
  useJIT: true
}

function request(method: string) {
  return (url: string, options = defaultRequestOptions) => {
    const userOptions = {
      ...defaultRequestOptions,
      ...options
    }
    const requestOptions = {
      method,
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      ...(userOptions.body && {body: JSON.stringify(userOptions.body)})
    };

    if (userOptions.useJIT) {
      injectJWTFromCookies(requestOptions.headers);
    }
    return fetch(url, requestOptions).then(handleResponse);
  }
}

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
}