/* =========================================
   PROJECT C.K.B. MASTER SCRIPT V5.2
   LAG REDUCTION & GPU OPTIMIZATION
   ========================================= */

(function() {
    'use strict';

    const unifiedStyles = `
        /* 1. GPU OPTIMIZED BACKGROUND */
        body, #mainpage {
            background-image: url('https://files.catbox.moe/n2f1f3.png') !important;
            background-color: #050505 !important;
            background-attachment: fixed !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            /* Removed ckb-bg-shift from body to prevent full-page repaints */
            animation: none !important; 
            will-change: transform;
        }

        /* 2. REMOVING EXPENSIVE BLURS */
        #main-container, .container-fluid, #wrap, .well {
            background: transparent !important;
            background-image: none !important;
            border: none !important;
        }

        .ckb-motd-wrapper {
            background-color: rgba(10, 10, 10, 0.85) !important; /* Solid Alpha instead of Blur */
            border: 2px solid #FF6AD5 !important;
            box-shadow: 0 0 10px rgba(255, 106, 213, 0.2) !important;
            border-radius: 4px;
            padding: 25px;
            z-index: 10;
        }

        /* 3. HARDWARE-ACCELERATED VHS OVERLAY */
        body::before {
            content: "" !important;
            position: fixed !important;
            top: 0; left: 0; width: 100%; height: 100%;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.05) 0px,
                rgba(0, 0, 0, 0.05) 1px,
                transparent 1px,
                transparent 2px
            );
            pointer-events: none !important;
            z-index: 0 !important;
            /* Reduced flicker frequency to save CPU */
            animation: ckb-vhs-flicker 0.3s infinite !important;
            opacity: 0.2 !important;
            will-change: opacity;
        }

        /* 4. OPTIMIZED LOADER */
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
            transition: opacity 0.5s ease;
        }

        .glitch-text {
            color: #00ffcc;
            font-size: 2em;
            font-weight: bold;
            text-shadow: 0 0 5px rgba(0, 255, 204, 0.5);
        }

        .loading-bar-container { width: 250px; height: 2px; background: rgba(255, 255, 255, 0.1); margin-top: 20px; overflow: hidden; }
        .loading-bar { width: 100%; height: 100%; background: #ff003c; animation: loading-progress 2s linear infinite; }

        /* 5. MINIMALIST KEYFRAMES (GPU ONLY) */
        @keyframes ckb-vhs-flicker { 0% { opacity: 0.15; } 50% { opacity: 0.25; } 100% { opacity: 0.15; } }
        @keyframes loading-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = unifiedStyles;
    document.head.appendChild(styleSheet);

    // --- UTILITIES ---
    function processMessage(node) {
        if (!(node instanceof HTMLElement)) return;
        node.querySelectorAll('a:not(.ckb-processed)').forEach(link => {
            if (link.href.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
                const img = document.createElement('img');
                img.src = link.href;
                img.style.cssText = "max-width:180px; border-radius:4px; margin:5px 0; display:block;";
                link.after(img);
                link.style.display = 'none';
            }
            link.classList.add('ckb-processed');
        });
    }

    function init() {
        // Timed removal of Loader
        const removeLoader = () => {
            const loader = document.getElementById('ckb-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => { loader.remove(); }, 600); // .remove() is cleaner than .display='none'
            }
        };

        if (document.readyState === 'complete') { setTimeout(removeLoader, 1500); }
        else { window.addEventListener('load', () => setTimeout(removeLoader, 1500)); }

        const chatBuffer = document.getElementById('messagebuffer');
        if (chatBuffer) {
            new MutationObserver(m => m.forEach(res => res.addedNodes.forEach(node => processMessage(node)))).observe(chatBuffer, { childList: true });
        }

        console.log("%c[CKB] V5.2: Optimization Patch Applied.", "color: #00ffcc; font-weight: bold;");
    }

    init();
})();
