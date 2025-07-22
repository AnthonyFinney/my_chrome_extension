"use strict";
const gainNodes = new WeakMap();
const contexts = new WeakMap();
function ensureGain(el) {
    let gain = gainNodes.get(el);
    if (!gain) {
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(el);
        gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);
        ctx.resume();
        contexts.set(el, ctx);
        gainNodes.set(el, gain);
    }
    return gain;
}
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "set_volume") {
        const volume = Math.max(0, Math.min(6, msg.value));
        document.querySelectorAll("audio,video").forEach((node) => {
            const el = node;
            const gain = ensureGain(el);
            gain.gain.value = volume;
        });
    }
});
