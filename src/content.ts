interface AudioNodes {
  ctx: AudioContext;
  gain: GainNode;
  bass: BiquadFilterNode;
  voice: BiquadFilterNode;
}

const nodesMap = new WeakMap<HTMLMediaElement, AudioNodes>();

let currentVolume = 1;
let bassEnabled = false;
let voiceEnabled = false;

function ensureNodes(el: HTMLMediaElement): AudioNodes {
  let nodes = nodesMap.get(el);
  if (!nodes) {
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(el);

    const bass = ctx.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 150;
    bass.gain.value = bassEnabled ? 10 : 0;

    const voice = ctx.createBiquadFilter();
    voice.type = "highshelf";
    voice.frequency.value = 3000;
    voice.gain.value = voiceEnabled ? 10 : 0;

    const gain = ctx.createGain();
    gain.gain.value = currentVolume;

    source.connect(bass);
    bass.connect(voice);
    voice.connect(gain);
    gain.connect(ctx.destination);
    ctx.resume();

    nodes = { ctx, gain, bass, voice };
    nodesMap.set(el, nodes);

    el.addEventListener("volumechange", () => {
      nodes!.gain.gain.value = currentVolume;
    });
  }
  return nodes;
}

function applyToAll() {
  document.querySelectorAll("audio,video").forEach((el) => {
    const nodes = ensureNodes(el as HTMLMediaElement);
    nodes.gain.gain.value = currentVolume;
    nodes.bass.gain.value = bassEnabled ? 10 : 0;
    nodes.voice.gain.value = voiceEnabled ? 10 : 0;
  });
}

if (chrome?.storage?.local) {
  chrome.storage.local.get("boostVolume", (data) => {
    if (typeof data.boostVolume === "number") {
      currentVolume = data.boostVolume;
    }
    applyToAll();
  });
} else {
  applyToAll();
}

const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    m.addedNodes.forEach((node) => {
      if (node instanceof HTMLMediaElement) {
        ensureNodes(node);
      } else if (node instanceof HTMLElement) {
        node.querySelectorAll("audio,video").forEach((el) => ensureNodes(el as HTMLMediaElement));
      }
    });
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "set_volume") {
    currentVolume = Math.max(0, Math.min(6, msg.value));
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ boostVolume: currentVolume });
    }
    applyToAll();
  } else if (msg.action === "toggle_bass") {
    bassEnabled = Boolean(msg.value);
    applyToAll();
  } else if (msg.action === "toggle_voice") {
    voiceEnabled = Boolean(msg.value);
    applyToAll();
  } else if (msg.action === "get_volume") {
    sendResponse({ value: currentVolume });
  }
  return true;
});
