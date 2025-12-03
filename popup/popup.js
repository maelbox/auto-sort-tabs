document.addEventListener("DOMContentLoaded", async () => {
  const stored = await browser.storage.local.get({
    autoSort: true,
    method: "created",
    groupByDomain: true,
    direction: "descending",
  });

  document.getElementById("autoSort").checked = stored.autoSort;
  document.getElementById("groupByDomain").checked = stored.groupByDomain;
  document.querySelector(`input[value="${stored.method}"]`).checked = true;

  const directionBtn = document.getElementById("toggleDirection");
  if (stored.direction === "ascending") {
    directionBtn.textContent = "Ascending";
    directionBtn.dataset.direction = "ascending";
  } else {
    directionBtn.textContent = "Descending";
    directionBtn.dataset.direction = "descending";
  }
});

const autoSortCheckbox = document.getElementById("autoSort");
const groupByDomainCheckbox = document.getElementById("groupByDomain");
const methodRadios = document.getElementsByName("method");

function saveSettings() {
  const settings = {
    autoSort: autoSortCheckbox.checked,
    method: document.querySelector('input[name="method"]:checked').value,
    groupByDomain: groupByDomainCheckbox.checked,
    direction: document.getElementById("toggleDirection").dataset.direction,
  };

  browser.storage.local.set(settings);

  browser.runtime.sendMessage({
    type: "settingsChanged",
  });
}

autoSortCheckbox.addEventListener("change", saveSettings);
groupByDomainCheckbox.addEventListener("change", saveSettings);
methodRadios.forEach((radio) => radio.addEventListener("change", saveSettings));

document.getElementById("toggleDirection").addEventListener("click", () => {
  const directionBtn = document.getElementById("toggleDirection");
  if (directionBtn.dataset.direction === "ascending") {
    directionBtn.dataset.direction = "descending";
    directionBtn.textContent = "Descending";
  } else {
    directionBtn.dataset.direction = "ascending";
    directionBtn.textContent = "Ascending";
  }

  saveSettings();
});
