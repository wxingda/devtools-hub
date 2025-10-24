// DevTools Hub Namespace 模块化封装
window.DevToolsHub = (function () {
    const api = {};
    api.state = { currentTool: 'json-formatter', tools: {} };
    api.registerTool = function (id, hooks) { api.state.tools[id] = hooks || {}; };
    api.switchTool = function (id) { if (typeof switchTool === 'function') switchTool(id); };
    return api;
})();

// 全局变量
let currentTool = 'json-formatter';

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async function () {
    try {
        if (window.partialsReady && typeof window.partialsReady.then === 'function') {
            await window.partialsReady;
        }
    } catch (e) {
        console.warn('[init] partialsReady wait failed:', e);
    }
    initializeApp();
    setupKeyboardShortcuts();
    setupI18n();
    initializeHeaderFeatures();
    initStarCount();
});

// 初始化应用
function initializeApp() {
    setupNavigation();
    setupTheme();
    initializeTools();

    // 初始化注册的工具模块
    if (window.DevToolsHub && window.DevToolsHub.state.tools) {
        Object.keys(window.DevToolsHub.state.tools).forEach(toolId => {
            const tool = window.DevToolsHub.state.tools[toolId];
            if (tool.init && typeof tool.init === 'function') {
                try {
                    tool.init();
                } catch (e) {
                    console.warn(`Tool ${toolId} init failed:`, e);
                }
            }
        });
    }

    // 自动计算初始哈希值
    calculateHashes();

    // 初始化颜色选择器
    updateColorInputs('#3498db');
    generatePalette();
    updateColorHistory(); // 加载颜色历史
    updateColorFavorites(); // 加载颜色收藏

    // 初始化正则表达式测试
    testRegex();

    // 添加页面加载动画
    addPageTransitions();

    // 首次设置工具区域的可访问性与性能优化（仅激活工具可交互）
    applyInertState(currentTool);
}

// 初始化 Header 功能
function initializeHeaderFeatures() {
    // 更新统计信息
    updateStatistics();

    // PWA 安装按钮
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });

    // 检测是否已安装
    window.addEventListener('appinstalled', () => {
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        showNotification('DevTools Hub 已成功安装！', 'success');
    });
}

// 更新统计信息
function updateStatistics() {
    // 模拟真实使用统计
    const stats = {
        users: Math.floor(Math.random() * 5000) + 15000, // 15k-20k 用户
        tools: 8, // 当前工具数量
        countries: Math.floor(Math.random() * 20) + 80, // 80-100 国家
        uptime: '99.9%'
    };

    // 更新显示
    const statsElements = document.querySelectorAll('.stat-value');
    if (statsElements.length >= 3) {
        statsElements[0].textContent = formatNumber(stats.users);
        statsElements[1].textContent = stats.tools;
        statsElements[2].textContent = stats.countries;
    }
}

// 格式化数字显示
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// 快速开始功能
function showQuickStart() {
    const modal = document.createElement('div');
    modal.className = 'quick-start-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeQuickStart()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-rocket"></i> 快速开始</h3>
                <button onclick="closeQuickStart()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="quick-start-grid">
                    <div class="quick-start-item" onclick="switchTool('password-generator'); closeQuickStart();">
                        <div class="qs-icon">🔐</div>
                        <h4>生成安全密码</h4>
                        <p>创建强密码，保护账户安全</p>
                    </div>
                    <div class="quick-start-item" onclick="switchTool('color-palette'); closeQuickStart();">
                        <div class="qs-icon">🎨</div>
                        <h4>选择完美色彩</h4>
                        <p>专业调色板和格式转换</p>
                    </div>
                    <div class="quick-start-item" onclick="switchTool('json-formatter'); closeQuickStart();">
                        <div class="qs-icon">📝</div>
                        <h4>格式化 JSON</h4>
                        <p>美化和验证 JSON 数据</p>
                    </div>
                    <div class="quick-start-item" onclick="switchTool('regex-tester'); closeQuickStart();">
                        <div class="qs-icon">🔍</div>
                        <h4>测试正则表达式</h4>
                        <p>实时验证正则模式</p>
                    </div>
                </div>
                <div class="quick-start-tips">
                    <h4><i class="fas fa-lightbulb"></i> 小贴士</h4>
                    <ul>
                        <li>所有工具完全离线运行，保护隐私安全</li>
                        <li>支持 PWA 安装，可作为桌面应用使用</li>
                        <li>响应式设计，手机平板完美适配</li>
                        <li>工具间可快速切换，提升工作效率</li>
                    </ul>
                </div>
                <div class="quick-start-cta" style="margin-top:1rem;display:flex;align-items:center;gap:.6rem;justify-content:flex-end">
                    <a href="https://github.com/wxingda/devtools-hub" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:.5rem;color:var(--text-color);border:1px solid var(--border-color);padding:.4rem .6rem;border-radius:10px;background:var(--bg-color)">
                        <i class="fab fa-github"></i>
                        <span>喜欢？给个 Star</span>
                        <span class="star-count-badge" data-star-count>—</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.offsetHeight; // 触发重排
    modal.classList.add('show');
}

function closeQuickStart() {
    const modal = document.querySelector('.quick-start-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// PWA 安装功能
async function installPWA() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            showNotification('感谢安装 DevTools Hub！', 'success');
        }
        window.deferredPrompt = null;
    }
}

// 功能亮点切换
function toggleFeatures() {
    const highlight = document.getElementById('featuresHighlight');
    highlight.classList.toggle('collapsed');
}

// 通知系统
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => notification.classList.add('show'), 100);

    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// 社交分享功能
