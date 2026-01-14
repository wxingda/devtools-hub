// 哈希计算工具模块
(function () {
    'use strict';

    window.calculateHashes = async function () {
        const input = document.getElementById('hashInput').value;
        const outputs = {
            'md5': document.getElementById('md5Output'),
            'sha1': document.getElementById('sha1Output'),
            'sha256': document.getElementById('sha256Output'),
            'sha512': document.getElementById('sha512Output')
        };

        if (!input) {
            Object.values(outputs).forEach(el => { if (el) el.value = ''; });
            return;
        }

        // 使用 Web Crypto API 进行计算 (MD5 需要外部库，这里假设只有 SHA 系列)
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        async function hash(algo) {
            try {
                const hashBuffer = await crypto.subtle.digest(algo, data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                return '不支持该算法';
            }
        }

        if (outputs['sha1']) outputs['sha1'].value = await hash('SHA-1');
        if (outputs['sha256']) outputs['sha256'].value = await hash('SHA-256');
        if (outputs['sha512']) outputs['sha512'].value = await hash('SHA-512');

        // MD5 逻辑（如果需要可以引入 md5.js，这里暂时占位）
        if (outputs['md5'] && !outputs['md5'].value) {
            outputs['md5'].value = '需引入 MD5 库';
        }
    };

    // 初始化注册
    if (window.DevToolsHub) {
        window.DevToolsHub.registerTool('hash-calculator', {
            init: () => {
                const hashInput = document.getElementById('hashInput');
                if (hashInput) {
                    hashInput.addEventListener('input', calculateHashes);
                }
            },
            clear: () => {
                const hashInput = document.getElementById('hashInput');
                if (hashInput) hashInput.value = '';
                calculateHashes();
            }
        });
    }
})();