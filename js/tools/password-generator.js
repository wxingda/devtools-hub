// 密码生成器工具模块
(function () {
    'use strict';

    // 密码生成器功能
    window.generatePassword = function () {
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
            if (window.showNotification) {
                showNotification('请至少选择一种字符类型！', 'warning');
            }
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        document.getElementById('generatedPassword').value = password;
        updatePasswordStrength(password);
        updatePasswordAnalysis(password);
    };

    // 批量生成密码
    window.generateMultiple = function () {
        const passwords = [];
        for (let i = 0; i < 5; i++) {
            generatePassword();
            passwords.push(document.getElementById('generatedPassword').value);
        }

        // 显示批量密码对话框或在新窗口中显示
        const passwordList = passwords.join('\\n');
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
    };

    // 重新生成密码
    window.regeneratePassword = function () {
        generatePassword();
    };

    // 清空密码
    window.clearPassword = function () {
        document.getElementById('generatedPassword').value = '';
        const result = document.getElementById('passwordResult');
        if (result) {
            result.innerHTML = '';
        }
        const strength = document.getElementById('passwordStrength');
        if (strength) {
            strength.className = 'strength-meter';
            strength.textContent = '';
        }
    };

    // 复制密码
    window.copyPassword = function () {
        const password = document.getElementById('generatedPassword').value;
        if (!password) {
            if (window.showNotification) {
                showNotification('请先生成密码！', 'warning');
            }
            return;
        }

        navigator.clipboard.writeText(password).then(() => {
            if (window.showNotification) {
                showNotification('密码已复制到剪贴板！', 'success');
            }
        }).catch(() => {
            if (window.showNotification) {
                showNotification('复制失败，请手动选择复制', 'error');
            }
        });
    };

    // 密码强度分析
    window.updatePasswordStrength = function (password) {
        if (!password) return;

        let strength = 0;
        let feedback = [];

        // 长度检查
        if (password.length >= 8) strength += 1;
        else feedback.push('至少8个字符');

        if (password.length >= 12) strength += 1;
        if (password.length >= 16) strength += 1;

        // 字符类型检查
        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('包含小写字母');

        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('包含大写字母');

        if (/[0-9]/.test(password)) strength += 1;
        else feedback.push('包含数字');

        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else feedback.push('包含特殊字符');

        // 更新强度显示
        const strengthEl = document.getElementById('passwordStrength');
        if (strengthEl) {
            strengthEl.className = 'strength-meter';
            if (strength <= 2) {
                strengthEl.classList.add('weak');
                strengthEl.textContent = '弱';
            } else if (strength <= 4) {
                strengthEl.classList.add('medium');
                strengthEl.textContent = '中等';
            } else if (strength <= 6) {
                strengthEl.classList.add('strong');
                strengthEl.textContent = '强';
            } else {
                strengthEl.classList.add('very-strong');
                strengthEl.textContent = '很强';
            }
        }
    };

    // 密码分析详情
    window.updatePasswordAnalysis = function (password) {
        if (!password) return;

        const analysisEl = document.getElementById('passwordAnalysis');
        if (!analysisEl) return;

        const entropy = calculateEntropy(password);
        const composition = analyzeComposition(password);

        analysisEl.innerHTML = `
            <div class="analysis-item">
                <span>熵值：</span>
                <strong>${entropy.toFixed(1)} bits</strong>
            </div>
            <div class="analysis-item">
                <span>字符组成：</span>
                <span>${composition}</span>
            </div>
            <div class="analysis-item">
                <span>破解时间：</span>
                <span>${estimateCrackTime(entropy)}</span>
            </div>
        `;
    };

    // 计算密码熵值
    function calculateEntropy(password) {
        let charset = 0;
        if (/[a-z]/.test(password)) charset += 26;
        if (/[A-Z]/.test(password)) charset += 26;
        if (/[0-9]/.test(password)) charset += 10;
        if (/[^A-Za-z0-9]/.test(password)) charset += 32;

        return Math.log2(Math.pow(charset, password.length));
    }

    // 分析字符组成
    function analyzeComposition(password) {
        const parts = [];
        if (/[a-z]/.test(password)) parts.push('小写');
        if (/[A-Z]/.test(password)) parts.push('大写');
        if (/[0-9]/.test(password)) parts.push('数字');
        if (/[^A-Za-z0-9]/.test(password)) parts.push('符号');
        return parts.join(' + ');
    }

    // 估算破解时间
    function estimateCrackTime(entropy) {
        const seconds = Math.pow(2, entropy - 1) / 1000000000; // 假设每秒10亿次尝试
        if (seconds < 60) return '瞬间';
        if (seconds < 3600) return `${Math.round(seconds / 60)} 分钟`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} 小时`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} 天`;
        if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} 年`;
        return '数千年';
    }

    // 长度预设按钮事件
    window.setPasswordLength = function (length) {
        document.getElementById('passwordLength').value = length;
        document.getElementById('lengthValue').textContent = length;

        // 更新预设按钮状态
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-length') == length) {
                btn.classList.add('active');
            }
        });

        // 重新生成密码
        generatePassword();
    };

    // 注册工具到 DevToolsHub
    if (window.DevToolsHub) {
        DevToolsHub.registerTool('password-generator', {
            init: function () {
                // 初始化密码长度滑块
                const lengthSlider = document.getElementById('passwordLength');
                const lengthValue = document.getElementById('lengthValue');

                if (lengthSlider && lengthValue) {
                    lengthSlider.addEventListener('input', function () {
                        lengthValue.textContent = this.value;
                        generatePassword();
                    });
                }

                // 初始化预设按钮
                document.querySelectorAll('.preset-btn').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const length = this.getAttribute('data-length');
                        setPasswordLength(length);
                    });
                });

                // 初始化复选框事件
                ['includeUppercase', 'includeLowercase', 'includeNumbers', 'includeSymbols'].forEach(id => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) {
                        checkbox.addEventListener('change', generatePassword);
                    }
                });

                // 自动生成初始密码
                generatePassword();
            }
        });
    }

})();