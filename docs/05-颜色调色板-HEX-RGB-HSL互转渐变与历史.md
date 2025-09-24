# 05｜颜色调色板：HEX/RGB/HSL 互转、渐变与历史

本篇围绕 DevTools Hub 的颜色工具，讲解颜色格式互转、渐变生成、历史记录与UI交互。

## 1. 颜色格式与互转

常见格式：
- HEX：`#3498db` / `#fff`
- RGB：`rgb(52, 152, 219)`
- HSL：`hsl(204, 70%, 53%)`

互转思路：
- HEX → RGB：按位解析十六进制
- RGB → HSL：根据最大/最小通道计算 h/s/l
- 保持精度与范围（0-255、0-360、0-100%）

示例：
```js
function hexToRgb(hex) {
  const s = hex.replace('#', '')
  const c = s.length === 3 ? s.split('').map(ch => ch + ch).join('') : s
  const n = parseInt(c, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
```

## 2. 渐变生成与预览

- 给定两个或多个颜色点，生成线性渐变 `linear-gradient()`
- 支持角度与中间停靠（`color-stop`）
- 提供复制 CSS 按钮

增强：
- 自动从主色生成配色方案（互补色、类似色、三角配色）
- 可视化渐变条与可拖拽的色标

## 3. 历史记录与取色器

- 对最近选取/生成的颜色入栈（去重、最多 N 条）
- 点击历史快速回填输入框与预览
- 可选：调用 `EyeDropper API`（受浏览器支持限制）

## 4. 集成到 DevTools Hub

- 统一用 `updateColorInputs('#3498db')` 初始化
- `generatePalette()` 生成调色板并渲染预览格
- `updateColorHistory()` 维护历史
- 与导航/深链接配合良好

## 5. 小练习

- 加一个“对比度检查（WCAG）”，提示文本在该颜色上的可读性分级
- 支持从图片取色（canvas + 文件/拖拽）
- 增加导出：将当前调色板导出为 JSON 或 CSS 变量

---

上一章：04-密码生成器  ｜  下一章：06-正则表达式测试器：实时匹配与模板库
