// ============================================================
// KEYBOARD SHORTCUTS (core) — stap 1-5
// ============================================================
(function (global) {
    'use strict';

    const STORAGE_KEY = 'egodact_shortcuts_v1';
    const isMac = /Mac|iPhone|iPad|iPod/.test((navigator && (navigator.platform || navigator.userAgent)) || '');
    const MOD_LABEL = isMac ? 'Cmd' : 'Ctrl';

    function modKey(e) { return isMac ? e.metaKey : e.ctrlKey; }

    // ---------- platform-aware combo helpers ----------
    function normalizeKey(e) {
        // Return a canonical key name from a KeyboardEvent.
        const key = (e.key || '').toLowerCase();
        const special = {
            ' ': 'space', 'arrowup': 'arrowup', 'arrowdown': 'arrowdown',
            'arrowleft': 'arrowleft', 'arrowright': 'arrowright',
            'escape': 'escape', 'enter': 'enter', 'tab': 'tab',
            'backspace': 'backspace', 'delete': 'delete',
        };
        if (special[key]) return special[key];
        if (key.length === 1) return key;
        return key; // fallback (e.g. f1)
    }

    function comboFromEvent(e) {
        const parts = [];
        if (modKey(e)) parts.push('mod');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        const k = normalizeKey(e);
        if (k && !['control', 'meta', 'alt', 'shift'].includes(k)) parts.push(k);
        return parts.join('+');
    }

    function comboDisplay(combo) {
        if (!combo) return '—';
        const isMacLocal = isMac;
        return combo.split('+').map(function (p) {
            if (p === 'mod') return isMacLocal ? '⌘' : 'Ctrl';
            if (p === 'alt') return isMacLocal ? '⌥' : 'Alt';
            if (p === 'shift') return isMacLocal ? '⇧' : 'Shift';
            if (p === 'space') return 'Space';
            if (p === 'escape') return 'Esc';
            if (p === 'arrowup') return '↑';
            if (p === 'arrowdown') return '↓';
            if (p === 'arrowleft') return '←';
            if (p === 'arrowright') return '→';
            return p.toUpperCase();
        }).join(isMacLocal ? '' : '+');
    }

    // ---------- storage ----------
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { combos: {}, enabled: true };
            const parsed = JSON.parse(raw);
            return { combos: parsed.combos || {}, enabled: parsed.enabled !== false };
        } catch (e) { return { combos: {}, enabled: true }; }
    }
    function saveState() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ combos: state.combos, enabled: state.enabled })); } catch (e) {}
    }

    const state = loadState();

    // ---------- registry ----------
    // id -> { id, title, combo, defaultCombo, scope, source, action, allowInInput, keep }
    const registry = {};

    function registerShortcut(meta) {
        meta = meta || {};
        if (!meta.id) return null;
        const id = String(meta.id);
        const defaultCombo = meta.keys ? String(meta.keys).toLowerCase() : '';
        const combo = state.combos[id] || defaultCombo;
        registry[id] = {
            id: id,
            title: meta.title || id,
            combo: combo,
            defaultCombo: defaultCombo,
            scope: meta.scope || 'global',
            source: meta.source || 'core',
            action: typeof meta.action === 'function' ? meta.action : null,
            allowInInput: !!meta.allowInInput,
            enabled: meta.enabled !== false
        };
        return registry[id];
    }

    function unregisterShortcut(id) {
        delete registry[id];
        if (state.combos[id]) { delete state.combos[id]; saveState(); }
    }

    function setShortcutKeys(id, newCombo, opts) {
        opts = opts || {};
        newCombo = String(newCombo || '').toLowerCase().trim();
        if (!registry[id]) return { ok: false, reason: 'unknown' };
        const conflict = Object.keys(registry).find(function (k) {
            return k !== id && registry[k].combo === newCombo && newCombo;
        });
        if (conflict && !opts.override) {
            return { ok: false, reason: 'conflict', conflictId: conflict };
        }
        if (conflict && opts.override) {
            delete state.combos[conflict];
            registry[conflict].combo = registry[conflict].defaultCombo;
            state.combos[conflict] = registry[conflict].defaultCombo;
        }
        registry[id].combo = newCombo;
        state.combos[id] = newCombo;
        saveState();
        return { ok: true, overridden: !!conflict };
    }

    function resetShortcut(id) {
        if (!registry[id]) return;
        delete state.combos[id];
        registry[id].combo = registry[id].defaultCombo;
        saveState();
    }

    function resetAll() {
        Object.keys(registry).forEach(function (id) {
            delete state.combos[id];
            registry[id].combo = registry[id].defaultCombo;
        });
        saveState();
    }

    function isShortcutsEnabled() { return state.enabled !== false; }
    function setShortcutsEnabled(v) { state.enabled = !!v; saveState(); }

    function getShortcuts() {
        return Object.keys(registry).map(function (id) {
            const r = registry[id];
            return {
                id: r.id,
                title: r.title,
                combo: r.combo,
                defaultCombo: r.defaultCombo,
                display: comboDisplay(r.combo),
                scope: r.scope,
                source: r.source,
                enabled: r.enabled
            };
        });
    }

    function findConflict(combo) {
        const ids = Object.keys(registry).filter(function (k) { return registry[k].combo === combo && combo; });
        return ids.length > 1 ? ids : null;
    }

    // ---------- keydown handler ----------
    function isEditable(target) {
        if (!target) return false;
        const tag = (target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
        if (target.isContentEditable) return true;
        return false;
    }

    function currentScopeOk(scope) {
        if (scope === 'global') return true;
        // best-effort: check if a modal/panel for that scope is open
        if (scope === 'weekplanning') return !!document.getElementById('egodact-weekplanning-wrap');
        if (scope === 'challenges') return !!document.querySelector('[data-egodact-view="challenges"]');
        return true;
    }

    function handleKeydown(e) {
        if (!state.enabled) return;
        if (global.__egodactShortcutCapturing) return;
        const combo = comboFromEvent(e);
        if (!combo) return;

        // find matching shortcut
        const match = Object.keys(registry).map(function (id) { return registry[id]; })
            .find(function (r) {
                return r.enabled && r.combo && r.combo === combo;
            });
        if (!match) return;

        if (isEditable(e.target) && !match.allowInInput) return;
        if (!currentScopeOk(match.scope)) return;

        e.preventDefault();
        e.stopPropagation();
        try {
            if (typeof match.action === 'function') match.action(e);
            else if (typeof egodactShortcutDispatched === 'function') egodactShortcutDispatched(match.id);
        } catch (err) { console.error('Shortcut action failed:', err); }
    }

    // ---------- modal UI ----------
    function egodactToonToast(msg, opts) {
        if (typeof global.egodactToonToast === 'function') global.egodactToonToast(msg, opts);
        else console.log(msg);
    }

    let capturingFor = null;
    function openShortcutsModal() {
        const bestaand = document.getElementById('egodact-shortcuts-modal');
        if (bestaand) bestaand.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'egodact-shortcuts-modal';
        backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:inherit;';
        const modal = document.createElement('div');
        modal.style.cssText = 'background:var(--egd-modal,#424242);color:var(--egd-tekst,#fff);width:min(620px,calc(100vw-32px));max-height:calc(100vh-32px);overflow:auto;border-radius:8px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,.4);';
        backdrop.appendChild(modal);

        const head = document.createElement('div');
        head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
        const title = document.createElement('h2');
        title.textContent = 'Sneltoetsen';
        title.style.cssText = 'margin:0;font-size:18px;';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Sluiten';
        closeBtn.style.cssText = 'padding:6px 12px;border:none;border-radius:4px;background:var(--egd-accent,#90caf9);color:var(--egd-accent-tekst,#0d47a1);cursor:pointer;font-weight:bold;';
        closeBtn.addEventListener('click', function () { global.__egodactShortcutCapturing = false; backdrop.remove(); });
        head.append(title, closeBtn);
        modal.appendChild(head);

        // master toggle
        const masterRow = document.createElement('div');
        masterRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--egd-rand,#555);margin-bottom:10px;';
        const masterLabel = document.createElement('span');
        masterLabel.textContent = 'Shortcuts ingeschakeld';
        const masterToggle = document.createElement('input');
        masterToggle.type = 'checkbox';
        masterToggle.checked = isShortcutsEnabled();
        masterToggle.addEventListener('change', function () {
            setShortcutsEnabled(masterToggle.checked);
            renderList();
        });
        masterRow.append(masterLabel, masterToggle);
        modal.appendChild(masterRow);

        const hint = document.createElement('p');
        hint.style.cssText = 'font-size:12px;color:var(--egd-tekst-zacht,#b0b0b0);margin:0 0 10px;';
        hint.textContent = 'Platform: ' + (isMac ? 'macOS (⌘)' : 'Windows/Linux (Ctrl)') + '. Klik "Wijzig" en druk een nieuwe combinatie.';
        modal.appendChild(hint);

        const listWrap = document.createElement('div');
        modal.appendChild(listWrap);

        function renderList() {
            listWrap.innerHTML = '';
            const items = getShortcuts();
            // group by source
            const groups = {};
            items.forEach(function (s) {
                const g = s.source || 'core';
                if (!groups[g]) groups[g] = [];
                groups[g].push(s);
            });
            Object.keys(groups).forEach(function (g) {
                const gh = document.createElement('h3');
                gh.textContent = g === 'core' ? 'Ingebouwd' : g;
                gh.style.cssText = 'font-size:13px;margin:10px 0 4px;color:var(--egd-accent,#90caf9);';
                listWrap.appendChild(gh);
                groups[g].forEach(function (s) {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--egd-rand,#555);gap:8px;';
                    const left = document.createElement('div');
                    const t = document.createElement('div');
                    t.textContent = s.title;
                    t.style.cssText = 'font-size:13px;';
                    const sub = document.createElement('div');
                    sub.textContent = s.id + (s.scope !== 'global' ? ' · ' + s.scope : '');
                    sub.style.cssText = 'font-size:11px;color:var(--egd-tekst-zacht,#b0b0b0);';
                    left.append(t, sub);
                    const right = document.createElement('div');
                    right.style.cssText = 'display:flex;align-items:center;gap:6px;';
                    const keyBadge = document.createElement('span');
                    keyBadge.textContent = s.display;
                    keyBadge.style.cssText = 'font-family:monospace;font-size:12px;padding:2px 8px;border:1px solid var(--egd-rand,#555);border-radius:4px;background:var(--egd-veld,#2e2e2e);';
                    const editBtn = document.createElement('button');
                    editBtn.textContent = capturingFor === s.id ? 'Druk toetsen…' : 'Wijzig';
                    editBtn.style.cssText = 'padding:4px 8px;font-size:12px;border:1px solid var(--egd-rand,#555);border-radius:4px;background:transparent;color:var(--egd-tekst,#fff);cursor:pointer;';
                    editBtn.addEventListener('click', function () {
                        if (capturingFor === s.id) { capturingFor = null; global.__egodactShortcutCapturing = false; renderList(); return; }
                        capturingFor = s.id;
                        global.__egodactShortcutCapturing = true;
                        renderList();
                    });
                    const resetBtn = document.createElement('button');
                    resetBtn.textContent = '↺';
                    resetBtn.title = 'Herstel standaard';
                    resetBtn.style.cssText = 'padding:4px 8px;font-size:12px;border:1px solid var(--egd-rand,#555);border-radius:4px;background:transparent;color:var(--egd-tekst,#fff);cursor:pointer;';
                    resetBtn.addEventListener('click', function () {
                        resetShortcut(s.id);
                        egodactToonToast('Hersteld: ' + s.title, { type: 'info' });
                        renderList();
                    });
                    right.append(keyBadge, editBtn, resetBtn);
                    row.append(left, right);
                    listWrap.appendChild(row);
                });
            });
            // conflict warning
            const conflicts = Object.keys(registry).map(function (id) {
                const c = findConflict(registry[id].combo);
                return c ? { id: id, combo: registry[id].combo, ids: c } : null;
            }).filter(Boolean);
            const seen = new Set();
            conflicts.forEach(function (c) {
                const k = c.combo + c.ids.join(',');
                if (seen.has(k)) return; seen.add(k);
                const w = document.createElement('div');
                w.style.cssText = 'margin-top:8px;padding:8px;border:1px solid var(--egd-gevaar,#ef5350);border-radius:6px;color:var(--egd-gevaar,#ef5350);font-size:12px;';
                w.textContent = 'Conflict: ' + c.ids.join(' & ') + ' gebruiken beide ' + comboDisplay(c.combo) + '.';
                listWrap.appendChild(w);
            });
        }

        renderList();

        // capture keypress for editing
        const captureHandler = function (e) {
            if (!capturingFor) return;
            e.preventDefault();
            e.stopPropagation();
            const combo = comboFromEvent(e);
            if (!combo) return;
            // ignore bare modifiers
            if (['mod', 'alt', 'shift'].includes(combo)) return;
            if (combo === 'escape') { capturingFor = null; global.__egodactShortcutCapturing = false; renderList(); return; }
            const res = setShortcutKeys(capturingFor, combo);
            if (res.ok) {
                if (res.overridden) egodactToonToast('Opgeslagen (andere shortcut gereset)', { type: 'info' });
                else egodactToonToast('Opgeslagen', { type: 'success' });
            } else if (res.reason === 'conflict') {
                const other = res.conflictId;
                const ok = confirm('Deze combinatie wordt al gebruikt door "' + other + '". Overschrijven? (De andere wordt gereset naar standaard.)');
                if (ok) {
                    const r2 = setShortcutKeys(capturingFor, combo, { override: true });
                    if (r2.ok) egodactToonToast('Opgeslagen (overschreven)', { type: 'success' });
                } else {
                    egodactToonToast('Geannuleerd', { type: 'info' });
                }
            }
            capturingFor = null;
            global.__egodactShortcutCapturing = false;
            renderList();
        };
        function docCapture(e) { if (capturingFor) captureHandler(e); }
        document.addEventListener('keydown', docCapture, true);
        backdrop.addEventListener('egodact-shortcuts-close', function () { document.removeEventListener('keydown', docCapture, true); });

        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex;justify-content:space-between;margin-top:12px;';
        const resetAllBtn = document.createElement('button');
        resetAllBtn.textContent = 'Herstel alles';
        resetAllBtn.style.cssText = 'padding:6px 12px;border:1px solid var(--egd-rand,#555);border-radius:4px;background:transparent;color:var(--egd-tekst,#fff);cursor:pointer;';
        resetAllBtn.addEventListener('click', function () {
            resetAll();
            egodactToonToast('Alle shortcuts hersteld', { type: 'info' });
            renderList();
        });
        const enabledInfo = document.createElement('span');
        enabledInfo.style.cssText = 'font-size:12px;color:var(--egd-tekst-zacht,#b0b0b0);align-self:center;';
        enabledInfo.textContent = 'Master switch hierboven.';
        footer.append(resetAllBtn, enabledInfo);
        modal.appendChild(footer);

        backdrop.addEventListener('click', function (e) { if (e.target === backdrop) { global.__egodactShortcutCapturing = false; backdrop.remove(); } });
        document.body.appendChild(backdrop);
        // focus for key capture
        modal.tabIndex = -1;
        modal.focus();
    }

    // ---------- init core shortcuts ----------
    function registerCoreShortcuts() {
        registerShortcut({ id: 'core.shortcuts.settings', title: 'Sneltoetsen openen', keys: 'alt+shift+/', scope: 'global', source: 'core', action: function () { openShortcutsModal(); } });
        registerShortcut({ id: 'core.weekplanning', title: 'Weekplanning openen', keys: 'alt+shift+w', scope: 'global', source: 'core', action: function () {
            try { if (typeof openWeekplanning === 'function') openWeekplanning(); } catch (e) {}
        }});
        registerShortcut({ id: 'core.challenges', title: 'Challenges openen', keys: 'alt+shift+c', scope: 'global', source: 'core', action: function () {
            try {
                const btn = document.querySelector('[data-egodact-view="challenges"], #egodact-challenges-knop');
                if (btn) btn.click();
            } catch (e) {}
        }});
        registerShortcut({ id: 'core.search', title: 'Zoeken focussen', keys: 'alt+shift+f', scope: 'global', source: 'core', allowInInput: false, action: function () {
            try {
                const el = document.querySelector('input[type="search"], #egodact-zoekveld');
                if (el) el.focus();
            } catch (e) {}
        }});
        registerShortcut({ id: 'core.closeModal', title: 'Sluiten (Escape)', keys: 'escape', scope: 'global', source: 'core', action: function () {
            const bd = document.getElementById('egodact-custom-modal-backdrop') || document.getElementById('egodact-weekplanning-backdrop') || document.getElementById('egodact-shortcuts-modal');
            if (bd && bd.parentNode) bd.remove();
        }});
    }

    // ---------- expose ----------
    global.egodactRegisterShortcut = registerShortcut;
    global.egodactUnregisterShortcut = unregisterShortcut;
    global.egodactSetShortcutKeys = setShortcutKeys;
    global.egodactGetShortcuts = getShortcuts;
    global.egodactResetShortcut = resetShortcut;
    global.egodactResetAllShortcuts = resetAll;
    global.egodactShortcutsEnabled = isShortcutsEnabled;
    global.egodactSetShortcutsEnabled = setShortcutsEnabled;
    global.egodactOpenShortcutsModal = openShortcutsModal;
    global.egodactShortcutComboDisplay = comboDisplay;
    global.egodactIsMac = isMac;

    // ---------- init ----------
    registerCoreShortcuts();

    document.addEventListener('keydown', handleKeydown, true);

    // ---------- hamburger integration hook ----------
    // Expose a flag so buttons.js knows shortcuts are available.
    global.__egodactShortcutsReady = true;

})(typeof window !== 'undefined' ? window : this);
