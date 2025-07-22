// Get all tabs currently playing audio
async function getTabsWithAudio() {
  return await chrome.tabs.query({ audible: true });
}

let targetTabId: number | undefined;

function sendMessageToTargetTab<T = any>(message: any): Promise<T | undefined> {
  if (targetTabId !== undefined) {
    return chrome.tabs.sendMessage(targetTabId, message);
  }
  return Promise.resolve(undefined);
}

function sendVolumeToTargetTab(value: number) {
  sendMessageToTargetTab({ action: "set_volume", value });
}

async function getCurrentVolume(): Promise<number | undefined> {
  const resp = await sendMessageToTargetTab<{ value: number }>({
    action: "get_volume",
  });
  return resp && typeof resp.value === "number" ? resp.value : undefined;
}

async function getStoredVolume(): Promise<number | undefined> {
  return new Promise((resolve) => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get("boostVolume", (data) => {
        resolve(
          typeof data.boostVolume === "number" ? data.boostVolume : undefined
        );
      });
    } else {
      resolve(undefined);
    }
  });
}
function renderTabs(tabs: chrome.tabs.Tab[]) {
  const list = document.getElementById("tabs-list");
  if (!list) return;
  list.innerHTML = "";

  tabs.forEach((tab) => {
    const li = document.createElement("li");
    li.textContent = tab.title ?? "Untitled";
    li.addEventListener("click", () => {
      targetTabId = tab.id;
      chrome.tabs.update(tab.id!, { active: true });
    });
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const slider = document.getElementById("volume-slider") as HTMLInputElement;
  const label = document.getElementById("volume-label");
  const voice = document.getElementById("voice-boost") as HTMLInputElement;
  const bass = document.getElementById("bass-boost") as HTMLInputElement;
  if (slider && label) {
    slider.addEventListener("input", () => {
      const vol = Number(slider.value);
      (label as HTMLElement).textContent = `${Math.round(vol * 100)}%`;
      sendVolumeToTargetTab(vol);
    });

    let current = await getCurrentVolume();
    if (typeof current !== "number") {
      current = await getStoredVolume();
    }
    if (typeof current !== "number") {
      current = 1;
    }
    slider.value = String(current);
    (label as HTMLElement).textContent = `${Math.round(current * 100)}%`;
  }

  if (voice) {
    voice.addEventListener("change", () => {
      sendMessageToTargetTab({ action: "toggle_voice", value: voice.checked });
    });
  }

  if (bass) {
    bass.addEventListener("change", () => {
      sendMessageToTargetTab({ action: "toggle_bass", value: bass.checked });
    });
  }

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    targetTabId = activeTab.id;
  }
  const tabs = await getTabsWithAudio();
  renderTabs(tabs);
});
