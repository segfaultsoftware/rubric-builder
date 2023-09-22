import React, { useEffect, useRef, useState } from 'react'

import { Outlet } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from './app/hooks'
import { getLoggedInAs, selectLoggedInAs } from './features/profile/profileSlice'
import {
  dispatchFromServerPush,
  getBrowserSubscription,
  selectVapidPublicKey,
  updateBrowserSubscription
} from './features/browser/browserSlice'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

import NavBar from './NavBar'

const RootLayout = () => {
  const dispatch = useAppDispatch()
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const vapidPublicKey = useAppSelector(selectVapidPublicKey)

  const triggered = useRef<boolean>(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    dispatch(getBrowserSubscription())
    serviceWorkerRegistration.register({
      onRegistration: (registration) => {
        setRegistration(registration)
      }
    })
  }, [])

  useEffect(() => {
    if (!loggedInAs) {
      dispatch(getLoggedInAs())
    }
  }, [loggedInAs])

  useEffect(() => {
    if (registration && vapidPublicKey) {
      const subscribeOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      }

      const hasBeenTriggered = triggered.current
      if (!hasBeenTriggered) {
        triggered.current = true
        registration.pushManager.subscribe(subscribeOptions).then((recentSubscription) => {
          dispatch(updateBrowserSubscription(recentSubscription))
        }).catch((error) => {
          console.error('Error subscribing', error)
        })
        navigator.serviceWorker.addEventListener('message', (message) => {
          const data = JSON.parse(message.data)
          if (data.type === 'push') {
            const { type, action, id } = data.event
            dispatch(dispatchFromServerPush({ id, type, action }))
          }
        })
      }
    }
  }, [registration, vapidPublicKey])

  return (
    <div className="container-sm col-xl-10 col-xxl-8 px-4 py-1">
      <NavBar loggedInAs={loggedInAs} />
      <Outlet />
    </div>
  )
}

export default RootLayout
