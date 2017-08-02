self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('Todo').then(cache => {
            return cache.addAll([]);
        })
    );
});