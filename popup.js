"use strict";
document.addEventListener("DOMContentLoaded", function () {
    const websiteInput = document.getElementById("websiteInput");
    const addWebsiteBtn = document.getElementById("addWebsite");
    const blockedList = document.getElementById("blockedList");
    // Load blocked websites from storage
    function loadBlockedSites() {
        chrome.storage.local.get(["blockedWebsites"], function (result) {
            const sites = result.blockedWebsites || [];
            blockedList.innerHTML = ""; // Clear old list
            sites.forEach(site => {
                const li = document.createElement("li");
                li.innerHTML = `${site} <span class="remove-btn" data-site="${site}">❌</span>`;
                blockedList.appendChild(li);
            });
            // Attach event listeners to remove buttons
            document.querySelectorAll(".remove-btn").forEach(btn => {
                btn.addEventListener("click", function () {
                    removeWebsite(this.getAttribute("data-site"));
                });
            });
        });
    }
    // Function to add a website to the blocklist
    function addWebsite() {
        let site = websiteInput.value.trim();
        if (!site)
            return;
        chrome.storage.local.get(["blockedWebsites"], function (result) {
            let sites = result.blockedWebsites || [];
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
    function removeWebsite(site) {
        chrome.storage.local.get(["blockedWebsites"], function (result) {
            let sites = result.blockedWebsites || [];
            sites = sites.filter(s => s !== site);
            chrome.storage.local.set({ "blockedWebsites": sites }, function () {
                updateBlockingRules(sites);
                loadBlockedSites();
            });
        });
    }
    // Function to update blocking rules
    function updateBlockingRules(sites) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1), // Remove all old rules
            addRules: sites.map((site, index) => ({
                id: index + 1,
                priority: 1,
                action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
                condition: { urlFilter: site, resourceTypes: ["main_frame"] }
            }))
        });
    }
    // Event listeners
    addWebsiteBtn.addEventListener("click", addWebsite);
    loadBlockedSites();
});
