"use strict";
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "set_volume") {
        // Set all audio/video elements' volume
        const volume = Math.max(0, Math.min(6, msg.value)); // Clamp 0-6
        document.querySelectorAll("audio,video").forEach((el) => {
            el.volume = Math.min(1, volume); // Browsers only allow 0-1 for volume
            // If you want >100%, you'd need to use "gain" via Web Audio API (advanced)
        });
    }
});
