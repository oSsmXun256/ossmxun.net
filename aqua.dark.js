/*!
 * aqua.dark.js V1.5.1
 *
 * Copyright (c) 2026 oSsmXun Design, All rights reserved.
 * Please read the project page: https://ossmxun.net/aqua-design
 *
 * --- V1.5.1 変更点 ---
 * - ダークモード用CSSを aqua.dark.css に分離（このファイルからは削除）
 * - FOUC（ちらつき）防止のため、インライン先行スクリプトとの併用を推奨
 *   → aqua.dark.inline.js または以下のスニペットを <head> 最上部に配置してください
 *
 * --- インライン先行スクリプト（各HTMLの <head> 先頭にコピーして使用）---
 *
 *   <script>
 *     (function(){
 *       try {
 *         var s = localStorage.getItem('aqua-dark-mode');
 *         var dark = s === '1' || (s === null && matchMedia('(prefers-color-scheme: dark)').matches);
 *         if (dark) document.documentElement.classList.add('aqua-dark');
 *       } catch(e) {}
 *     })();
 *   </script>
 *
 * --- 使い方 ---
 * 1. インライン先行スクリプトを <head> の最上部（CSSより前）に配置
 * 2. aqua.dark.css を他のCSSと一緒に読み込む
 * 3. このファイルを </body> の直前に読み込む
 *
 * 4. トグルボタンを配置する（data-aqua-dark-toggle 属性だけで動作）
 *    <button data-aqua-dark-toggle>
 *      <span class="aqua-dark-icon-sun">☀️ ライト</span>
 *      <span class="aqua-dark-icon-moon">🌙 ダーク</span>
 *    </button>
 *
 * 5. または JavaScript から操作する
 *    AquaDark.toggle();      // トグル
 *    AquaDark.enable();      // ダークモード ON
 *    AquaDark.disable();     // ダークモード OFF
 *    AquaDark.isDark();      // 現在の状態を取得 (boolean)
 *    AquaDark.followSystem(); // システム設定に追従（手動設定をリセット）
 *
 * 6. イベントを監視する
 *    document.addEventListener('aqua-dark-change', (e) => {
 *        console.log('dark:', e.detail.dark);
 *    });
 */

(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  定数                                                                */
    /* ------------------------------------------------------------------ */
    const STORAGE_KEY = 'aqua-dark-mode';
    const CLASS_NAME  = 'aqua-dark';
    const ATTR_TOGGLE = 'data-aqua-dark-toggle';

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
    /*  初期化                                                              */
    /*  ※ クラス付与は インライン先行スクリプト が担当するため             */
    /*    ここでは システム変化の監視 と イベントバインド のみ行う          */
    /* ------------------------------------------------------------------ */
    function init() {
        // インライン先行スクリプトが実行されなかった場合のフォールバック
        // （先行スクリプトがあれば既にクラスが付いているので条件が true にならない）
        if (!getRoot().classList.contains(CLASS_NAME)) {
            let dark = false;
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved !== null) {
                    dark = saved === '1';
                } else {
                    dark = window.matchMedia &&
                           window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
            } catch (_) {
                dark = window.matchMedia &&
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            apply(dark);
        }

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
        enable()  { apply(true);  },
        disable() { apply(false); },
        toggle()  { apply(!this.isDark()); },
        isDark()  { return getRoot().classList.contains(CLASS_NAME); },
        followSystem() {
            try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
            const dark = window.matchMedia &&
                         window.matchMedia('(prefers-color-scheme: dark)').matches;
            apply(dark);
        }
    };

    window.AquaDark = AquaDark;

    /* ------------------------------------------------------------------ */
    /*  初期化とイベントバインド                                            */
    /* ------------------------------------------------------------------ */
    init();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindToggleButtons);
    } else {
        bindToggleButtons();
    }

})();
