// Dev/event logger: captures Egodact addon events and forwards to background for devtools viewer.
(function () {
    'use strict';
    if (window.__egodactDevLoggerInstalled) return;
    window.__egodactDevLoggerInstalled = true;

    const MAX_QUEUE = 200;
    let queue = [];
    let flushTimer = null;

    function safeStringify(value, depth) {
        depth = depth || 0;
        if (value === null || typeof value === 'undefined') return String(value);
        const t = typeof value;
        if (t === 'string') return value.length > 2000 ? value.slice(0, 2000) + '…' : value;
        if (t === 'number' || t === 'boolean') return String(value);
        if (t === 'function') return '[Function]';
        if (depth > 3) return '[Object]';
        if (Array.isArray(value)) {
            try { return '[' + value.slice(0, 20).map(function (v) { return safeStringify(v, depth + 1); }).join(', ') + (value.length > 20 ? ', …' : '') + ']'; } catch (e) { return '[Array]'; }
        }
        if (t === 'object') {
            try {
                if (typeof Node !== 'undefined' && value instanceof Node) return '[Node ' + (value.nodeName || '') + ']';
                if (value instanceof Error) return value.name + ': ' + value.message;
                const out = {};
                const keys = Object.keys(value).slice(0, 20);
                keys.forEach(function (k) { try { out[k] = safeStringify(value[k], depth + 1); } catch (e) { out[k] = '[unreadable]'; } });
                return JSON.stringify(out);
            } catch (e) { return '[Object]'; }
        }
        try { return String(value); } catch (e) { return '[' + t + ']'; }
    }

    function addonIdFrom(detail) {
        if (!detail || typeof detail !== 'object') return null;
        const meta = detail.meta || detail;
        return detail.addonId || meta.addonId || (detail.type === 'addon' ? meta.id : null) || null;
    }

    function push(entry) {
        try {
            entry.t = Date.now();
            queue.push(entry);
            if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
            scheduleFlush();
        } catch (e) {}
    }

    function scheduleFlush() {
        if (flushTimer) return;
        flushTimer = setTimeout(flush, 120);
    }

    function flush() {
        flushTimer = null;
        if (!queue.length) return;
        const batch = queue.splice(0, queue.length);
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ type: 'devlog:push', entries: batch }, function () {
                    try { void chrome.runtime.lastError; } catch (e) {}
                });
            }
        } catch (e) {}
    }

    const loggedEventIds = new Set();
    let loggedSeq = 0;
    function logCustomEvent(event, sourceTag) {
        try {
            if (!event) return;
            const name = event.type || '';
            if (name.indexOf('egodact:') !== 0) return;
            // Dedupe: dispatch wrapper (same world) + capture listener (cross-world) can both see it
            if (!event.__egdDevLogId) {
                try { event.__egdDevLogId = 'e' + (++loggedSeq) + '_' + Date.now(); } catch (e2) { event.__egdDevLogId = 'e' + (++loggedSeq); }
            }
            const dedupeKey = event.__egdDevLogId + ':' + name;
            if (loggedEventIds.has(dedupeKey)) return;
            loggedEventIds.add(dedupeKey);
            if (loggedEventIds.size > 1000) {
                const it = loggedEventIds.values();
                for (let i = 0; i < 400; i++) { const n = it.next(); if (n.done) break; loggedEventIds.delete(n.value); }
            }
            const detail = event.detail;
            const meta = detail && detail.meta ? detail.meta : detail;
            push({
                kind: 'event', level: 'info', name: name,
                subType: detail && detail.type ? detail.type : null,
                addonId: addonIdFrom(detail),
                id: (meta && (meta.id || meta.requestId)) || (detail && detail.id) || null,
                summary: name + (detail && detail.type ? ' (' + detail.type + ')' : ''),
                page: location.href,
                detail: safeStringify(detail, 0)
            });
        } catch (e) {}
    }

    const origDispatch = document.dispatchEvent;
    document.dispatchEvent = function (event) {
        try {
            if (event && typeof CustomEvent !== 'undefined' && event instanceof CustomEvent) {
                logCustomEvent(event, 'dispatch');
            }
        } catch (e) {}
        return origDispatch.apply(this, arguments);
    };

    // Capture listeners see CustomEvents dispatched from ANY world (including userScripts worlds)
    [
        'egodact:host:ready', 'egodact:addons:changed',
        'egodact:addon:register', 'egodact:addon:open',
        'egodact:addon:challenges:request', 'egodact:addon:challenges:response',
        'egodact:addon:toast', 'egodact:addon:shortcut'
    ].forEach(function (name) {
        document.addEventListener(name, function (event) { logCustomEvent(event, 'listener'); }, true);
    });

    function wrapConsole(level) {
        const orig = console[level];
        if (typeof orig !== 'function') return;
        console[level] = function () {
            try {
                const args = Array.prototype.slice.call(arguments);
                const text = args.map(function (a) { return safeStringify(a, 0); }).join(' ');
                if (text.indexOf('[Egodact') !== -1 || text.indexOf('egodact') !== -1 || text.indexOf('Addon') !== -1 || text.indexOf('[Injector') !== -1 || text.indexOf('[Marketplace') !== -1) {
                    push({ kind: 'console', level: level, name: 'console.' + level, subType: null, addonId: null, id: null, summary: text.slice(0, 240), detail: text, page: location.href });
                }
            } catch (e) {}
            return orig.apply(console, arguments);
        };
    }
    ['error', 'warn', 'info', 'log'].forEach(wrapConsole);

    window.addEventListener('error', function (event) {
        try {
            const msg = (event && event.message) ? event.message : 'Script error';
            const src = (event && event.filename) ? event.filename : '';
            if (msg.indexOf('egodact') !== -1 || msg.indexOf('Egodact') !== -1 || src.indexOf('egodact') !== -1 || src.indexOf('addon') !== -1) {
                push({ kind: 'error', level: 'error', name: 'window.error', subType: null, addonId: null, id: null, summary: msg, detail: msg + (src ? ' @ ' + src + ':' + (event.lineno || '') : ''), page: location.href });
            }
        } catch (e) {}
    });

    window.addEventListener('unhandledrejection', function (event) {
        try {
            const reason = event ? event.reason : null;
            const text = safeStringify(reason, 0);
            if (text.indexOf('egodact') !== -1 || text.indexOf('Egodact') !== -1 || text.indexOf('addon') !== -1) {
                push({ kind: 'error', level: 'error', name: 'unhandledrejection', subType: null, addonId: null, id: null, summary: text.slice(0, 240), detail: text, page: location.href });
            }
        } catch (e) {}
    });

    push({ kind: 'lifecycle', level: 'info', name: 'devlog:ready', subType: null, addonId: null, id: null, summary: 'Dev logger actief op ' + (location.href || ''), detail: '' });
})();