// ============================================================
// EGODACT ADDON INJECTOR - BACKGROUND SERVICE WORKER
// ============================================================
// Injects marketplace addons into app.egodact.com.
//
// Strategy 1: chrome.userScripts.execute (Chrome 135+). Runs the
//             addon code in the USER_SCRIPT world, which is exempt
//             from the page CSP. Needs the "Allow User Scripts"
//             toggle in chrome://extensions.
// Strategy 2: chrome.scripting.executeScript + eval in the
//             extension's isolated world (works when the page/
//             extension CSP allows eval).
//
// The addon SDK (sdk.js + lib.js) is bundled with the host and is
// always injected first, so addons do not have to ship it.

const STORAGE_PREFIX = 'egodact_marketplace_addon_';
const APP_ORIGIN = 'https://app.egodact.com';
const BUNDLED_FILES = ['sdk.js', 'lib.js'];
const MAX_LOG = 300;

const debugLog = [];
const injectedTabs = {};

function logDebug(level, msg) {
    const line = '[' + level + '] ' + msg;
    debugLog.push({ t: Date.now(), line: line });
    if (debugLog.length > MAX_LOG) debugLog.shift();
    if (level === 'error') console.error('[Injector]', msg);
    else if (level === 'warn') console.warn('[Injector]', msg);
    else console.log('[Injector]', msg);
}

let bundledSourcePromise = null;

function getBundledSources() {
    if (!bundledSourcePromise) {
        bundledSourcePromise = Promise.all(BUNDLED_FILES.map(function (file) {
            return fetch(chrome.runtime.getURL(file))
                .then(function (res) { return res.text(); })
                .then(function (text) { return { file: file, text: text }; })
                .catch(function (err) {
                    logDebug('warn', 'Kon ' + file + ' niet laden: ' + err.message);
                    return { file: file, text: '' };
                });
        })).then(function (entries) {
            const map = {};
            entries.forEach(function (entry) { map[entry.file] = entry.text; });
            return map;
        });
    }
    return bundledSourcePromise;
}

function isUserScriptsAvailable() {
    try {
        if (!chrome.userScripts || typeof chrome.userScripts.execute !== 'function') return false;
        const pending = chrome.userScripts.getScripts();
        if (pending && typeof pending.catch === 'function') pending.catch(function () {});
        return true;
    } catch (err) {
        return false;
    }
}

function listInstalled(items) {
    const list = [];
    Object.keys(items || {}).forEach(function (key) {
        if (key.indexOf(STORAGE_PREFIX) !== 0) return;
        const value = items[key];
        if (value && value.id && value.files) list.push(value);
    });
    return list;
}

function orderedFiles(addonData) {
    const files = addonData.files || {};
    const order = (Array.isArray(addonData.order) && addonData.order.length)
        ? addonData.order.slice()
        : Object.keys(files);
    const seen = {};
    const list = [];

    order.forEach(function (path) {
        if (!path || seen[path]) return;
        seen[path] = true;
        if (typeof files[path] === 'string' && files[path].length) list.push(path);
        else logDebug('warn', 'Bestand ontbreekt: ' + path + ' (' + addonData.id + ')');
    });

    Object.keys(files).forEach(function (path) {
        if (seen[path]) return;
        seen[path] = true;
        if (typeof files[path] === 'string' && files[path].length) list.push(path);
    });

    return list;
}

