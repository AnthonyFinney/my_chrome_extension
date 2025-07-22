// Get all tabs currently playing audio
async function getTabsWithAudio() {
  return await chrome.tabs.query({ audible: true });
}

// Send volume change to the active tab
function sendMessageToActiveTab(message: any) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id!, message);
    }
  });
}

function sendVolumeToActiveTab(value: number) {
  sendMessageToActiveTab({ action: "set_volume", value });
}

function renderTabs(tabs: chrome.tabs.Tab[]) {
  const list = document.getElementById("tabs-list");
  if (!list) return;
  list.innerHTML = "";

  tabs.forEach((tab) => {
    const li = document.createElement("li");
    li.textContent = tab.title ?? "Untitled";
    li.addEventListener("click", () => {
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
      sendVolumeToActiveTab(vol);
    });
  }

  if (voice) {
    voice.addEventListener("change", () => {
      sendMessageToActiveTab({ action: "toggle_voice", value: voice.checked });
    });
  }

  if (bass) {
    bass.addEventListener("change", () => {
      sendMessageToActiveTab({ action: "toggle_bass", value: bass.checked });
    });
  }

  const tabs = await getTabsWithAudio();
  renderTabs(tabs);
});
