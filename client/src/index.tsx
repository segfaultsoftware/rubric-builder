import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './bootstrapOverrides.scss'

import { store } from './app/store'
import reportWebVitals from './reportWebVitals'
import RootLayout from './RootLayout'
import RubricIndex from './features/rubric/RubricIndex'
import HomePage from './HomePage'
import RubricNew from './features/rubric/RubricNew'
import RubricEdit from './features/rubric/RubricEdit'
import CalibrationsEdit from './features/calibrations/CalibrationsEdit'
import ScoreNew from './features/scores/ScoreNew'
import ScoreAnalysis from './features/scores/ScoreAnalysis'
import RegisterPage from './features/profile/RegisterPage'
import LoginPage from './features/profile/LoginPage'
import AuthenticationProtected from './AuthenticationProtected'
import AcceptInvitation from './features/invites/AcceptInvitation'
import Invite from './features/invites/Invite'

import './index.css'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!
const root = createRoot(container)
const router = createBrowserRouter([
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/invitations/accept',
    element: <AcceptInvitation />
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'invite',
        element: <AuthenticationProtected><Invite /></AuthenticationProtected>
      },
      {
        path: 'calibrations/:rubricId/edit',
        element: <AuthenticationProtected><CalibrationsEdit /></AuthenticationProtected>
      },
      {
        path: 'rubrics',
        element: <AuthenticationProtected><RubricIndex /></AuthenticationProtected>
      },
      {
        path: 'rubrics/new',
        element: <AuthenticationProtected><RubricNew /></AuthenticationProtected>
      },
      {
        path: 'rubrics/:rubricId/edit',
        element: <AuthenticationProtected><RubricEdit /></AuthenticationProtected>
      },
      {
        path: 'rubrics/:rubricId/scores/new',
        element: <AuthenticationProtected><ScoreNew /></AuthenticationProtected>
      },
      {
        path: 'rubrics/:rubricId/scores',
        element: <AuthenticationProtected><ScoreAnalysis /></AuthenticationProtected>
      }
    ]
  }
])

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
