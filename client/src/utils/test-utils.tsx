import React, { type PropsWithChildren } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { type PreloadedState } from '@reduxjs/toolkit'
import { type AppStore, type RootState, setupStore } from '../app/store'
import { Provider } from 'react-redux'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>
  store?: AppStore
}
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  function Wrapper ({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
      <Provider store={store}>{children}</Provider>
    )
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export interface ServerStub {
  method: 'get' | 'post' | 'put' | 'delete'
  url: string
  json: object | object[]
}

export const setupServerWithStubs = (stubs: ServerStub[] = []) => {
  return setupServer(
    ...stubs.map((serverStub) => {
      return rest[serverStub.method](serverStub.url, async (req, res, ctx) => {
        return res(
          ctx.json(serverStub.json)
        )
      })
    })
  )
}

export const addStubToServer = (server: ReturnType<typeof setupServer>, stub: ServerStub) => {
  server.use(
    rest[stub.method](stub.url, async (req, res, ctx) => {
      return res(ctx.json(stub.json))
    })
  )
}
