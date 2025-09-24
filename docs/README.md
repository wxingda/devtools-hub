# DevTools Hub 前端新手教程系列

> 面向零到一学习前端与工程化思维的同学。本系列以本仓库「DevTools Hub」为主线案例，边学边做，循序渐进，顺便把你的第一个 PWA 小站上线。

- 在线体验：https://wxingda.github.io/devtools-hub
- 项目仓库：https://github.com/wxingda/devtools-hub

## 你将收获
- 纯前端项目的基础骨架：HTML + CSS + 原生 JavaScript
- 响应式 UI、深色模式、快捷键、组件化组织
- PWA 三件套：manifest.json、service worker、离线/安装
- 常见工具实战：密码生成器、JSON 格式化器、颜色调色板、正则测试器
- SEO 与分享：meta/OG/Twitter、sitemap/robots
- 部署与运维：GitHub Pages 一键上线与更新策略

## 教程目录
1. [01-搭建一个纯前端 PWA 工具站（从 0 到可安装）](./01-搭建一个纯前端PWA工具站.md)
2. [02-用原生 JS 做一个可插拔工具栏（导航/深链接/快捷键）](./02-原生JS的可插拔工具栏.md)
3. [03-JSON 工具实战：从文本框到树视图与校验](./03-JSON工具实战-从文本框到树视图与校验.md)
4. [04-密码生成器：随机性、强度评估与一键复制](./04-密码生成器-随机性强度评估与一键复制.md)
5. [05-颜色调色板：HEX/RGB/HSL 互转、渐变与历史](./05-颜色调色板-HEX-RGB-HSL互转渐变与历史.md)
6. [06-正则表达式测试器：实时匹配与模板库](./06-正则表达式测试器-实时匹配与模板库.md)
7. [07-PWA 进阶：缓存策略、离线页、更新与后台同步](./07-PWA进阶-缓存策略离线页更新与后台同步.md)
8. [08-国际化与无障碍：i18n 切换、ARIA、键盘导航](./08-国际化与无障碍-i18n切换ARIA与键盘导航.md)
9. [09-性能优化：预加载/预连接、字体加载、首屏体验](./09-性能优化-预加载预连接字体与首屏体验.md)
10. [10-部署与 SEO：GitHub Pages、sitemap、Open Graph](./10-部署与SEO-GitHubPages-sitemap-OpenGraph.md)

建议按序阅读；也可挑选与自己当下最相关的主题直接上手。

---

小提示：如你准备把自己的工具或功能接入 DevTools Hub，可关注预留的插件 API：`window.DevToolsHub.registerTool(id, hooks)`。
