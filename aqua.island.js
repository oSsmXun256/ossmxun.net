/*!
 * aqua.island.js V1.5.1
 * Dynamic Island 制御用スクリプト
 */

(function () {
    'use strict';

    const AquaIsland = {
        element: null,
        timeoutId: null,

        init() {
            this.element = document.getElementById('aqua-island');
            if (!this.element) return;
        },

        showActive(leftHTML, rightHTML, autoCloseMs = 0) {
            if (!this.element) return;
            clearTimeout(this.timeoutId);
            
            // 拡張クラスを一旦外して中身を入れる
            this.element.className = 'aqua-island';
            this.element.innerHTML = `
                <div class="aqua-island-content">
                    <div>${leftHTML}</div>
                    <div>${rightHTML}</div>
                </div>
            `;

            // レンダリングを待ってからクラスを付与し、アニメーションを発火
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (this.element) this.element.className = 'aqua-island island-active';
                });
            });

            if (autoCloseMs > 0) {
                this.timeoutId = setTimeout(() => this.collapse(), autoCloseMs);
            }
        },

        expand(html, autoCloseMs = 0) {
            if (!this.element) return;
            clearTimeout(this.timeoutId);

            // 拡張クラスを一旦外して中身を入れる
            this.element.className = 'aqua-island';
            this.element.innerHTML = `<div class="aqua-island-content" style="flex-direction: column; align-items: stretch; height: 100%; justify-content: space-around;">${html}</div>`;

            // レンダリングを待ってからクラスを付与し、アニメーションを発火
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (this.element) this.element.className = 'aqua-island island-expanded';
                });
            });

            if (autoCloseMs > 0) {
                this.timeoutId = setTimeout(() => this.collapse(), autoCloseMs);
            }
        },

        collapse() {
            if (!this.element) return;
            clearTimeout(this.timeoutId);
            
            this.element.className = 'aqua-island';
            this.element.innerHTML = '';
        }
    };

    window.AquaIsland = AquaIsland;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AquaIsland.init());
    } else {
        AquaIsland.init();
    }
})();