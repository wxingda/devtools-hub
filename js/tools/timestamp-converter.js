// 时间戳转换工具模块
(function () {
    'use strict';

    window.convertTimestamp = function () {
        const input = document.getElementById('timestampInput').value;
        const result = document.getElementById('timestampResult');
        if (!input || !result) return;

        try {
            const ts = parseInt(input);
            const date = new Date(ts * (input.length === 10 ? 1000 : 1));
            result.value = date.toLocaleString();
        } catch (e) {
            result.value = '无效的时间戳';
        }
    };

    window.convertDatetime = function () {
        const input = document.getElementById('datetimeInput').value;
        const result = document.getElementById('datetimeResult');
        if (!input || !result) return;

        try {
            const date = new Date(input);
            result.value = Math.floor(date.getTime() / 1000);
        } catch (e) {
            result.value = '无效的日期格式';
        }
    };

    window.updateCurrentTime = function () {
        const el = document.getElementById('currentTimestamp');
        if (el) el.textContent = Math.floor(Date.now() / 1000);
    };

    // 初始化注册
    if (window.DevToolsHub) {
        window.DevToolsHub.registerTool('timestamp-converter', {
            init: () => {
                setInterval(window.updateCurrentTime, 1000);
                window.updateCurrentTime();
            },
            clear: () => {
                ['timestampInput', 'datetimeInput', 'timestampResult', 'datetimeResult'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            }
        });
    }
})();