interface AudioNodes {
  ctx: AudioContext;
  gain: GainNode;
  bass: BiquadFilterNode;
  voice: BiquadFilterNode;
}

const nodesMap = new WeakMap<HTMLMediaElement, AudioNodes>();

function ensureNodes(el: HTMLMediaElement): AudioNodes {
  let nodes = nodesMap.get(el);
  if (!nodes) {
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(el);

    const bass = ctx.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 150;
    bass.gain.value = 0;

    const voice = ctx.createBiquadFilter();
    voice.type = "highshelf";
    voice.frequency.value = 3000;
    voice.gain.value = 0;

    const gain = ctx.createGain();

    source.connect(bass);
    bass.connect(voice);
    voice.connect(gain);
    gain.connect(ctx.destination);
    ctx.resume();

    nodes = { ctx, gain, bass, voice };
    nodesMap.set(el, nodes);
  }
  return nodes;
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "set_volume") {
    const volume = Math.max(0, Math.min(6, msg.value));
    document.querySelectorAll("audio,video").forEach((node) => {
      const { gain } = ensureNodes(node as HTMLMediaElement);
      gain.gain.value = volume;
    });
  } else if (msg.action === "toggle_bass") {
    const enabled = Boolean(msg.value);
    document.querySelectorAll("audio,video").forEach((node) => {
      const { bass } = ensureNodes(node as HTMLMediaElement);
      bass.gain.value = enabled ? 10 : 0;
    });
  } else if (msg.action === "toggle_voice") {
    const enabled = Boolean(msg.value);
    document.querySelectorAll("audio,video").forEach((node) => {
      const { voice } = ensureNodes(node as HTMLMediaElement);
      voice.gain.value = enabled ? 10 : 0;
    });
  }
});
