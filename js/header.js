// Star CTA 交互与页面就绪标记
(function () {
    // 页面就绪，移除首屏占位样式
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('ready');
    });

    // 浮动 Star CTA 交互
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
    setTimeout(() => cta.classList.add('show'), 1500);
})();