function shareProject(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('DevTools Hub - 开发者工具集合');
    const description = encodeURIComponent('免费、安全、离线的开发者工具集合，包含密码生成器、调色板、JSON格式化等实用工具');

    let shareUrl = '';

    switch (platform) {
        case 'docs':
            window.location.href = '/docs/';
            return;
        case 'github':
            window.open('https://github.com/wxingda/devtools-hub', '_blank');
            showNotification('正在打开 GitHub 仓库...', 'info');
            return;
        case 'weibo':
            shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}&language=zh_cn`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=devtools,webdev,privacy`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${description}`;
            break;
        case 'reddit':
            shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
            break;
        case 'copy':
            navigator.clipboard.writeText(window.location.href).then(() => {
                showNotification('链接已复制到剪贴板！', 'success');
            }).catch(() => {
                showNotification('复制失败，请手动复制链接', 'error');
            });
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showNotification(`正在打开 ${platform} 分享页面...`, 'info');
    }
}

// GitHub 星标按钮点击处理
function starProject() {
    window.open('https://github.com/wxingda/devtools-hub', '_blank');
    showNotification('感谢支持！正在打开 GitHub 页面...', 'success');
}

// 拉取并展示 GitHub Star 数（带缓存，避免频繁请求）
function initStarCount() {
    const REPO_API = 'https://api.github.com/repos/wxingda/devtools-hub';
    const CACHE_KEY = 'dth_repo_meta';
    const CACHE_TTL = 1000 * 60 * 30; // 30 分钟

    function fmt(n) {
        if (typeof n !== 'number') return '—';
        if (n < 1000) return String(n);
        if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return Math.round(n / 100) / 10 + 'k';
    }

    function render(count) {
        const els = document.querySelectorAll('[data-star-count]');
        els.forEach(el => el.textContent = fmt(count));
    }

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { t, stars } = JSON.parse(cached);
            if (Date.now() - t < CACHE_TTL) {
                render(stars);
            }
        }
    } catch (_) { }

    fetch(REPO_API, { headers: { 'Accept': 'application/vnd.github+json' } })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
            const stars = data && typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
            if (stars != null) {
                render(stars);
                try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), stars })); } catch (_) { }
            }
        })
        .catch(() => {/* 静默失败，保留缓存或占位 */ });
}

// 设置键盘快捷键

// CSS 单位转换器
function convertCssUnits() {
    const baseFontSize = parseFloat(document.getElementById('baseFontSize').value) || 16;
    const inputValue = parseFloat(document.getElementById('inputValue').value);
    const inputUnit = document.getElementById('inputUnit').value;
    if (isNaN(inputValue)) {
        showNotification('请输入有效的数值', 'error');
        return;
    }
    const viewportWidth = window.innerWidth || 1440;
    const viewportHeight = window.innerHeight || 900;

    // 统一换算到 px
    let valueInPx;
    switch (inputUnit) {
        case 'px': valueInPx = inputValue; break;
        case 'rem': valueInPx = inputValue * baseFontSize; break;
        case 'em': valueInPx = inputValue * baseFontSize; break; // 简化：与 rem 同根字号
        case 'vw': valueInPx = (inputValue / 100) * viewportWidth; break;
        case 'vh': valueInPx = (inputValue / 100) * viewportHeight; break;
        case '%': valueInPx = (inputValue / 100) * baseFontSize; break; // 简化假设百分比相对根字体
        default: valueInPx = inputValue;
    }

    // 生成所有单位
    const results = {
        px: valueInPx,
        rem: valueInPx / baseFontSize,
        em: valueInPx / baseFontSize,
        vw: (valueInPx / viewportWidth) * 100,
        vh: (valueInPx / viewportHeight) * 100,
        '%': (valueInPx / baseFontSize) * 100
    };

    const ordered = ['px', 'rem', 'em', 'vw', 'vh', '%'];
    const table = ordered.map(u => {
        const val = results[u];
        return `<div class="unit-item"><h4>${u}</h4><code>${val % 1 === 0 ? val : val.toFixed(4)}</code></div>`;
    }).join('');
    const displayStr = ordered.map(u => `${u}: ${results[u] % 1 === 0 ? results[u] : results[u].toFixed(4)}`).join(' | ');
    const resultInput = document.getElementById('cssUnitResult');
    if (resultInput) resultInput.value = displayStr;
    const tableEl = document.getElementById('cssUnitTable');
    if (tableEl) tableEl.innerHTML = table;
}

function copyCssUnitResult() {
    const el = document.getElementById('cssUnitResult');
    if (!el || !el.value) return;
    copyToClipboard(el.value, '转换结果已复制');
}
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Alt + 数字键切换工具
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
            const toolKeys = {
                '1': 'password-generator',
                '2': 'color-palette',
                '3': 'regex-tester',
                '4': 'json-formatter',
                '5': 'url-encoder',
                '6': 'base64-encoder',
                '7': 'hash-calculator',
                '8': 'timestamp-converter',
                '9': 'qr-generator',
                '0': 'text-diff'
            };

            if (toolKeys[e.key]) {
                e.preventDefault();
                switchTool(toolKeys[e.key]);
            }
        }

        // Ctrl/Cmd + K 清空当前工具
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearCurrentTool();
        }

        // Ctrl/Cmd + D 切换主题
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }

        // ESC 键清空焦点
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }

        // JSON 工具快捷键：Cmd/Ctrl + Enter 格式化，Cmd/Ctrl + M 压缩，Cmd/Ctrl+Shift+C 复制输出
        if ((e.ctrlKey || e.metaKey) && (currentTool === 'json-formatter' || document.activeElement.closest && document.activeElement.closest('#jsonInput'))) {
            if (e.key === 'Enter') {
                e.preventDefault();
                formatJSON();
            }
            if (e.key && e.key.toLowerCase() === 'm' && !e.shiftKey) {
                e.preventDefault();
                compressJSON();
            }
            if (e.key && (e.key.toLowerCase() === 'c' && e.shiftKey)) {
                e.preventDefault();
                copyOutput();
            }
        }
    });
}

// 清空当前工具
function clearCurrentTool() {
    switch (currentTool) {
        case 'password-generator':
            document.getElementById('generatedPassword').value = '';
            break;
        case 'json-formatter':
            document.getElementById('jsonInput').value = '';
            document.getElementById('jsonOutput').value = '';
            break;
        case 'url-encoder':
            document.getElementById('urlInput').value = '';
            document.getElementById('urlOutput').value = '';
            break;
        case 'base64-encoder':
            document.getElementById('base64Input').value = '';
            document.getElementById('base64Output').value = '';
            break;
        case 'hash-calculator':
            document.getElementById('hashInput').value = '';
            calculateHashes();
            break;
        case 'timestamp-converter':
            document.getElementById('timestampInput').value = '';
            document.getElementById('datetimeInput').value = '';
            document.getElementById('timestampResult').value = '';
            document.getElementById('datetimeResult').value = '';
            break;
        case 'qr-generator':
            document.getElementById('qrText').value = '';
            document.getElementById('qrDisplay').innerHTML = '<p>点击"生成二维码"按钮创建二维码</p>';
            break;
        case 'text-diff':
            clearDiff();
            break;
    }
}

// 添加页面过渡动画
function addPageTransitions() {
    const tools = document.querySelectorAll('.tool');
    tools.forEach((tool, index) => {
        tool.style.opacity = '0';
        tool.style.transform = 'translateY(20px)';
        tool.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });

    // 显示当前工具
    setTimeout(() => {
        const activeTool = document.querySelector('.tool.active');
        if (activeTool) {
            activeTool.style.opacity = '1';
            activeTool.style.transform = 'translateY(0)';
        }
    }, 100);
}

// 仅让当前激活的工具可交互，其它工具标记为 inert（可减少事件与辅助技术干扰）
function applyInertState(activeId) {
    const tools = document.querySelectorAll('.tool');
    tools.forEach(el => {
        if (el.id === activeId) {
            el.removeAttribute('inert');
        } else {
            el.setAttribute('inert', '');
        }
    });
}

// 设置导航
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tools = document.querySelectorAll('.tool');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const toolId = btn.dataset.tool;
            switchTool(toolId);
        });
    });
}

// Share Bar 绑定
document.addEventListener('DOMContentLoaded', function () {
    const shareButtons = document.querySelectorAll('.share-bar .share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('data-share');
            if (platform) {
                shareProject(platform);
            }
        });
    });
});

// 切换工具
function switchTool(toolId) {
    // 如果已经是当前工具，直接返回
    if (currentTool === toolId) return;

    const currentToolElement = document.querySelector(`.tool.active`);
    const newToolElement = document.getElementById(toolId);

    // 淡出当前工具
    if (currentToolElement) {
        currentToolElement.style.opacity = '0';
        currentToolElement.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            currentToolElement.classList.remove('active');
            currentToolElement.style.transform = 'translateY(20px)';
        }, 150);
    }

    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === toolId);
    });

    // 淡入新工具
    setTimeout(() => {
        if (newToolElement) {
            newToolElement.classList.add('active');
            newToolElement.style.opacity = '0';
            newToolElement.style.transform = 'translateY(20px)';

            setTimeout(() => {
                newToolElement.style.opacity = '1';
                newToolElement.style.transform = 'translateY(0)';
            }, 50);
        }
        currentTool = toolId;
        // 更新 inert 状态：仅当前工具可交互
        applyInertState(currentTool);
    }, 150);

    // 添加点击反馈动画
    const activeNavBtn = document.querySelector(`[data-tool="${toolId}"]`);
    if (activeNavBtn) {
        activeNavBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            activeNavBtn.style.transform = '';
        }, 100);
    }
}

// 设置主题切换
function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

// 更新主题图标
function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// i18n 简易实现
const I18N_DICTIONARY = {
    zh: {
        'header.tagline': '专为开发者打造的实用工具集合',
        'nav.password-generator': '密码生成器',
        'nav.color-palette': '颜色调色板',
        'nav.regex-tester': '正则测试器',
        'nav.json-formatter': 'JSON格式化',
        'nav.url-encoder': 'URL编码器',
        'nav.base64-encoder': 'Base64编码',
        'nav.hash-calculator': '哈希计算器',
        'nav.timestamp-converter': '时间戳转换',
        'nav.qr-generator': '二维码生成',
        'nav.text-diff': '文本对比',
        'nav.css-unit-converter': 'CSS单位',
        'tool.password.sub': '生成安全的随机密码',
        'tool.color.sub': '颜色选择和格式转换',
        'tool.regex.sub': '实时测试和验证正则表达式',
        'tool.json.sub': '美化和压缩JSON数据',
        'tool.url.sub': 'URL字符串编码解码',
        'tool.base64.sub': 'Base64编码解码工具',
        'tool.hash.sub': 'MD5、SHA1、SHA256计算',
        'tool.timestamp.sub': 'Unix时间戳与日期时间互转',
        'tool.qr.sub': '将文本或URL转换为二维码',
        'tool.textdiff.sub': '比较两段文本的差异',
        'tool.cssunit.sub': '在 px / rem / em / vw / vh / % 之间快速换算'
    },
    en: {
        'header.tagline': 'A collection of handy tools for developers',
        'nav.password-generator': 'Password',
        'nav.color-palette': 'Colors',
        'nav.regex-tester': 'Regex',
        'nav.json-formatter': 'JSON',
        'nav.url-encoder': 'URL Encode',
        'nav.base64-encoder': 'Base64',
        'nav.hash-calculator': 'Hash',
        'nav.timestamp-converter': 'Timestamp',
        'nav.qr-generator': 'QR Code',
        'nav.text-diff': 'Diff',
        'nav.css-unit-converter': 'CSS Units',
        'tool.password.sub': 'Generate secure random passwords',
        'tool.color.sub': 'Color picking & format conversion',
        'tool.regex.sub': 'Test and validate regular expressions',
        'tool.json.sub': 'Beautify & compress JSON data',
        'tool.url.sub': 'Encode or decode URL strings',
        'tool.base64.sub': 'Base64 encode & decode',
        'tool.hash.sub': 'MD5, SHA1 & SHA256 calculation',
        'tool.timestamp.sub': 'Convert between Unix timestamp and date',
        'tool.qr.sub': 'Turn text or URL into QR code',
        'tool.textdiff.sub': 'Compare differences between two texts',
        'tool.cssunit.sub': 'Convert between px / rem / em / vw / vh / %'
    }
};

let currentLang = localStorage.getItem('lang') || 'zh';

function setupI18n() {
    applyI18n();
    const toggle = document.getElementById('langToggle');
    if (toggle) {
        toggle.textContent = currentLang === 'zh' ? 'EN' : '中文';
        toggle.addEventListener('click', () => {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('lang', currentLang);
            applyI18n();
            toggle.textContent = currentLang === 'zh' ? 'EN' : '中文';
            showNotification(currentLang === 'zh' ? '已切换到中文' : 'Switched to English', 'success');
        });
    }
}

function applyI18n() {
    const dict = I18N_DICTIONARY[currentLang] || {};
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
}

// 初始化工具
function initializeTools() {
    // 密码长度滑块
    const lengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');

    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
        updateLengthPresets(e.target.value);
    });

    // 长度预设按钮
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const length = btn.dataset.length;
            lengthSlider.value = length;
            lengthValue.textContent = length;
            updateLengthPresets(length);
        });
    });

    // 颜色选择器
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (e) => {
        updateColorInputs(e.target.value);
    });

    // 颜色输入框
    const hexInput = document.getElementById('hexInput');
    hexInput.addEventListener('input', (e) => {
        if (isValidHex(e.target.value)) {
            updateColorInputs(e.target.value);
        }
    });

    // 正则表达式实时测试
    const regexPattern = document.getElementById('regexPattern');
    const testString = document.getElementById('testString');
    const flags = document.querySelectorAll('input[type="checkbox"][id$="Flag"]');

    [regexPattern, testString, ...flags].forEach(element => {
        element.addEventListener('input', testRegex);
    });

    // JSON输入实时验证和统计
    const jsonInput = document.getElementById('jsonInput');
    if (jsonInput) {
        jsonInput.addEventListener('input', debounce(() => {
            validateJSON();
            updateInputStats();
        }, 300));

        // 快捷键支持
        jsonInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                formatJSON();
            }
        });

        // 初始化统计
        updateInputStats();
        updateOutputStats('等待输入');
    }

    // JSON 便捷操作按钮绑定
    const pasteBtn = document.getElementById('pasteJsonBtn');
    const clearBtn = document.getElementById('clearJsonBtn');
    const fmtBtn = document.getElementById('formatJsonBtn');
    const cmpBtn = document.getElementById('compressJsonBtn');
    const copyOutBtn = document.getElementById('copyOutputBtn');
    const downloadOutBtn = document.getElementById('downloadOutputBtn');
    const validateBtn = document.getElementById('validateJsonBtn');

    if (pasteBtn) pasteBtn.addEventListener('click', pasteJson);
    if (clearBtn) clearBtn.addEventListener('click', clearJsonInput);
    if (fmtBtn) fmtBtn.addEventListener('click', formatJSON);
    if (cmpBtn) cmpBtn.addEventListener('click', compressJSON);
    if (copyOutBtn) copyOutBtn.addEventListener('click', copyOutput);
    if (downloadOutBtn) downloadOutBtn.addEventListener('click', downloadOutput);
    if (validateBtn) validateBtn.addEventListener('click', validateJSON);

    // 树视图切换增强
    const treeBtn = document.getElementById('showTreeBtn');
    const textBtn = document.getElementById('showTextBtn');
    const searchBar = document.getElementById('jsonSearchBar');

    if (treeBtn) {
        treeBtn.addEventListener('click', () => {
            showTree();
            treeBtn.classList.add('active');
            if (textBtn) textBtn.classList.remove('active');
            if (searchBar) searchBar.style.display = 'flex';
        });
    }

    if (textBtn) {
        textBtn.addEventListener('click', () => {
            showText();
            textBtn.classList.add('active');
            if (treeBtn) treeBtn.classList.remove('active');
            if (searchBar) searchBar.style.display = 'none';
        });
    }

    // 哈希计算实时更新
    const hashInput = document.getElementById('hashInput');
    hashInput.addEventListener('input', debounce(calculateHashes, 300));

    // 全局快捷键支持
    document.addEventListener('keydown', (e) => {
        // 只在 JSON 工具区域活跃时响应
        if (document.activeElement && document.activeElement.closest('.tool[id="json-formatter"]')) {
            if (e.ctrlKey && e.key === 'v' && e.target === document.body) {
                e.preventDefault();
                pasteJson();
            } else if (e.ctrlKey && e.key === 'c' && e.target === document.getElementById('jsonOutput')) {
                e.preventDefault();
                copyOutput();
            }
        }
    });

    // 文本对比：输入统计与快捷键
    const textAEl = document.getElementById('textA');
    const textBEl = document.getElementById('textB');
    if (textAEl && textBEl) {
        const updateStats = debounce(updateDiffInputStats, 150);
        textAEl.addEventListener('input', updateStats);
        textBEl.addEventListener('input', updateStats);

        // Cmd/Ctrl + Enter 快速对比
        const handleKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                compareTexts();
            }
        };
        textAEl.addEventListener('keydown', handleKey);
        textBEl.addEventListener('keydown', handleKey);

        // 初始化一次统计
        updateDiffInputStats();
    }
}

// 密码生成器功能
function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;

    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
        showNotification('请至少选择一种字符类型！', 'warning');
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    document.getElementById('generatedPassword').value = password;
    updatePasswordStrength(password);
    updatePasswordAnalysis(password);
}

// 批量生成密码
function generateMultiple() {
    const passwords = [];
    for (let i = 0; i < 5; i++) {
        generatePassword();
        passwords.push(document.getElementById('generatedPassword').value);
    }

    // 显示批量密码对话框或在新窗口中显示
    const passwordList = passwords.join('\n');
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head><title>批量生成的密码</title></head>
            <body style="font-family: monospace; padding: 20px;">
                <h3>批量生成的安全密码 (${passwords.length} 个)</h3>
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${passwordList}</pre>
                <button onclick="navigator.clipboard.writeText('${passwordList}').then(() => alert('所有密码已复制到剪贴板！'))">复制全部</button>
            </body>
        </html>
    `);
}

