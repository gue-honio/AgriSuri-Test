// ============================================================
// sw.js — Service Worker ng AgriSense PH
// Ino-cache ang lahat ng files para gumana offline.
// Kapag walang internet — gagamitin ang cached version.
// ============================================================

const CACHE_NAME = 'agrisense-ph-v1';

// Lahat ng files na ica-cache para sa offline use
const FILES_TO_CACHE = [
  './',
  './index.html',
  './auth.html',
  './admin.html',
  './da-dashboard.html',
  './analytics.html',
  './css/app.css',
  './css/weather.css',
  './css/result.css',
  './libs/tf.min.js',
  './libs/teachablemachine-image.min.js',
  './models/rice/model.json',
  './models/rice/weights.bin',
  './models/rice/metadata.json',
  './models/tomato/model.json',
  './models/tomato/weights.bin',
  './models/tomato/metadata.json'
];

// ── INSTALL ───────────────────────────────────────────────────
// Tinatawag kapag unang beses na nag-install ang Service Worker.
// Dito nica-cache ang lahat ng files.
self.addEventListener('install', event => {
  console.log('[SW] Installing AgriSense PH Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching all files...');
      // Cache files one by one — hindi mag-fail kahit may hindi ma-cache
      return Promise.allSettled(
        FILES_TO_CACHE.map(file =>
          cache.add(file).catch(err =>
            console.warn(`[SW] Could not cache: ${file}`, err)
          )
        )
      );
    }).then(() => {
      console.log('[SW] Installation complete!');
      // Force activation — hindi na maghihintay ng reload
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────
// Tinatawag kapag active na ang Service Worker.
// Dito tinatanggal ang lumang cache versions.
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME) // Tanggalin ang lumang versions
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Now controlling all pages.');
      return self.clients.claim(); // I-control agad ang lahat ng pages
    })
  );
});

// ── FETCH ─────────────────────────────────────────────────────
// Tinatawag sa bawat network request.
// Strategy: Cache First — gamitin ang cache, kung wala — i-fetch sa network.
// Para sa AI model files at app files — cache first.
// Para sa API calls (weather, Supabase) — network first.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ── API CALLS — Network First ─────────────────────────────
  // Para sa Supabase at Open-Meteo — kailangan ng fresh data
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('open-meteo.com') ||
      url.hostname.includes('nominatim.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Kapag offline at API call — ibalik ang custom offline response
          return new Response(
            JSON.stringify({ error: 'offline', message: 'No internet connection' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // ── APP FILES — Cache First ───────────────────────────────
  // Para sa HTML, CSS, JS, at model files — gamitin ang cache
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // May cache — gamitin ito at i-update sa background
        const fetchUpdate = fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {}); // Hindi critical kung mag-fail ang background update

        return cached; // Ibalik ang cached version agad
      }

      // Walang cache — i-fetch sa network
      return fetch(event.request)
        .then(response => {
          // I-save sa cache para sa susunod
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline at walang cache — offline page para sa HTML requests
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

// ── BACKGROUND SYNC ───────────────────────────────────────────
// Kapag bumalik ang internet — i-sync ang queued detections
self.addEventListener('sync', event => {
  if (event.tag === 'sync-detections') {
    console.log('[SW] Background sync triggered');
    // Ang actual sync logic ay nasa index.html (online event listener)
  }
});

console.log('[SW] Service Worker script loaded!');
