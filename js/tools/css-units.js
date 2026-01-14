// CSS 单位转换工具模块
(function () {
    'use strict';

    window.convertCssUnits = function () {
        const baseFontSize = parseFloat(document.getElementById('baseFontSize').value) || 16;
        const inputValue = parseFloat(document.getElementById('inputValue').value);
        const inputUnit = document.getElementById('inputUnit').value;
        const tableEl = document.getElementById('cssUnitTable');

        if (isNaN(inputValue)) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let pxValue;
        switch (inputUnit) {
            case 'px': pxValue = inputValue; break;
            case 'rem': pxValue = inputValue * baseFontSize; break;
            case 'em': pxValue = inputValue * baseFontSize; break;
            case 'vw': pxValue = (inputValue / 100) * viewportWidth; break;
            case 'vh': pxValue = (inputValue / 100) * viewportHeight; break;
            case '%': pxValue = (inputValue / 100) * baseFontSize; break;
            default: pxValue = inputValue;
        }

        const results = {
            'px': pxValue,
            'rem': pxValue / baseFontSize,
            'em': pxValue / baseFontSize,
            'vw': (pxValue / viewportWidth) * 100,
            'vh': (pxValue / viewportHeight) * 100,
            '%': (pxValue / baseFontSize) * 100
        };

        if (tableEl) {
            tableEl.innerHTML = Object.entries(results).map(([unit, val]) => `
                <div class="unit-item">
                    <h4>${unit}</h4>
                    <code>${Number.isInteger(val) ? val : val.toFixed(4)}</code>
                </div>
            `).join('');
        }
    };

    // 初始化注册
    if (window.DevToolsHub) {
        window.DevToolsHub.registerTool('css-units', {
            init: () => {
                const inputs = ['baseFontSize', 'inputValue', 'inputUnit'];
                inputs.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.addEventListener('input', window.convertCssUnits);
                });
            },
            clear: () => {
                const inputs = ['inputValue', 'cssUnitResult'];
                inputs.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                const tableEl = document.getElementById('cssUnitTable');
                if (tableEl) tableEl.innerHTML = '';
            }
        });
    }
})();