// ============================================================
// EGODACT ADDON INJECTOR - CONTENT SCRIPT
// ============================================================
// Tells the background service worker that the page is ready so it
// can inject the installed marketplace addons. The actual injection
// happens in background.js (chrome.userScripts / chrome.scripting).

(function () {
    'use strict';

    let notified = 0;

    function notifyBackground() {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            return;
        }
        notified += 1;
        chrome.runtime.sendMessage({ type: 'injector:contentReady' }, function (response) {
            if (chrome.runtime.lastError) {
                console.warn('[Injector CS] Background niet bereikbaar:', chrome.runtime.lastError.message);
                return;
            }
            if (response && response.results && response.results.length) {
                const failed = response.results.filter(function (r) { return r && r.ok === false; });
                if (failed.length) {
                    console.warn('[Injector CS] Injectie mislukt voor:', failed);
                }
            }
        });
    }

    notifyBackground();

    // The service worker may start slightly after the page; retry a
    // couple of times so addons are injected on the first load too.
    setTimeout(notifyBackground, 1500);
    setTimeout(notifyBackground, 4000);

    window.addEventListener('pageshow', function (event) {
        if (event && event.persisted) notifyBackground();
    });
})();
