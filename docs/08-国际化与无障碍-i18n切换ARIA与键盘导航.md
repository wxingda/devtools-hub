# 08｜国际化与无障碍：i18n 切换、ARIA、键盘导航

DevTools Hub 已支持中英切换与一定程度的可访问性。本篇系统化梳理：如何设计 i18n 结构、应用 ARIA 语义，以及确保键盘可达与主题对比度。

## 1. i18n 结构

- 文本标注：使用 `data-i18n` 挂载 key，如 `data-i18n="nav.json-formatter"`
- 语言切换：监听切换按钮，将当前语言保存到 `localStorage`
- 加载与替换：在初始化时根据语言表替换 DOM 文本

示意：
```js
const dict = {
  zh: { 'nav.json-formatter': 'JSON格式化', /* ... */ },
  en: { 'nav.json-formatter': 'JSON Formatter', /* ... */ },
}
function applyI18n(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    if (dict[lang] && dict[lang][key]) el.textContent = dict[lang][key]
  })
}
```

## 2. ARIA 与语义

- 语义化标签：`header/nav/main/footer/section` 等
- 重要区块加上 `role` 与可读名称（如分享条 `role="region"` `aria-label` 描述用途）
- 表单控件：关联 `label for` 与 `id`，状态变化（错误/成功）用 `aria-live` 提示

## 3. 键盘可达

- 所有可交互元素均可 `Tab` 聚焦（按钮、链接、可见控件）
- 快捷键：Alt + 数字切换工具，注意输入框聚焦时不拦截
- 跳转链接：页面首元素提供“跳到主要内容”的跳转锚点

## 4. 颜色与对比度

- CSS 变量控制主题色；暗色主题在 `[data-theme="dark"]` 下覆盖
- 检查文本与背景对比度（WCAG AA/AAA）
- 给出颜色工具中的“对比度检查”作为实战练习

## 5. 本地化细节

- 日期/时间/数字格式：可用 `Intl` 系列 API
- 文案长度差异：按钮/标签预留空间，避免换行破版
- 方向性：如将来支持 RTL 语言，需要在布局上考虑 `dir="rtl"`

## 6. 集成与状态持久

- 语言、主题、最近工具等偏好统一保存在 `localStorage`
- 初始化时按偏好恢复；按钮状态与 UI 文本同步

## 7. 小练习

- 为通知组件添加 `role="status"` + `aria-live="polite"`
- 为工具导航加上 `aria-current="page"` 指示当前工具
- 提供“高对比度模式”的一键切换（在 CSS 里增强边框/文本色）

---

[上一章：07-PWA 进阶](./07-PWA进阶-缓存策略离线页更新与后台同步.md)  ｜  [下一章：09-性能优化：预加载/预连接、字体加载、首屏体验](./09-性能优化-预加载预连接字体与首屏体验.md)
