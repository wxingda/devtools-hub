// PWA 安装提示与 Service Worker 注册
(function () {
    // 处理 URL 参数（深链接支持）
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tool = urlParams.get('tool');
        if (tool && typeof window.switchTool === 'function') {
            window.switchTool(tool);
        }
    });

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker 注册成功:', registration.scope);

                    // 检查更新
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (
                                newWorker.state === 'installed' &&
                                navigator.serviceWorker.controller
                            ) {
                                showUpdateAvailable();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.log('Service Worker 注册失败:', error);
                });
        });
    }

    // PWA 安装提示
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA 安装提示被触发');
        e.preventDefault();
        deferredPrompt = e;
        // 展示头部的“安装到桌面”按钮
        const headerBtn = document.getElementById('installPwaHeaderBtn');
        if (headerBtn) headerBtn.style.display = 'inline-flex';
        // 也可直接展示横幅提醒
        showInstallPrompt();
    });

    // 显示安装提示
    function showInstallPrompt() {
        const existing = document.getElementById('install-banner');
        if (existing) return;
        const installBanner = document.createElement('div');
        installBanner.id = 'install-banner';
        installBanner.innerHTML = `
      <div class="install-content">
        <div class="install-text">
          <i class="fas fa-download"></i>
          <span>安装 DevTools Hub 到桌面，获得更好的体验！</span>
        </div>
        <div class="install-actions">
          <button id="install-btn" class="btn primary">立即安装</button>
          <button id="dismiss-btn" class="btn secondary">稍后</button>
        </div>
      </div>`;
        document.body.appendChild(installBanner);

        document.getElementById('install-btn').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    console.log('PWA 安装结果:', choiceResult.outcome);
                    deferredPrompt = null;
                    hideInstallPrompt();
                });
            }
        });
        document
            .getElementById('dismiss-btn')
            .addEventListener('click', hideInstallPrompt);

        setTimeout(() => installBanner.classList.add('show'), 100);
    }

    function hideInstallPrompt() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    // 对外暴露安装方法，供头部按钮调用
    window.installPWA = function installPWA() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.finally(() => {
                deferredPrompt = null;
                hideInstallPrompt();
                const headerBtn = document.getElementById('installPwaHeaderBtn');
                if (headerBtn) headerBtn.style.display = 'none';
            });
        } else {
            // 若无法触发浏览器原生提示，回退为展示横幅
            showInstallPrompt();
        }
    };

    // 安装完成事件：隐藏横幅与头部按钮，做一次轻提示
    window.addEventListener('appinstalled', () => {
        console.log('PWA 已安装');
        hideInstallPrompt();
        const headerBtn = document.getElementById('installPwaHeaderBtn');
        if (headerBtn) headerBtn.style.display = 'none';
    });

    // 显示更新可用提示
    function showUpdateAvailable() {
        const existing = document.getElementById('update-banner');
        if (existing) return;
        const updateBanner = document.createElement('div');
        updateBanner.id = 'update-banner';
        updateBanner.innerHTML = `
      <div class="update-content">
        <div class="update-text">
          <i class="fas fa-sync-alt"></i>
          <span>DevTools Hub 有新版本可用！</span>
        </div>
        <div class="update-actions">
          <button id="update-btn" class="btn primary">立即更新</button>
          <button id="update-dismiss-btn" class="btn secondary">稍后</button>
        </div>
      </div>`;
        document.body.appendChild(updateBanner);

        document.getElementById('update-btn').addEventListener('click', () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        });
        document
            .getElementById('update-dismiss-btn')
            .addEventListener('click', () => updateBanner.remove());

        setTimeout(() => updateBanner.classList.add('show'), 100);
    }
})();
