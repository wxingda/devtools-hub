# 03｜JSON 工具实战：从文本框到树视图与校验

本篇以 DevTools Hub 的 JSON 工具为例，带你实现“格式化/压缩 + 语法校验 + 树视图 + 交互反馈”。

目标：
- 写出可靠的格式化/压缩逻辑与错误提示
- 实现 JSON 校验与错误定位的用户体验
- 架构一个树状展示的思路与渐进增强

## 1. 基本格式化与压缩

核心是 `JSON.parse` 和 `JSON.stringify`：
```js
function pretty(jsonStr) {
  const obj = JSON.parse(jsonStr)
  return JSON.stringify(obj, null, 2)
}
function minify(jsonStr) {
  const obj = JSON.parse(jsonStr)
  return JSON.stringify(obj)
}
```
健壮性：
- 用 try/catch 包裹，错误时在 UI 显示错误信息（行/列若可得）
- 在输入为空/仅空白时给出提示而非异常

## 2. 错误提示与定位

`JSON.parse` 报错信息通常包含位置，但不总是精确到行列。可以：
- 在异常时高亮输入框边框为红色，显示错误文本
- 简单行列估算：遍历字符串直到错误位置（按消息中的 `position` 或扫描）
- 用户体验优先：保留上次正确结果，避免清空输出

## 3. 树状视图：思路与实现路径

保持“渐进增强”的策略：
- 基线：文本格式化输出
- 进阶：将对象转换为树节点数组，渲染成可折叠的 DOM

示例思路：
```js
function toTree(obj, path = '$') {
  if (obj !== null && typeof obj === 'object') {
    const isArr = Array.isArray(obj)
    const children = Object.entries(obj).map(([k, v]) => toTree(v, `${path}${isArr ? `[${k}]` : `.${k}`}`))
    return { type: isArr ? 'array' : 'object', path, size: children.length, children }
  }
  return { type: typeof obj, path, value: obj }
}
```
渲染时：
- object/array 显示 key 数量、支持折叠
- 原始值直接显示，适当着色（字符串绿色、数字蓝色、布尔紫色、null 灰色）

## 4. 交互与状态

- 文本/树双视图切换：保留上一次选择（localStorage）
- 复制按钮：一键复制格式化结果
- 校验状态徽标：有效/无效
- 大文件提示：超过阈值给出性能提示，必要时懒加载树节点

## 5. 集成到 DevTools Hub

- 将“格式化/压缩/校验/树视图”作为 hooks 接入 `registerTool('json-formatter', hooks)`
- 在 `switchTool('json-formatter')` 时初始化或刷新视图
- 支持深链接：`?tool=json-formatter`

## 6. 小练习

- 在错误时尽量给出“最可能的修复建议”（如缺少逗号、引号不闭合）
- 加一个“美化缩进宽度”选择（2/4 空格）
- 大对象的树视图做懒加载，点击时再展开子项

---

上一章：02-原生 JS 的可插拔工具栏  ｜  下一章：04-密码生成器：随机性、强度评估与一键复制
