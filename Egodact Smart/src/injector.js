// ============================================================
// EGODACT ADDON INJECTOR --- CONTENT SCRIPT
// ============================================================
// Runs in the content script context. The actual injection is
// handled by the background service worker via chrome.scripting.

(function () {
    'use strict';

    console.log('[Injector CS] Content script loaded');

    // Notify background worker that this tab is ready
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'injector:contentReady' }, function (response) {
            if (chrome.runtime.lastError) {
                console.warn('[Injector CS] Could not notify background:', chrome.runtime.lastError.message);
            } else {
                console.log('[Injector CS] Background notified');
            }
        });
    }

    // Expose helper for marketplace to check installed status
    window.EgodactAddonInjector = {
        isInstalled: function (addonId, callback) {
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
                if (callback) callback(false);
                return;
            }
            chrome.runtime.sendMessage({ type: 'injector:isInstalled', addonId: addonId }, function (response) {
                if (chrome.runtime.lastError) {
                    if (callback) callback(false);
                } else {
                    if (callback) callback(response && response.installed);
                }
            });
        },
        uninstall: function (addonId, callback) {
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
                if (callback) callback({ success: false });
                return;
            }
            chrome.runtime.sendMessage({ type: 'injector:uninstall', addonId: addonId }, function (response) {
                if (chrome.runtime.lastError) {
                    if (callback) callback({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    if (callback) callback(response || { success: false });
                }
            });
        }
    };
})();
