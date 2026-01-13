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
import RubricViewOnly from './features/rubric/RubricViewOnly'
import CalibrationResults from './features/calibrationResults/CalibrationResults'

import './index.css'
import RubricTemplates from './features/rubric/RubricTemplates'

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
        path: 'templates',
        element: <RubricTemplates />
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
        path: 'rubrics/:rubricId/view',
        element: <RubricViewOnly />
      },
      {
        path: 'rubrics/:rubricId/scores/new',
        element: <AuthenticationProtected><ScoreNew /></AuthenticationProtected>
      },
      {
        path: 'rubrics/:rubricId/scores',
        element: <AuthenticationProtected><ScoreAnalysis /></AuthenticationProtected>
      },
      {
        path: 'rubrics/:rubricId/calibration-results',
        element: <AuthenticationProtected><CalibrationResults /></AuthenticationProtected>
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
