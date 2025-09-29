// JSON 格式化工具模块
(function () {
    'use strict';

    // JSON格式化器功能
    window.formatJSON = function () {
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
                updateOutputStats(`已格式化, ${formatted.split('\\n').length} 行`);

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
    };

    window.compressJSON = function () {
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
    };

    window.validateJSON = function () {
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
    };

    // JSON convenience helpers
    window.pasteJson = async function () {
        try {
            const text = await navigator.clipboard.readText();
            const input = document.getElementById('jsonInput');
            if (input) {
                input.value = text;
                validateJSON();
                if (window.showNotification) {
                    showNotification('已粘贴剪贴板内容', 'success');
                }
            }
        } catch (err) {
            if (window.showNotification) {
                showNotification('无法访问剪贴板', 'error');
            }
        }
    };

    window.clearJson = function () {
        document.getElementById('jsonInput').value = '';
        document.getElementById('jsonOutput').value = '';
        showJsonStatus('已清空', '');
        updateOutputStats('等待输入');
    };

    window.copyJsonOutput = function () {
        const output = document.getElementById('jsonOutput').value;
        if (!output) {
            if (window.showNotification) {
                showNotification('没有可复制的内容', 'warning');
            }
            return;
        }

        navigator.clipboard.writeText(output).then(() => {
            if (window.showNotification) {
                showNotification('结果已复制到剪贴板！', 'success');
            }
        }).catch(() => {
            if (window.showNotification) {
                showNotification('复制失败，请手动选择复制', 'error');
            }
        });
    };

    // JSON树视图功能
    window.showJsonTree = function () {
        const input = document.getElementById('jsonInput').value;
        if (!input.trim()) {
            if (window.showNotification) {
                showNotification('请先输入 JSON 内容', 'warning');
            }
            return;
        }

        try {
            const data = JSON.parse(input);
            const treeHtml = generateJsonTree(data);

            // 创建树视图模态框
            const modal = document.createElement('div');
            modal.className = 'json-tree-modal';
            modal.innerHTML = `
                <div class="modal-backdrop" onclick="closeJsonTree()"></div>
                <div class="modal-content json-tree-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-sitemap"></i> JSON 树视图</h3>
                        <button onclick="closeJsonTree()" class="close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="json-tree-wrapper">
                            ${treeHtml}
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.offsetHeight; // 触发重排
            modal.classList.add('show');

        } catch (error) {
            if (window.showNotification) {
                showNotification(`无法解析 JSON: ${error.message}`, 'error');
            }
        }
    };

    window.closeJsonTree = function () {
        const modal = document.querySelector('.json-tree-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    };

    // 生成JSON树结构HTML
    function generateJsonTree(data, key = '', level = 0) {
        const indent = '  '.repeat(level);
        let html = '';

        if (Array.isArray(data)) {
            html += `<div class="json-node array" data-level="${level}">`;
            if (key) html += `<span class="json-key">"${key}"</span>: `;
            html += `<span class="json-bracket">[</span>`;
            html += `<span class="json-toggle" onclick="toggleJsonNode(this)">▼</span>`;
            html += `<div class="json-children">`;

            data.forEach((item, index) => {
                html += generateJsonTree(item, index, level + 1);
                if (index < data.length - 1) html += '<span class="json-comma">,</span>';
            });

            html += `</div><span class="json-bracket">]</span></div>`;

        } else if (data !== null && typeof data === 'object') {
            html += `<div class="json-node object" data-level="${level}">`;
            if (key) html += `<span class="json-key">"${key}"</span>: `;
            html += `<span class="json-bracket">{</span>`;
            html += `<span class="json-toggle" onclick="toggleJsonNode(this)">▼</span>`;
            html += `<div class="json-children">`;

            const entries = Object.entries(data);
            entries.forEach(([k, v], index) => {
                html += generateJsonTree(v, k, level + 1);
                if (index < entries.length - 1) html += '<span class="json-comma">,</span>';
            });

            html += `</div><span class="json-bracket">}</span></div>`;

        } else {
            // 叶子节点
            html += `<div class="json-node leaf" data-level="${level}">`;
            if (key) html += `<span class="json-key">"${key}"</span>: `;

            if (typeof data === 'string') {
                html += `<span class="json-string">"${escapeHtml(data)}"</span>`;
            } else if (typeof data === 'number') {
                html += `<span class="json-number">${data}</span>`;
            } else if (typeof data === 'boolean') {
                html += `<span class="json-boolean">${data}</span>`;
            } else if (data === null) {
                html += `<span class="json-null">null</span>`;
            }
            html += `</div>`;
        }

        return html;
    }

    // 切换JSON节点折叠状态
    window.toggleJsonNode = function (toggleEl) {
        const node = toggleEl.closest('.json-node');
        const children = node.querySelector('.json-children');

        if (children.style.display === 'none') {
            children.style.display = 'block';
            toggleEl.textContent = '▼';
        } else {
            children.style.display = 'none';
            toggleEl.textContent = '▶';
        }
    };

    // 转义HTML字符
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 状态显示辅助函数
    function showJsonStatus(message, type) {
        const statusEl = document.getElementById('jsonStatus');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `json-status ${type}`;
        }
    }

    // 更新输出统计
    function updateOutputStats(stats) {
        const statsEl = document.getElementById('outputStats');
        if (statsEl) {
            statsEl.textContent = stats;
        }
    }

    // 注册工具到 DevToolsHub
    if (window.DevToolsHub) {
        DevToolsHub.registerTool('json-formatter', {
            init: function () {
                // 初始化JSON输入监听
                const input = document.getElementById('jsonInput');
                if (input) {
                    input.addEventListener('input', function () {
                        // 实时验证
                        setTimeout(validateJSON, 300);
                    });

                    // 粘贴事件监听
                    input.addEventListener('paste', function () {
                        setTimeout(validateJSON, 100);
                    });
                }

                // 键盘快捷键
                document.addEventListener('keydown', function (e) {
                    if ((e.ctrlKey || e.metaKey) && document.activeElement &&
                        document.activeElement.closest('#json-formatter')) {
                        switch (e.key) {
                            case 'f':
                            case 'F':
                                e.preventDefault();
                                formatJSON();
                                break;
                            case 'm':
                            case 'M':
                                e.preventDefault();
                                compressJSON();
                                break;
                        }
                    }
                });
            }
        });
    }

})();