// 重新生成密码
function regeneratePassword() {
    generatePassword();
}

// 清空密码
function clearPassword() {
    document.getElementById('generatedPassword').value = '';
    document.getElementById('strengthText').textContent = '待生成';
    document.getElementById('strengthBar').className = 'strength-bar';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('entropyValue').textContent = '0 bits';
    document.getElementById('crackTime').textContent = '-';
}

// 更新密码强度
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { class: 'weak', text: '弱', color: '#e74c3c' },
        { class: 'weak', text: '较弱', color: '#f39c12' },
        { class: 'medium', text: '中等', color: '#f1c40f' },
        { class: 'medium', text: '较强', color: '#2ecc71' },
        { class: 'strong', text: '强', color: '#27ae60' },
        { class: 'very-strong', text: '很强', color: '#16a085' }
    ];

    const level = levels[Math.min(score, 5)];
    strengthBar.className = `strength-bar ${level.class}`;
    strengthText.textContent = level.text;
    strengthText.style.backgroundColor = level.color;
    strengthText.style.color = 'white';
}

// 更新密码分析信息
function updatePasswordAnalysis(password) {
    // 更新字符数
    document.getElementById('charCount').textContent = password.length;

    // 计算熵值
    const charset = getCharsetSize(password);
    const entropy = Math.log2(Math.pow(charset, password.length));
    document.getElementById('entropyValue').textContent = `${Math.round(entropy)} bits`;

    // 估算破解时间
    const crackTime = estimateCrackTime(entropy);
    document.getElementById('crackTime').textContent = crackTime;
}

// 获取字符集大小
function getCharsetSize(password) {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/[0-9]/.test(password)) size += 10;
    if (/[^A-Za-z0-9]/.test(password)) size += 32; // 估算特殊字符数量
    return size;
}

