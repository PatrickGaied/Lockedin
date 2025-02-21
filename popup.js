"use strict";
document.addEventListener("DOMContentLoaded", function () {
    // Blocking elements
    const websiteInput = document.getElementById("websiteInput");
    const addWebsiteBtn = document.getElementById("addWebsite");
    const blockedList = document.getElementById("blockedList");
    // Tab elements
    const blockedWebsitesTab = document.getElementById("blockedWebsitesTab");
    const studySessionTab = document.getElementById("studySessionTab");
    // Timer elements
    const startStudySessionBtn = document.getElementById("startStudySession");
    const timerDisplay = document.getElementById("timerDisplay");
    const decreaseTimeBtn = document.getElementById("decreaseTime");
    const increaseTimeBtn = document.getElementById("increaseTime");
    const pauseTimerBtn = document.getElementById("pauseTimer");
    const resetTimerButton = document.getElementById("resetTimer");
    const sessionDurationSpan = document.getElementById("sessionDuration");
    // Timer state
    let timerInterval = null;
    let baseDuration = 30 * 60; // Default 30 minutes in seconds
    let timeLeft = baseDuration;
    let isTimerRunning = false;
    let isTimerPaused = false;
    // Load blocked websites
    function loadBlockedSites() {
        chrome.storage.local.get(["blockedWebsites"], (result) => {
            const sites = result.blockedWebsites || [];
            blockedList.innerHTML = "";
            sites.forEach(site => {
                const li = document.createElement("li");
                li.innerHTML = `${site} <span class="remove-btn" data-site="${site}">❌   </span>`;
                blockedList.appendChild(li);
            });
            document.querySelectorAll(".remove-btn").forEach(btn => {
                btn.addEventListener("click", function () {
                    removeWebsite(this.getAttribute("data-site"));
                });
            });
        });
    }
    // Add website to blocklist
    function addWebsite() {
        let site = websiteInput.value.trim();
        if (!site)
            return;
        chrome.storage.local.get(["blockedWebsites"], (result) => {
            let sites = result.blockedWebsites || [];
            if (!sites.includes(site)) {
                sites.push(site);
                chrome.storage.local.set({ blockedWebsites: sites }, () => {
                    updateBlockingRules(sites);
                    loadBlockedSites();
                    websiteInput.value = "";
                });
            }
        });
    }
    // Remove website from blocklist
    function removeWebsite(site) {
        chrome.storage.local.get(["blockedWebsites"], (result) => {
            let sites = result.blockedWebsites || [];
            sites = sites.filter(s => s !== site);
            chrome.storage.local.set({ blockedWebsites: sites }, () => {
                updateBlockingRules(sites);
                loadBlockedSites();
            });
        });
    }
    // Update blocking rules
    function updateBlockingRules(sites) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1),
            addRules: sites.map((site, index) => ({
                id: index + 1,
                priority: 1,
                action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
                condition: {
                    urlFilter: `*://*.${site}/*`,
                    resourceTypes: ["main_frame"]
                }
            }))
        });
    }
    // Tab switching
    function openTab(evt, tabName) {
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        const tablinks = document.getElementsByClassName("tablinks");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = "block";
        }
        evt.currentTarget.classList.add("active");
    }
    // Timer functions
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
    }
    function saveTimerState() {
        chrome.storage.local.set({
            timerState: {
                baseDuration,
                timeLeft,
                isTimerRunning,
                lastUpdate: Date.now()
            }
        });
    }
    function loadTimerState(callback) {
        chrome.storage.local.get(["timerState"], (result) => {
            const state = result.timerState;
            if (state) {
                baseDuration = state.baseDuration;
                timeLeft = state.timeLeft;
                isTimerRunning = state.isTimerRunning;
                const timeElapsed = Math.floor((Date.now() - state.lastUpdate) / 1000);
                if (isTimerRunning && timeLeft > 0 && !isTimerPaused) {
                    timeLeft = Math.max(0, timeLeft - timeElapsed);
                    if (timeLeft > 0) {
                        startTimer();
                    }
                    else {
                        isTimerRunning = false;
                        timerDisplay.textContent = "Session Complete!";
                    }
                }
                sessionDurationSpan.textContent = `${baseDuration / 60}`;
                updateTimerDisplay();
            }
            callback();
        });
    }
    function startTimer() {
        if (timerInterval)
            clearInterval(timerInterval);
        timerInterval = window.setInterval(() => {
            if (timeLeft > 0 && !isTimerPaused) {
                timeLeft--;
                updateTimerDisplay();
                saveTimerState();
            }
            else if (timeLeft > 0) {
                updateTimerDisplay();
                saveTimerState();
            }
            else {
                clearInterval(timerInterval);
                timerInterval = null;
                isTimerRunning = false;
                timerDisplay.textContent = "Session Complete!";
                saveTimerState();
            }
        }, 1000);
    }
    function startStudySession() {
        if (isTimerRunning)
            return;
        timeLeft = baseDuration;
        isTimerRunning = true;
        updateTimerDisplay();
        startTimer();
        saveTimerState();
    }
    function adjustDuration(delta) {
        if (isTimerRunning)
            return;
        const newDuration = Math.max(30 * 60, Math.min(300 * 60, baseDuration + delta * 60));
        baseDuration = newDuration;
        timeLeft = baseDuration;
        sessionDurationSpan.textContent = `${baseDuration / 60}`;
        updateTimerDisplay();
        saveTimerState();
    }
    function pauseStudySession() {
        if (!isTimerPaused) {
            isTimerPaused = true;
        }
        else {
            isTimerPaused = false;
        }
    }
    function resetTimerBtn() {
        if (timerInterval)
            clearInterval(timerInterval);
        timerInterval = null;
        isTimerRunning = false;
        isTimerPaused = false;
        timeLeft = baseDuration;
        updateTimerDisplay();
        saveTimerState();
    }
    // Event listeners
    addWebsiteBtn.addEventListener("click", addWebsite);
    blockedWebsitesTab.addEventListener("click", (evt) => openTab(evt, "BlockedWebsites"));
    studySessionTab.addEventListener("click", (evt) => openTab(evt, "StudySession"));
    startStudySessionBtn.addEventListener("click", startStudySession);
    decreaseTimeBtn.addEventListener("click", () => adjustDuration(-5));
    increaseTimeBtn.addEventListener("click", () => adjustDuration(5));
    pauseTimerBtn.addEventListener("click", pauseStudySession);
    resetTimerButton.addEventListener("click", resetTimerBtn);
    // Initial setup
    loadTimerState(() => {
        loadBlockedSites();
        openTab({ currentTarget: blockedWebsitesTab }, "BlockedWebsites");
    });
});
