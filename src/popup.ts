// Find all tabs with audio and render controls
async function getTabsWithAudio() {
  return await chrome.tabs.query({ audible: true });
}

function renderTabs(tabs: chrome.tabs.Tab[]) {
  const container = document.getElementById("tabs");
  if (!container) return;
  container.innerHTML = "";

  tabs.forEach((tab) => {
    const tabDiv = document.createElement("div");
    tabDiv.className = "tab";

    const title = document.createElement("label");
    title.textContent = tab.title ?? "Untitled";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "6";
    slider.step = "0.01";
    slider.value = "1";

    slider.addEventListener("input", () => {
      chrome.tabs.sendMessage(tab.id!, {
        action: "set_volume",
        value: Number(slider.value),
      });
    });

    tabDiv.appendChild(title);
    tabDiv.appendChild(slider);
    container.appendChild(tabDiv);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const tabs = await getTabsWithAudio();
  renderTabs(tabs);
});
