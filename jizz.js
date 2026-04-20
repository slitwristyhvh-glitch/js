Here is my master Javascript "/* =========================================
   PROJECT C.K.B. MASTER SCRIPT V4.7
   Includes Media Embedding, Fancy Discord Explode Button,
   Archive.org MKV Hijacker, & !autoqueue Bridge.
   ========================================= */

(function() {
    'use strict';

    // --- 1. SUBTITLE ENGINE (SRT -> VTT) ---
    function srtToVtt(srtText) {
        let vttText = "WEBVTT\n\n";
        return vttText + srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    }

    async function syncAndConvertSubs() {
        const video = document.querySelector('#videowrap video');
        if (!video || !video.src || !video.src.includes("archive.org")) return;
        if (document.querySelector('.ckb-sub-track')) return;

        const srtUrl = video.src.replace(/\.mp4($|\?)/, ".srt$1");
        try {
            const response = await fetch(srtUrl);
            if (!response.ok) return;
            const srtText = await response.text();
            const vttText = srtToVtt(srtText);
            const blob = new Blob([vttText], { type: 'text/vtt' });
            const blobUrl = URL.createObjectURL(blob);
            const track = document.createElement('track');
            track.className = 'ckb-sub-track';
            track.kind = 'subtitles';
            track.label = 'English (Auto)';
            track.srclang = 'en';
            track.src = blobUrl;
            track.default = true; 
            track.onload = function() {
                if (video.textTracks && video.textTracks.length > 0) {
                    video.textTracks[0].mode = 'showing';
                }
            };
            video.appendChild(track);
        } catch (error) { console.error("Subtitles Error:", error); }
    }

    // --- 2. CHAT MEDIA ENGINE & BOT BRIDGES ---
    function processMessage(node) {
        if (!(node instanceof HTMLElement)) return;
        const msgText = node.innerText || node.textContent;

        // --- BRIDGE: !autoqueue (Bot to Ziggy's UI) ---
        if (msgText.includes('!autoqueue ')) {
            const rawUrl = msgText.split('!autoqueue ')[1].trim();
            if (window.CLIENT && window.CLIENT.name === "Ziggy") {
                const urlBox = document.getElementById('addfromurl-input');
                const queueBtn = document.getElementById('addfromurl-queue');
                if (urlBox && queueBtn) {
                    urlBox.value = rawUrl;
                    queueBtn.click();
                    setTimeout(() => { urlBox.value = ""; }, 500);
                }
            }
            node.style.display = 'none'; // Hide command from chat
            return;
        }

        // --- COMMAND: !forcearchive (Manual Admin Injection) ---
        if (msgText.startsWith('!forcearchive ')) {
            const url = msgText.split('!forcearchive ')[1].trim();
            const match = url.match(/\/details\/([^\/]+)/) || url.match(/\/download\/([^\/]+)/);
            const id = match ? match[1] : url;

            if (window.CLIENT && window.CLIENT.name === "Ziggy" && window.socket) {
                window.socket.emit('queue', {
                    id: `<iframe src="https://archive.org/embed/${id}" width="100%" height="480" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe>`,
                    type: 'cm',
                    pos: 'end'
                });
            }
            node.style.display = 'none';
            return;
        }

        // --- STANDARD LINK PROCESSING ---
        const chatLinks = node.querySelectorAll('a:not(.ckb-processed)');
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;

        chatLinks.forEach(link => {
            const url = link.href.trim();
            const lowerUrl = url.toLowerCase();

            if (lowerUrl.includes('.ckbvideo') || lowerUrl.endsWith('.webm')) {
                const videoUrl = url.replace('.ckbvideo', '');
                link.after(Object.assign(document.createElement('div'), {
                    style: "margin: 10px 0;",
                    innerHTML: `<video controls loop muted style="max-width:350px;border-radius:8px;"><source src="${videoUrl}" type="video/webm"></video>`
                }));
                link.style.display = "none";
            } 
            else if (ytRegex.test(url)) {
                const videoId = url.match(ytRegex)[1];
                const ytWrap = document.createElement('a');
                ytWrap.href = url; ytWrap.target = "_blank";
                ytWrap.style.cssText = "display:flex;align-items:center;max-width:350px;margin:5px 0;background:rgba(0,0,0,0.6);border:1px solid #333;border-radius:6px;overflow:hidden;text-decoration:none;";
                ytWrap.innerHTML = `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" style="width:120px;height:68px;object-fit:cover;border-right:1px solid #333;"/><div style="color:#fff;padding:0 10px;font-size:13px;font-weight:bold;">▶️ Loading Title...</div>`;
                link.after(ytWrap);
                link.style.display = "none";
                fetch(`https://noembed.com/embed?url=${url}`).then(r => r.json()).then(d => { if(d.title) ytWrap.querySelector('div').innerText = d.title; });
            }
            else if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/)) {
                const imgWrap = document.createElement('div');
                imgWrap.innerHTML = `<img src="${url}" style="max-width:200px;cursor:zoom-in;border-radius:5px;margin:5px 0;" onclick="this.style.maxWidth=(this.style.maxWidth==='200px'?'450px':'200px');"/>`;
                link.after(imgWrap);
                link.style.display = "none";
            }
            link.classList.add('ckb-processed');
        });
    }

    // --- 3. PLAYER HIJACKER (For Archive.org MKVs) ---
    function handleArchiveEmbed(data) {
        if (data && data.id && data.id.includes("archive.org")) {
            console.log("🛡️ Archive.org MKV Hijacker Activated.");
            const match = data.id.match(/\/details\/([^\/]+)/) || data.id.match(/\/download\/([^\/]+)/);
            const archiveId = match ? match[1] : null;
            if (archiveId) {
                const videoWrap = document.getElementById('videowrap');
                if (videoWrap) {
                    videoWrap.innerHTML = `<iframe src="https://archive.org/embed/${archiveId}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
                }
            }
        }
    }

    // --- 4. INITIALIZATION ---
    function init() {
        const chatBuffer = document.getElementById('messagebuffer');
        if (chatBuffer) {
            new MutationObserver(m => m.forEach(res => res.addedNodes.forEach(node => processMessage(node)))).observe(chatBuffer, { childList: true });
            processMessage(chatBuffer);
        }

        const playerDiv = document.getElementById('videowrap');
        if (playerDiv) {
            new MutationObserver(() => setTimeout(syncAndConvertSubs, 1000)).observe(playerDiv, { childList: true, subtree: true });
        }

        if (window.socket) {
            window.socket.on("changeMedia", handleArchiveEmbed);
        }

        // Add Fancy Exploding Discord Button
        const btnRow = document.getElementById('emotelistbtn')?.parentNode;
        if (btnRow && !document.getElementById('fancy-discord-btn')) {
            const dBtn = document.createElement('a');
            dBtn.id = 'fancy-discord-btn';
            dBtn.href = 'https://discord.gg/SMa9YJVBgj';
            dBtn.target = '_blank';
            dBtn.className = 'btn btn-sm'; 
            dBtn.innerHTML = 'Join Discord ✨'; // Button text set here
            
            dBtn.addEventListener('click', function(e) {
                e.preventDefault();
                dBtn.classList.add('exploding');
                setTimeout(() => {
                    window.open(dBtn.href, '_blank');
                    dBtn.classList.remove('exploding');
                }, 600);
            });
            btnRow.appendChild(dBtn);
        }

        console.log("Project C.K.B. Master Script V4.7 - Ready for Invincible.");
    }

    init();
})();
/* GOBLINVAPIST STROBE TOGGLE */
(function() {
    $('#messagebuffer, #userlist').on('click', '[data-nick="GoblinVapist"], .chat-msg-GoblinVapist .username', function() {
        // Find all instances of his name and toggle the class
        $('.chat-msg-GoblinVapist .username, .userlist_item[data-nick="GoblinVapist"] span').toggleClass('strobe-active');
        
        // Optional: Print a small console log to confirm it's working
        console.log("Goblin Strobe Toggled");
    });
})();

/* LATRELLSPREWELL DUALITY TOGGLE */
(function() {
    // 1. Initial setup: Give him the slime class when messages load
    const applyInitialClass = () => {
        $('.chat-msg-latrellsprewell .username:not(.latrell-slime, .latrell-pride)').addClass('latrell-slime');
        $('.userlist_item[data-nick="latrellsprewell"] span:not(.latrell-slime, .latrell-pride)').addClass('latrell-slime');
    };

    // Run every time a new message arrives
    const observer = new MutationObserver(applyInitialClass);
    observer.observe(document.getElementById('messagebuffer'), { childList: true });
    applyInitialClass();

    // 2. The Toggle Logic
    $('#messagebuffer, #userlist').on('click', '[data-nick="latrellsprewell"], .chat-msg-latrellsprewell .username', function() {
        const targets = $('.chat-msg-latrellsprewell .username, .userlist_item[data-nick="latrellsprewell"] span');
        
        if (targets.hasClass('latrell-slime')) {
            targets.removeClass('latrell-slime').addClass('latrell-pride');
        } else {
            targets.removeClass('latrell-pride').addClass('latrell-slime');
        }
    });
})();

// 🌴 C.K.B. Digital Solitude - Master Injector 🌴
// This script overrides your external "Holy Light" CSS to apply the new 2026 Solitude aesthetic.

const ckbSolitudeStyles = `
    /* 1. THE RESET: Overwriting the Rainbow & Holy Light CSS */
    body, #mainpage {
        background-image: url('https://files.catbox.moe/n2f1f3.png') !important;
        background-color: #050505 !important;
        background-attachment: fixed !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        animation: none !important; /* Kills the global-rainbow animation */
    }

    /* Stripping patterns (hearts, etc.) from external containers */
    #main-container, .container-fluid, #wrap, .well {
        background: transparent !important;
        background-image: none !important;
        border: none !important;
    }

    /* 2. THE VAPORWAVE GLITCH LAYER */
    /* This adds a moving scanline layer over the pixelated image to "HD-ify" it */
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

    /* 3. CKB MOTD & TEXT READABILITY */
    .ckb-motd-wrapper {
        background-color: rgba(5, 5, 5, 0.7) !important;
        backdrop-filter: blur(10px) saturate(150%);
        border: 2px solid #FF6AD5 !important;
        box-shadow: 0 0 20px rgba(255, 106, 213, 0.3) !important;
        border-radius: 4px;
        padding: 25px;
        position: relative;
        z-index: 10;
        margin-bottom: 20px;
    }

    /* 4. KEYFRAMES FOR THE 'HD' ANIMATED EFFECT */
    @keyframes ckb-vhs-flicker {
        0% { opacity: 0.25; }
        50% { opacity: 0.35; }
        100% { opacity: 0.25; }
    }

    /* Adding a subtle 'chromatic aberration' glitch to the background image */
    @keyframes ckb-bg-shift {
        0% { filter: hue-rotate(0deg) contrast(1); }
        98% { filter: hue-rotate(0deg) contrast(1); }
        99% { filter: hue-rotate(10deg) contrast(1.1) brightness(1.2); transform: scale(1.01); }
        100% { filter: hue-rotate(0deg) contrast(1); transform: scale(1); }
    }

    body {
        animation: ckb-bg-shift 5s infinite !important;
    }
`;

// Initialization
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = ckbSolitudeStyles;
document.head.appendChild(styleSheet);

// Console Branding
console.log("%c[CKB] Solitude Core Online. Visual distortion engaged.", "color: #00ffcc; font-weight: bold; background: #000; padding: 5px;");


// Add this to your existing ckbSolitudeStyles string
const ckbSolitudeStyles = `
    /* ... your existing CSS ... */

    #ckb-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #050505;
        z-index: 9999; /* Ensures it is above everything */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Consolas', 'Courier New', monospace;
        transition: opacity 1s ease, visibility 1s;
    }

    .glitch-text {
        color: #00ffcc;
        font-size: 2em;
        font-weight: bold;
        letter-spacing: 5px;
        position: relative;
        text-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
        animation: text-flicker 2s infinite;
    }

    /* Glitch Effect for the text */
    .glitch-text::before, .glitch-text::after {
        content: attr(data-text);
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: #050505;
    }

    .glitch-text::before {
        left: 2px;
        text-shadow: -2px 0 #ff003c;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim 5s infinite linear alternate-reverse;
    }

    .glitch-text::after {
        left: -2px;
        text-shadow: -2px 0 #00ffcc;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim2 5s infinite linear alternate-reverse;
    }

    .loading-bar-container {
        width: 300px;
        height: 2px;
        background: rgba(255, 255, 255, 0.1);
        margin-top: 20px;
        position: relative;
        overflow: hidden;
    }

    .loading-bar {
        width: 100%;
        height: 100%;
        background: #ff003c;
        box-shadow: 0 0 15px #ff003c;
        animation: loading-progress 3s ease-in-out infinite;
    }

    .wired-sub {
        margin-top: 15px;
        color: #444;
        font-size: 0.8em;
        letter-spacing: 2px;
    }

    @keyframes loading-progress {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0); }
        100% { transform: translateX(100%); }
    }

    @keyframes text-flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
        90% { transform: skewX(0deg); }
        91% { transform: skewX(10deg); color: #ff003c; }
        92% { transform: skewX(0deg); }
    }

    @keyframes glitch-anim {
        0% { clip: rect(10px, 9999px, 20px, 0); }
        100% { clip: rect(80px, 9999px, 90px, 0); }
    }
`;

// ADD THIS AT THE BOTTOM OF YOUR JAVASCRIPT FILE:
// This hides the loader after the page is ready
window.addEventListener('load', () => {
    const loader = document.getElementById('ckb-loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 2000); // Keeps it visible for 2 seconds for aesthetic effect
});" Can you fix it as when I updated it, it just reverts to using the external css
