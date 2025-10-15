// Star CTA 交互与页面就绪标记
(function () {
    // 页面就绪，移除首屏占位样式
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('ready');
    });

    async function initStarCTA() {
        // 等待 partials 注入完成
        try {
            if (window.partialsReady && typeof window.partialsReady.then === 'function') {
                await window.partialsReady;
            }
        } catch (_) { }

        const cta = document.getElementById('star-cta');
        if (!cta) return;

        let expanded = false;
        function setExpanded(v) {
            expanded = v;
            cta.classList.toggle('expanded', v);
        }
        cta.addEventListener('click', (e) => {
            const btn = e.target.closest('.cta-btn');
            if (!btn) {
                setExpanded(!expanded);
                return;
            }
            const act = btn.getAttribute('data-action');
            switch (act) {
                case 'open-github':
                    window.open('https://github.com/wxingda/devtools-hub', '_blank');
                    break;
                case 'copy-link':
                    navigator.clipboard
                        .writeText('https://github.com/wxingda/devtools-hub')
                        .then(() => {
                            if (window.showNotification)
                                showNotification('仓库地址已复制，欢迎 Star ⭐', 'success');
                        });
                    break;
                case 'close':
                    cta.classList.add('hide');
                    break;
            }
        });
        // 键盘支持
        cta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExpanded(!expanded);
            }
            if (e.key === 'Escape') {
                cta.classList.add('hide');
            }
        });
        // 延迟显示
        setTimeout(() => cta.classList.add('show'), 1200);

        // 温和提示策略：首次访问 30s 后或点击使用 10 次后自动展开一次，之后 7 天内不再打扰
        const HINT_KEY = 'dth_star_hint_ts';
        const CLICK_KEY = 'dth_usage_clicks';
        const COOLDOWN = 1000 * 60 * 60 * 24 * 7; // 7 天
        function shouldHint() {
            try {
                const last = parseInt(localStorage.getItem(HINT_KEY) || '0', 10);
                if (Date.now() - last < COOLDOWN) return false;
            } catch (_) { }
            try {
                const times = parseInt(localStorage.getItem(CLICK_KEY) || '0', 10);
                if (times >= 10) return true;
            } catch (_) { }
            return false;
        }
        function markHinted() {
            try { localStorage.setItem(HINT_KEY, String(Date.now())); } catch (_) { }
        }
        // 统计页面内的一些关键交互（按钮点击）
        document.addEventListener('click', (e) => {
            const t = e.target.closest('button, a, .nav-btn');
            if (!t) return;
            try {
                const times = parseInt(localStorage.getItem(CLICK_KEY) || '0', 10) + 1;
                localStorage.setItem(CLICK_KEY, String(Math.min(times, 99)));
            } catch (_) { }
            if (shouldHint()) {
                setExpanded(true);
                markHinted();
            }
        }, { passive: true });

        // 首次访问计时提示
        setTimeout(() => {
            if (shouldHint()) {
                setExpanded(true);
                markHinted();
            }
        }, 30000);
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStarCTA);
    } else {
        initStarCTA();
    }
})();
