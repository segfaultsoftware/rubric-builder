import React, { type PropsWithChildren } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { type PreloadedState } from '@reduxjs/toolkit'
import { type AppStore, type RootState, setupStore } from '../app/store'
import { Provider } from 'react-redux'

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
