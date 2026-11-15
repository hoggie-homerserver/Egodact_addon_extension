// ============================================================
// EGODACT ADDON INJECTOR
// ============================================================
// Loads addon code from chrome.storage and injects it into the page.
// This is Method 1 (marketplace) for validated addons.

(function () {
    'use strict';

    const STORAGE_PREFIX = 'egodact_marketplace_addon_';

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
            // Create a script element and inject it.
            const script = document.createElement('script');
            script.textContent = code;
            script.dataset.egodactAddon = addonData.id;
            (document.head || document.documentElement).appendChild(script);
            console.log('[Injector] Loaded addon:', addonData.id, addonData.version);
        } catch (err) {
            console.error('[Injector] Failed to inject', addonData.id, err);
        }
    }

    // Load all installed addons from chrome.storage.
    function loadInstalledAddons() {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
        chrome.storage.local.get(null, function (items) {
            if (chrome.runtime.lastError) {
                console.error('[Injector] Storage read failed:', chrome.runtime.lastError);
                return;
            }
            Object.keys(items).forEach(function (key) {
                if (key.indexOf(STORAGE_PREFIX) !== 0) return;
                const addonData = items[key];
                if (addonData && addonData.id) {
                    injectAddon(addonData);
                }
            });
        });
    }

    // Check if an addon is installed.
    function isInstalled(addonId) {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return false;
        // Synchronous check not possible with chrome.storage; return false and let async handle it.
        return false;
    }

    // Remove an addon from storage.
    function uninstallAddon(addonId) {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
        const key = STORAGE_PREFIX + addonId;
        chrome.storage.local.remove(key, function () {
            // Remove injected script
            const script = document.querySelector('script[data-egodact-addon="' + addonId + '"]');
            if (script) script.remove();
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadInstalledAddons);
    } else {
        loadInstalledAddons();
    }
})();