async function runInTab(tabId, codes, label) {
    if (!codes.length) return { ok: false, error: 'Geen code om te injecteren' };

    if (isUserScriptsAvailable()) {
        try {
            const results = await chrome.userScripts.execute({
                target: { tabId: tabId },
                injectImmediately: true,
                js: codes.map(function (code) { return { code: code }; })
            });
            const errors = (results || []).map(function (r) { return r && r.error; }).filter(Boolean);
            if (errors.length) {
                logDebug('error', label + ' (userScripts): ' + errors.join(' | '));
                return { ok: false, strategy: 'userScripts', error: errors.join(' | ') };
            }
            logDebug('info', label + ' geinjecteerd via userScripts');
            return { ok: true, strategy: 'userScripts' };
        } catch (err) {
            logDebug('warn', label + ' userScripts mislukt: ' + err.message);
        }
    } else {
        logDebug('warn', 'userScripts niet beschikbaar (toggle staat uit)');
    }

    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            world: 'ISOLATED',
            args: [codes.join('\n;\n')],
            func: function (src) {
                try {
                    (0, eval)(src);
                    return { ok: true };
                } catch (err) {
                    return { ok: false, error: String((err && err.message) || err) };
                }
            }
        });
        const result = results && results[0] && results[0].result;
        if (result && result.ok) {
            logDebug('info', label + ' geinjecteerd via scripting/eval');
            return { ok: true, strategy: 'scripting-eval' };
        }
        const message = (result && result.error) || 'Onbekende fout';
        logDebug('error', label + ' (scripting/eval): ' + message);
        return { ok: false, strategy: 'scripting-eval', error: message };
    } catch (err) {
        logDebug('error', label + ' scripting mislukt: ' + err.message);
        return { ok: false, strategy: 'scripting', error: err.message };
    }
}

async function probeTab(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            world: 'ISOLATED',
            func: function () {
                return {
                    host: typeof window.EgodactAddons !== 'undefined',
                    ready: window.__egodactHostReady === true
                };
            }
        });
        return (results && results[0] && results[0].result) || null;
    } catch (err) {
        return null;
    }
}

async function waitForHost(tabId) {
    for (let attempt = 0; attempt < 6; attempt++) {
        const probe = await probeTab(tabId);
        if (probe && probe.host) return probe;
        await new Promise(function (resolve) { setTimeout(resolve, 300 + attempt * 400); });
    }
    return null;
}

async function injectAddon(tabId, addonData) {
    const key = String(tabId);
    const tabState = injectedTabs[key] || (injectedTabs[key] = {});

    if (tabState[addonData.id] === addonData.version) {
        return { ok: true, id: addonData.id, skipped: true, strategy: 'cached' };
    }

    const sdk = await getBundledSources();
    const files = orderedFiles(addonData);
    if (!files.length) {
        logDebug('error', 'Geen bestanden voor ' + addonData.id);
        return { ok: false, id: addonData.id, error: 'Geen addon-bestanden gevonden' };
    }

    const codes = [];
    // Prefer the SDK that the addon itself ships; fall back to the copy
    // bundled with the host so addons do not have to include it.
    BUNDLED_FILES.forEach(function (file) {
        if (files.indexOf(file) !== -1) return;
        if (sdk[file]) codes.push(sdk[file]);
    });
    files.forEach(function (path) {
        codes.push('/* egodact addon file: ' + path + ' */\n' + addonData.files[path]);
    });

    const result = await runInTab(tabId, codes, addonData.id);
    result.id = addonData.id;
    if (result.ok) tabState[addonData.id] = addonData.version;
    return result;
}

