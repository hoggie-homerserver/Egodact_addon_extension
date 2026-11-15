// ============================================================
// EGODACT ADDON INJECTOR - BACKGROUND SERVICE WORKER
// ============================================================
// Injects marketplace addons into app.egodact.com.
//
// Strategy 1: chrome.userScripts.execute (Chrome 135+). Runs the
//             addon code in a user script world, which is exempt
//             from the page CSP. Needs the "Allow User Scripts"
//             toggle in chrome://extensions.
// Strategy 2: chrome.scripting.executeScript + eval in the
//             extension's isolated world (works when the page/
//             extension CSP allows eval).
//
// Every addon gets its OWN user script world (worldId per addon).
// That mirrors the old "one extension per addon" model, so global
// state cannot collide: chat and the group project each get their
// own window.firebase and their own default Firebase app.

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

function tabStateFor(tabId) {
    const key = String(tabId);
    if (!injectedTabs[key]) {
        injectedTabs[key] = { addons: {}, running: null };
    }
    return injectedTabs[key];
}

function worldIdFor(addonId) {
    return 'egodact-addon-' + String(addonId).replace(/[^A-Za-z0-9_-]/g, '-');
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

async function runInTab(tabId, codes, label, worldId) {
    if (!codes.length) return { ok: false, error: 'Geen code om te injecteren' };

    if (isUserScriptsAvailable()) {
        try {
            const injection = {
                target: { tabId: tabId },
                injectImmediately: true,
                js: codes.map(function (code) { return { code: code }; })
            };
            if (worldId) injection.worldId = worldId;
            const results = await chrome.userScripts.execute(injection);
            const errors = (results || []).map(function (r) { return r && r.error; }).filter(Boolean);
            if (errors.length) {
                logDebug('error', label + ' (userScripts): ' + errors.join(' | '));
                return { ok: false, strategy: 'userScripts', error: errors.join(' | ') };
            }
            logDebug('info', label + ' geinjecteerd via userScripts in world ' + (worldId || 'default'));
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
    const state = tabStateFor(tabId);

    if (state.addons[addonData.id] === addonData.version) {
        return { ok: true, id: addonData.id, skipped: true, strategy: 'cached' };
    }

    const sdk = await getBundledSources();
    const files = orderedFiles(addonData);
    if (!files.length) {
        logDebug('error', 'Geen bestanden voor ' + addonData.id);
        return { ok: false, id: addonData.id, error: 'Geen addon-bestanden gevonden' };
    }

    const codes = [];
    // Host is up (we waited for it), so tell the SDK not to queue.
    codes.push('try { window.__egodactHostReady = true; } catch (e) {}');
    // Prefer the SDK that the addon itself ships; fall back to the copy
    // bundled with the host so addons do not have to include it.
    BUNDLED_FILES.forEach(function (file) {
        if (files.indexOf(file) !== -1) return;
        if (sdk[file]) codes.push(sdk[file]);
    });
    files.forEach(function (path) {
        codes.push('/* egodact addon file: ' + path + ' */\n' + addonData.files[path]);
    });

    const result = await runInTab(tabId, codes, addonData.id, worldIdFor(addonData.id));
    result.id = addonData.id;
    if (result.ok) state.addons[addonData.id] = addonData.version;
    return result;
}

// Serializes all injection work per tab. The content script retries
// contentReady a few times; without this a retry could start while a
// large addon (Firebase vendor bundles) is still being injected and
// run the same code twice in the same world, resetting globals such as
// window.firebase. Installs use the same queue, so a fresh install can
// never overlap a running batch either.
function queueInjection(tabId, task) {
    const state = tabStateFor(tabId);
    const run = (state.running || Promise.resolve()).catch(function () {}).then(task);
    state.running = run;
    run.then(function () {
        if (state.running === run) state.running = null;
    }, function () {
        if (state.running === run) state.running = null;
    });
    return run;
}

function injectAllAddons(tabId, force) {
    return queueInjection(tabId, async function () {
        const items = await chrome.storage.local.get(null);
        const addons = listInstalled(items);
        if (!addons.length) {
            logDebug('info', 'Geen addons geinstalleerd');
            return [];
        }

        const state = tabStateFor(tabId);
        if (force) state.addons = {};

        await waitForHost(tabId);

        const results = [];
        for (const addon of addons) {
            results.push(await injectAddon(tabId, addon));
        }
        return results;
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        delete injectedTabs[String(tabId)];
        return;
    }
    if (changeInfo.status !== 'complete') return;

    const url = (tab && tab.url) || '';
    if (url.indexOf(APP_ORIGIN) !== 0) return;

    delete injectedTabs[String(tabId)];
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
        // A repair must re-run the addon even when the version did not
        // change (the stored file list was stale), so the marketplace
        // marks those installs as forced.
        const forceInject = !!(raw.force);

        chrome.storage.local.set({ [key]: record }).then(async function () {
            logDebug('info', 'Addon opgeslagen: ' + record.id + ' v' + record.version);
            const tabs = await chrome.tabs.query({ url: APP_ORIGIN + '/*' });
            const results = [];
            for (const tab of tabs) {
                results.push(await queueInjection(tab.id, async function () {
                    const state = tabStateFor(tab.id);
                    if (!forceInject && state.addons[record.id] === record.version) {
                        return { ok: true, id: record.id, skipped: true, strategy: 'cached' };
                    }
                    delete state.addons[record.id];
                    return injectAddon(tab.id, record);
                }));
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
                delete injectedTabs[tabKey].addons[addonId];
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
                    world: worldIdFor(addon.id),
                    missing: (addon.order || []).filter(function (p) { return !addon.files[p]; }),
                    bytes: JSON.stringify(addon.files).length
                };
            });
            const state = typeof senderTabId === 'number' ? tabStateFor(senderTabId) : null;
            const report = {
                userScripts: isUserScriptsAvailable(),
                addons: addons,
                injectedInThisTab: state ? state.addons : {},
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
