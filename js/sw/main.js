const Mycache = 'kim-currency-conv-v3';

var filesToCache = [
    '.',
    '/currency_converter/js/script.js',
    '/currency_converter/node_modules/bootstrap/dist/css/bootstrap.min.css',
    '/currency_converter/css/style.css',
    '/currency_converter/node_modules/jquery/dist/jquery.min.js',
    '/currency_converter/node_modules/popper.js/dist/popper.min.js',
    '/currency_converter/node_modules/bootstrap/dist/js/bootstrap.min.js',
    '/currency_converter/js/script.js',
    '/currency_converter/index.html'

    
  
  ];
  

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(Mycache).then( cache => {
            return cache.addAll(filesToCache);
        })
    );
});


self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('kim-')  && cacheName != Mycache;
          }).map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });


  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      }).catch(()=> {
        return caches.match('/currency_converter/index.html');
      })
    );
  });

  
