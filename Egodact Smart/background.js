chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== 'EGODACT_LOAD_CHALLENGES') {
        return;
    }

    (async () => {
        try {
            const response = await fetch(
                'https://api.egodact.com/challenge-portfolio',
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            sendResponse({ ok: true, data });
        } catch (error) {
            console.error('Egodact challenge API request failed:', error);
            sendResponse({
                ok: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    })();

    // Keep the message channel open for the asynchronous response.
    return true;
});
