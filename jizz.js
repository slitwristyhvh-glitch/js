/* =========================================
   PROJECT C.K.B. MASTER SCRIPT V5.3
   REVERT: HOLY LIGHT + WIRED LOADER
   ========================================= */

(function() {
    'use strict';

    // --- 1. THE HOLY LIGHT RECOVERY (CSS INJECTOR) ---
    const unifiedStyles = `
        /* REVERTING TO HEART BACKGROUND */
        body, #mainpage {
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #ffcc33, #ff6699) !important;
            background-size: 400% 400% !important;
            animation: global-rainbow 20s ease infinite !important;
            background-attachment: fixed !important;
        }

        /* REINSTATING HEART PATTERNS */
        #chatwrap, #videowrap, .well, #userlistswrap, #messagebuffer {
            background-color: #121212 !important; 
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff1493' fill-opacity='0.07' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E") !important;
            background-repeat: repeat !important;
            border: 1px solid #333 !important;
        }

        /* LOADING PAGE (THE WIRED) */
        #ckb-loader {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: #050505;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Consolas', 'Courier New', monospace;
            transition: opacity 0.8s ease;
        }

        .glitch-text {
            color: #00ffcc;
            font-size: 2em;
            font-weight: bold;
            letter-spacing: 5px;
            position: relative;
            text-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
        }

        .glitch-text::before, .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: #050505;
        }

        .glitch-text::before { left: 2px; text-shadow: -2px 0 #ff003c; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 5s infinite linear alternate-reverse; }
        .glitch-text::after { left: -2px; text-shadow: -2px 0 #00ffcc; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 5s infinite linear alternate-reverse; }

        .loading-bar-container { width: 300px; height: 2px; background: rgba(255, 255, 255, 0.1); margin-top: 20px; position: relative; overflow: hidden; }
        .loading-bar { width: 100%; height: 100%; background: #ff003c; animation: loading-progress 2s ease-in-out infinite; }

        /* KEYFRAMES */
        @keyframes global-rainbow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes loading-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes glitch-anim { 0% { clip: rect(10px, 9999px, 20px, 0); } 100% { clip: rect(80px, 9999px, 90px, 0); } }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = unifiedStyles;
    document.head.appendChild(styleSheet);

    // --- 2. MEDIA ENGINE & UTILITIES ---
    function processMessage(node) {
        if (!(node instanceof HTMLElement)) return;
        node.querySelectorAll('a:not(.ckb-processed)').forEach(link => {
            const url = link.href;
            if (url.match(/\.(jpeg|jpg|gif|png|webp|gifv)(\?.*)?$/i)) {
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = "max-width:200px; border-radius:5px; margin:5px 0; cursor:zoom-in; display:block;";
                img.onclick = () => img.style.maxWidth = img.style.maxWidth === '200px' ? '450px' : '200px';
                link.after(img);
                link.style.display = 'none';
            }
            link.classList.add('ckb-processed');
        });
    }

    // --- 3. INITIALIZATION ---
    function init() {
        const removeLoader = () => {
            const loader = document.getElementById('ckb-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => { loader.remove(); }, 800);
            }
        };

        if (document.readyState === 'complete') { setTimeout(removeLoader, 2000); }
        else { window.addEventListener('load', () => setTimeout(removeLoader, 2000)); }

        const chatBuffer = document.getElementById('messagebuffer');
        if (chatBuffer) {
            new MutationObserver(m => m.forEach(res => res.addedNodes.forEach(node => processMessage(node)))).observe(chatBuffer, { childList: true });
        }

        console.log("%c[CKB] V5.3: Reverted to Holy Light. Lag cleared.", "color: #ff1493; font-weight: bold;");
    }

    init();
})();
