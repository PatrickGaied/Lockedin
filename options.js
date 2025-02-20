document.addEventListener('DOMContentLoaded', () => {
    const blockListInput = document.getElementById('blockListInput');
    const saveBtn = document.getElementById('saveBtn');
  
    // Load the current block list from storage and display it.
    chrome.storage.sync.get({ blockList: [] }, (data) => {
      blockListInput.value = data.blockList.join('\n');
    });
  
    // When the user clicks save, update the block list in storage.
    saveBtn.addEventListener('click', () => {
      // Split the textarea content into lines, trim them, and remove empty entries.
      const list = blockListInput.value.split('\n').map(line => line.trim()).filter(line => line);
      chrome.storage.sync.set({ blockList: list }, () => {
        alert('Block list saved.');
      });
    });
  });
  