async function injectAllAddons(tabId, force) {
    const items = await chrome.storage.local.get(null);
    const addons = listInstalled(items);
    if (!addons.length) {
        logDebug('info', 'Geen addons geinstalleerd');
        return [];
    }

    if (force) injectedTabs[String(tabId)] = {};
    await waitForHost(tabId);

    const results = [];
    for (const addon of addons) {
        results.push(await injectAddon(tabId, addon));
    }
    return results;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        injectedTabs[String(tabId)] = {};
        return;
    }
    if (changeInfo.status !== 'complete') return;

    const url = (tab && tab.url) || '';
    if (url.indexOf(APP_ORIGIN) !== 0) return;

    injectedTabs[String(tabId)] = {};
    setTimeout(function () {
        injectAllAddons(tabId).catch(function (err) {
            logDebug('error', 'Injectie na paginalading mislukt: ' + err.message);
        });
    }, 600);
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    delete injectedTabs[String(tabId)];
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    const type = message && message.type;
    if (!type) return false;

    const senderTabId = sender && sender.tab && sender.tab.id;
    const senderUrl = (sender && sender.tab && sender.tab.url) || '';

    if (type === 'injector:contentReady') {
        if (typeof senderTabId === 'number' && senderUrl.indexOf(APP_ORIGIN) === 0) {
            injectAllAddons(senderTabId).then(function (results) {
                sendResponse({ success: true, results: results });
            }).catch(function (err) {
                sendResponse({ success: false, error: err.message });
            });
            return true;
        }
        sendResponse({ success: true, results: [] });
        return false;
    }

    if (type === 'injector:capabilities') {
        sendResponse({
            userScripts: isUserScriptsAvailable(),
            hasUserScriptsApi: !!(chrome.userScripts && chrome.userScripts.execute)
        });
        return false;
    }

    if (type === 'injector:install') {
        const raw = message.addonData || {};
        if (!raw.id) {
            sendResponse({ success: false, error: 'Geen addon-id' });
            return false;
        }
        const record = {
            id: raw.id,
            name: raw.name || raw.id,
            version: raw.version || '0.0.0',
            order: Array.isArray(raw.order) ? raw.order : [],
            files: raw.files || {},
            installedAt: Date.now()
        };
        const key = STORAGE_PREFIX + record.id;

        chrome.storage.local.set({ [key]: record }).then(async function () {
            logDebug('info', 'Addon opgeslagen: ' + record.id + ' v' + record.version);
            const tabs = await chrome.tabs.query({ url: APP_ORIGIN + '/*' });
            const results = [];
            for (const tab of tabs) {
                injectedTabs[String(tab.id)] = {};
                results.push(await injectAddon(tab.id, record));
            }
            sendResponse({ success: true, results: results, tabs: tabs.length });
        }).catch(function (err) {
            logDebug('error', 'Opslaan mislukt: ' + err.message);
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }

    if (type === 'injector:uninstall') {
        const addonId = message.addonId;
        if (!addonId) {
            sendResponse({ success: false, error: 'Geen addon-id' });
            return false;
        }
        chrome.storage.local.remove(STORAGE_PREFIX + addonId).then(function () {
            Object.keys(injectedTabs).forEach(function (tabKey) {
                delete injectedTabs[tabKey][addonId];
            });
            logDebug('info', 'Addon verwijderd: ' + addonId);
            sendResponse({ success: true });
        }).catch(function (err) {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }

    if (type === 'injector:isInstalled') {
        const key = STORAGE_PREFIX + message.addonId;
        chrome.storage.local.get(key).then(function (items) {
            const record = items && items[key];
            sendResponse({
                installed: !!record,
                version: record ? record.version : null,
                fileCount: record ? Object.keys(record.files || {}).length : 0
            });
        }).catch(function () {
            sendResponse({ installed: false });
        });
        return true;
    }

    if (type === 'injector:list') {
        chrome.storage.local.get(null).then(function (items) {
            sendResponse({ addons: listInstalled(items) });
        }).catch(function () {
            sendResponse({ addons: [] });
        });
        return true;
    }

    if (type === 'injector:reinject') {
        const tabId = typeof message.tabId === 'number' ? message.tabId : senderTabId;
        if (typeof tabId !== 'number') {
            sendResponse({ success: false, error: 'Geen tab' });
            return false;
        }
        injectAllAddons(tabId, true).then(function (results) {
            sendResponse({ success: true, results: results });
        }).catch(function (err) {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }

    if (type === 'injector:diagnose') {
        (async function () {
            const items = await chrome.storage.local.get(null);
            const addons = listInstalled(items).map(function (addon) {
                const paths = orderedFiles(addon);
                return {
                    id: addon.id,
                    version: addon.version,
                    files: paths.length,
                    missing: (addon.order || []).filter(function (p) { return !addon.files[p]; }),
                    bytes: JSON.stringify(addon.files).length
                };
            });
            const report = {
                userScripts: isUserScriptsAvailable(),
                addons: addons,
                injectedInThisTab: typeof senderTabId === 'number' ? (injectedTabs[String(senderTabId)] || {}) : {},
                host: typeof senderTabId === 'number' ? await probeTab(senderTabId) : null,
                log: debugLog.slice(-40).map(function (entry) { return entry.line; })
            };
            sendResponse(report);
        })();
        return true;
    }

    return false;
});

logDebug('info', 'Service worker geladen');