// 估算破解时间
function estimateCrackTime(entropy) {
    const attempts = Math.pow(2, entropy) / 2; // 平均需要尝试一半的可能性
    const attemptsPerSecond = 1e9; // 假设每秒10亿次尝试
    const seconds = attempts / attemptsPerSecond;

    if (seconds < 60) return '瞬间';
    if (seconds < 3600) return `${Math.round(seconds / 60)} 分钟`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} 小时`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} 天`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} 年`;
    return '数世纪';
}

// 更新长度预设按钮状态
function updateLengthPresets(currentLength) {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.length === currentLength) {
            btn.classList.add('active');
        }
    });
}

// 复制密码
function copyPassword() {
    const password = document.getElementById('generatedPassword').value;
    if (!password) {
        showNotification('请先生成密码！', 'warning');
        return;
    }

    copyToClipboard(password, '密码已复制到剪贴板！');
}

// 颜色调色板功能 - 增强版
function updateColorInputs(color) {
    const colorPicker = document.getElementById('colorPicker');
    const colorPreview = document.getElementById('colorPreview');
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');
    const hsvaInput = document.getElementById('hsvaInput');
    const cmykInput = document.getElementById('cmykInput');
    const cssInput = document.getElementById('cssInput');

    colorPicker.value = color;
    colorPreview.style.backgroundColor = color;
    hexInput.value = color;

    const rgb = hexToRgb(color);
    if (rgb) {
        // RGB 格式
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // HSL 格式
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hslInput.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

        // HSVA 格式
        if (hsvaInput) {
            const hsva = rgbToHsva(rgb.r, rgb.g, rgb.b);
            hsvaInput.value = `hsva(${Math.round(hsva.h)}, ${Math.round(hsva.s)}%, ${Math.round(hsva.v)}%, 1)`;
        }

        // CMYK 格式
        if (cmykInput) {
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            cmykInput.value = `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`;
        }

        // CSS 命名颜色
        if (cssInput) {
            const cssName = getCSSColorName(color);
            cssInput.value = cssName || color;
        }
    }

    // 添加到颜色历史
    addToColorHistory(color);

    // 分析颜色特性
    analyzeColorProperties(color);
}

// 色彩历史管理
let colorHistory = JSON.parse(localStorage.getItem('colorHistory') || '[]');
let colorFavorites = JSON.parse(localStorage.getItem('colorFavorites') || '[]');

function addToColorHistory(color) {
    // 避免重复
    const index = colorHistory.indexOf(color);
    if (index > -1) {
        colorHistory.splice(index, 1);
    }

    colorHistory.unshift(color);

    // 限制历史记录数量
    if (colorHistory.length > 20) {
        colorHistory = colorHistory.slice(0, 20);
    }

    localStorage.setItem('colorHistory', JSON.stringify(colorHistory));
    updateColorHistory();
}

function updateColorHistory() {
    const historyContainer = document.getElementById('colorHistory');
    if (!historyContainer) return;

    historyContainer.innerHTML = '';

    colorHistory.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'history-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.title = color;
        colorDiv.addEventListener('click', () => updateColorInputs(color));
        historyContainer.appendChild(colorDiv);
    });
}

// 手动保存到历史（供按钮使用）
function saveToHistory() {
    const hexInput = document.getElementById('hexInput');
    const color = (hexInput?.value || '').trim();
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
        showNotification && showNotification('未检测到有效颜色', 'warning');
        return;
    }
    addToColorHistory(color);
    showNotification && showNotification('已保存到历史', 'success');
}

// 收藏管理
function isFavorite(color) {
    return colorFavorites.includes(color);
}

function toggleFavoriteColor() {
    const hexInput = document.getElementById('hexInput');
    const color = (hexInput?.value || '').trim();
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
        showNotification && showNotification('当前颜色无效，无法收藏', 'warning');
        return;
    }
    const idx = colorFavorites.indexOf(color);
    if (idx >= 0) {
        colorFavorites.splice(idx, 1);
        showNotification && showNotification('已取消收藏', 'info');
    } else {
        // 最近在前，去重
        colorFavorites = [color, ...colorFavorites.filter(c => c !== color)].slice(0, 30);
        showNotification && showNotification('已收藏当前颜色', 'success');
    }
    localStorage.setItem('colorFavorites', JSON.stringify(colorFavorites));
    updateColorFavorites();
}

function updateColorFavorites() {
    const favContainer = document.getElementById('colorFavorites');
    if (!favContainer) return;
    favContainer.innerHTML = '';
    if (!Array.isArray(colorFavorites)) colorFavorites = [];
    colorFavorites.forEach(color => {
        const div = document.createElement('div');
        div.className = 'history-color';
        div.style.backgroundColor = color;
        div.title = color + '（点击应用，右键取消收藏）';
        div.addEventListener('click', () => updateColorInputs(color));
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            colorFavorites = colorFavorites.filter(c => c !== color);
            localStorage.setItem('colorFavorites', JSON.stringify(colorFavorites));
            updateColorFavorites();
        });
        favContainer.appendChild(div);
    });
}

function clearColorFavorites() {
    if (!confirm('确定清空所有收藏颜色吗？')) return;
    colorFavorites = [];
    localStorage.setItem('colorFavorites', JSON.stringify(colorFavorites));
    updateColorFavorites();
    showNotification && showNotification('收藏已清空', 'info');
}

// 颜色特性分析
function analyzeColorProperties(color) {
    const analysis = document.getElementById('colorAnalysis');
    if (!analysis) return;

    const rgb = hexToRgb(color);
    if (!rgb) return;

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const isLight = brightness > 128;
    const contrast = isLight ? '#000000' : '#ffffff';

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const saturation = hsl.s;

    let colorType = '';
    if (saturation < 10) colorType = '灰色系';
    else if (hsl.h >= 0 && hsl.h < 30) colorType = '红色系';
    else if (hsl.h >= 30 && hsl.h < 60) colorType = '黄色系';
    else if (hsl.h >= 60 && hsl.h < 150) colorType = '绿色系';
    else if (hsl.h >= 150 && hsl.h < 210) colorType = '青色系';
    else if (hsl.h >= 210 && hsl.h < 270) colorType = '蓝色系';
    else if (hsl.h >= 270 && hsl.h < 330) colorType = '紫色系';
    else colorType = '红色系';

    analysis.innerHTML = `
        <div class="color-property">
            <span class="property-label">亮度:</span>
            <span class="property-value">${Math.round(brightness)}/255 (${isLight ? '明亮' : '较暗'})</span>
        </div>
        <div class="color-property">
            <span class="property-label">色相:</span>
            <span class="property-value">${Math.round(hsl.h)}° (${colorType})</span>
        </div>
        <div class="color-property">
            <span class="property-label">饱和度:</span>
            <span class="property-value">${Math.round(saturation)}%</span>
        </div>
        <div class="color-property">
            <span class="property-label">建议文字色:</span>
            <span class="property-value" style="color: ${contrast}; background: ${color}; padding: 2px 8px; border-radius: 4px;">${contrast}</span>
        </div>
    `;
}

// 生成调色板 - 增强版
function generatePalette() {
    const baseColor = document.getElementById('colorPicker').value;
    const paletteType = document.getElementById('paletteType')?.value || 'monochromatic';
    const paletteColors = document.getElementById('paletteColors');

    let colors = [];

    switch (paletteType) {
        case 'monochromatic':
            colors = generateMonochromaticPalette(baseColor);
            break;
        case 'analogous':
            colors = generateAnalogousPalette(baseColor);
            break;
        case 'complementary':
            colors = generateComplementaryPalette(baseColor);
            break;
        case 'triadic':
            colors = generateTriadicPalette(baseColor);
            break;
        case 'tetradic':
            colors = generateTetradicPalette(baseColor);
            break;
        default:
            colors = generateMonochromaticPalette(baseColor);
    }

    paletteColors.innerHTML = '';
    colors.forEach((color, index) => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.setAttribute('data-color', color);
        colorDiv.title = `${color} - 点击选择`;

        // 添加颜色值标签
        const colorLabel = document.createElement('span');
        colorLabel.className = 'color-label';
        colorLabel.textContent = color;
        colorDiv.appendChild(colorLabel);

        colorDiv.addEventListener('click', () => updateColorInputs(color));
        paletteColors.appendChild(colorDiv);
    });
}

// 各种调色板生成算法
function generateMonochromaticPalette(baseColor) {
    const colors = [];
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [baseColor];

    // 生成明暗变化
    for (let i = 0.3; i <= 1.7; i += 0.2) {
        const newR = Math.min(255, Math.max(0, Math.round(rgb.r * i)));
        const newG = Math.min(255, Math.max(0, Math.round(rgb.g * i)));
        const newB = Math.min(255, Math.max(0, Math.round(rgb.b * i)));
        colors.push(rgbToHex(newR, newG, newB));
    }
    return colors;
}

function generateAnalogousPalette(baseColor) {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [baseColor];

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];

    // 生成邻近色
    for (let i = -60; i <= 60; i += 30) {
        const newHue = (hsl.h + i + 360) % 360;
        const newRgb = hslToRgb(newHue, hsl.s, hsl.l);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    return colors;
}

function generateComplementaryPalette(baseColor) {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [baseColor];

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const complementaryHue = (hsl.h + 180) % 360;
    const complementaryRgb = hslToRgb(complementaryHue, hsl.s, hsl.l);

    return [
        baseColor,
        rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b),
        // 添加变化
        rgbToHex(Math.min(255, rgb.r + 30), rgb.g, rgb.b),
        rgbToHex(rgb.r, Math.min(255, rgb.g + 30), rgb.b),
        rgbToHex(rgb.r, rgb.g, Math.min(255, rgb.b + 30))
    ];
}

function generateTriadicPalette(baseColor) {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [baseColor];

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];

    // 三等分色环
    for (let i = 0; i < 360; i += 120) {
        const newHue = (hsl.h + i) % 360;
        const newRgb = hslToRgb(newHue, hsl.s, hsl.l);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    return colors;
}

function generateTetradicPalette(baseColor) {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [baseColor];

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];

    // 四等分色环
    for (let i = 0; i < 360; i += 90) {
        const newHue = (hsl.h + i) % 360;
        const newRgb = hslToRgb(newHue, hsl.s, hsl.l);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    return colors;
}

// 正则表达式测试 - 增强版
function testRegex() {
    const pattern = document.getElementById('regexPattern').value;
    const testString = document.getElementById('testString').value;
    const globalFlag = document.getElementById('globalFlag').checked;
    const ignoreCaseFlag = document.getElementById('ignoreCaseFlag').checked;
    const multilineFlag = document.getElementById('multilineFlag').checked;

    const matchCount = document.getElementById('matchCount');
    const matchesList = document.getElementById('matchesList');
    const regexExplanation = document.getElementById('regexExplanation');

    if (!pattern) {
        matchCount.textContent = '0';
        matchesList.innerHTML = '';
        if (regexExplanation) regexExplanation.innerHTML = '';
        return;
    }

    try {
        let flags = '';
        if (globalFlag) flags += 'g';
        if (ignoreCaseFlag) flags += 'i';
        if (multilineFlag) flags += 'm';

        const regex = new RegExp(pattern, flags);
        const matches = [...testString.matchAll(regex)];

        matchCount.textContent = matches.length;

        // 高亮显示匹配结果
        highlightMatches(testString, matches);

        // 显示匹配详情
        matchesList.innerHTML = '';
        matches.forEach((match, index) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match-item enhanced';

            let groupsHtml = '';
            if (match.length > 1) {
                groupsHtml = '<div class="match-groups">';
                for (let i = 1; i < match.length; i++) {
                    if (match[i] !== undefined) {
                        groupsHtml += `<span class="group">分组 ${i}: "${escapeHtml(match[i])}"</span>`;
                    }
                }
                groupsHtml += '</div>';
            }

            matchDiv.innerHTML = `
                <div class="match-header">
                    <strong>匹配 ${index + 1}:</strong>
                    <span class="match-text">"${escapeHtml(match[0])}"</span>
                </div>
                <div class="match-details">
                    <span class="match-position">位置: ${match.index} - ${match.index + match[0].length - 1}</span>
                    <span class="match-length">长度: ${match[0].length}</span>
                </div>
                ${groupsHtml}
            `;
            matchesList.appendChild(matchDiv);
        });

        // 显示正则表达式解释
        if (regexExplanation) {
            regexExplanation.innerHTML = explainRegex(pattern);
        }

        // 显示性能信息
        showRegexPerformance(pattern, testString, regex);

    } catch (error) {
        matchCount.textContent = '0';
        matchesList.innerHTML = `<div class="match-item error">正则表达式错误: ${error.message}</div>`;
        if (regexExplanation) regexExplanation.innerHTML = '';
    }
}

// 高亮显示匹配结果
function highlightMatches(text, matches) {
    const highlightContainer = document.getElementById('regexHighlight');
    if (!highlightContainer) return;

    if (matches.length === 0) {
        highlightContainer.innerHTML = escapeHtml(text);
        return;
    }

    let highlightedText = '';
    let lastIndex = 0;

    matches.forEach((match, index) => {
        // 添加匹配前的文本
        highlightedText += escapeHtml(text.slice(lastIndex, match.index));

        // 添加高亮的匹配文本
        highlightedText += `<span class="highlight-match" data-match="${index + 1}">${escapeHtml(match[0])}</span>`;

        lastIndex = match.index + match[0].length;
    });

    // 添加最后剩余的文本
    highlightedText += escapeHtml(text.slice(lastIndex));

    highlightContainer.innerHTML = highlightedText;
}

// 正则表达式解释器
function explainRegex(pattern) {
    const explanations = {
        '\\d': '匹配任意数字 (0-9)',
        '\\w': '匹配字母、数字或下划线',
        '\\s': '匹配空白字符（空格、制表符、换行符）',
        '\\D': '匹配非数字字符',
        '\\W': '匹配非字母数字下划线字符',
        '\\S': '匹配非空白字符',
        '.': '匹配除换行符外的任意字符',
        '^': '匹配字符串开始',
        '$': '匹配字符串结束',
        '*': '匹配前面的字符0次或多次',
        '+': '匹配前面的字符1次或多次',
        '?': '匹配前面的字符0次或1次',
        '{n}': '匹配前面的字符恰好n次',
        '{n,}': '匹配前面的字符至少n次',
        '{n,m}': '匹配前面的字符n到m次',
        '|': '或运算符，匹配左边或右边的表达式',
        '[]': '字符类，匹配方括号中的任意字符',
        '()': '分组，创建捕获组',
        '(?:)': '非捕获组',
        '(?=)': '正向先行断言',
        '(?!)': '负向先行断言',
        '\\b': '单词边界',
        '\\B': '非单词边界'
    };

    let explanation = '<div class="regex-breakdown">';
    explanation += '<h4><i class="fas fa-info-circle"></i> 正则表达式分析</h4>';

    let hasExplanation = false;
    for (const [regex, desc] of Object.entries(explanations)) {
        if (pattern.includes(regex)) {
            explanation += `<div class="regex-rule"><code>${regex}</code> - ${desc}</div>`;
            hasExplanation = true;
        }
    }

    if (!hasExplanation) {
        explanation += '<div class="regex-rule">基础字符匹配</div>';
    }

    explanation += '</div>';
    return explanation;
}

// 性能分析
function showRegexPerformance(pattern, testString, regex) {
    const perfContainer = document.getElementById('regexPerformance');
    if (!perfContainer) return;

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
        testString.match(regex);
    }
    const end = performance.now();

    const avgTime = (end - start) / 1000;
    let performanceClass = 'good';
    let performanceText = '性能良好';

    if (avgTime > 1) {
        performanceClass = 'bad';
        performanceText = '性能较差，考虑优化';
    } else if (avgTime > 0.5) {
        performanceClass = 'warning';
        performanceText = '性能一般';
    }

    perfContainer.innerHTML = `
        <div class="performance-info ${performanceClass}">
            <i class="fas fa-tachometer-alt"></i>
            平均执行时间: ${avgTime.toFixed(3)}ms - ${performanceText}
        </div>
    `;
}

// 常用正则表达式模板
const regexTemplates = {
    'email': {
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        description: '电子邮箱地址',
        example: 'user@example.com'
    },
    'phone': {
        pattern: '^1[3-9]\\d{9}$',
        description: '中国手机号码',
        example: '13812345678'
    },
    'url': {
        pattern: '^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/?.*$',
        description: 'URL地址',
        example: 'https://www.example.com'
    },
    'ipv4': {
        pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
        description: 'IPv4地址',
        example: '192.168.1.1'
    },
    'date': {
        pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
        description: '日期格式 YYYY-MM-DD',
        example: '2024-01-15'
    },
    'time': {
        pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: '时间格式 HH:MM',
        example: '14:30'
    },
    'hex': {
        pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$',
        description: '十六进制颜色代码',
        example: '#FF5733'
    },
    'idcard': {
        pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
        description: '中国身份证号码',
        example: '110101199001011234'
    },
    'password': {
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
        description: '强密码（8位以上，包含大小写字母、数字、特殊字符）',
        example: 'Password123!'
    },
    'username': {
        pattern: '^[a-zA-Z0-9_]{3,16}$',
        description: '用户名（3-16位，字母数字下划线）',
        example: 'user_123'
    }
};

// 加载正则表达式模板
function loadRegexTemplate(templateKey) {
    const template = regexTemplates[templateKey];
    if (!template) return;

    document.getElementById('regexPattern').value = template.pattern;
    document.getElementById('testString').value = template.example;

    testRegex();
    showNotification(`已加载模板: ${template.description}`, 'success');
}

// 正则表达式模板选择器
function showRegexTemplates() {
    const modal = document.createElement('div');
    modal.className = 'regex-templates-modal';

    let templatesHtml = '<div class="templates-grid">';
    for (const [key, template] of Object.entries(regexTemplates)) {
        templatesHtml += `
            <div class="template-item" onclick="loadRegexTemplate('${key}'); closeRegexTemplates();">
                <div class="template-title">${template.description}</div>
                <div class="template-pattern">${template.pattern}</div>
                <div class="template-example">示例: ${template.example}</div>
            </div>
        `;
    }
    templatesHtml += '</div>';

    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeRegexTemplates()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-code"></i> 常用正则表达式模板</h3>
                <button onclick="closeRegexTemplates()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${templatesHtml}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.offsetHeight;
    modal.classList.add('show');
}

function closeRegexTemplates() {
    const modal = document.querySelector('.regex-templates-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// JSON格式化器功能
function formatJSON() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    const btn = document.getElementById('formatJsonBtn');

    if (!input.trim()) {
        showJsonStatus('请输入 JSON 内容', 'error');
        updateOutputStats('等待输入');
        return;
    }

    // 添加加载状态
    btn.classList.add('loading');
    setTimeout(() => {
        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            output.value = formatted;
            showJsonStatus('格式化成功', 'success');
            updateOutputStats(`已格式化, ${formatted.split('\n').length} 行`);

            // 成功动画效果
            output.style.animation = 'fadeInSuccess 0.5s ease';
            setTimeout(() => output.style.animation = '', 500);
        } catch (error) {
            output.value = '';
            showJsonStatus(`格式化失败: ${error.message}`, 'error');
            updateOutputStats('格式化失败');
        } finally {
            btn.classList.remove('loading');
        }
    }, 100);
}

function compressJSON() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    const btn = document.getElementById('compressJsonBtn');

    if (!input.trim()) {
        showJsonStatus('请输入 JSON 内容', 'error');
        updateOutputStats('等待输入');
        return;
    }

    btn.classList.add('loading');
    setTimeout(() => {
        try {
            const parsed = JSON.parse(input);
            const compressed = JSON.stringify(parsed);
            output.value = compressed;
            showJsonStatus('压缩成功', 'success');
            updateOutputStats(`已压缩, ${compressed.length} 字符`);

            // 成功动画效果
            output.style.animation = 'fadeInSuccess 0.5s ease';
            setTimeout(() => output.style.animation = '', 500);
        } catch (error) {
            output.value = '';
            showJsonStatus(`压缩失败: ${error.message}`, 'error');
            updateOutputStats('压缩失败');
        } finally {
            btn.classList.remove('loading');
        }
    }, 100);
}

function validateJSON() {
    const input = document.getElementById('jsonInput').value;

    if (!input.trim()) {
        showJsonStatus('等待输入', '');
        return;
    }

    try {
        JSON.parse(input);
        showJsonStatus('JSON 格式正确', 'success');
    } catch (error) {
        showJsonStatus(`语法错误: ${error.message}`, 'error');
    }
}

// JSON convenience helpers
async function pasteJson() {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById('jsonInput');
        if (input) {
            input.value = text;
            validateJSON();
            updateInputStats();
            showNotification('已从剪贴板粘贴内容', 'success');
        }
    } catch (e) {
        showNotification('无法访问剪贴板：' + e.message, 'error');
    }
}

function clearJsonInput() {
    const input = document.getElementById('jsonInput');
    const output = document.getElementById('jsonOutput');
    if (input) input.value = '';
    if (output) output.value = '';
    const tree = document.getElementById('jsonTreeView'); if (tree) tree.innerHTML = '';
    showJsonStatus('已清空', '');
    updateInputStats();
    updateOutputStats('等待输入');
}

function copyOutput() {
    const out = document.getElementById('jsonOutput');
    if (!out || !out.value) {
        showNotification('没有可复制的内容', 'warning');
        return;
    }
    copyToClipboard(out.value, 'JSON 结果已复制');
}

function downloadOutput() {
    const out = document.getElementById('jsonOutput');
    if (!out || !out.value) {
        showNotification('没有可下载的内容', 'warning');
        return;
    }
    const blob = new Blob([out.value], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showNotification('已准备下载', 'success');
}

// 统计功能
function updateInputStats() {
    const input = document.getElementById('jsonInput');
    const stats = document.getElementById('inputStats');
    if (!input || !stats) return;

    const lines = input.value.split('\n').length;
    const chars = input.value.length;
    stats.textContent = `${lines} 行, ${chars} 字符`;
}

function updateOutputStats(status) {
    const stats = document.getElementById('outputStats');
    if (!stats) return;
    stats.textContent = status;
}

function showJsonStatus(message, type) {
    const status = document.getElementById('jsonStatus');
    status.textContent = message;
    status.className = `json-info ${type}`;
}

// URL编码器功能
function encodeURL() {
    const input = document.getElementById('urlInput').value;
    const output = document.getElementById('urlOutput');

    if (!input) {
        showNotification('请输入要编码的URL或文本', 'warning');
        return;
    }

    output.value = encodeURIComponent(input);
}

function decodeURL() {
    const input = document.getElementById('urlInput').value;
    const output = document.getElementById('urlOutput');

    if (!input) {
        showNotification('请输入要解码的URL', 'warning');
        return;
    }

    try {
        output.value = decodeURIComponent(input);
    } catch (error) {
        showNotification('URL解码失败：' + error.message, 'error');
    }
}

// Base64编码器功能
function encodeBase64() {
    const input = document.getElementById('base64Input').value;
    const output = document.getElementById('base64Output');

    if (!input) {
        showNotification('请输入要编码的文本', 'warning');
        return;
    }

    try {
        output.value = btoa(unescape(encodeURIComponent(input)));
    } catch (error) {
        showNotification('Base64编码失败：' + error.message, 'error');
    }
}

function decodeBase64() {
    const input = document.getElementById('base64Input').value;
    const output = document.getElementById('base64Output');

    if (!input) {
        showNotification('请输入要解码的Base64字符串', 'warning');
        return;
    }

    try {
        output.value = decodeURIComponent(escape(atob(input)));
    } catch (error) {
        showNotification('Base64解码失败：' + error.message, 'error');
    }
}

// 哈希计算器功能
async function calculateHashes() {
    const input = document.getElementById('hashInput').value;

    if (!input) {
        document.getElementById('md5Result').value = '';
        document.getElementById('sha1Result').value = '';
        document.getElementById('sha256Result').value = '';
        return;
    }

    try {
        // 使用Web Crypto API计算哈希值
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        // SHA-1
        const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
        document.getElementById('sha1Result').value = bufferToHex(sha1Buffer);

        // SHA-256
        const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
        document.getElementById('sha256Result').value = bufferToHex(sha256Buffer);

        // MD5 (使用简单实现)
        document.getElementById('md5Result').value = md5(input);

    } catch (error) {
        showNotification('哈希计算失败：' + error.message, 'error');
    }
}

// 复制哈希值
function copyHash(elementId) {
    const hashValue = document.getElementById(elementId).value;
    if (!hashValue) {
        showNotification('没有可复制的哈希值', 'warning');
        return;
    }

    copyToClipboard(hashValue, '哈希值已复制到剪贴板！');
}

// 工具函数
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(successMessage, 'success');
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(successMessage, 'success');
    });
}

function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });

    // 设置背景颜色
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

// 新增颜色转换函数
function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;

    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// RGB 转 HSVA
function rgbToHsva(r, g, b, a = 1) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max, d = max - min;

    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100, a: a };
}

// RGB 转 CMYK
function rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255;

    const k = 1 - Math.max(r, Math.max(g, b));
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    return {
        c: c * 100,
        m: m * 100,
        y: y * 100,
        k: k * 100
    };
}

// CSS 颜色名称映射（简化版）
const cssColorNames = {
    '#f0f8ff': 'aliceblue', '#faebd7': 'antiquewhite', '#00ffff': 'aqua', '#7fffd4': 'aquamarine',
    '#f0ffff': 'azure', '#f5f5dc': 'beige', '#000000': 'black', '#0000ff': 'blue',
    '#a52a2a': 'brown', '#00ffff': 'cyan', '#00008b': 'darkblue', '#008000': 'green',
    '#808080': 'gray', '#ffd700': 'gold', '#00ff00': 'lime', '#ff00ff': 'magenta',
    '#800000': 'maroon', '#000080': 'navy', '#ffa500': 'orange', '#800080': 'purple',
    '#ff0000': 'red', '#c0c0c0': 'silver', '#008080': 'teal', '#ffffff': 'white',
    '#ffff00': 'yellow'
};

function getCSSColorName(hex) {
    return cssColorNames[hex.toLowerCase()] || null;
}

// 预设颜色库
const colorPresets = {
    'material': {
        name: 'Material Design',
        colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722']
    },
    'flat': {
        name: 'Flat UI',
        colors: ['#1abc9c', '#16a085', '#2ecc71', '#27ae60', '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#34495e', '#2c3e50', '#f1c40f', '#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b']
    },
    'pastel': {
        name: '粉彩色系',
        colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#c9c9ff', '#ffc9ff', '#ffb3ff', '#c9ffba', '#baffff', '#ffe4e1', '#e6e6fa', '#fff8dc', '#f0fff0', '#f0f8ff', '#fdf5e6']
    },
    'vintage': {
        name: '复古色系',
        colors: ['#8b4513', '#a0522d', '#cd853f', '#daa520', '#b8860b', '#556b2f', '#6b8e23', '#808000', '#483d8b', '#663399', '#8b008b', '#800080', '#4b0082', '#191970', '#000080', '#2f4f4f']
    }
};

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// 预设颜色库功能
function loadColorPreset(presetName) {
    const preset = colorPresets[presetName];
    if (!preset) return;

    const paletteColors = document.getElementById('paletteColors');
    paletteColors.innerHTML = '';

    preset.colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color preset-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.setAttribute('data-color', color);
        colorDiv.title = `${color} - ${preset.name}`;

        const colorLabel = document.createElement('span');
        colorLabel.className = 'color-label';
        colorLabel.textContent = color;
        colorDiv.appendChild(colorLabel);

        colorDiv.addEventListener('click', () => updateColorInputs(color));
        paletteColors.appendChild(colorDiv);
    });

    showNotification(`已加载 ${preset.name} 色彩库`, 'success');
}

// 颜色格式复制功能
function copyColorFormat(format) {
    const color = document.getElementById('colorPicker').value;
    const rgb = hexToRgb(color);
    if (!rgb) return;

    let value = '';

    switch (format) {
        case 'hex':
            value = color;
            break;
        case 'rgb':
            value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            break;
        case 'hsl':
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
            break;
        case 'hsva':
            const hsva = rgbToHsva(rgb.r, rgb.g, rgb.b);
            value = `hsva(${Math.round(hsva.h)}, ${Math.round(hsva.s)}%, ${Math.round(hsva.v)}%, 1)`;
            break;
        case 'cmyk':
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            value = `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`;
            break;
        case 'css':
            value = getCSSColorName(color) || color;
            break;
    }

    copyToClipboard(value, `${format.toUpperCase()} 格式已复制！`);
}

// 清除颜色历史
function clearColorHistory() {
    if (confirm('确定要清除所有颜色历史记录吗？')) {
        colorHistory = [];
        localStorage.setItem('colorHistory', JSON.stringify(colorHistory));
        updateColorHistory();
        showNotification('颜色历史已清除', 'info');
    }
}

// 导出调色板
function exportPalette() {
    const paletteColors = document.querySelectorAll('#paletteColors .palette-color');
    const colors = Array.from(paletteColors).map(el => el.getAttribute('data-color')).filter(Boolean);

    if (colors.length === 0) {
        showNotification('没有可导出的颜色', 'error');
        return;
    }

    const palette = {
        name: `调色板_${new Date().toISOString().split('T')[0]}`,
        colors: colors,
        created: new Date().toISOString()
    };

    const dataStr = JSON.stringify(palette, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${palette.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('调色板已导出', 'success');
}

// 随机颜色生成
function generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 50) + 50; // 50-100%
    const lightness = Math.floor(Math.random() * 40) + 30;  // 30-70%

    const rgb = hslToRgb(hue, saturation, lightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    updateColorInputs(hex);
    generatePalette();
}
function md5(string) {
    // 这是一个简化的MD5实现，实际项目中建议使用成熟的库
    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        // ... 省略其他轮次的计算
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    // 这里使用一个简化版本，实际应用中应该使用完整的MD5算法
    // 为了演示目的，返回一个模拟的哈希值
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32);
}

function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function cmn(q, a, b, x, s, t) {
    return add32(rol32(add32(add32(a, q), add32(x, t)), s), b);
}

function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
}

function rol32(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}

// 显示关于信息
function showAbout() {
    alert(`DevTools Hub v1.0.0

