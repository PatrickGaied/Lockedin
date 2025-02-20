// Load settings from storage and update dynamic blocking rules.
function loadSettingsAndUpdateRules() {
  // Provide default values if not already set: an empty block list and blocking enabled.
  chrome.storage.sync.get({ blockList: [], blockingEnabled: true }, (data) => {
    updateRules(data.blockList, data.blockingEnabled);
  });
}

// Update the dynamic rules for blocking websites.
function updateRules(blockList, isEnabled) {
  // First, get any currently active dynamic rules.
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const currentRuleIds = rules.map(rule => rule.id);
    // Remove all existing dynamic rules.
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: currentRuleIds
    }, () => {
      // If blocking is enabled and there are sites in the list,
      // add a new rule for each website.
      if (isEnabled && blockList.length > 0) {
        const newRules = blockList.map((domain, index) => ({
          id: 1000 + index,  // Unique ID for each rule.
          priority: 1,
          action: { type: "block" },
          condition: {
            // 'urlFilter' will match if the domain string appears in the URL.
            // This simple filter works for many cases; for more precision you could use regex.
            urlFilter: domain,
            resourceTypes: ["main_frame"]  // Only block navigations (not images, scripts, etc.)
          }
        }));
        chrome.declarativeNetRequest.updateDynamicRules({
          addRules: newRules
        });
      }
    });
  });
}

// Listen for changes to the storage so that when the block list or the toggle changes,
// we update the rules accordingly.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.blockList || changes.blockingEnabled) {
      loadSettingsAndUpdateRules();
    }
  }
});

// Run on startup.
loadSettingsAndUpdateRules();
