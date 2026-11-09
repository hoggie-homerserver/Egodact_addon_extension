// ============================================================
// EGODACT ADDON API
// ============================================================
// Dit bestand biedt een stabiele API voor addons. Addons zijn kleine
// JavaScript-bestanden die zich registreren via window.EgodactAddons.
// De API is bewust klein en thema-bewust: gebruik de helpers hieronder
// zodat je addon automatisch meebeweegt met donker/licht thema.
//
// Volgorde in manifest.json (content_scripts):
//   1. src/config.js
//   2. src/theme.js
//   3. src/addon-api.js
//   4. src/addons/*.js
//   5. overige core bestanden
//   6. src/main.js

function egodactAddonDisabled(id) {
    try {
        const raw = localStorage.getItem('egodact_disabled_addons');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) && list.indexOf(id) !== -1;
    } catch (err) { return false; }
}

function egodactButtonDisabled(id) {
    try {
        const raw = localStorage.getItem('egodact_disabled_addon_buttons');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) && list.indexOf(id) !== -1;
    } catch (err) { return false; }
}
function egodactSetButtonEnabled(id, enabled) {
    try {
        const raw = localStorage.getItem('egodact_disabled_addon_buttons');
        const list = raw ? JSON.parse(raw) : [];
        const arr = Array.isArray(list) ? list : [];
        const idx = arr.indexOf(id);
        if (enabled) {
            if (idx !== -1) arr.splice(idx, 1);
        } else {
            if (idx === -1) arr.push(id);
        }
        localStorage.setItem('egodact_disabled_addon_buttons', JSON.stringify(arr));
    } catch (err) {}
}

