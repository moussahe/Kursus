// Schoolaris Service Worker
// Handles push notifications and offline caching

const CACHE_NAME = "schoolaris-v1";
const OFFLINE_URL = "/offline";

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and chrome-extension URLs
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try network first for API requests
        if (event.request.url.includes("/api/")) {
          return await fetch(event.request);
        }

        // For other requests, try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          // Fetch in background to update cache
          event.waitUntil(
            (async () => {
              try {
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, networkResponse.clone());
              } catch {
                // Network failed, that's okay
              }
            })()
          );
          return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(event.request);

        // Cache successful responses for static assets
        if (
          networkResponse.ok &&
          (event.request.url.includes("/icons/") ||
            event.request.url.includes("/screenshots/") ||
            event.request.url.endsWith(".css") ||
            event.request.url.endsWith(".js"))
        ) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // Network failed, try to serve offline page for navigation
        if (event.request.mode === "navigate") {
          const cachedOffline = await caches.match(OFFLINE_URL);
          if (cachedOffline) {
            return cachedOffline;
          }
        }
        throw error;
      }
    })()
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("Push event received but no data");
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "Nouvelle notification de Schoolaris",
      icon: data.icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      image: data.image,
      tag: data.tag || "schoolaris-notification",
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: [200, 100, 200],
      data: {
        url: data.url || "/",
        notificationId: data.notificationId,
        type: data.type,
        childId: data.childId,
        timestamp: Date.now(),
      },
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Schoolaris", options)
    );
  } catch (error) {
    console.error("Error showing push notification:", error);
  }
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || "/";

  // Handle action buttons
  if (event.action) {
    switch (event.action) {
      case "view":
        // Open the URL
        event.waitUntil(openUrl(targetUrl));
        break;
      case "dismiss":
        // Just close, already done above
        break;
      default:
        event.waitUntil(openUrl(targetUrl));
    }
  } else {
    // Default click action
    event.waitUntil(openUrl(targetUrl));
  }

  // Track notification click if notificationId exists
  if (notificationData.notificationId) {
    event.waitUntil(
      fetch("/api/push/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: notificationData.notificationId,
          action: event.action || "click",
        }),
      }).catch(() => {
        // Ignore tracking failures
      })
    );
  }
});

// Helper to open URL in existing window or new one
async function openUrl(url) {
  const windowClients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  // Check if there's already a window with this URL
  for (const client of windowClients) {
    if (client.url === url && "focus" in client) {
      return client.focus();
    }
  }

  // Check if any window is on our origin
  for (const client of windowClients) {
    if (client.url.startsWith(self.location.origin) && "navigate" in client) {
      await client.navigate(url);
      return client.focus();
    }
  }

  // Open new window
  return self.clients.openWindow(url);
}

// Handle notification close (for analytics)
self.addEventListener("notificationclose", (event) => {
  const notificationData = event.notification.data || {};

  if (notificationData.notificationId) {
    fetch("/api/push/track-dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationId: notificationData.notificationId,
      }),
    }).catch(() => {
      // Ignore tracking failures
    });
  }
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-progress") {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // Sync any cached progress updates
  const cache = await caches.open(CACHE_NAME);
  const pendingSync = await cache.match("/pending-sync");

  if (pendingSync) {
    try {
      const data = await pendingSync.json();
      await fetch("/api/progress/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await cache.delete("/pending-sync");
    } catch {
      // Will retry on next sync
    }
  }
}

console.log("Schoolaris Service Worker loaded");
