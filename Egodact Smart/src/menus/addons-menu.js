// ============================================================
// ADDONS MENU (met aan/uit per addon)
// ============================================================

function egodactAddonDisabled(id) {
    try {
        const raw = localStorage.getItem('egodact_disabled_addons');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) && list.indexOf(id) !== -1;
    } catch (err) {
        return false;
    }
}

function egodactSetAddonEnabled(id, enabled) {
    try {
        const raw = localStorage.getItem('egodact_disabled_addons');
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        const idx = list.indexOf(id);
        if (enabled && idx !== -1) list.splice(idx, 1);
        if (!enabled && idx === -1) list.push(id);
        localStorage.setItem('egodact_disabled_addons', JSON.stringify(list));
    } catch (err) {}
}

function openAddonsMenu(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const api = window.EgodactAddons;
    const registeredAddons = (api && api._addons) || [];
    const knownIds = (api && typeof api.knownAddons === 'function') ? api.knownAddons() : [];
    const allAddons = registeredAddons.slice();
    knownIds.forEach(function (id) {
        if (!allAddons.some(function (a) { return a.id === id; })) {
            allAddons.push({ id: id, name: id, version: '?', description: '', author: '' });
        }
    });
    const addons = allAddons;
    const menus = (api && api._menus) || [];
    const buttons = (api && api._buttons) || [];
    const games = (api && api._games) || [];

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
        width: 'min(640px, calc(100vw - 32px))',
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

    const kaart = (titel, tekst, onClick) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        Object.assign(btn.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            width: '100%',
            textAlign: 'left',
            background: 'var(--egd-veld)',
            color: 'var(--egd-tekst)',
            border: '1px solid var(--egd-rand)',
            borderRadius: '6px',
            padding: '12px 14px',
            cursor: 'pointer',
            fontFamily: 'inherit'
        });
        btn.innerHTML = `
            <span style="display:flex; flex-direction:column; gap:2px; min-width:0;">
                <span style="font-size:15px; font-weight:bold;">${api.escapeHtml(titel)}</span>
                <span style="font-size:12px; color:var(--egd-tekst-zacht);">${api.escapeHtml(tekst)}</span>
            </span>
            <span style="background:var(--egd-accent); color:var(--egd-accent-tekst); border-radius:4px; padding:6px 12px; font-size:12px; font-weight:bold; text-transform:uppercase;">Openen</span>
        `;
        btn.addEventListener('click', () => {
            backdrop.remove();
            try { onClick(); } catch (err) { console.error(err); }
        });
        btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'var(--egd-accent)'; });
        btn.addEventListener('mouseleave', () => { btn.style.borderColor = 'var(--egd-rand)'; });
        return btn;
    };

    const sectie = (titel, items, mapper) => {
        if (!items.length) return null;
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:8px;';
        const kop = document.createElement('h3');
        kop.textContent = titel;
        kop.style.cssText = 'margin:0; font-size:15px; color:var(--egd-tekst-zacht);';
        wrap.appendChild(kop);
        items.map(mapper).forEach(el => wrap.appendChild(el));
        return wrap;
    };

    modal.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--egd-rand); padding-bottom:10px;">
            <h2 style="margin:0; font-size:22px; font-weight:500;">Addons</h2>
            <span style="margin-left:auto; font-size:12px; color:var(--egd-tekst-zacht);">${addons.length} addon${addons.length === 1 ? '' : 's'}</span>
        </div>
        <div id="egodact-addons-body" style="overflow-y:auto; min-height:0; max-height:calc(100vh - 190px); padding-right:4px; display:flex; flex-direction:column; gap:14px;"></div>
        <div style="display:flex; justify-content:flex-end; margin-top:5px;">
            <button id="egodact-addons-sluiten" type="button" style="background-color:var(--egd-accent); border:none; color:var(--egd-accent-tekst); cursor:pointer; padding:10px 20px; font-weight:bold; font-size:14px; text-transform:uppercase; border-radius:4px; box-shadow:0px 3px 1px -2px rgba(0,0,0,0.2);">Sluiten</button>
        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const body = modal.querySelector('#egodact-addons-body');
    const sluit = () => backdrop.remove();
    modal.querySelector('#egodact-addons-sluiten').addEventListener('click', sluit);
    backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) sluit(); });

    if (!addons.length && !menus.length && !buttons.length && !games.length) {
        const leeg = document.createElement('div');
        leeg.textContent = 'Nog geen addons geregistreerd.';
        Object.assign(leeg.style, {
            padding: '14px',
            textAlign: 'center',
            color: 'var(--egd-tekst-zacht)',
            background: 'var(--egd-veld)',
            border: '1px dashed var(--egd-rand)',
            borderRadius: '4px',
            fontSize: '13px'
        });
        body.appendChild(leeg);
        return;
    }

    // Addons overzicht met toggle
    if (addons.length) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
        const kop = document.createElement('h3');
        kop.textContent = 'Geregistreerde addons';
        kop.style.cssText = 'margin:0; font-size:15px; color:var(--egd-tekst-zacht);';
        wrap.appendChild(kop);
        addons.forEach((addon) => {
            const kaartEl = document.createElement('div');
            Object.assign(kaartEl.style, {
                padding: '10px 12px',
                background: 'var(--egd-veld)',
                border: '1px solid var(--egd-rand)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
            });
            const info = document.createElement('div');
            info.innerHTML = `
                <div style="display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;">
                    <strong style="font-size:14px;">${api.escapeHtml(addon.name)}</strong>
                    <span style="font-size:11px; color:var(--egd-tekst-zacht);">v${api.escapeHtml(addon.version)}</span>
                    ${addon.author ? '<span style="font-size:11px; color:var(--egd-tekst-zacht);">· ' + api.escapeHtml(addon.author) + '</span>' : ''}
                </div>
                ${addon.description ? '<div style="font-size:12px; color:var(--egd-tekst-zacht); margin-top:4px;">' + api.escapeHtml(addon.description) + '</div>' : ''}
            `;
            const disabled = egodactAddonDisabled(addon.id);
            const toggleWrap = document.createElement('label');
            toggleWrap.style.cssText = 'position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer;';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !disabled;
            checkbox.style.cssText = 'opacity:0;width:0;height:0;position:absolute;';
            const slider = document.createElement('span');
            Object.assign(slider.style, {
                position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
                backgroundColor: disabled ? 'var(--egd-uit)' : 'var(--egd-accent)',
                borderRadius: '24px', transition: 'background-color 150ms ease'
            });
            const knob = document.createElement('span');
            Object.assign(knob.style, {
                position: 'absolute', top: '3px', left: disabled ? '3px' : '23px',
                width: '18px', height: '18px', borderRadius: '50%',
                backgroundColor: '#fff', transition: 'left 150ms ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            });
            slider.appendChild(knob);
            toggleWrap.append(checkbox, slider);
            toggleWrap.addEventListener('click', function (e) {
                e.preventDefault();
                const nuUit = !egodactAddonDisabled(addon.id);
                egodactSetAddonEnabled(addon.id, !nuUit);
                window.location.reload();
            });
            kaartEl.append(info, toggleWrap);
            wrap.appendChild(kaartEl);
        });
        body.appendChild(wrap);
    }

    const menuSectie = sectie('Addon menu\'s', menus, (m) =>
        kaart(m.title, m.addon ? m.addon.name : 'addon', m.open));
    if (menuSectie) body.appendChild(menuSectie);

    const gameSectie = sectie('Addon games', games, (g) =>
        kaart(g.title, g.description || (g.addon ? g.addon.name : 'addon'), g.open));
    if (gameSectie) body.appendChild(gameSectie);

    // Addon-knoppen worden niet meer in dit menu getoond; ze zijn te
    // beheren via de addon zelf (bijv. via een knop in de topbar).
}
