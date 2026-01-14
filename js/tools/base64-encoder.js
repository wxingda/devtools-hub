// Base64 编解码工具模块
(function () {
    'use strict';

    window.base64Encode = function () {
        const input = document.getElementById('base64Input').value;
        const output = document.getElementById('base64Output');
        if (output) {
            try {
                output.value = btoa(unescape(encodeURIComponent(input)));
            } catch (e) {
                if (window.showNotification) window.showNotification('编码失败', 'error');
            }
        }
    };

    window.base64Decode = function () {
        const input = document.getElementById('base64Input').value;
        const output = document.getElementById('base64Output');
        if (output) {
            try {
                output.value = decodeURIComponent(escape(atob(input)));
            } catch (e) {
                if (window.showNotification) window.showNotification('解码失败：无效的 Base64 格式', 'error');
            }
        }
    };

    // 初始化注册
    if (window.DevToolsHub) {
        window.DevToolsHub.registerTool('base64-encoder', {
            init: () => { },
            clear: () => {
                ['base64Input', 'base64Output'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            }
        });
    }
})();