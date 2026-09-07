const CACHE='the-vision-family-v16-14-1';
const ASSETS=[
  './manifest.webmanifest?v=16.14',
  './icon-192.png?v=16.14',
  './icon-512.png?v=16.14',
  './favicon.png?v=16.14',
  './vision-logo.png?v=16.14'
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(async c=>{
      for(const u of ASSETS){
        try{await c.add(u)}catch(e){}
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const req=e.request;
  const url=new URL(req.url);

  if(req.mode==='navigate' ||
     url.pathname.endsWith('/index.html') ||
     url.pathname.endsWith('/viable-vision-family/')){
    e.respondWith(
      fetch(req,{cache:'no-store'})
        .then(resp=>{
          const cp=resp.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',cp));
          return resp;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(resp=>{
        const cp=resp.clone();
        caches.open(CACHE).then(c=>c.put(req,cp));
        return resp;
      });
    })
  );
});
