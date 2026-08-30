const VERSION='2.6.0';
const STATIC_CACHE=`meteo-ranhados-static-${VERSION}`;
const DATA_CACHE=`meteo-ranhados-data-${VERSION}`;
const STATIC_SHELL=[
  '/agora/','/previsao/','/radar/','/graficos/','/climate/','/observatorio/','/camera/','/offline.html',
  '/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/maskable-512.png',
  '/integration/ranhados-shell.css','/integration/ranhados-shell.js','/identity/ranhados-mark.svg','/identity/ranhados-signature.svg','/identity/barragem-ranhados.svg',
  '/agora/agora.css','/agora/agora.js','/previsao/forecast.css','/previsao/forecast.js',
  '/graficos/graphs.css','/graficos/graphs.js'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{const c=await caches.open(STATIC_CACHE);await Promise.allSettled(STATIC_SHELL.map(async u=>{const r=await fetch(u,{cache:'reload'});if(r.ok)await c.put(u,r)}));self.skipWaiting()})());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('meteo-ranhados-')&&!([STATIC_CACHE,DATA_CACHE].includes(k)))await caches.delete(k);await self.clients.claim()})());
});
const normalized=req=>{const u=new URL(req.url);return new Request(u.origin+u.pathname,{method:'GET',headers:{'Accept':req.headers.get('Accept')||'*/*'}})};
async function networkFirst(req,cacheName=DATA_CACHE){const key=normalized(req),c=await caches.open(cacheName);try{const r=await fetch(req);if(r.ok)await c.put(key,r.clone());return r}catch(e){const hit=await c.match(key);if(hit)return hit;throw e}}
async function staleWhileRevalidate(req){const c=await caches.open(STATIC_CACHE),key=normalized(req),hit=await c.match(key);const net=fetch(req).then(r=>{if(r.ok)c.put(key,r.clone());return r}).catch(()=>null);return hit||await net||new Response('',{status:504})}
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;const u=new URL(req.url);
  if(u.origin!==location.origin)return;
  if(u.pathname==='/api/v1/warnings.json'){event.respondWith(fetch(req).catch(()=>new Response(JSON.stringify({warnings:[],stale:true,offline:true}),{status:503,headers:{'Content-Type':'application/json'}})));return}
  if(u.pathname.startsWith('/api/v1/')){event.respondWith(networkFirst(req));return}
  if(u.pathname.endsWith('.mp4'))return;
  if(u.pathname==='/camera/latest.jpg'){event.respondWith(networkFirst(req));return}
  if(req.mode==='navigate'){event.respondWith((async()=>{try{const r=await fetch(req);if(r.ok){const c=await caches.open(STATIC_CACHE);await c.put(normalized(req),r.clone())}return r}catch(e){const c=await caches.open(STATIC_CACHE);return await c.match(normalized(req))||await c.match('/agora/')||await c.match('/offline.html')}})());return}
  if(/\.(?:css|js|png|jpe?g|svg|ico|webmanifest)$/.test(u.pathname)){event.respondWith(staleWhileRevalidate(req));return}
});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});
