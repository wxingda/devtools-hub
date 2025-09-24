# 07｜PWA 进阶：缓存策略、离线页、更新与后台同步

这一篇深入 DevTools Hub 的 PWA 实战：核心/运行时缓存层次、离线页、更新流程（跳过等待）、后台同步与推送通知。

## 1. 缓存分层与命名

- Core Cache（核心静态资源）：`index.html`、`styles.css`、`script.js`、`manifest.json`、`offline.html` 等
- Runtime Cache（运行时/外部资源）：字体、图标等 CDN 资源
- 使用版本号前缀：`devtools-core-vX.Y.Z`、`devtools-runtime-vX.Y.Z`

作用：
- 可控地清理旧版本缓存
- 避免不同策略互相污染

## 2. 安装与激活生命周期

在 `install` 中预缓存核心与外部资源；在 `activate` 中删除旧缓存并 `clients.claim()`：
```js
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const core = await caches.open(CORE_CACHE)
    await core.addAll(CORE_ASSETS)
    const runtime = await caches.open(RUNTIME_CACHE)
    await runtime.addAll(EXTERNAL_ASSETS)
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => ![CORE_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})
```

## 3. Fetch 策略

- HTML：network-first + offline fallback（优先最新页面，断网退离线页）
- 核心静态：cache-first（稳定且常用）
- 外部与运行时：stale-while-revalidate（先快速返回缓存，再后台更新）

## 4. 离线页与体验

- `offline.html` 轻量友好，提示断网并提供“重试/回到首页”
- 可显示最近一次可用的主内容截图/说明

## 5. 更新流程（跳过等待）

- 页面监听 `updatefound`，新 SW `installed` 且存在控制器时提示“有新版本，点击立即更新”
- 点击后通过 `postMessage({ type: 'SKIP_WAITING' })` 触发新 SW 接管
- 刷新页面以加载最新资源

## 6. 后台同步与推送（可选）

- `sync` 事件：网络恢复后重试任务（本项目用作演示）
- `push` 事件：显示通知；点击通知打开应用或特定页面

## 7. 调试与排错

- DevTools → Application → Service Workers/Cache Storage/Manifest
- 注意缓存更新时机：需触发安装/激活与资源请求
- 建议在测试时频繁 bump `CACHE_VERSION`，验证清理与回填

## 8. 小练习

- 增加一个版本提示条，显示当前 SW 版本并提供“刷新以更新”按钮
- 为截图/图标等增加预缓存，提升离线体验
- 将字体改为本地打包/子集化，减少外部依赖

---

上一章：06-正则表达式测试器  ｜  下一章：08-国际化与无障碍：i18n 切换、ARIA、键盘导航
