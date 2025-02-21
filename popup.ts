document.addEventListener("DOMContentLoaded", function () {
    // Blocking elements
    const websiteInput = document.getElementById("websiteInput") as HTMLInputElement;
    const addWebsiteBtn = document.getElementById("addWebsite") as HTMLButtonElement;
    const blockedList = document.getElementById("blockedList") as HTMLUListElement;
  
    // Tab elements
    const blockedWebsitesTab = document.getElementById("blockedWebsitesTab") as HTMLButtonElement;
    const studySessionTab = document.getElementById("studySessionTab") as HTMLButtonElement;
  
    // Timer elements
    const startStudySessionBtn = document.getElementById("startStudySession") as HTMLButtonElement;
    const timerDisplay = document.getElementById("timerDisplay") as HTMLDivElement;
    const decreaseTimeBtn = document.getElementById("decreaseTime") as HTMLButtonElement;
    const increaseTimeBtn = document.getElementById("increaseTime") as HTMLButtonElement;
    const pauseTimeBtn = document.getElementById("pauseTime") as HTMLButtonElement;
    const sessionDurationSpan = document.getElementById("sessionDuration") as HTMLSpanElement;
  
    // Timer state
    let timerInterval: number | null = null;
    let baseDuration = 30 * 60; // Default 30 minutes in seconds
    let timeLeft = baseDuration;
    let isTimerRunning = false;
    let isTimerPaused = false;
  
    // Load blocked websites
    function loadBlockedSites(): void {
      chrome.storage.local.get(["blockedWebsites"], (result: { blockedWebsites?: string[] }) => {
        const sites: string[] = result.blockedWebsites || [];
        blockedList.innerHTML = "";
        sites.forEach(site => {
          const li = document.createElement("li");
          li.innerHTML = `${site} <span class="remove-btn" data-site="${site}">❌   </span>`;
          blockedList.appendChild(li);
        });
        document.querySelectorAll(".remove-btn").forEach(btn => {
          btn.addEventListener("click", function (this: HTMLElement) {
            removeWebsite(this.getAttribute("data-site") as string);
          });
        });
      });
    }
  
    // Add website to blocklist
    function addWebsite(): void {
      let site: string = websiteInput.value.trim();
      if (!site) return;
      chrome.storage.local.get(["blockedWebsites"], (result: { blockedWebsites?: string[] }) => {
        let sites: string[] = result.blockedWebsites || [];
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
    function removeWebsite(site: string): void {
      chrome.storage.local.get(["blockedWebsites"], (result: { blockedWebsites?: string[] }) => {
        let sites: string[] = result.blockedWebsites || [];
        sites = sites.filter(s => s !== site);
        chrome.storage.local.set({ blockedWebsites: sites }, () => {
          updateBlockingRules(sites);
          loadBlockedSites();
        });
      });
    }
  
    // Update blocking rules
    function updateBlockingRules(sites: string[]): void {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1),
        addRules: sites.map((site, index) => ({
          id: index + 1,
          priority: 1,
          action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
          condition: {
            urlFilter: `*://*.${site}/*`,
            resourceTypes: ["main_frame"] as chrome.declarativeNetRequest.ResourceType[]
          }
        }))
      });
    }
  
    // Tab switching
    function openTab(evt: Event, tabName: string): void {
      const tabcontent = document.getElementsByClassName("tabcontent") as HTMLCollectionOf<HTMLElement>;
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
      (evt.currentTarget as HTMLElement).classList.add("active");
    }
  
    // Timer functions
    function formatTime(seconds: number): string {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  
    function updateTimerDisplay(): void {
      timerDisplay.textContent = formatTime(timeLeft);
    }
  
    function saveTimerState(): void {
      chrome.storage.local.set({
        timerState: {
          baseDuration,
          timeLeft,
          isTimerRunning,
          lastUpdate: Date.now()
        }
      });
    }
  
    function loadTimerState(callback: () => void): void {
      chrome.storage.local.get(["timerState"], (result: { timerState?: any }) => {
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
            } else {
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
  
    function startTimer(): void {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = window.setInterval(() => {
        if (timeLeft > 0 && !isTimerPaused) {
          timeLeft--;
          updateTimerDisplay();
          saveTimerState();
        } else if (timeLeft > 0) {
          updateTimerDisplay();
          saveTimerState();
        } else {
          clearInterval(timerInterval!);
          timerInterval = null;
          isTimerRunning = false;
          timerDisplay.textContent = "Session Complete!";
          saveTimerState();
        }
      }, 1000);
    }
  
    function startStudySession(): void {
      if (isTimerRunning) return;
      timeLeft = baseDuration;
      isTimerRunning = true;
      updateTimerDisplay();
      startTimer();
      saveTimerState();
    }
  
    function adjustDuration(delta: number): void {
      if (isTimerRunning) return;
      const newDuration = Math.max(30 * 60, Math.min(300 * 60, baseDuration + delta * 60));
      baseDuration = newDuration;
      timeLeft = baseDuration;
      sessionDurationSpan.textContent = `${baseDuration / 60}`;
      updateTimerDisplay();
      saveTimerState();
    }

    function pauseStudySession(): void {
        if (!isTimerPaused) {
          isTimerPaused = true;
        } else {
          isTimerPaused = false;
        }
    }
  
    // Event listeners
    addWebsiteBtn.addEventListener("click", addWebsite);
    blockedWebsitesTab.addEventListener("click", (evt) => openTab(evt, "BlockedWebsites"));
    studySessionTab.addEventListener("click", (evt) => openTab(evt, "StudySession"));
    startStudySessionBtn.addEventListener("click", startStudySession);
    decreaseTimeBtn.addEventListener("click", () => adjustDuration(-5));
    increaseTimeBtn.addEventListener("click", () => adjustDuration(5));
    pauseTimeBtn.addEventListener("click", pauseStudySession);
  
    // Initial setup
    loadTimerState(() => {
      loadBlockedSites();
      openTab({ currentTarget: blockedWebsitesTab } as unknown as Event, "BlockedWebsites");
    });
  });
  