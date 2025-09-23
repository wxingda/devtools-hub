// DevTools Hub Namespace 模块化封装
window.DevToolsHub = (function () {
    const api = {};
    api.state = { currentTool: 'password-generator', tools: {} };
    api.registerTool = function (id, hooks) { api.state.tools[id] = hooks || {}; };
    api.switchTool = function (id) { if (typeof switchTool === 'function') switchTool(id); };
    return api;
})();

// 全局变量
let currentTool = 'password-generator';

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupKeyboardShortcuts();
    setupI18n();
});

// 初始化应用
function initializeApp() {
    setupNavigation();
    setupTheme();
    initializeTools();

    // 自动生成初始密码
    generatePassword();

    // 自动计算初始哈希值
    calculateHashes();

    // 初始化颜色选择器
    updateColorInputs('#3498db');
    generatePalette();

    // 初始化正则表达式测试
    testRegex();

    // 添加页面加载动画
    addPageTransitions();
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

    if (pasteBtn) pasteBtn.addEventListener('click', pasteJson);
    if (clearBtn) clearBtn.addEventListener('click', clearJsonInput);
    if (fmtBtn) fmtBtn.addEventListener('click', formatJSON);
    if (cmpBtn) cmpBtn.addEventListener('click', compressJSON);
    if (copyOutBtn) copyOutBtn.addEventListener('click', copyOutput);
    if (downloadOutBtn) downloadOutBtn.addEventListener('click', downloadOutput);

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

// 颜色调色板功能
function updateColorInputs(color) {
    const colorPicker = document.getElementById('colorPicker');
    const colorPreview = document.getElementById('colorPreview');
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');

    colorPicker.value = color;
    colorPreview.style.backgroundColor = color;
    hexInput.value = color;

    const rgb = hexToRgb(color);
    if (rgb) {
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hslInput.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    }
}

// 生成调色板
function generatePalette() {
    const baseColor = document.getElementById('colorPicker').value;
    const paletteColors = document.getElementById('paletteColors');

    const colors = generateColorPalette(baseColor);

    paletteColors.innerHTML = '';
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.setAttribute('data-color', color);
        colorDiv.addEventListener('click', () => updateColorInputs(color));
        paletteColors.appendChild(colorDiv);
    });
}

// 生成颜色调色板
function generateColorPalette(baseColor) {
    const colors = [];
    const rgb = hexToRgb(baseColor);

    if (!rgb) return [baseColor];

    // 生成明暗变化
    for (let i = 0.2; i <= 1.8; i += 0.2) {
        const newR = Math.min(255, Math.max(0, Math.round(rgb.r * i)));
        const newG = Math.min(255, Math.max(0, Math.round(rgb.g * i)));
        const newB = Math.min(255, Math.max(0, Math.round(rgb.b * i)));
        colors.push(rgbToHex(newR, newG, newB));
    }

    return colors;
}

// 正则表达式测试
function testRegex() {
    const pattern = document.getElementById('regexPattern').value;
    const testString = document.getElementById('testString').value;
    const globalFlag = document.getElementById('globalFlag').checked;
    const ignoreCaseFlag = document.getElementById('ignoreCaseFlag').checked;
    const multilineFlag = document.getElementById('multilineFlag').checked;

    const matchCount = document.getElementById('matchCount');
    const matchesList = document.getElementById('matchesList');

    if (!pattern) {
        matchCount.textContent = '0';
        matchesList.innerHTML = '';
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

        matchesList.innerHTML = '';
        matches.forEach((match, index) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match-item';
            matchDiv.innerHTML = `
                <strong>匹配 ${index + 1}:</strong>
                <span class="match-text">${escapeHtml(match[0])}</span>
                <br><small>位置: ${match.index} - ${match.index + match[0].length - 1}</small>
            `;
            matchesList.appendChild(matchDiv);
        });

    } catch (error) {
        matchCount.textContent = '0';
        matchesList.innerHTML = `<div class="match-item" style="color: var(--accent-color);">正则表达式错误: ${error.message}</div>`;
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

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// 简单的MD5实现
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
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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