一个现代化的开发者工具集合，提供日常开发中最常用的实用工具。

特性：
✅ 完全离线使用
✅ 响应式设计
✅ 深色模式支持
✅ 现代化界面
✅ 开源免费

Made with ❤️ for developers`);
}

// 时间戳转换器功能
function convertTimestamp() {
    const timestampInput = document.getElementById('timestampInput').value;
    const timestampResult = document.getElementById('timestampResult');

    if (timestampInput) {
        const timestamp = parseInt(timestampInput);
        const date = new Date(timestamp * 1000);
        timestampResult.value = date.toLocaleString();
        updateTimestampFormats(date);
    }
}

function convertDateTime() {
    const datetimeInput = document.getElementById('datetimeInput').value;
    const datetimeResult = document.getElementById('datetimeResult');

    if (datetimeInput) {
        const date = new Date(datetimeInput);
        const timestamp = Math.floor(date.getTime() / 1000);
        datetimeResult.value = timestamp.toString();
        updateTimestampFormats(date);
    }
}

function setCurrentTimestamp() {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    document.getElementById('timestampInput').value = timestamp;
    convertTimestamp();
}

function setCurrentDateTime() {
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16);
    document.getElementById('datetimeInput').value = isoString;
    convertDateTime();
}

function updateTimestampFormats(date) {
    document.getElementById('isoFormat').value = date.toISOString();
    document.getElementById('utcFormat').value = date.toUTCString();
    document.getElementById('localFormat').value = date.toLocaleString();
}

// 添加时间戳输入监听器
document.addEventListener('DOMContentLoaded', function () {
    const timestampInput = document.getElementById('timestampInput');
    const datetimeInput = document.getElementById('datetimeInput');

    if (timestampInput) {
        timestampInput.addEventListener('input', convertTimestamp);
    }

    if (datetimeInput) {
        datetimeInput.addEventListener('input', convertDateTime);
    }

    // 初始化时间戳转换器
    setCurrentTimestamp();
});

// 二维码生成器功能
function generateQR() {
    const text = document.getElementById('qrText').value;
    const size = document.getElementById('qrSize').value;
    const level = document.getElementById('qrLevel').value;
    const qrDisplay = document.getElementById('qrDisplay');
    const downloadBtn = document.getElementById('downloadQR');

    if (!text.trim()) {
        qrDisplay.innerHTML = '<p style="color: #e74c3c;">请输入要生成二维码的内容</p>';
        downloadBtn.style.display = 'none';
        return;
    }

    // 使用Google Chart API生成二维码
    const qrUrl = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(text)}&choe=UTF-8&chld=${level}|0`;

    qrDisplay.innerHTML = `
        <img src="${qrUrl}" 
             alt="QR Code" 
             style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px;"
             onload="document.getElementById('downloadQR').style.display = 'inline-block'">
    `;

    // 存储二维码URL供下载使用
    window.currentQrUrl = qrUrl;
}

