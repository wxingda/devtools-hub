# 🤝 贡献指南

欢迎您为 DevTools Hub 做出贡献！我们感谢每一个贡献者的努力。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发指南](#开发指南)
- [提交规范](#提交规范)
- [问题反馈](#问题反馈)
- [功能建议](#功能建议)

## 🤝 行为准则

我们承诺为所有人提供无骚扰的体验，无论年龄、身体大小、残疾、种族、性别认同和表达、经验水平、国籍、个人外表、种族、宗教或性身份和取向如何。

### 我们的标准

**积极行为包括：**
- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

**不可接受的行为包括：**
- 使用性暗示的语言或图像
- 恶意评论、侮辱/贬损评论，以及人身攻击或政治攻击
- 公开或私下骚扰
- 未经明确许可，发布他人的私人信息
- 在专业环境中可能被认为不当的其他行为

## 🚀 如何贡献

### 1. Fork 仓库

点击页面右上角的 "Fork" 按钮，将仓库 fork 到您的 GitHub 账户。

### 2. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/devtools-hub.git
cd devtools-hub
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 4. 进行更改

在您的本地环境中进行代码更改。

### 5. 提交更改

```bash
git add .
git commit -m "你的提交信息"
```

### 6. 推送到 GitHub

```bash
git push origin feature/your-feature-name
```

### 7. 创建 Pull Request

在 GitHub 上创建一个 Pull Request，详细描述您的更改。
5. 开启一个 Pull Request

## 📋 贡献类型

### 🐛 错误报告
- 使用清晰描述性的标题
- 提供重现步骤
- 说明预期行为和实际行为
- 包含截图（如果适用）
- 提供环境信息（浏览器、操作系统等）

### ✨ 功能请求
- 使用清晰描述性的标题
- 详细描述建议的功能
- 解释为什么这个功能有用
- 考虑替代方案

### 💻 代码贡献
- 确保代码符合项目的编码标准
- 添加必要的注释
- 更新相关文档
- 测试你的更改

## 🎯 开发指南

### 项目结构
```
devtools-hub/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript功能
├── README.md           # 项目说明
├── CONTRIBUTING.md     # 贡献指南
└── LICENSE             # 许可证
```

### 代码规范
- 使用一致的缩进（2个空格）
- 为函数和复杂逻辑添加注释
- 使用语义化的变量和函数名
- 保持代码简洁易读

### 添加新工具
1. 在 `index.html` 中添加导航按钮和工具内容
2. 在 `styles.css` 中添加相应样式
3. 在 `script.js` 中实现功能逻辑
4. 更新 README.md 中的功能列表

## 🔧 本地开发

1. 克隆仓库：
```bash
git clone https://github.com/your-username/devtools-hub.git
cd devtools-hub
```

2. 直接在浏览器中打开 `index.html` 或使用本地服务器：
```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve .
```

3. 访问 `http://localhost:8000`

## 📝 提交信息规范

使用语义化的提交信息：

- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档更新
- `style:` 代码格式化
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 其他更改

示例：
```
feat: 添加颜色调色板工具
fix: 修复密码生成器的字符集问题
docs: 更新使用说明
```

## 🎨 设计指南

### 用户界面
- 保持界面简洁直观
- 确保响应式设计
- 支持深色模式
- 使用一致的颜色方案

### 用户体验
- 提供即时反馈
- 确保功能易于发现
- 优化加载速度
- 支持键盘导航

## 🧪 测试

在提交 PR 之前，请确保：
- [ ] 所有工具功能正常
- [ ] 响应式设计在不同设备上正常显示
- [ ] 深色/浅色主题切换正常
- [ ] 没有控制台错误
- [ ] 代码格式正确

## ❓ 获取帮助

如果你有任何问题：
- 查看现有的 [Issues](https://github.com/your-username/devtools-hub/issues)
- 创建新的 Issue 描述你的问题
- 加入我们的讨论

## 📜 行为准则

参与此项目时，请：
- 保持友善和尊重
- 欢迎新贡献者
- 提供建设性的反馈
- 专注于对社区最有利的事情

---

再次感谢你的贡献！🙏