const CACHE_VERSION = 'v1.5.3';
const CORE_CACHE = `devtools-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `devtools-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const CORE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/js/header.js',
    '/js/partials.js',
    '/js/pwa.js',
    '/js/tools/password-generator.js',
    '/js/tools/json-formatter.js',
    '/manifest.json',
    OFFLINE_URL,
    '/screenshots/password-generator.png',
    // HTML partials for offline
    '/partials/header.html',
    '/partials/share-bar.html',
    '/partials/nav.html',
    '/partials/footer.html',
    '/partials/star-cta.html',
    '/partials/github-corner.html',
    '/partials/usage-modal.html'
];

const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// 安装事件
self.addEventListener('install', event => {
    console.log('Service Worker: 安装中...');
    event.waitUntil(
        Promise.all([
            caches.open(CORE_CACHE).then(cache => {
                console.log('Service Worker: 缓存核心文件');
                return cache.addAll(CORE_ASSETS);
            }),
            caches.open(RUNTIME_CACHE).then(cache => {
                console.log('Service Worker: 缓存外部资源');
                return cache.addAll(EXTERNAL_ASSETS);
            })
        ]).then(() => {
            console.log('Service Worker: 安装完成');
            return self.skipWaiting();
        })
    );
});

// 激活事件
self.addEventListener('activate', event => {
    console.log('Service Worker: 激活中...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => ![CORE_CACHE, RUNTIME_CACHE].includes(k)).map(k => {
                    console.log('Service Worker: 删除旧缓存', k);
                    return caches.delete(k);
                })
            );
        }).then(() => {
            console.log('Service Worker: 激活完成');
            return self.clients.claim();
        })
    );
});

// 通用 fetch 处理：优先缓存核心，其他资源 stale-while-revalidate
self.addEventListener('fetch', event => {
    // 只处理 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }
    const url = new URL(event.request.url);

    // HTML: network first + offline fallback
    if (event.request.mode === 'navigate' || (event.request.headers.get('Accept') || '').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(resp => {
                    const copy = resp.clone();
                    caches.open(CORE_CACHE).then(c => c.put(event.request, copy));
                    return resp;
                })
                .catch(async () => (await caches.match(event.request)) || (await caches.match(OFFLINE_URL)))
        );
        return;
    }

    // 核心静态资源：cache first
    if (CORE_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
                const copy = resp.clone();
                caches.open(CORE_CACHE).then(c => c.put(event.request, copy));
                return resp;
            }))
        );
        return;
    }

    // 外部与运行时资源：stale-while-revalidate
    event.respondWith(
        caches.match(event.request).then(cached => {
            const fetchPromise = fetch(event.request).then(networkResp => {
                if (networkResp && networkResp.status === 200) {
                    const copy = networkResp.clone();
                    caches.open(RUNTIME_CACHE).then(c => c.put(event.request, copy));
                }
                return networkResp;
            }).catch(() => cached);
            return cached || fetchPromise;
        })
    );
});

// 处理消息 (skip waiting)
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// 后台同步
self.addEventListener('sync', event => {
    console.log('Service Worker: 后台同步', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // 这里可以添加后台同步逻辑
            Promise.resolve()
        );
    }
});

// 推送通知
self.addEventListener('push', event => {
    console.log('Service Worker: 接收到推送通知');

    const options = {
        body: event.data ? event.data.text() : 'DevTools Hub 更新了！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看更新',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'close',
                title: '关闭',
                icon: '/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('DevTools Hub', options)
    );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: 通知被点击', event.action);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // 关闭通知
    } else {
        // 默认行为：打开应用
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});