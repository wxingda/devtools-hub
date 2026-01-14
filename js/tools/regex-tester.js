// 正则表达式测试工具模块
(function () {
    'use strict';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.testRegex = function () {
        const pattern = document.getElementById('regexPattern').value;
        const testString = document.getElementById('testString').value;
        const globalFlag = document.getElementById('globalFlag').checked;
        const ignoreCaseFlag = document.getElementById('ignoreCaseFlag').checked;
        const multilineFlag = document.getElementById('multilineFlag').checked;

        const matchCount = document.getElementById('matchCount');
        const matchesList = document.getElementById('matchesList');
        const highlightContainer = document.getElementById('regexHighlight');

        if (!pattern) {
            if (matchCount) matchCount.textContent = '0';
            if (matchesList) matchesList.innerHTML = '';
            if (highlightContainer) highlightContainer.innerHTML = '';
            return;
        }

        try {
            let flags = '';
            if (globalFlag) flags += 'g';
            if (ignoreCaseFlag) flags += 'i';
            if (multilineFlag) flags += 'm';

            const regex = new RegExp(pattern, flags);
            const matches = [...testString.matchAll(regex)];

            if (matchCount) matchCount.textContent = matches.length;

            // 高亮
            if (highlightContainer) {
                let highlightedText = '';
                let lastIndex = 0;
                matches.forEach((match, index) => {
                    highlightedText += escapeHtml(testString.slice(lastIndex, match.index));
                    highlightedText += `<span class="highlight-match" data-match="${index + 1}">${escapeHtml(match[0])}</span>`;
                    lastIndex = match.index + match[0].length;
                });
                highlightedText += escapeHtml(testString.slice(lastIndex));
                highlightContainer.innerHTML = highlightedText;
            }

            // 列表
            if (matchesList) {
                matchesList.innerHTML = matches.map((match, index) => `
                    <div class="match-item enhanced">
                        <div class="match-header">
                            <strong>匹配 ${index + 1}:</strong>
                            <span class="match-text">"${escapeHtml(match[0])}"</span>
                        </div>
                        <div class="match-details">
                            <span class="match-position">位置: ${match.index} - ${match.index + match[0].length - 1}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            if (matchCount) matchCount.textContent = '0';
            if (matchesList) matchesList.innerHTML = `<div class="match-item error">正则表达式错误: ${error.message}</div>`;
        }
    };

    // 初始化注册
    if (window.DevToolsHub) {
        window.DevToolsHub.registerTool('regex-tester', {
            init: () => {
                const inputs = ['regexPattern', 'testString', 'globalFlag', 'ignoreCaseFlag', 'multilineFlag'];
                inputs.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', testRegex);
                    }
                });
            },
            clear: () => {
                ['regexPattern', 'testString'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                testRegex();
            }
        });
    }
})();