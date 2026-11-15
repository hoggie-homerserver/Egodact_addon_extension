// ============================================================
// EGODACT ADDON INJECTOR — BACKGROUND SERVICE WORKER
// ============================================================
// Handles injection of marketplace addons into app.egodact.com tabs.
// Uses chrome.scripting.executeScript (MV3 compatible, bypasses CSP).

const STORAGE_PREFIX = 'egodact_marketplace_addon_';

// Inject a single addon into a tab.
function injectAddonIntoTab(tabId, addonData) {
    const entryPoint = addonData.entryPoint || 'content.js';
    const code = addonData.files && addonData.files[entryPoint];
    if (!code) {
        console.warn('[Injector BG] No entry point found for', addonData.id);
        return;
    }
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        world: 'ISOLATED',
        func: function (code, addonId) {
            try {
                (0, eval)(code);
                console.log('[Injector BG] Loaded addon:', addonId);
            } catch (e) {
                console.error('[Injector BG] Failed to inject', addonId, e);
            }
        },
        args: [code, addonData.id]
    }, function (results) {
        if (chrome.runtime.lastError) {
            console.error('[Injector BG] executeScript error:', chrome.runtime.lastError.message);
        }
    });
}

// Load and inject all installed addons into a tab.
function injectAllAddons(tabId) {
    chrome.storage.local.get(null, function (items) {
        if (chrome.runtime.lastError) {
            console.error('[Injector BG] Storage read failed:', chrome.runtime.lastError);
            return;
        }
        Object.keys(items).forEach(function (key) {
            if (key.indexOf(STORAGE_PREFIX) !== 0) return;
            const addonData = items[key];
            if (addonData && addonData.id && addonData.files) {
                injectAddonIntoTab(tabId, addonData);
            }
        });
    });
}

// Listen for tab updates on app.egodact.com.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete') return;
    if (!tab.url || tab.url.indexOf('https://app.egodact.com') !== 0) return;
    // Small delay to let the host extension's content scripts initialize.
    setTimeout(function () {
        injectAllAddons(tabId);
    }, 500);
});

// Listen for messages from content scripts.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'injector:install') {
        const addonData = message.addonData;
        if (addonData && addonData.id) {
            const key = STORAGE_PREFIX + addonData.id;
            chrome.storage.local.set({ [key]: addonData }, function () {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    // Inject into all app.egodact.com tabs
                    chrome.tabs.query({ url: 'https://app.egodact.com/*' }, function (tabs) {
                        tabs.forEach(function (tab) {
                            injectAddonIntoTab(tab.id, addonData);
                        });
                    });
                    sendResponse({ success: true });
                }
            });
            return true; // async response
        }
        sendResponse({ success: false, error: 'No addon data' });
    } else if (message.type === 'injector:uninstall') {
        const addonId = message.addonId;
        if (addonId) {
            const key = STORAGE_PREFIX + addonId;
            chrome.storage.local.remove(key, function () {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ success: true });
                }
            });
            return true;
        }
        sendResponse({ success: false, error: 'No addon id' });
    } else if (message.type === 'injector:isInstalled') {
        const addonId = message.addonId;
        const key = STORAGE_PREFIX + addonId;
        chrome.storage.local.get(key, function (items) {
            sendResponse({ installed: !!(items && items[key]) });
        });
        return true;
    } else if (message.type === 'injector:list') {
        chrome.storage.local.get(null, function (items) {
            const addons = [];
            Object.keys(items).forEach(function (key) {
                if (key.indexOf(STORAGE_PREFIX) === 0) {
                    addons.push(items[key]);
                }
            });
            sendResponse({ addons: addons });
        });
        return true;
    }
    return false;
});

console.log('[Injector BG] Service worker loaded');
