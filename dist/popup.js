"use strict";
// Get all tabs currently playing audio
async function getTabsWithAudio() {
    return await chrome.tabs.query({ audible: true });
}
// Send volume change to the active tab
function sendVolumeToActiveTab(value) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "set_volume",
                value,
            });
        }
    });
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
            chrome.tabs.update(tab.id, { active: true });
        });
        list.appendChild(li);
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    const slider = document.getElementById("volume-slider");
    const label = document.getElementById("volume-label");
    if (slider && label) {
        slider.addEventListener("input", () => {
            const vol = Number(slider.value);
            label.textContent = `${Math.round(vol * 100)}%`;
            sendVolumeToActiveTab(vol);
        });
    }
    const tabs = await getTabsWithAudio();
    renderTabs(tabs);
});
