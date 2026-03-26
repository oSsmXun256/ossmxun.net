/*!
 * aqua.dark.js V1.5.0 (ちらつき防止・外部CSS化対応版)
 *
 * Copyright (c) 2026 oSsmXun Design, All rights reserved.
 * Please read the project page: https://ossmxun.net/aqua-design
 */

(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /* 定数                                                                */
    /* ------------------------------------------------------------------ */
    const STORAGE_KEY = 'aqua-dark-mode';
    const CLASS_NAME  = 'aqua-dark';
    const ATTR_TOGGLE = 'data-aqua-dark-toggle';

    /* ------------------------------------------------------------------ */
    /* コアロジック                                                        */
    /* ------------------------------------------------------------------ */
    function getRoot() {
        return document.documentElement;
    }

    function apply(dark) {
        const root = getRoot();
        if (dark) {
            root.classList.add(CLASS_NAME);
        } else {
            root.classList.remove(CLASS_NAME);
        }

        // localStorage に保存
        try {
            localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
        } catch (_) { /* プライベートブラウズ等 */ }

        // カスタムイベント発火
        document.dispatchEvent(new CustomEvent('aqua-dark-change', {
            detail: { dark },
            bubbles: true
        }));

        // トグルボタンの aria-label / aria-pressed を更新
        document.querySelectorAll('[' + ATTR_TOGGLE + ']').forEach(el => {
            el.setAttribute('aria-pressed', dark ? 'true' : 'false');
            el.setAttribute('aria-label', dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
        });
    }

    /* ------------------------------------------------------------------ */
    /* 初期化: 保存済み設定 or システム設定を反映                          */
    /* ------------------------------------------------------------------ */
    function init() {
        let dark = false;

        // 1. localStorage の値を優先
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                dark = saved === '1';
            } else {
                // 2. システムのダークモード設定を参照
                dark = window.matchMedia &&
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        } catch (_) {
            dark = window.matchMedia &&
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // DOMのクラス状態とボタン等の属性を同期
        apply(dark);

        // システムのカラースキーム変化を監視（localStorage が未設定の場合のみ追従）
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', e => {
                    try {
                        if (localStorage.getItem(STORAGE_KEY) === null) {
                            apply(e.matches);
                        }
                    } catch (_) {
                        apply(e.matches);
                    }
                });
        }
    }

    /* ------------------------------------------------------------------ */
    /* イベント委任: data-aqua-dark-toggle をクリックでトグル             */
    /* ------------------------------------------------------------------ */
    function bindToggleButtons() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('[' + ATTR_TOGGLE + ']');
            if (btn) AquaDark.toggle();
        });
    }

    /* ------------------------------------------------------------------ */
    /* 公開 API                                                            */
    /* ------------------------------------------------------------------ */
    const AquaDark = {
        enable() {
            apply(true);
        },
        disable() {
            apply(false);
        },
        toggle() {
            apply(!this.isDark());
        },
        isDark() {
            return getRoot().classList.contains(CLASS_NAME);
        },
        followSystem() {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (_) { /* ignore */ }
            const dark = window.matchMedia &&
                         window.matchMedia('(prefers-color-scheme: dark)').matches;
            apply(dark);
        }
    };

    // グローバルに公開
    window.AquaDark = AquaDark;

    /* ------------------------------------------------------------------ */
    /* 初期化とイベントバインド                                            */
    /* ------------------------------------------------------------------ */
    init();

    // クリックイベントの監視はDOM構築を待ってから行う
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            bindToggleButtons();
        });
    } else {
        bindToggleButtons();
    }

})();