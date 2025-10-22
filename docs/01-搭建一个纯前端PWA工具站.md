# 01｜搭建一个纯前端 PWA 工具站（从 0 到可安装）

本篇面向前端新手，带你搭建一个“纯前端、可离线、可安装”的小工具站。我们用 DevTools Hub 作为参考案例，一步步拆解页面结构、样式组织、脚本初始化和 PWA 三件套。

阅读目标：
- 理解一个静态站的基本骨架
- 学会在本地快速预览（含 macOS、Windows、Linux）
- 认识 PWA 的基本概念与项目中的落地实现

## 1. 目录与关键文件

纯静态站的最小集合：
- `index.html`：页面骨架与 SEO 元信息
- `styles.css`：所有样式（本项目内含深色主题、响应式、组件化）
- `script.js`：交互逻辑与工具模块组织
- `manifest.json`：PWA 清单，定义名称、图标、启动方式
- `sw.js`：Service Worker，缓存离线资源、离线页、更新策略
- `offline.html`：断网时的兜底页面

打开仓库对照：以上文件在根目录即可找到。

## 2. 在本地跑起来

- 直接双击 `index.html` 用浏览器打开（最简单）
- 或者开一个本地静态服务器（推荐，便于调试 PWA）

macOS（zsh）：
```bash
python -m http.server 8000
# 然后浏览器打开 http://localhost:8000

# 如果不想看到每次请求的日志，可以重定向输出
python -m http.server 8000 > /dev/null 2>&1

# 或者仅隐藏标准输出，保留错误信息
python -m http.server 8000 > /dev/null
```

Windows：
```bash
# PowerShell
python -m http.server 8000

# 重定向输出到 nul（不显示请求日志）
python -m http.server 8000 > nul 2>&1
```

> 💡 **补充说明**：`python -q` 是用于启动 Python 交互式解释器时不显示版本和版权信息的参数，但对 `http.server` 模块不起作用。如需减少服务器日志输出，建议使用重定向符号（如 `> /dev/null`）。

Node 党：
```bash
npx serve .
```

提示：使用本地服务器访问时，`sw.js` 才能被注册，PWA 功能（缓存、安装）才能完整工作。

## 3. HTML：骨架与可访问性

观察 `index.html`：
- 完整的 SEO/社交分享 meta（canonical、OG、Twitter）
- 结构化数据 JSON-LD（SoftwareApplication/WebApplication）
- 跳转链接 `.skip-link` 与语义化标签（`header/nav/main`）
- 响应式视口与字体/图标延迟加载
- 主题色、颜色方案（light/dark）

思考题：
- 为什么要有 `link rel="preconnect"` 与 `dns-prefetch`？
- OG 图片为什么要提供 `alt/width/height`？

## 4. CSS：主题与组件

`styles.css` 使用 CSS 变量组织主题：
- `:root` 定义浅色主题变量，`[data-theme="dark"]` 覆盖暗色
- 组件块：头部区、功能卡片、导航、工具面板、按钮、表单
- 响应式：`grid` + `flex`，移动端适配

动手：把 `--primary-color` 改一下，观察整体配色的联动变化。

## 5. JS：初始化与模块化思维

`script.js` 做了三件事：
- App 初始化：导航、主题、工具注册、首屏默认数据
- 工具间切换：`switchTool(toolId)` + URL 深链接（`?tool=` 或 `#`）
- 体验增强：快捷键（Alt+数字）、通知、分享条、统计（本地模拟）

项目还预留了插件注册能力：
```js
window.DevToolsHub.registerTool(id, hooks);
```
你可以把自己的功能以 `hooks` 约定接入（如 `onMount/onUnmount`）。

## 6. PWA 三件套

- `manifest.json`：应用名称、图标集合、shortcuts 快捷入口、`display: standalone`
- `sw.js`：核心/运行时缓存、离线回退、stale-while-revalidate、更新策略（`SKIP_WAITING`）
- `index.html`：注册 Service Worker 的脚本段（在页面底部）

在 DevTools 的 Application 面板可以看到：
- Manifest 读取情况与图标是否就绪
- Service Workers 的生命周期（install/activate）
- Cache Storage 的两个缓存：`devtools-core-*` 和 `devtools-runtime-*`

练习：
1) 断网后刷新，观察离线是否仍可访问核心页面；
2) 修改 `CACHE_VERSION`，刷新两次，体验更新流程；
3) 为某张截图新增预缓存项，观察离线是否命中。

## 7. 下一步

- 继续第二篇：实现“可插拔工具栏”与深链接、快捷键结构
- 想挑战：把你的第一个功能注册为一个工具卡片（用 `registerTool`）

附注：如果你在教学或团队内推广这个项目，建议引导在线版体验，强调“纯前端、零依赖、离线可用”的差异化优势。

---

下一章：02-用原生 JS 做一个可插拔工具栏（导航/深链接/快捷键）
