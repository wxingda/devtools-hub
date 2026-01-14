// URL 编解码工具模块
(function () {
    'use strict';

    window.urlEncode = function() {
        const input = document.getElementById('urlInput').value;
        const output = document.getElementById('urlOutput');
        if (output) output.value = encodeURIComponent(input);
    };

    window.urlDecode = function() {
        const input = document.getElementById('urlInput').value;
        const output = document.getElementById('urlOutput');
        if (output) {
            try {
                output.value = decodeURIComponent(input);
            } catch (e) {
                if (window.showNotification) window.showNotification('解码失败：无效的编码格式', 'error');
            }
        }
    };

    // 初始化注册
    if (window.DevToolsHub) {
        window.DevToolsHub.registerTool('url-encoder', {
            init: () => {
                // 如果需要可以在这里绑定事件，或者由 HTML 中的 onclick 触发
            },
            clear: () => {
                ['urlInput', 'urlOutput'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            }
        });
    }
})();