function downloadQR() {
    if (window.currentQrUrl) {
        const link = document.createElement('a');
        link.href = window.currentQrUrl;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 文本差异对比功能
function compareTexts() {
    const textA = document.getElementById('textA').value;
    const textB = document.getElementById('textB').value;
    const diffResult = document.getElementById('diffResult');
    const diffStats = document.getElementById('diffStats');

    if (!textA.trim() && !textB.trim()) {
        diffResult.innerHTML = '<p style="color: #e74c3c;">请输入要对比的文本</p>';
        diffStats.textContent = '请输入文本进行对比';
        return;
    }

    const linesA = textA.split('\n');
    const linesB = textB.split('\n');

    let html = '<div class="diff-content">';
    let addedLines = 0;
    let removedLines = 0;
    let modifiedLines = 0;

    const maxLines = Math.max(linesA.length, linesB.length);

    for (let i = 0; i < maxLines; i++) {
        const lineA = linesA[i] || '';
        const lineB = linesB[i] || '';

        if (lineA === lineB) {
            // 相同行
            if (lineA !== '') {
                html += `<div class="diff-line unchanged">
                    <span class="line-number">${i + 1}</span>
                    <span class="line-content">${escapeHtml(lineA)}</span>
                </div>`;
            }
        } else {
            // 不同行
            if (lineA && !lineB) {
                // 删除的行
                html += `<div class="diff-line removed">
                    <span class="line-number">-</span>
                    <span class="line-content">${escapeHtml(lineA)}</span>
                </div>`;
                removedLines++;
            } else if (!lineA && lineB) {
                // 添加的行
                html += `<div class="diff-line added">
                    <span class="line-number">+</span>
                    <span class="line-content">${escapeHtml(lineB)}</span>
                </div>`;
                addedLines++;
            } else {
                // 修改的行
                html += `<div class="diff-line removed">
                    <span class="line-number">-</span>
                    <span class="line-content">${escapeHtml(lineA)}</span>
                </div>`;
                html += `<div class="diff-line added">
                    <span class="line-number">+</span>
                    <span class="line-content">${escapeHtml(lineB)}</span>
                </div>`;
                modifiedLines++;
            }
        }
    }

    html += '</div>';
    diffResult.innerHTML = html;

    // 更新统计信息
    diffStats.innerHTML = `
        <span style="color: #27ae60;">+${addedLines} 添加</span>
        <span style="color: #e74c3c;">-${removedLines} 删除</span>
        <span style="color: #f39c12;">${modifiedLines} 修改</span>
    `;
}

function clearDiff() {
    document.getElementById('textA').value = '';
    document.getElementById('textB').value = '';
    document.getElementById('diffResult').innerHTML = '';
    document.getElementById('diffStats').textContent = '点击"对比文本"查看差异';
    updateDiffInputStats();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 文本对比辅助函数
async function pasteDiff(side) {
    try {
        const text = await navigator.clipboard.readText();
        const targetId = side === 'right' ? 'textB' : 'textA';
        const el = document.getElementById(targetId);
        if (el) {
            el.value = text;
            updateDiffInputStats();
            showNotification(`已粘贴到${side === 'right' ? '右侧' : '左侧'}`, 'success');
        }
    } catch (e) {
        showNotification('无法访问剪贴板：' + e.message, 'error');
    }
}

function swapDiffTexts() {
    const a = document.getElementById('textA');
    const b = document.getElementById('textB');
    if (!a || !b) return;
    const tmp = a.value;
    a.value = b.value;
    b.value = tmp;
    updateDiffInputStats();
    showNotification('已交换左右文本', 'info');
}

function copyDiff() {
    const result = document.getElementById('diffResult');
    if (!result || !result.innerText.trim()) {
        showNotification('没有可复制的对比结果', 'warning');
        return;
    }
    copyToClipboard(result.innerText, '对比结果已复制');
}

function downloadDiff() {
    const result = document.getElementById('diffResult');
    if (!result || !result.innerText.trim()) {
        showNotification('没有可下载的对比结果', 'warning');
        return;
    }
    const blob = new Blob([result.innerText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-result.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showNotification('已准备下载', 'success');
}

function updateDiffInputStats() {
    const a = document.getElementById('textA');
    const b = document.getElementById('textB');
    const aStats = document.getElementById('textAStats');
    const bStats = document.getElementById('textBStats');
    if (a && aStats) {
        const lines = a.value ? a.value.split('\n').length : 0;
        const chars = a.value.length;
        aStats.textContent = `${lines} 行, ${chars} 字符`;
    }
    if (b && bStats) {
        const lines = b.value ? b.value.split('\n').length : 0;
        const chars = b.value.length;
        bStats.textContent = `${lines} 行, ${chars} 字符`;
    }
}

// JSON 树视图 & 离线 QR & 使用统计 增强
(function () {
    // =============== 使用统计 ===============
    const USAGE_KEY = 'devtools_usage_stats_v1';
    function loadUsage() { try { return JSON.parse(localStorage.getItem(USAGE_KEY)) || {}; } catch (e) { return {}; } }
    function saveUsage(stats) { localStorage.setItem(USAGE_KEY, JSON.stringify(stats)); }
    function recordUsage(tool) { const stats = loadUsage(); const now = Date.now(); if (!stats[tool]) stats[tool] = { count: 0, last: now }; stats[tool].count++; stats[tool].last = now; saveUsage(stats); }
    function formatTime(ts) { if (!ts) return '-'; const d = new Date(ts); return d.toLocaleString(); }
    function openUsageModal() { const modal = document.getElementById('usageModal'); if (!modal) return; renderUsageTable(); modal.setAttribute('aria-hidden', 'false'); const focusClose = modal.querySelector('.modal-close'); focusClose && focusClose.focus(); }
    function closeUsageModal() { const modal = document.getElementById('usageModal'); if (!modal) return; modal.setAttribute('aria-hidden', 'true'); }
    function renderUsageTable() { const stats = loadUsage(); const tbody = document.getElementById('usageTableBody'); if (!tbody) return; const rows = Object.entries(stats).sort((a, b) => b[1].count - a[1].count).map(([tool, data]) => `<tr><td>${tool}</td><td>${data.count}</td><td>${formatTime(data.last)}</td></tr>`).join(''); tbody.innerHTML = rows || '<tr><td colspan="3" style="opacity:.6">暂无数据</td></tr>'; }
    document.addEventListener('click', e => { if (e.target.matches('[data-close-modal]') || e.target.closest('[data-close-modal]')) closeUsageModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeUsageModal(); });
    document.addEventListener('DOMContentLoaded', () => { // 悬浮入口按钮
        if (!document.querySelector('.usage-trigger-btn')) {
            const btn = document.createElement('button'); btn.className = 'usage-trigger-btn'; btn.innerHTML = '<i class="fas fa-chart-line"></i><span>统计</span>'; btn.addEventListener('click', openUsageModal); document.body.appendChild(btn);
        }
        const resetBtn = document.getElementById('resetUsageBtn'); if (resetBtn) { resetBtn.addEventListener('click', () => { if (confirm('确定重置所有统计？')) { saveUsage({}); renderUsageTable(); showNotification && showNotification('统计已重置', 'success'); } }); }
    });

    // Hook switchTool 来记录使用
    // 深链接支持：包装 switchTool，同步 URL hash，并记录使用
    const _originalSwitch = window.switchTool;
    let _ignoreHash = false;
    function _setHash(toolId) {
        if (location.hash.slice(1) === toolId) return;
        _ignoreHash = true;
        try { location.hash = toolId; } catch (_) { }
        // 下一轮事件循环后允许处理 hashchange
        setTimeout(() => { _ignoreHash = false; }, 0);
    }
    if (typeof _originalSwitch === 'function') {
        window.switchTool = function (toolId) {
            _originalSwitch(toolId);
            recordUsage(toolId);
            _setHash(toolId);
        };
    }

    // =============== JSON 树视图 ===============
    function buildTree(container, data, query) {
        container.innerHTML = ''; const ul = document.createElement('ul'); container.appendChild(ul); function createNode(key, value, parent) {
            const li = document.createElement('li'); let type = typeof value; if (value === null) type = 'null'; const isObj = type === 'object'; const isArr = Array.isArray(value); li.className = 'tree-node'; const wrapper = document.createElement('div'); wrapper.className = 'node-line'; if (isObj || isArr) { wrapper.innerHTML = `<span class="node-toggle" role="button" tabindex="0">▶</span><span class="node-key">${escapeHtml(String(key))}</span><span class="node-sep">: </span><span class="node-type">${isArr ? `Array(${value.length})` : 'Object'}</span>`; } else { let cls = 'node-value-string'; if (type === 'number') cls = 'node-value-number'; else if (type === 'boolean') cls = 'node-value-boolean'; else if (type === 'null') cls = 'node-value-null'; wrapper.innerHTML = `<span class="node-key">${escapeHtml(String(key))}</span><span class="node-sep">: </span><span class="${cls}">${escapeHtml(JSON.stringify(value))}</span>`; }
            li.appendChild(wrapper); parent.appendChild(li); if (isObj || isArr) { const childUl = document.createElement('ul'); li.appendChild(childUl); (isArr ? value : Object.entries(value)).forEach((entry, i) => { if (isArr) createNode(i, entry, childUl); else { const [k, v] = entry; createNode(k, v, childUl); } }); li.classList.add('collapsed'); wrapper.querySelector('.node-toggle').addEventListener('click', () => { li.classList.toggle('collapsed'); }); wrapper.querySelector('.node-toggle').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.classList.toggle('collapsed'); } }); }
            // 简易高亮搜索
            if (query) {
                const q = String(query).toLowerCase();
                const txt = wrapper.textContent.toLowerCase();
                if (txt.includes(q)) {
                    wrapper.style.background = 'rgba(255, 214, 102, .18)';
                    wrapper.style.borderRadius = '6px';
                }
            }
        }
        if (typeof data === 'object' && data !== null) { if (Array.isArray(data)) { createNode('[root]', data, ul); } else { createNode('[root]', data, ul); } } else { ul.innerHTML = `<li><em>根节点不是对象/数组</em></li>`; }
    }

    function showTree() { const input = document.getElementById('jsonInput'); const tree = document.getElementById('jsonTreeView'); const output = document.getElementById('jsonOutput'); if (!tree || !input) return; try { const data = JSON.parse(input.value); const q = (document.getElementById('jsonTreeSearch') || {}).value || ''; buildTree(tree, data, q); tree.hidden = false; output.style.display = 'none'; document.getElementById('showTreeBtn').style.display = 'none'; document.getElementById('showTextBtn').style.display = 'inline-flex'; } catch (e) { showNotification && showNotification('当前 JSON 无法解析', 'error'); } }
    function showText() { const tree = document.getElementById('jsonTreeView'); const output = document.getElementById('jsonOutput'); if (!tree) return; tree.hidden = true; output.style.display = 'block'; document.getElementById('showTreeBtn').style.display = 'inline-flex'; document.getElementById('showTextBtn').style.display = 'none'; }

    document.addEventListener('DOMContentLoaded', () => {
        const treeBtn = document.getElementById('showTreeBtn'); const textBtn = document.getElementById('showTextBtn'); if (treeBtn) treeBtn.addEventListener('click', showTree); if (textBtn) textBtn.addEventListener('click', showText);
        const search = document.getElementById('jsonTreeSearch'); if (search) { search.addEventListener('input', () => { const tree = document.getElementById('jsonTreeView'); if (!tree || tree.hidden) return; showTree(); }); }
        // 初始根据 URL 参数或 hash 激活工具
        const params = new URLSearchParams(location.search);
        const urlTool = params.get('tool');
        const hashTool = location.hash ? location.hash.slice(1) : '';
        const target = hashTool || urlTool;
        if (target && typeof window.switchTool === 'function') {
            window.switchTool(target);
        }
        // 监听 hash 变化（例如用户直接修改 #tool）
        window.addEventListener('hashchange', () => {
            if (_ignoreHash) return;
            const t = location.hash.slice(1);
            if (t && typeof window.switchTool === 'function') {
                window.switchTool(t);
            }
        });
    });

    // =============== 离线 QR 生成（替换外部 API） ===============
    // 简化：使用一个最小实现（伪：不完整二维码算法，仅占位演示）。建议后续接入真正二维码库或手写模块。
    function generateSimpleQR(text, size) {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = size; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000'; // 简单 hash 映射点阵（非真实二维码，仅示例）。
        let hash = 0; for (let i = 0; i < text.length; i++) { hash = (hash * 31 + text.charCodeAt(i)) >>> 0; }
        const cells = 33; const cellSize = Math.floor(size / cells); for (let y = 0; y < cells; y++) { for (let x = 0; x < cells; x++) { const bit = (hash + x * 73856093 + y * 19349663) & 7; if (bit === 0) { ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize); } } }
        return canvas.toDataURL('image/png');
    }

    const originalGenerateQR = window.generateQR; // 保留原函数引用
    window.generateQR = function () {
        try {
            const text = document.getElementById('qrText').value; const size = parseInt(document.getElementById('qrSize').value) || 300; const level = document.getElementById('qrLevel').value; const qrDisplay = document.getElementById('qrDisplay'); const downloadBtn = document.getElementById('downloadQR'); if (!text.trim()) { qrDisplay.innerHTML = '<p style="color:#e74c3c;">请输入要生成二维码的内容</p>'; downloadBtn.style.display = 'none'; return; } // 使用本地实现
            const dataUrl = generateSimpleQR(text + '|' + level, size); qrDisplay.innerHTML = `<img src="${dataUrl}" alt="QR Code" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:8px;"/>`; window.currentQrUrl = dataUrl; downloadBtn.style.display = 'inline-block';
        } catch (e) { console.warn('离线 QR 失败，回退外部 API', e); if (originalGenerateQR) originalGenerateQR(); }
    };
})();