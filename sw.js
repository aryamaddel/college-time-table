const CACHE_NAME = 'timetable-v1';
const ASSETS = [
  '/',
  '/timetable.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => 
        key !== CACHE_NAME ? caches.delete(key) : null
      ))
    )
  );
});
