import { injectJWTFromCookies, saveJWTinCookie } from './Authentication'

export class FetchNotOkError extends Error {
  payload: object

  constructor (message: string, payload: object) {
    super(message)
    this.name = this.constructor.name
    this.payload = payload
  }
}

export const camelToSnakeCase = (str: string): string => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

export const snakeCaseKeys = (obj: Record<string, any>): Record<string, any> => {
  const returnObj: Record<string, any> = {}

  for (const camel in obj) {
    returnObj[camelToSnakeCase(camel)] = obj[camel]
  }

  return returnObj
}

export const snakeToCamelCase = (str: string): string => str.replace(/(_([a-z]))/g, letter => letter[1].toUpperCase())

export const camelCaseKeys = (obj: Record<string, any>): Record<string, any> => {
  const returnObj: Record<string, any> = {}

  for (const snake in obj) {
    const value = obj[snake]
    if (value instanceof Array) {
      returnObj[snakeToCamelCase(snake)] = value.map((v) => camelCaseKeys(v))
    } else if (value instanceof Object) {
      returnObj[snakeToCamelCase(snake)] = camelCaseKeys(value)
    } else {
      returnObj[snakeToCamelCase(snake)] = value
    }
  }

  return returnObj
}

async function handleResponse (response: Response): Promise<any> {
  const text = await response.text()
  const json = text.trim().length > 0 ? JSON.parse(text) : {}
  if (!response.ok) {
    throw new FetchNotOkError(response.statusText, { message: text })
  }

  saveJWTinCookie({ response })

  return json
}

interface RequestOptions {
  body?: object
  useJIT?: boolean
}

const defaultRequestOptions: RequestOptions = {
  useJIT: true
}

function request (method: string) {
  return async (url: string, options = defaultRequestOptions): Promise<any> => {
    const userOptions = {
      ...defaultRequestOptions,
      ...options
    }
    const requestOptions = {
      method,
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      ...(userOptions.body != null && { body: JSON.stringify(userOptions.body) })
    }

    if (userOptions.useJIT != null) {
      injectJWTFromCookies(requestOptions.headers)
    }
    return await fetch(url, requestOptions).then(handleResponse)
  }
}

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
}