(function () {
    'use strict';
    if (window.__egodactHostLoaded) return;
    window.__egodactHostLoaded = true;

    const STORAGE_PREFIX = 'egodact_addon_';

    function egodactOpenModal(titel, bodyHtml, opties) {
        opties = opties || {};
        const bestaand = document.getElementById('egodact-custom-modal-backdrop');
        if (bestaand) bestaand.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'egodact-custom-modal-backdrop';
        Object.assign(backdrop.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'var(--egd-backdrop)',
            zIndex: '9999999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: 'var(--egd-modal)',
            color: 'var(--egd-tekst)',
            width: opties.breedte || 'min(520px, calc(100vw - 32px))',
            maxHeight: 'calc(100vh - 32px)',
            boxSizing: 'border-box',
            overflow: 'hidden',
            borderRadius: '6px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--egd-schaduw)'
        });

        modal.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--egd-rand); padding-bottom:10px; margin-bottom:5px;">
                <h2 style="margin:0; font-size:22px; font-weight:500;">${titel}</h2>
                <button id="egodact-modal-sluiten" type="button" style="background-color:var(--egd-accent); border:none; color:var(--egd-accent-tekst); cursor:pointer; padding:8px 14px; font-weight:bold; font-size:13px; border-radius:4px;">Sluiten</button>
            </div>
            <div id="egodact-modal-body" style="overflow-y:auto; min-height:0; max-height:calc(100vh - 190px); padding-right:4px; display:flex; flex-direction:column; gap:10px;">
                ${bodyHtml || ''}
            </div>
        `;

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        const sluit = () => backdrop.remove();
        modal.querySelector('#egodact-modal-sluiten').addEventListener('click', sluit);
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) sluit(); });
        if (typeof opties.onOpen === 'function') opties.onOpen(backdrop, modal);
        return backdrop;
    }

    // ------------------------------------------------------------
    // Toast / notificaties
    // ------------------------------------------------------------
    function egodactToonToast(bericht, opties) {
        opties = opties || {};

        if (!document.body) return null;

        let wrap = document.getElementById('egodact-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'egodact-toast-wrap';
            Object.assign(wrap.style, {
                position: 'fixed',
                right: '16px',
                bottom: '16px',
                zIndex: '2147483600',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px',
                pointerEvents: 'none'
            });
            document.body.appendChild(wrap);
        }

        const type = opties.type || 'info';
        const kleuren = {
            success: 'var(--egd-accent)',
            error: 'var(--egd-gevaar)',
            warning: '#ef6c00',
            info: '#2e7d32'
        };

        const el = document.createElement('div');
        el.style.cssText =
            'pointer-events:auto; max-width:340px; padding:10px 14px; border-radius:6px;' +
            'font-family:Arial,sans-serif; font-size:13px; line-height:1.35;' +
            'box-shadow:var(--egd-schaduw); opacity:0; transform:translateY(6px);' +
            'transition:opacity 160ms ease, transform 160ms ease;' +
            'background:' + (opties.background || kleuren[type] || kleuren.info) + ';' +
            'color:' + (opties.color || '#fff') + ';';
        el.textContent = String(bericht == null ? '' : bericht);

        wrap.appendChild(el);

        try {
            requestAnimationFrame(function () {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        } catch (err) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }

        const duur = typeof opties.duration === 'number' ? opties.duration : 3000;
        setTimeout(function () {
            el.style.opacity = '0';
            el.style.transform = 'translateY(6px)';
            setTimeout(function () { el.remove(); }, 220);
        }, Math.max(600, duur));

        return el;
    }

    function maakKnopStijl(el) {        Object.assign(el.style, {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            margin: '0 8px 0 0',
            width: '28px',
            minWidth: '28px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            verticalAlign: 'middle',
            outline: 'none',
            position: 'relative',
            zIndex: '999999',
            flexShrink: '0',
            color: 'var(--egd-header-icoon)'
        });
        return el;
    }

    const EgodactAddons = {
        _addons: [],
        _known: [],
        _byId: {},
        _menus: [],
        _hamburgerItems: [],
        _buttons: [],
        _games: [],
        _sidebarPanels: [],
        _schedules: [],
        _readyCallbacks: [],

        // ------------------------------------------------------------
        // Registratie
        // ------------------------------------------------------------
        registerAddon(meta) {
            meta = meta || {};
            if (!meta.id) throw new Error('Addon heeft een id nodig.');
            if (this._byId[meta.id]) {
                console.warn('Egodact addon met id "' + meta.id + '" is al geregistreerd.');
                return this._byId[meta.id];
            }
            const addon = {
                id: meta.id,
                name: meta.name || meta.id,
                version: meta.version || '1.0.0',
                description: meta.description || '',
                author: meta.author || '',
                source: meta.source || meta.url || meta.homepage || meta.repository || '',
                menus: [],
                hamburger: [],
                buttons: [],
                games: []
            };
            this._addons.push(addon);
            this._byId[addon.id] = addon;
            return addon;
        },

        registerMenu(meta) {
            meta = meta || {};
            const addon = meta.addonId ? this._byId[meta.addonId] : null;
            const id = meta.id || (meta.addonId + ':' + (meta.title || 'menu'));
            // Dedupe by id.
            if (this._menus.some(function (m) { return m && m.id === id; })) return this._menus.find(function (m) { return m && m.id === id; });
            const entry = {
                id: id,
                addonId: meta.addonId || null,
                title: meta.title || 'Menu',
                icon: meta.icon || '',
                open: typeof meta.open === 'function' ? meta.open : function () {},
                addon: addon
            };
            this._menus.push(entry);
            if (addon) addon.menus.push(entry);
            return entry;
        },

        // Menu-item voor de hamburger naast de gebruikersnaam.
        // Alleen addons die dit expliciet registreren komen in de
        // hamburger; gewone registerMenu()-items blijven in de
        // Addons-bibliotheek.
        registerHamburger(meta) {
            meta = meta || {};
            const addon = meta.addonId ? this._byId[meta.addonId] : null;
            const id = meta.id || (meta.addonId + ':' + (meta.title || 'menu'));
            // Dedupe by id.
            if (this._hamburgerItems.some(function (m) { return m && m.id === id; })) return this._hamburgerItems.find(function (m) { return m && m.id === id; });
            const entry = {
                id: id,
                addonId: meta.addonId || null,
                title: meta.title || 'Menu',
                icon: meta.icon || '',
                order: typeof meta.order === 'number' ? meta.order : 0,
                open: typeof meta.open === 'function' ? meta.open : function () {},
                addon: addon
            };
            this._hamburgerItems.push(entry);
            if (addon) addon.hamburger.push(entry);
            return entry;
        },

        registerButton(meta) {
            meta = meta || {};
            const addon = meta.addonId ? this._byId[meta.addonId] : null;
            const entry = {
                id: meta.id || (meta.addonId + ':' + (meta.title || 'knop')),
                addonId: meta.addonId || null,
                title: meta.title || 'Knop',
                icon: meta.icon || '',
                key: (meta.addonId || '') + ':' + (meta.id || ''),
                position: meta.position || 'header',
                slot: meta.slot === 'name' ? 'name' : 'actions',
                order: (typeof meta.order === 'number') ? meta.order : null,
                x: meta.x,
                y: meta.y,
                draggable: meta.draggable !== false,
                onClick: typeof meta.onClick === 'function' ? meta.onClick : function () {},
                addon: addon
            };
            this._buttons.push(entry);
            if (addon) addon.buttons.push(entry);
            return entry;
        },

        registerGame(meta) {
            meta = meta || {};
            const addon = meta.addonId ? this._byId[meta.addonId] : null;
            const entry = {
                id: meta.id || (meta.addonId + ':' + (meta.title || 'game')),
                addonId: meta.addonId || null,
                title: meta.title || 'Game',
                description: meta.description || '',
                icon: meta.icon || '',
                open: typeof meta.open === 'function' ? meta.open : function () {},
                addon: addon
            };
            this._games.push(entry);
            if (addon) addon.games.push(entry);
            return entry;
        },

        registerSidebarPanel(meta) {
            meta = meta || {};
            const addon = meta.addonId ? this._byId[meta.addonId] : null;
            const entry = {
                id: meta.id || (meta.addonId + ':' + (meta.title || 'panel')),
                addonId: meta.addonId || null,
                title: meta.title || 'Panel',
                icon: meta.icon || '',
                order: typeof meta.order === 'number' ? meta.order : 0,
                render: typeof meta.render === 'function' ? meta.render : function () {},
                addon: addon
            };
            this._sidebarPanels.push(entry);
            if (addon) {
                if (!addon.sidebarPanels) addon.sidebarPanels = [];
                addon.sidebarPanels.push(entry);
            }
            return entry;
        },

        registerSchedule(meta) {
            meta = meta || {};
            const id = meta.id || (meta.addonId + ':' + (meta.title || 'schedule'));
            // Remove existing with same id.
            this._schedules = this._schedules.filter(function (s) { return s.id !== id; });
            const entry = {
                id: id,
                addonId: meta.addonId || null,
                title: meta.title || 'Reminder',
                message: meta.message || '',
                time: (typeof meta.time === 'number') ? meta.time : (Date.now() + (meta.delay || 60000)),
                repeat: meta.repeat || false,
                interval: meta.interval || 0,
                fired: false
            };
            this._schedules.push(entry);
            return entry;
        },
        cancelSchedule(id) {
            this._schedules = this._schedules.filter(function (s) { return s.id !== id; });
        },
        getSchedules() {
            return this._schedules.slice();
        },

        // ------------------------------------------------------------
        // Helpers voor addons
        // ------------------------------------------------------------
        openModal: egodactOpenModal,
        toast: egodactToonToast,

        // Alle challenges van het bord (zelfde 5-minuten-cache als het
        // Addons-menu). Geeft altijd een Promise met een array terug.
        getChallenges(force) {
            try {
                if (typeof egodactLaadChallenges === 'function') {
                    return Promise.resolve(egodactLaadChallenges(force === true))
                        .catch(function (err) {
                            console.warn('Challenges laden mislukt:', err);
                            return [];
                        });
                }
            } catch (err) {
                console.warn('Challenges laden mislukt:', err);
            }
            return Promise.resolve([]);
        },

        // Thema-info voor addons die zelf willen herstylen.
        getTheme() {
            try {
                const dark = document.documentElement.getAttribute('data-egodact-thema') === 'donker';
                return { theme: dark ? 'dark' : 'light', dark: dark };
            } catch (err) {
                return { theme: 'dark', dark: true };
            }
        },

        storage(addonId) {
            const prefix = STORAGE_PREFIX + (addonId || 'global') + '_';
            return {
                get(key, fallback) {
                    try {
                        const raw = localStorage.getItem(prefix + key);
                        return raw === null ? fallback : JSON.parse(raw);
                    } catch (err) {
                        return fallback;
                    }
                },
                set(key, value) {
                    try {
                        localStorage.setItem(prefix + key, JSON.stringify(value));
                        return true;
                    } catch (err) {
                        return false;
                    }
                },
                remove(key) {
                    try { localStorage.removeItem(prefix + key); } catch (err) {}
                }
            };
        },

        escapeHtml(tekst) {
            return String(tekst == null ? '' : tekst)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        },

        onReady(cb) {
            if (typeof cb === 'function') this._readyCallbacks.push(cb);
        },

        finalize() {
            this._readyCallbacks.forEach((cb) => {
                try { cb(this); } catch (err) { console.error(err); }
            });
        },

        // ------------------------------------------------------------
        // Interne hulp voor core (knoppen/menu's)
        // ------------------------------------------------------------
        knownAddons() {
            return this._known;
        },
        rememberAddon(id) {
            if (this._known.indexOf(id) === -1) this._known.push(id);
        },

        buttonDisabled(id) {
            return egodactButtonDisabled(id);
        },
        setButtonEnabled(id, enabled) {
            egodactSetButtonEnabled(id, enabled);
        },

        hasContent() {
            return this._addons.length > 0 || this._menus.length > 0 ||
                this._hamburgerItems.length > 0 ||
                this._buttons.length > 0 || this._games.length > 0;
        },

        createHeaderButton(id, title) {
            const knop = document.createElement('button');
            knop.id = id;
            knop.type = 'button';
            knop.title = title;
            maakKnopStijl(knop);
            return knop;
        }
    };

    // ------------------------------------------------------------
    // Brug voor losse addon-extensies (andere extensies)
    // ------------------------------------------------------------
    document.addEventListener('egodact:addon:register', function (event) {
        const detail = (event && event.detail) || {};
        const meta = detail.meta || {};
        const guardId = (detail.type == 'addon') ? meta.id : (meta.addonId || meta.id);
        if (detail.type == 'addon' && meta.id) EgodactAddons.rememberAddon(meta.id);
        if (guardId && egodactAddonDisabled(guardId)) return;
        try {
            if (detail.type === 'addon') {
                EgodactAddons.registerAddon(meta);
            } else if (detail.type === 'menu') {
                EgodactAddons.registerMenu({
                    addonId: meta.addonId || null,
                    id: meta.id,
                    title: meta.title || 'Menu',
                    icon: meta.icon || '',
                    open: function () {
                        document.dispatchEvent(new CustomEvent('egodact:addon:open', {
                            detail: { id: meta.id }
                        }));
                    }
                });
            } else if (detail.type === 'hamburger') {
                EgodactAddons.registerHamburger({
                    addonId: meta.addonId || null,
                    id: meta.id,
                    title: meta.title || 'Menu',
                    icon: meta.icon || '',
                    order: meta.order,
                    open: function () {
                        document.dispatchEvent(new CustomEvent('egodact:addon:open', {
                            detail: { id: meta.id }
                        }));
                    }
                });
            } else if (detail.type === 'button') {
                EgodactAddons.registerButton({
                    addonId: meta.addonId || null,
                    id: meta.id,
                    title: meta.title || 'Knop',
                    icon: meta.icon || '',
                    position: meta.position || 'header',
                    slot: meta.slot,
                    order: meta.order,
                    x: meta.x,
                    y: meta.y,
                    draggable: meta.draggable !== false,
                    onClick: function () {
                        document.dispatchEvent(new CustomEvent('egodact:addon:open', {
                            detail: { id: meta.id }
                        }));
                    }
                });
            } else if (detail.type === 'button-toggle') {
                const btnKey = (meta.addonId || '') + ':' + (meta.id || '');
                egodactSetButtonEnabled(btnKey, meta.enabled !== false);
                if (typeof voegKnoppenToe === 'function') { try { voegKnoppenToe(); } catch (e) {} }
            } else if (detail.type === 'schedule') {
                EgodactAddons.registerSchedule({
                    addonId: meta.addonId || null,
                    id: meta.id,
                    title: meta.title || 'Reminder',
                    message: meta.message || '',
                    time: meta.time,
                    delay: meta.delay,
                    repeat: meta.repeat,
                    interval: meta.interval
                });
            } else if (detail.type === 'cancel-schedule') {
                EgodactAddons.cancelSchedule(meta.id);
            } else if (detail.type === 'sidebar-panel') {
                EgodactAddons.registerSidebarPanel({
                    addonId: meta.addonId || null,
                    id: meta.id,
                    title: meta.title || 'Panel',
                    icon: meta.icon || '',
                    order: meta.order
                });
            } else if (detail.type === 'game') {
                EgodactAddons.registerGame({
                    addonId: meta.addonId || null,
                    id: meta.id,
                    title: meta.title || 'Game',
                    description: meta.description || '',
                    icon: meta.icon || '',
                    open: function () {
                        document.dispatchEvent(new CustomEvent('egodact:addon:open', {
                            detail: { id: meta.id }
                        }));
                    }
                });
            } else if (detail.type === 'challenges:request') {
                if (!meta.requestId) return;
                EgodactAddons.getChallenges(meta.force === true).then(function (lijst) {
                    let json = '[]';
                    try { json = JSON.stringify(lijst || []); } catch (err) {}
                    console.log('[EgodactAddons] challenges response', meta.requestId, Array.isArray(lijst) ? lijst.length : 0);
                    document.dispatchEvent(new CustomEvent('egodact:addon:challenges:response', {
                        detail: {
                            requestId: meta.requestId,
                            json: json,
                            count: Array.isArray(lijst) ? lijst.length : 0
                        }
                    }));
                }).catch(function (err) {
                    console.warn('[EgodactAddons] challenges request failed', err);
                    document.dispatchEvent(new CustomEvent('egodact:addon:challenges:response', {
                        detail: { requestId: meta.requestId, json: '[]', count: 0 }
                    }));
                });
            } else if (detail.type === 'toast') {
                egodactToonToast(meta.message, meta.options || {});
            }
        } catch (err) {
            console.error('Egodact addon registratie mislukt:', err);
        }
        if (typeof voegKnoppenToe === 'function') { try { voegKnoppenToe(); } catch (e) {} }
        else { setTimeout(function(){ if (typeof voegKnoppenToe === 'function') voegKnoppenToe(); }, 0); }
    });

    // ------------------------------------------------------------
    // Addon -> host: challenges opvragen
    // ------------------------------------------------------------
    // De lijst gaat als JSON-string mee, zodat hij ook tussen twee
    // losse extensies (isolated worlds) heelhuids aankomt.
    document.addEventListener('egodact:addon:challenges:request', function (event) {
        const detail = (event && event.detail) || {};
        if (!detail.requestId) return;

        EgodactAddons.getChallenges(detail.force === true).then(function (lijst) {
            let json = '[]';
            try { json = JSON.stringify(lijst || []); } catch (err) {}

            document.dispatchEvent(new CustomEvent('egodact:addon:challenges:response', {
                detail: {
                    requestId: detail.requestId,
                    json: json,
                    count: Array.isArray(lijst) ? lijst.length : 0
                }
            }));
        });
    });

    // ------------------------------------------------------------
    // Addon -> host: toast
    // ------------------------------------------------------------
    document.addEventListener('egodact:addon:toast', function (event) {
        const detail = (event && event.detail) || {};
        egodactToonToast(detail.message, detail.options || {});
    });

    try {
    window.__egodactHostReady = true;
    document.dispatchEvent(new CustomEvent('egodact:host:ready'));
} catch (err) {}
    window.EgodactAddons = EgodactAddons;
})();
