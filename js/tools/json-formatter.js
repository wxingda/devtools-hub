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
                if (typeof updateInputStats === 'function') {
                    try { updateInputStats(); } catch (_) { }
                }
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
        const input = document.getElementById('jsonInput');
        const output = document.getElementById('jsonOutput');
        const tree = document.getElementById('jsonTreeView');
        const searchBar = document.getElementById('jsonSearchBar');
        const btnTree = document.getElementById('showTreeBtn');
        const btnText = document.getElementById('showTextBtn');
        if (input) input.value = '';
        if (output) { output.value = ''; output.hidden = false; }
        if (tree) { tree.innerHTML = ''; tree.hidden = true; }
        if (searchBar) searchBar.style.display = 'none';
        if (btnTree) btnTree.classList.remove('active');
        if (btnText) btnText.classList.add('active');
        showJsonStatus('已清空', '');
        updateOutputStats('等待输入');
        if (typeof updateInputStats === 'function') {
            try { updateInputStats(); } catch (_) { }
        }
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
    function toggleJsonView(mode) {
        const output = document.getElementById('jsonOutput');
        const tree = document.getElementById('jsonTreeView');
        const searchBar = document.getElementById('jsonSearchBar');
        const btnTree = document.getElementById('showTreeBtn');
        const btnText = document.getElementById('showTextBtn');

        if (!(output && tree && searchBar && btnTree && btnText)) return;

        if (mode === 'tree') {
            const raw = document.getElementById('jsonInput')?.value || '';
            try {
                if (!raw.trim()) throw new Error('空内容');
                const data = JSON.parse(raw);
                tree.innerHTML = buildJsonTreeHTML(data);
                tree.hidden = false;
                output.hidden = true;
                searchBar.style.display = 'flex';
                btnTree.classList.add('active');
                btnText.classList.remove('active');
            } catch (e) {
                showJsonStatus(`无法解析 JSON: ${e.message}`, 'error');
                // 解析失败仍回退到文本视图
                tree.hidden = true;
                output.hidden = false;
                searchBar.style.display = 'none';
                btnTree.classList.remove('active');
                btnText.classList.add('active');
            }
        } else {
            tree.hidden = true;
            output.hidden = false;
            searchBar.style.display = 'none';
            btnTree.classList.remove('active');
            btnText.classList.add('active');
        }
    }

    // 重置旧事件监听（通过克隆节点替换）
    function resetHandlers(ids) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el || !el.parentNode) return;
            const clone = el.cloneNode(true);
            el.parentNode.replaceChild(clone, el);
        });
    }

    // 构建树视图（符合 .json-tree 的 ul/li 结构和样式类）
    function buildJsonTreeHTML(data) {
        return `<ul>${buildNode(data)}</ul>`;
    }

    function buildNode(value, key) {
        const hasChildren = value && (Array.isArray(value) || typeof value === 'object');
        const typeClass = Array.isArray(value) ? 'array' : (value === null ? 'null' : typeof value);
        let head = '';
        if (key !== undefined) {
            head += `<span class="node-key">"${escapeHtml(String(key))}"</span><span class="node-sep">: </span>`;
        }
        if (!hasChildren) {
            return `<li class="leaf ${typeClass}">${head}${renderPrimitive(value)}</li>`;
        }
        const open = Array.isArray(value) ? '[' : '{';
        const close = Array.isArray(value) ? ']' : '}';
        let children = '';
        if (Array.isArray(value)) {
            value.forEach((v, i) => { children += buildNode(v, i); });
        } else {
            Object.entries(value).forEach(([k, v]) => { children += buildNode(v, k); });
        }
        return `<li class="branch ${typeClass}">
            <span class="node-toggle" title="展开/折叠"></span>${head}
            <span class="node-bracket">${open}</span>
            <ul>${children}</ul>
            <span class="node-bracket">${close}</span>
        </li>`;
    }

    function renderPrimitive(v) {
        switch (typeof v) {
            case 'string': return `<span class="node-value-string">"${escapeHtml(v)}"</span>`;
            case 'number': return `<span class="node-value-number">${v}</span>`;
            case 'boolean': return `<span class="node-value-boolean">${v}</span>`;
            default: return `<span class="node-value-null">null</span>`;
        }
    }

    // 事件委托：展开/折叠
    function bindTreeDelegation() {
        const tree = document.getElementById('jsonTreeView');
        if (!tree || tree._delegated) return;
        tree.addEventListener('click', (e) => {
            const toggle = e.target.closest('.node-toggle');
            if (toggle) {
                const li = toggle.closest('li');
                li && li.classList.toggle('collapsed');
            }
        });
        tree._delegated = true;
    }

    // 搜索与高亮
    function bindTreeSearch() {
        const input = document.getElementById('jsonTreeSearch');
        const tree = document.getElementById('jsonTreeView');
        if (!input || !tree || input._bound) return;
        input.addEventListener('input', () => {
            const q = input.value.trim();
            clearHighlights(tree);
            if (!q) return;
            const re = new RegExp(escapeRegExp(q), 'gi');
            const targets = tree.querySelectorAll('.node-key, .node-value-string, .node-value-number, .node-value-boolean, .node-value-null');
            targets.forEach(el => {
                const text = el.getAttribute('data-original') || el.textContent;
                el.setAttribute('data-original', text);
                el.innerHTML = text.replace(re, (m) => `<mark class="json-hl">${m}</mark>`);
                if (re.test(text)) {
                    // 展开包含匹配的分支
                    let li = el.closest('li');
                    while (li) { li.classList.remove('collapsed'); li = li.parentElement && li.parentElement.closest('li'); }
                }
            });
        });
        input._bound = true;
    }

    function clearHighlights(root) {
        root.querySelectorAll('[data-original]').forEach(el => {
            el.innerHTML = el.getAttribute('data-original');
            el.removeAttribute('data-original');
        });
        root.querySelectorAll('mark.json-hl').forEach(m => {
            const parent = m.parentNode; if (!parent) return;
            parent.replaceChild(document.createTextNode(m.textContent), m);
        });
    }

    function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

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

                // 绑定工具栏按钮（延迟到当前事件循环之后，避免与 legacy DOMContentLoaded 冲突）
                const byId = (id) => document.getElementById(id);
                setTimeout(() => {
                    // 防重复绑定：移除 legacy 监听
                    resetHandlers([
                        'pasteJsonBtn', 'clearJsonBtn', 'formatJsonBtn', 'compressJsonBtn',
                        'validateJsonBtn', 'copyOutputBtn', 'downloadOutputBtn',
                        'showTreeBtn', 'showTextBtn', 'jsonTreeSearch'
                    ]);

                    byId('pasteJsonBtn')?.addEventListener('click', pasteJson);
                    byId('clearJsonBtn')?.addEventListener('click', clearJson);
                    byId('formatJsonBtn')?.addEventListener('click', formatJSON);
                    byId('compressJsonBtn')?.addEventListener('click', compressJSON);
                    byId('validateJsonBtn')?.addEventListener('click', validateJSON);
                    byId('copyOutputBtn')?.addEventListener('click', copyJsonOutput);
                    byId('downloadOutputBtn')?.addEventListener('click', () => {
                        if (typeof downloadOutput === 'function') return downloadOutput();
                        const out = document.getElementById('jsonOutput');
                        if (!out || !out.value) return;
                        const blob = new Blob([out.value], { type: 'application/json;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = 'data.json';
                        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                    });
                    byId('showTreeBtn')?.addEventListener('click', () => toggleJsonView('tree'));
                    byId('showTextBtn')?.addEventListener('click', () => toggleJsonView('text'));

                    // 绑定树事件
                    bindTreeDelegation();
                    bindTreeSearch();

                    // 默认展示树视图（根据 UI 默认按钮状态）
                    const defaultToTree = document.getElementById('showTreeBtn')?.classList.contains('active');
                    toggleJsonView(defaultToTree ? 'tree' : 'text');
                }, 0);
            },
            clear: function () {
                window.clearJson();
            }
        });
    }

})();