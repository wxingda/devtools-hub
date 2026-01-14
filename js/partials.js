// 简单的 HTML 片段加载器：将 [data-include] 的元素替换为远程片段内容
(function () {
    const placeholders = [];
    let resolveReady;
    const ready = new Promise(r => (resolveReady = r));
    window.partialsReady = ready;

    async function loadOne(el) {
        const src = el.getAttribute('data-include');
        if (!src) return;
        try {
            const resp = await fetch(src, { cache: 'no-cache' });
            if (!resp.ok) throw new Error('Failed to fetch ' + src + ' ' + resp.status);
            const html = await resp.text();
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            // 用片段的根节点替换 placeholder（若多个根，则逐个插入）
            const parent = el.parentNode;
            const frag = document.createDocumentFragment();
            while (wrapper.firstChild) {
                frag.appendChild(wrapper.firstChild);
            }
            parent.replaceChild(frag, el);
        } catch (err) {
            console.error('[partials] load error:', err);
        }
    }

    async function boot() {
        const els = Array.from(document.querySelectorAll('[data-include]'));
        placeholders.push(...els);
        // 并行加载所有片段，提升首屏渲染速度
        await Promise.all(els.map(el => loadOne(el)));
        resolveReady();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
