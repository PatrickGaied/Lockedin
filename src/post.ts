export async function sendPostRequest(): Promise<void> {
    try {
        const response = await fetch('http://localhost:3000/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "I am locked tf in @everyone" })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('API response:', data);
    } catch (error) {
        console.error('Failed to send API request:', error);
    }
}

// Expose the function to be callable from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendPostRequest') {
        sendPostRequest().then(() => sendResponse({ status: 'success' })).catch((error) => sendResponse({ status: 'error', error }));
        return true; // Indicates that the response will be sent asynchronously
    }
});