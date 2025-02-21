document.addEventListener("DOMContentLoaded", function () {
  const websiteInput = document.getElementById("websiteInput") as HTMLInputElement;
  const addWebsiteBtn = document.getElementById("addWebsite") as HTMLButtonElement;
  const blockedList = document.getElementById("blockedList") as HTMLUListElement;

  
  function normalizeSite(site: string): string {
    // Remove extra whitespace.
    site = site.trim();
    
    // Use a regex to remove the protocol (http://, https://, or *://).
    site = site.replace(/^(?:https?:\/\/|\*\:\/\/)/, "");
    
    // Remove any path that might come after the domain.
    const slashIndex = site.indexOf("/");
    if (slashIndex !== -1) {
      site = site.substring(0, slashIndex);
    }
    
    // Return the plain domain, e.g., "youtube.com" or "www.youtube.com"
    return site;
  }
  



  // Load blocked websites from storage
  function loadBlockedSites(): void {
      chrome.storage.local.get(["blockedWebsites"], function (result: { blockedWebsites?: string[] }) {
          const sites: string[] = result.blockedWebsites || [];
          blockedList.innerHTML = ""; // Clear old list

          sites.forEach(site => {
              const li = document.createElement("li");
              li.innerHTML = `${site} <span class="remove-btn" data-site="${site}">❌</span>`;
              blockedList.appendChild(li);
          });

          // Attach event listeners to remove buttons
          document.querySelectorAll(".remove-btn").forEach(btn => {
              btn.addEventListener("click", function (this: HTMLElement) {
                  removeWebsite(this.getAttribute("data-site") as string);
              });
          });
      });
  }

  // Function to add a website to the blocklist
  function addWebsite(): void {
      let site: string = websiteInput.value.trim();
      if (!site) return;
      site = normalizeSite(site);

      chrome.storage.local.get(["blockedWebsites"], function (result: { blockedWebsites?: string[] }) {
          let sites: string[] = result.blockedWebsites || [];
          if (!sites.includes(site)) {
              sites.push(site);
              chrome.storage.local.set({ "blockedWebsites": sites }, function () {
                  updateBlockingRules(sites);
                  loadBlockedSites(); // Refresh UI
                  websiteInput.value = "";
              });
          }
      });
  }

  // Function to remove a website from the blocklist
  function removeWebsite(site: string): void {
      chrome.storage.local.get(["blockedWebsites"], function (result: { blockedWebsites?: string[] }) {
          let sites: string[] = result.blockedWebsites || [];
          sites = sites.filter(s => s !== site);
          chrome.storage.local.set({ "blockedWebsites": sites }, function () {
              updateBlockingRules(sites);
              loadBlockedSites();
          });
      });
  }

  // Function to update blocking rules
  function updateBlockingRules(sites: string[]): void {
      chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1), // Remove all old rules
          addRules: sites.map((site, index) => ({
              id: index + 1,
              priority: 1,
              action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
              condition: { urlFilter: site, resourceTypes: ["main_frame"] as chrome.declarativeNetRequest.ResourceType[] }
          }))
      });
  }

  // Event listeners
  addWebsiteBtn.addEventListener("click", addWebsite);
  loadBlockedSites();
});