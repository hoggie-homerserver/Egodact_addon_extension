// ============================================================
// EGODACT ADDON INJECTOR — BACKGROUND SERVICE WORKER
// ============================================================

const STORAGE_PREFIX = 'egodact_marketplace_addon_';

function injectAddonIntoTab(tabId, addonData) {
    const entryPoint = addonData.entryPoint || 'content.js';
    const code = addonData.files && addonData.files[entryPoint];
    if (!code) {
        console.warn('[Injector BG] No entry point found for', addonData.id);
        return;
    }
    console.log('[Injector BG] Injecting', addonData.id, 'into tab', tabId, 'code length:', code.length);

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        world: 'ISOLATED',
        func: function (code, addonId) {
            console.log('[Injected] Running for', addonId, 'client available:', typeof window.EgodactAddonClient);
            try {
                (0, eval)(code);
                console.log('[Injected] Success:', addonId);
            } catch (e) {
                console.error('[Injected] Failed:', addonId, e.message, e.stack);
            }
        },
        args: [code, addonData.id]
    }, function (results) {
        if (chrome.runtime.lastError) {
            console.error('[Injector BG] executeScript error:', chrome.runtime.lastError.message);
        } else {
            console.log('[Injector BG] executeScript done for', addonData.id, results);
        }
    });
}

function injectAllAddons(tabId) {
    chrome.storage.local.get(null, function (items) {
        if (chrome.runtime.lastError) {
            console.error('[Injector BG] Storage read failed:', chrome.runtime.lastError);
            return;
        }
        const addonIds = Object.keys(items).filter(function (key) {
            return key.indexOf(STORAGE_PREFIX) === 0;
        });
        console.log('[Injector BG] Found', addonIds.length, 'installed addons:', addonIds);
        addonIds.forEach(function (key) {
            const addonData = items[key];
            if (addonData && addonData.id && addonData.files) {
                injectAddonIntoTab(tabId, addonData);
            } else {
                console.warn('[Injector BG] Invalid addon data for', key);
            }
        });
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete') return;
    if (!tab.url || tab.url.indexOf('https://app.egodact.com') !== 0) return;
    console.log('[Injector BG] Tab updated:', tabId, tab.url);
    setTimeout(function () {
        injectAllAddons(tabId);
    }, 1000);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log('[Injector BG] Message received:', message.type);
    if (message.type === 'injector:install') {
        const addonData = message.addonData;
        if (addonData && addonData.id) {
            const key = STORAGE_PREFIX + addonData.id;
            chrome.storage.local.set({ [key]: addonData }, function () {
                if (chrome.runtime.lastError) {
                    console.error('[Injector BG] Storage set failed:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    console.log('[Injector BG] Stored addon:', addonData.id);
                    chrome.tabs.query({ url: 'https://app.egodact.com/*' }, function (tabs) {
                        console.log('[Injector BG] Found', tabs.length, 'app tabs');
                        tabs.forEach(function (tab) {
                            injectAddonIntoTab(tab.id, addonData);
                        });
                    });
                    sendResponse({ success: true });
                }
            });
            return true;
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
                    console.log('[Injector BG] Uninstalled addon:', addonId);
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
            const installed = !!(items && items[key]);
            console.log('[Injector BG] isInstalled', addonId, installed);
            sendResponse({ installed: installed });
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
