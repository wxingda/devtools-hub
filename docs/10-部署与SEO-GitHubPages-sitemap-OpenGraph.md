# 10｜部署与 SEO：GitHub Pages、sitemap、Open Graph

用最小成本把你的站点上线，同时让搜索与社交分享识别得更好。DevTools Hub 作为示例，已经具备完整的 SEO/分享与 PWA 配置。

## 1. GitHub Pages 部署

- 分支方式：设置仓库 Pages 来源为 `main` 分支根目录
- 工作流：`.github/workflows/deploy.yml` 可自动化构建/部署（如有需要）
- 本项目为纯静态：无需构建，直接发布即可

## 2. 基础 SEO 元信息

在 `index.html` 中：
- `title/description/keywords/author`，并设置 `robots` 允许抓取
- canonical 链接指向正式地址
- 语言与区域：`lang`、`geo.region`

## 3. 社交分享：OG 与 Twitter Card

- Open Graph：`og:type/url/title/description/image`，建议 1200×630 尺寸
- Twitter Card：`summary_large_image` 与同等字段
- 提供 `og:image:alt/width/height`，提升可访问性与解析稳定性

## 4. 结构化数据（JSON-LD）

- `SoftwareApplication` 或 `WebApplication`，包含 `name/description/url` 等
- 免费开源可标注 `offers.price=0`
- 更新 `dateModified` 以反映最近更新时间

## 5. sitemap 与 robots

- `sitemap.xml`：列出重要页面（首页、工具锚点可视情况）
- `robots.txt`：允许抓取核心资源、禁止私有路径
- 记得把 `sw.js` 加入允许列表（已在项目中）

## 6. PWA 与可发现性

- `manifest.json` 完整图标与快捷方式
- `sw.js` 提供离线 + 更新；访问 Application 面板检查
- `theme-color` 与 `apple-mobile-web-app-*` 提升移动端表现

## 7. 监测与校验

- 使用 Lighthouse 检测性能/可访问性/SEO/PWA
- 使用 Twitter Card Validator、Facebook Sharing Debugger 检查卡片
- 搜索控制台（如 Google/Bing）提交 `sitemap.xml`

## 8. 常见问题

- OG 图片路径：尽量用绝对 URL，确保外部可访问
- CDN 字体：在大陆/内网环境考虑自托管或降级策略
- 多语言：提供显式切换，避免仅靠浏览器自动检测

---

[上一章：09-性能优化](./09-性能优化-预加载预连接字体与首屏体验.md)  ｜  全书完：你已具备把一个纯前端 PWA 工具站从 0 到上线的完整路径。
