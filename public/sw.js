const CACHE_VERSION = '350';
const PRE_CACHE_FILES = [
  '/',
  'index.html',
  'manifest.webmanifest',
  'assets/favicon-32x32.png',
  'assets/favicon-76x76.png',
  'assets/favicon-144x144.png',
  'assets/favicon-192x192.png',
  'assets/favicon-512x512.png',
];

async function preCache() {
  const cache = await caches.open(CACHE_VERSION);
  return cache.addAll(PRE_CACHE_FILES);
}

async function cleanOldCaches() {
  let cacheNames = await caches.keys();
  cacheNames = cacheNames.filter(cacheName => cacheName !== CACHE_VERSION)
  for (const cacheName of cacheNames) {
    caches.delete(cacheName);
  }
}

async function fetchAndCache(event) {
  const response = await fetch(event.request);
  const cache = caches.open(CACHE_VERSION).then(cache => {
    const requestURL = new URL(event.request.url);
    cache.put(requestURL.href, response);
  });
  return response.clone();
}

async function getInCacheOrFetchAndCache(event) {
  const response = await caches.match(event.request);
  return response ?? fetchAndCache(event);
}

self.addEventListener('install', event => {
  self.skipWaiting();
  const promise = preCache();
  event.waitUntil(promise);
});

self.addEventListener('fetch', event => {
  let promise;
  if (event.request.cache === 'reload') {
    promise = fetchAndCache(event);
  } else {
    promise = getInCacheOrFetchAndCache(event);
  }
  event.respondWith(promise);
});

self.addEventListener('activate', event => {
  const promise = Promise.all([cleanOldCaches(), clients.claim()]);
  event.waitUntil(promise);
});