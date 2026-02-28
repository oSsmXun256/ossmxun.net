/*!
 * aqua.dark.js V1.5.0
 *
 * Copyright (c) 2026 oSsmXun Design, All rights reserved.
 * Please read the project page: https://ossmxun.net/aqua-design
 *
 * --- 使い方 ---
 * 1. このファイルを HTML に読み込む
 *    <script src="aqua.dark.js"></script>
 *
 * 2. トグルボタンを配置する（data-aqua-dark-toggle 属性だけで動作）
 *    <button data-aqua-dark-toggle>🌙 ダークモード</button>
 *
 * 3. または JavaScript から操作する
 *    AquaDark.toggle();     // トグル
 *    AquaDark.enable();     // ダークモード ON
 *    AquaDark.disable();    // ダークモード OFF
 *    AquaDark.isDark();     // 現在の状態を取得 (boolean)
 *
 * 4. イベントを監視する
 *    document.addEventListener('aqua-dark-change', (e) => {
 *        console.log('dark:', e.detail.dark);
 *    });
 */

(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  CSS変数 - ダークモード上書き値                                      */
    /* ------------------------------------------------------------------ */
    const DARK_CSS = `
:root.aqua-dark {
    /* ベース背景: 深いネイビー〜ブラック系グラデーション */
    --aqua-grad-1: #0d1117;
    --aqua-grad-2: #161b22;
    --aqua-grad-3: #1f2937;

    /* プライマリカラーをやや明るめに（視認性確保） */
    --aqua-primary: #7aa2f7;
    --aqua-primary-light: #a5c1ff;
    --aqua-primary-dark: #4e70df;

    /* テキスト */
    --aqua-text-secondary: #e2e8f0;
    --aqua-text-muted: rgba(226, 232, 240, 0.55);
    --aqua-text-inverse: #e2e8f0;
    --aqua-text-primary: #c9d1d9;

    /* Glass エフェクト — 暗め・低透明度 */
    --aqua-glass-bg: rgba(22, 27, 34, 0.65);
    --aqua-glass-bg-light: rgba(31, 41, 55, 0.70);
    --aqua-glass-bg-dark: rgba(10, 14, 20, 0.75);
    --aqua-glass-border: rgba(255, 255, 255, 0.12);
    --aqua-glass-border-light: rgba(255, 255, 255, 0.18);
    --aqua-glass-border-dark: rgba(255, 255, 255, 0.08);
    --aqua-glass-shadow-primary: rgba(0, 0, 0, 0.55);
    --aqua-glass-shadow-secondary: rgba(255, 255, 255, 0.06);
    --aqua-glass-after-bg: rgba(255, 255, 255, 0.04);

    /* 影 — 全体的に強め */
    --aqua-shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
    --aqua-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.5);
    --aqua-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.5);
    --aqua-shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.5);
    --aqua-shadow-glass: 0 8px 32px rgba(0,0,0,0.5);
    --aqua-shadow-glass-hover: 0 12px 40px rgba(0,0,0,0.6);
}

/* ダークモード: body 背景 */
.aqua-dark.aqua-reset,
.aqua-dark .aqua-reset {
    background: linear-gradient(135deg, #0d1117, #161b22, #1f2937);
}

/* ダークモード: glass テキスト影を強く */
.aqua-dark .aqua-glass,
.aqua-dark .aqua-glass * {
    text-shadow:
        0 1px 4px rgba(0,0,0,0.8),
        0 1px 8px rgba(0,0,0,0.5);
}

/* ダークモード: input / textarea */
.aqua-dark .aqua-input,
.aqua-dark .aqua-textarea,
.aqua-dark .aqua-select {
    color: var(--aqua-text-secondary);
}

.aqua-dark .aqua-input::placeholder,
.aqua-dark .aqua-textarea::placeholder {
    color: var(--aqua-text-muted);
}

/* ダークモード: ナビゲーション */
.aqua-dark .aqua-nav {
    border-bottom-color: rgba(255,255,255,0.08);
}

/* ダークモード: スライドボタン off 状態トラック */
.aqua-dark .aqua-slide-track {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.12);
}

/* ダークモード: トグルアイコン（data-aqua-dark-toggle のアイコン切り替え用） */
[data-aqua-dark-toggle] .aqua-dark-icon-moon { display: inline; }
[data-aqua-dark-toggle] .aqua-dark-icon-sun  { display: none;   }
.aqua-dark [data-aqua-dark-toggle] .aqua-dark-icon-moon { display: none;   }
.aqua-dark [data-aqua-dark-toggle] .aqua-dark-icon-sun  { display: inline; }
`;

    /* ------------------------------------------------------------------ */
    /*  定数                                                                */
    /* ------------------------------------------------------------------ */
    const STORAGE_KEY = 'aqua-dark-mode';
    const CLASS_NAME  = 'aqua-dark';
    const STYLE_ID    = 'aqua-dark-styles';
    const ATTR_TOGGLE = 'data-aqua-dark-toggle';

    /* ------------------------------------------------------------------ */
    /*  スタイル注入                                                        */
    /* ------------------------------------------------------------------ */
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = DARK_CSS;
        document.head.appendChild(style);
    }

    /* ------------------------------------------------------------------ */
    /*  コアロジック                                                        */
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
    /*  初期化: 保存済み設定 or システム設定を反映                          */
    /* ------------------------------------------------------------------ */
    function init() {
        injectStyles();

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
    /*  イベント委任: data-aqua-dark-toggle をクリックでトグル             */
    /* ------------------------------------------------------------------ */
    function bindToggleButtons() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('[' + ATTR_TOGGLE + ']');
            if (btn) AquaDark.toggle();
        });
    }

    /* ------------------------------------------------------------------ */
    /*  公開 API                                                            */
    /* ------------------------------------------------------------------ */
    const AquaDark = {
        /**
         * ダークモードを有効化する
         */
        enable() {
            apply(true);
        },

        /**
         * ダークモードを無効化する
         */
        disable() {
            apply(false);
        },

        /**
         * ダークモードをトグルする
         */
        toggle() {
            apply(!this.isDark());
        },

        /**
         * 現在ダークモードか返す
         * @returns {boolean}
         */
        isDark() {
            return getRoot().classList.contains(CLASS_NAME);
        },

        /**
         * システムのカラースキームに追従させ、localStorage をクリアする
         */
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
    /*  DOMContentLoaded 後に初期化                                         */
    /* ------------------------------------------------------------------ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init();
            bindToggleButtons();
        });
    } else {
        init();
        bindToggleButtons();
    }

})();
