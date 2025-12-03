function getDomain(url) {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;

    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    return hostname;
  } catch (e) {
    return url;
  }
}

async function sortTabs() {
  try {
    const settings = await browser.storage.local.get({
      autoSort: true,
      method: "created",
      groupByDomain: true,
      direction: "descending",
    });

    const method = settings.method;
    const allTabs = await browser.tabs.query({
      currentWindow: true,
      pinned: false,
    });

    allTabs.sort((a, b) => {
      let domainCompare = 0;
      if (settings.groupByDomain) {
        const domainA = getDomain(a.url);
        const domainB = getDomain(b.url);

        domainCompare = domainA.localeCompare(domainB);
        if (settings.direction === "descending") {
          domainCompare *= -1;
        }

        if (domainCompare !== 0) {
          return domainCompare;
        }
      }

      let methodCompare = 0;

      if (settings.method === "title") {
        methodCompare = a.title.localeCompare(b.title);
        if (settings.direction === "descending") {
          methodCompare *= -1;
        }
      } else if (settings.method === "recency") {
        methodCompare = b.lastAccessed - a.lastAccessed;
        if (settings.direction == "ascending") {
          methodCompare *= -1;
        }
      } else if (settings.method === "created") {
        methodCompare = b.id - a.id;
        if (settings.direction == "ascending") {
          methodCompare *= -1;
        }
      }

      return methodCompare;
    });

    const pinnedTabs = await browser.tabs.query({
      currentWindow: true,
      pinned: true,
    });
    const tabIds = allTabs.map((tab) => tab.id);

    await browser.tabs.move(tabIds, { index: pinnedTabs.length });
  } catch (error) {
    console.error(error);
  }
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "settingsChanged") {
    const settings = await browser.storage.local.get({ autoSort: true });
    if (settings.autoSort) {
      sortTabs();
    }
  }
});

function handleAutoSort() {
  browser.storage.local.get({ autoSort: true }).then((settings) => {
    if (settings.autoSort) {
      setTimeout(sortTabs, 200);
    }
  });
}

browser.tabs.onCreated.addListener(handleAutoSort);
browser.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    handleAutoSort();
  }
});
