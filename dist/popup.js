"use strict";
// Get all tabs currently playing audio
async function getTabsWithAudio() {
    return await chrome.tabs.query({ audible: true });
}
let targetTabId;
function sendMessageToTargetTab(message) {
    if (targetTabId !== undefined) {
        chrome.tabs.sendMessage(targetTabId, message);
    }
}
function sendVolumeToTargetTab(value) {
    sendMessageToTargetTab({ action: "set_volume", value });
}
function renderTabs(tabs) {
    const list = document.getElementById("tabs-list");
    if (!list)
        return;
    list.innerHTML = "";
    tabs.forEach((tab) => {
        const li = document.createElement("li");
        li.textContent = tab.title ?? "Untitled";
        li.addEventListener("click", () => {
            targetTabId = tab.id;
            chrome.tabs.update(tab.id, { active: true });
        });
        list.appendChild(li);
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    const slider = document.getElementById("volume-slider");
    const label = document.getElementById("volume-label");
    const voice = document.getElementById("voice-boost");
    const bass = document.getElementById("bass-boost");
    if (slider && label) {
        slider.addEventListener("input", () => {
            const vol = Number(slider.value);
            label.textContent = `${Math.round(vol * 100)}%`;
            sendVolumeToTargetTab(vol);
        });
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
