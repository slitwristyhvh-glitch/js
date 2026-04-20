/* =========================================
   PROJECT C.K.B. MASTER SCRIPT V5.1
   REFRAMED: HOLY LIGHT + DIGITAL SOLITUDE
   ========================================= */

(function() {
    'use strict';

    // --- 1. THE SOLITUDE CORE (CSS INJECTOR) ---
    // This block integrates your Master CSS and overrides the background
    const unifiedStyles = `
        /* [SOLITUDE OVERRIDE] - Kills the V4.7 Rainbow to show the Catbox Image */
        body, #mainpage {
            background-image: url('https://files.catbox.moe/n2f1f3.png') !important;
            background-color: #050505 !important;
            background-attachment: fixed !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            animation: ckb-bg-shift 5s infinite !important; /* Replaces global-rainbow */
        }

        /* [PATTERN OVERRIDE] - Removes heart patterns for Solitude clarity */
        #chatwrap, #videowrap, .well, #userlistswrap, #messagebuffer {
            background-image: none !important;
            background-color: rgba(18, 18, 18, 0.8) !important;
        }

        /* [VHS GLITCH LAYER] */
        body::before {
            content: "" !important;
            position: fixed !important;
            top: 0; left: 0; width: 100%; height: 100%;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.1) 0px,
                rgba(0, 0, 0, 0.1) 1px,
                transparent 1px,
                transparent 2px
            );
            pointer-events: none !important;
            z-index: 0 !important;
            animation: ckb-vhs-flicker 0.15s infinite !important;
            opacity: 0.3 !important;
        }

        /* [LOADING PAGE - THE WIRED] */
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
        .loading-bar { width: 100%; height: 100%; background: #ff003c; box-shadow: 0 0 15px #ff003c; animation: loading-progress 2s ease-in-out infinite; }

        /* [KEYFRAMES] */
        @keyframes ckb-vhs-flicker { 0% { opacity: 0.25; } 50% { opacity: 0.35; } 100% { opacity: 0.25; } }
        @keyframes ckb-bg-shift { 
            0% { filter: hue-rotate(0deg) contrast(1); } 
            99% { filter: hue-rotate(10deg) contrast(1.05); transform: scale(1); } 
            100% { filter: hue-rotate(0deg) contrast(1); transform: scale(1.005); } 
        }
        @keyframes loading-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes glitch-anim { 0% { clip: rect(10px, 9999px, 20px, 0); } 100% { clip: rect(80px, 9999px, 90px, 0); } }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = unifiedStyles;
    document.head.appendChild(styleSheet);

    // --- 2. MEDIA ENGINE & PLAYER HIJACKER ---
    function srtToVtt(srtText) { return "WEBVTT\n\n" + srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2'); }

    async function syncAndConvertSubs() {
        const video = document.querySelector('#videowrap video');
        if (!video || !video.src.includes("archive.org") || video.querySelector('.ckb-sub-track')) return;
        const srtUrl = video.src.replace(/\.mp4($|\?)/, ".srt$1");
        try {
            const response = await fetch(srtUrl);
            if (!response.ok) return;
            const vttText = srtToVtt(await response.text());
            const track = document.createElement('track');
            track.className = 'ckb-sub-track';
            track.src = URL.createObjectURL(new Blob([vttText], { type: 'text/vtt' }));
            track.kind = 'subtitles'; track.label = 'English (Auto)'; track.default = true;
            video.appendChild(track);
        } catch (e) { console.error("Sub Error:", e); }
    }

    function processMessage(node) {
        if (!(node instanceof HTMLElement)) return;
        const chatLinks = node.querySelectorAll('a:not(.ckb-processed)');
        chatLinks.forEach(link => {
            const url = link.href;
            if (url.match(/\.(jpeg|jpg|gif|png|webp|gifv)(\?.*)?$/i)) {
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = "max-width:200px; border-radius:5px; margin:5px 0; cursor:zoom-in; display:block;";
                img.onclick = () => img.style.maxWidth = img.style.maxWidth === '200px' ? '450px' : '200px';
                link.after(img);
                link.style.display = 'none';
            }
            link.classList.add('ckb processed');
        });
    }

    // --- 3. CUSTOM THEME TOGGLES ---
    function initThemes() {
        const applyLatrell = () => {
            $('.chat-msg-latrellsprewell .username:not(.latrell-slime, .latrell-pride)').addClass('latrell-slime');
            $('.userlist_item[data-nick="latrellsprewell"] span:not(.latrell-slime, .latrell-pride)').addClass('latrell-slime');
        };

        $('#messagebuffer, #userlist').on('click', '[data-nick="latrellsprewell"], .chat-msg-latrellsprewell .username', function() {
            $('.chat-msg-latrellsprewell .username, .userlist_item[data-nick="latrellsprewell"] span').toggleClass('latrell-slime latrell-pride');
        });

        $('#messagebuffer, #userlist').on('click', '[data-nick="GoblinVapist"], .chat-msg-GoblinVapist .username', function() {
            $('.chat-msg-GoblinVapist .username, .userlist_item[data-nick="GoblinVapist"] span').toggleClass('strobe-active');
        });

        new MutationObserver(applyLatrell).observe(document.getElementById('messagebuffer'), { childList: true });
        applyLatrell();
    }

    // --- 4. INITIALIZATION ---
    function init() {
        // Timed removal of "The Wired" Loader
        const removeLoader = () => {
            const loader = document.getElementById('ckb-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => { loader.style.display = 'none'; }, 800);
            }
        };

        if (document.readyState === 'complete') { setTimeout(removeLoader, 2000); }
        else { window.addEventListener('load', () => setTimeout(removeLoader, 2000)); }

        // Chat & Subtitle Observers
        const chatBuffer = document.getElementById('messagebuffer');
        if (chatBuffer) {
            new MutationObserver(m => m.forEach(res => res.addedNodes.forEach(node => processMessage(node)))).observe(chatBuffer, { childList: true });
        }

        const playerDiv = document.getElementById('videowrap');
        if (playerDiv) {
            new MutationObserver(() => setTimeout(syncAndConvertSubs, 1000)).observe(playerDiv, { childList: true, subtree: true });
        }

        // Fancy Discord Explode Button
        const btnRow = document.getElementById('emotelistbtn')?.parentNode;
        if (btnRow && !document.getElementById('fancy-discord-btn')) {
            const dBtn = document.createElement('a');
            dBtn.id = 'fancy-discord-btn';
            dBtn.href = 'https://discord.gg/SMa9YJVBgj';
            dBtn.target = '_blank';
            dBtn.className = 'btn btn-sm';
            dBtn.innerHTML = 'Join Discord ✨';
            dBtn.onclick = (e) => {
                e.preventDefault();
                dBtn.classList.add('exploding');
                setTimeout(() => { window.open(dBtn.href, '_blank'); dBtn.classList.remove('exploding'); }, 600);
            };
            btnRow.appendChild(dBtn);
        }

        initThemes();
        console.log("%c[CKB] V5.1 Reframed: Solitude Wired Connection Active.", "color: #00ffcc; font-weight: bold; background: #000; padding: 5px;");
    }

    init();
})();