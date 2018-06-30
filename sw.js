const kimCache = 'kim-currency-conv';

let filesToCache = [
    'sw.js',
    'node_modules/idb/lib/idb.js',
    'script.js',
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'css/style.css',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/popper.js/dist/popper.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'index.html'
  ];
  

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(kimCache).then( cache => {
            return cache.addAll(filesToCache);
        })
    );
});


// self.addEventListener('activate', event => {
//     event.waitUntil(
//       caches.keys().then(cacheNames => {
//         return Promise.all(
//           cacheNames.filter(cacheName => {
//             return cacheName.startsWith('kim-')  && cacheName != Mycache;
//           }).map(cacheName => {
//             return caches.delete(cacheName);
//           })
//         );
//       })
//     );
//   });


  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      }).catch(()=> {
        return caches.match('index.html');
      })
    );
  });