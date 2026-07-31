/* Service worker — прави програмата достъпна офлайн.
   Файлът е самостоятелен (без външни мостри/шрифтове), затова кешът е кратък. */

const VERSION = 'guitar-routine-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(()=>{}))))
      .then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  // network-first, за да виждаш обновленията веднага; кешът е резервата за офлайн
  e.respondWith(
    fetch(req).then(res=>{
      if(res && res.ok){ const copy = res.clone(); caches.open(VERSION).then(c=>c.put(req, copy)); }
      return res;
    }).catch(()=> caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
