// ============================================================
// EGODACT ADDON INJECTOR
// ============================================================
// Loads addon code from chrome.storage and injects it into the page.
// Uses eval() in the content script's isolated world so addons have
// access to window.EgodactAddonClient and window.EgodactAddonLib.

(function () {
    'use strict';

    const STORAGE_PREFIX = 'egodact_marketplace_addon_';

    // Wait for the host extension to be ready.
    function waitForHostReady(callback) {
        if (window.EgodactAddonClient && window.EgodactAddonLib) {
            callback();
            return;
        }
        // Listen for host ready event
        const handler = function () {
            if (window.EgodactAddonClient && window.EgodactAddonLib) {
                document.removeEventListener('egodact:host:ready', handler);
                callback();
            }
        };
        document.addEventListener('egodact:host:ready', handler);
        // Also poll as fallback
        let attempts = 0;
        const poll = setInterval(function () {
            attempts++;
            if (window.EgodactAddonClient && window.EgodactAddonLib) {
                clearInterval(poll);
                document.removeEventListener('egodact:host:ready', handler);
                callback();
            } else if (attempts > 50) {
                clearInterval(poll);
                console.warn('[Injector] Host not ready after 5s, injecting anyway');
                callback();
            }
        }, 100);
    }

    // Inject a single addon's code.
    function injectAddon(addonData) {
        if (!addonData || !addonData.files) return;
        const entryPoint = addonData.entryPoint || 'content.js';
        const code = addonData.files[entryPoint];
        if (!code) {
            console.warn('[Injector] No entry point found for', addonData.id);
            return;
        }
        try {
            // Use eval in the content script's isolated world so the addon
            // has access to window.EgodactAddonClient etc.
            // Wrap in a try/catch and a function scope.
            const wrappedCode = '(function() { try { ' + code + ' } catch (e) { console.error("[Addon ' + addonData.id + ']", e); } })();';
            eval(wrappedCode);
            console.log('[Injector] Loaded addon:', addonData.id, addonData.version);
        } catch (err) {
            console.error('[Injector] Failed to inject', addonData.id, err);
        }
    }

    // Load all installed addons from chrome.storage.
    function loadInstalledAddons() {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
            console.warn('[Injector] chrome.storage not available');
            return;
        }
        chrome.storage.local.get(null, function (items) {
            if (chrome.runtime.lastError) {
                console.error('[Injector] Storage read failed:', chrome.runtime.lastError);
                return;
            }
            const addonIds = [];
            Object.keys(items).forEach(function (key) {
                if (key.indexOf(STORAGE_PREFIX) !== 0) return;
                const addonData = items[key];
                if (addonData && addonData.id) {
                    addonIds.push(addonData.id);
                }
            });
            if (addonIds.length === 0) {
                console.log('[Injector] No installed addons found');
                return;
            }
            console.log('[Injector] Found installed addons:', addonIds);
            // Wait for host to be ready before injecting
            waitForHostReady(function () {
                addonIds.forEach(function (id) {
                    const key = STORAGE_PREFIX + id;
                    const addonData = items[key];
                    if (addonData) injectAddon(addonData);
                });
            });
        });
    }

    // Check if an addon is installed (async, returns via callback).
    function isInstalled(addonId, callback) {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
            if (callback) callback(false);
            return false;
        }
        const key = STORAGE_PREFIX + addonId;
        chrome.storage.local.get(key, function (items) {
            const installed = !!(items && items[key]);
            if (callback) callback(installed);
        });
        return false;
    }

    // Remove an addon from storage.
    function uninstallAddon(addonId) {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
        const key = STORAGE_PREFIX + addonId;
        chrome.storage.local.remove(key, function () {
            console.log('[Injector] Uninstalled addon:', addonId);
        });
    }

    // Expose globally
    window.EgodactAddonInjector = {
        inject: injectAddon,
        loadAll: loadInstalledAddons,
        isInstalled: isInstalled,
        uninstall: uninstallAddon
    };

    // Auto-load on page ready
    loadInstalledAddons();
})();
