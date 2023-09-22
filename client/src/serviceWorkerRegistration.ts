/*
  Copied a lot of the logic from the following command:

  yarn create-react-app my-app --template cra-template-pwa-typescript
 */

interface Config {
  onRegistration?: (registration: ServiceWorkerRegistration) => void
}

export function register (config?: Config) {
  if (!('serviceWorker' in navigator)) {
    console.warn('serviceWorker not in navigator')
  } else {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      console.warn('URLs differ, so cannot run service worker')
      return
    }

    const serviceWorkerUrl = `${process.env.PUBLIC_URL}/service-worker.js`
    registerValidServiceWorker(serviceWorkerUrl, config)
  }
}

function registerValidServiceWorker (serviceWorkerUrl: string, config?: Config) {
  navigator.serviceWorker.register(serviceWorkerUrl).then((registration) => {
    if (config?.onRegistration) {
      config.onRegistration(registration)
    }
  }).catch((error) => {
    console.error('Error during service worker registration:', error)
  })
}
