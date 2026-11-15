// ============================================================
// EGODACT ADDON INJECTOR - CONTENT SCRIPT
// ============================================================
// Tells the background service worker that the page is ready so it
// can inject the installed marketplace addons. The actual injection
// happens in background.js (chrome.userScripts / chrome.scripting).

(function () {
    'use strict';

    const warned = {};

    function reportResults(results) {
        if (!results || !results.length) return;
        const failed = results.filter(function (entry) { return entry && entry.ok === false; });
        failed.forEach(function (entry) {
            const id = entry.id || 'onbekend';
            const message = entry.error || 'onbekende fout';
            if (warned[id] === message) return;
            warned[id] = message;
            console.warn('[Injector CS] Addon "' + id + '" niet geladen: ' + message);
        });
    }

    function notifyBackground() {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            return;
        }
        chrome.runtime.sendMessage({ type: 'injector:contentReady' }, function (response) {
            if (chrome.runtime.lastError) {
                console.warn('[Injector CS] Background niet bereikbaar:', chrome.runtime.lastError.message);
                return;
            }
            if (response) reportResults(response.results);
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
