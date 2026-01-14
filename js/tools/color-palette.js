// 颜色调色板工具模块
(function () {
    'use strict';

    // 颜色转换辅助函数
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    function hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    // 颜色历史管理
    let colorHistory = JSON.parse(localStorage.getItem('colorHistory') || '[]');
    let colorFavorites = JSON.parse(localStorage.getItem('colorFavorites') || '[]');

    window.updateColorInputs = function(color) {
        const colorPicker = document.getElementById('colorPicker');
        const hexInput = document.getElementById('hexInput');
        const rgbInput = document.getElementById('rgbInput');
        const hslInput = document.getElementById('hslInput');

        if (!colorPicker || !hexInput || !rgbInput || !hslInput) return;

        colorPicker.value = color;
        hexInput.value = color.toUpperCase();

        const rgb = hexToRgb(color);
        if (rgb) {
            rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            hslInput.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        }

        addToColorHistory(color);
        analyzeColorProperties(color);
    };

    function addToColorHistory(color) {
        const index = colorHistory.indexOf(color);
        if (index > -1) colorHistory.splice(index, 1);
        colorHistory.unshift(color);
        if (colorHistory.length > 20) colorHistory = colorHistory.slice(0, 20);
        localStorage.setItem('colorHistory', JSON.stringify(colorHistory));
        updateColorHistoryUI();
    }

    function updateColorHistoryUI() {
        const historyContainer = document.getElementById('colorHistory');
        if (!historyContainer) return;
        historyContainer.innerHTML = '';
        colorHistory.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'history-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.title = color;
            colorDiv.addEventListener('click', () => updateColorInputs(color));
            historyContainer.appendChild(colorDiv);
        });
    }

    window.generatePalette = function() {
        const baseColor = document.getElementById('colorPicker').value;
        const paletteType = document.getElementById('paletteType')?.value || 'monochromatic';
        const paletteColors = document.getElementById('paletteColors');
        if (!paletteColors) return;

        let colors = [];
        const rgb = hexToRgb(baseColor);
        if (!rgb) return;
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        switch (paletteType) {
            case 'monochromatic':
                for (let i = 0.3; i <= 1.7; i += 0.2) {
                    colors.push(rgbToHex(
                        Math.min(255, Math.max(0, Math.round(rgb.r * i))),
                        Math.min(255, Math.max(0, Math.round(rgb.g * i))),
                        Math.min(255, Math.max(0, Math.round(rgb.b * i)))
                    ));
                }
                break;
            case 'analogous':
                for (let i = -60; i <= 60; i += 30) {
                    const newRgb = hslToRgb((hsl.h + i + 360) % 360, hsl.s, hsl.l);
                    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                }
                break;
            case 'complementary':
                const compRgb = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
                colors = [baseColor, rgbToHex(compRgb.r, compRgb.g, compRgb.b)];
                break;
        }

        paletteColors.innerHTML = '';
        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.innerHTML = `<span class="color-label">${color}</span>`;
            colorDiv.addEventListener('click', () => updateColorInputs(color));
            paletteColors.appendChild(colorDiv);
        });
    };

    function analyzeColorProperties(color) {
        const analysis = document.getElementById('colorAnalysis');
        if (!analysis) return;
        const rgb = hexToRgb(color);
        if (!rgb) return;

        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        const isLight = brightness > 128;
        const contrast = isLight ? '#000000' : '#ffffff';

        analysis.innerHTML = `
            <div class="color-property">
                <span class="property-label">亮度:</span>
                <span class="property-value">${Math.round(brightness)}/255 (${isLight ? '明亮' : '较暗'})</span>
            </div>
            <div class="color-property">
                <span class="property-label">建议文字色:</span>
                <span class="property-value" style="color: ${contrast}; background: ${color}; padding: 2px 8px; border-radius: 4px;">${contrast}</span>
            </div>
        `;
    }

    // 初始化注册
    if (window.DevToolsHub) {
        window.DevToolsHub.registerTool('color-palette', {
            init: () => {
                updateColorHistoryUI();
                const colorPicker = document.getElementById('colorPicker');
                if (colorPicker) {
                    colorPicker.addEventListener('input', (e) => updateColorInputs(e.target.value));
                }
                const paletteType = document.getElementById('paletteType');
                if (paletteType) {
                    paletteType.addEventListener('change', generatePalette);
                }
            }
        });
    }
})();