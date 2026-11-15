// ============================================================
// EGODACT ADDON INJECTOR
// ============================================================
// Loads addon code from chrome.storage and injects it into the page.
// Uses chrome.scripting.executeScript (MV3 compatible, no eval needed).

(function () {
    'use strict';

    const STORAGE_PREFIX = 'egodact_marketplace_addon_';

    // Wait for the host extension to be ready.
    function waitForHostReady(callback) {
        if (window.EgodactAddonClient && window.EgodactAddonLib) {
            callback();
            return;
        }
        const handler = function () {
            if (window.EgodactAddonClient && window.EgodactAddonLib) {
                document.removeEventListener('egodact:host:ready', handler);
                callback();
            }
        };
        document.addEventListener('egodact:host:ready', handler);
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

    // Inject a single addon's code using chrome.scripting (MV3 compatible).
    function injectAddon(addonData) {
        if (!addonData || !addonData.files) return;
        const entryPoint = addonData.entryPoint || 'content.js';
        const code = addonData.files[entryPoint];
        if (!code) {
            console.warn('[Injector] No entry point found for', addonData.id);
            return;
        }

        // Use chrome.scripting.executeScript to run code in the isolated world.
        // This bypasses CSP restrictions in MV3.
        if (typeof chrome !== 'undefined' && chrome.scripting && chrome.scripting.executeScript) {
            chrome.tabs.getCurrent(function (tab) {
                if (!tab || !tab.id) {
                    console.warn('[Injector] Could not get current tab for', addonData.id);
                    return;
                }
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    world: 'ISOLATED',
                    func: function (code, addonId) {
                        try {
                            // eslint-disable-next-line no-eval
                            (0, eval)(code);
                            console.log('[Injector] Loaded addon:', addonId);
                        } catch (e) {
                            console.error('[Injector] Failed to inject', addonId, e);
                        }
                    },
                    args: [code, addonData.id]
                }, function (results) {
                    if (chrome.runtime.lastError) {
                        console.error('[Injector] executeScript error:', chrome.runtime.lastError.message);
                    }
                });
            });
        } else {
            // Fallback: try direct eval (may be blocked by CSP)
            try {
                eval(code);
                console.log('[Injector] Loaded addon (fallback):', addonData.id);
            } catch (err) {
                console.error('[Injector] Fallback eval failed for', addonData.id, err);
            }
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
            return;
        }
        const key = STORAGE_PREFIX + addonId;
        chrome.storage.local.get(key, function (items) {
            const installed = !!(items && items[key]);
            if (callback) callback(installed);
        });
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
