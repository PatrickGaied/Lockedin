"use strict";
/// <reference types="chrome" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", function () {
    const websiteInput = document.getElementById("websiteInput");
    const addWebsiteBtn = document.getElementById("addWebsite");
    const blockedList = document.getElementById("blockedList");
    function normalizeSite(site) {
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
    // function to clear all service workers of current domain using chrome.browsingData.remove
    function clearServiceWorkers() {
        chrome.browsingData.remove({}, {
            serviceWorkers: true
        }, () => {
            console.log("Service workers cleared!");
        });
    }
    // Function to add a website to the blocklist
    function addWebsite() {
        return __awaiter(this, void 0, void 0, function* () {
            // Clear service workers
            clearServiceWorkers();
            let site = websiteInput.value.trim();
            if (!site)
                return;
            site = normalizeSite(site);
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
        });
    }
    // Function to remove a website from the blocklist
    function removeWebsite(site) {
        return __awaiter(this, void 0, void 0, function* () {
            chrome.storage.local.get(["blockedWebsites"], function (result) {
                let sites = result.blockedWebsites || [];
                sites = sites.filter(s => s !== site);
                chrome.storage.local.set({ "blockedWebsites": sites }, function () {
                    updateBlockingRules(sites);
                    loadBlockedSites();
                });
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
                condition: { urlFilter: site, resourceTypes: ["main_frame", "sub_frame"] }
            }))
        });
    }
    // Event listeners
    addWebsiteBtn.addEventListener("click", () => addWebsite());
    loadBlockedSites();
});
