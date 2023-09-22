// eslint-disable-next-line @typescript-eslint/no-unused-expressions
self.__WB_MANIFEST

self.addEventListener('push', (event) => {
  clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage(JSON.stringify({
        type: 'push',
        event: JSON.parse(event.data?.text() || '{}')
      }))
    })
  })
})
