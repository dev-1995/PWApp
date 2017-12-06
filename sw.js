importScripts('src/js/idb.js');
importScripts('src/js/dbutility.js')
var FILES = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/editor.js',
    '/src/js/dbutility.js',
    '/src/js/quill.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    'https://fonts.gstatic.com/s/materialicons/v31/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/fonts/roboto/Roboto-Regular.woff2',
];

self.addEventListener('install',function(event){
    console.log('[Service Worker installing]');
    event.waitUntil(
        caches.open('Static_Files').then(function(cache){
            console.log('precaching app ');
            cache.addAll(FILES);
        })
    )
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== 'Static_Files' && key !== 'Dynamic_Files') {
                        console.log('[Service Worker] Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)

        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}


self.addEventListener('fetch', function (event) {

    var url = 'https://pwapp-f6d53.firebaseio.com/posts';
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
            .then(function (res) {
                var clonedRes = res.clone();
                clearAllData('posts')
                    .then(function () {
                        return clonedRes.json();
                    })
                    .then(function (data) {
                        for (var key in data) {
                            writeData('posts', data[key])
                        }
                    });
                return res;
            })
        );
    }  else if (isInArray(event.request.url, 'Static_Files')) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(function (res) {
                                return caches.open('Dynamic_Files')
                                    .then(function (cache) {
                                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                                        cache.put(event.request.url, res.clone()).catch(function(e){});
                                        return res;
                                    }).catch(function(e){});
                            })
                            .catch(function (err) {

                            });
                    }
                })
        );
    }
});


self.addEventListener('sync', function(event) {
    console.log('[Service Worker] Background syncing', event);
    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker] Syncing new Posts');
        event.waitUntil(
            readAllData('sync-posts')
                .then(function(data) {
                    for (var dt of data) {
                        fetch('https://us-central1-pwapp-f6d53.cloudfunctions.net/storePost', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                id: dt.id,
                                post : dt.post
                            })
                        })
                            .then(function(res) {
                                console.log('Sent data', res);
                                if (res.ok) {
                                    res.json()
                                        .then(function(resData) {
                                            deleteItemFromData('sync-posts', resData.id);
                                        });
                                }
                            })
                            .catch(function(err) {
                                console.log('Error while sending data', err);
                            });
                    }

                })
        );
    }
});
