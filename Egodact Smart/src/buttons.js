// ============================================================
// KNOPPEN TOEVOEGEN
// ============================================================

// ============================================================
// OPRUIMEN BIJ UITSCHAKELEN
// ============================================================
// Elementen van de pagina die wij tijdelijk hebben aangepast (bijv. de
// zoekknop die opschuift). Bij het uitschakelen van de extensie zetten we
// die weer terug.

let egodactAangepasteElementen = [];

function egodactOnthoudenAanpassing(el) {
    if (el && egodactAangepasteElementen.indexOf(el) === -1) {
        egodactAangepasteElementen.push(el);
    }
}

function egodactHerstelPagina() {
    egodactAangepasteElementen.forEach(function (el) {
        try {
            el.style.transform = '';
            el.style.transition = '';
        } catch (err) {}
    });
    egodactAangepasteElementen = [];
}

function egodactRuimExtensieOp() {
    window.__egodactUitgeschakeld = true;

    [
        'egodact-info-knop',
        'egodact-taken-knop',
        'egodact-weekplanning-knop',
        'egodact-beta-features-knop',
        'egodact-tijd-knop',
        'egodact-addons-knop',
        'egodact-hamburger-knop',
        'egodact-hamburger-dropdown',
        'egodact-hamburger-stijl',
        'egodact-slot-name',
        'egodact-slot-actions',
        'egodact-toast-wrap',
        'egodact-knop-groep',
        'egodact-custom-modal-backdrop',
        'egodact-tijd-melding',
        'egodact-thema-stijl'
    ].forEach(function (id) {
        const el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    document.querySelectorAll('[data-egodact-addon-btn="1"]').forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
    });

    try {
        document.documentElement.removeAttribute('data-egodact-thema');
        document.documentElement.style.removeProperty('--egd-header-icoon');
    } catch (err) {}

    egodactHerstelPagina();
}

function apiHasDisabledButtonInDom() {
    try {
        const api = window.EgodactAddons;
        if (!api || !Array.isArray(api._buttons)) return false;
        return api._buttons.some(function (entry) {
            if (!entry || !entry.id || !egodactButtonDisabled(entry.key)) return false;
            const btnId = 'egodact-addon-btn-' + String(entry.id).replace(/[^a-z0-9_-]/gi, '-');
            return !!document.getElementById(btnId);
        });
    } catch (err) { return false; }
}

// ============================================================
// HAMBURGER MENU VOOR ADDON-MENU'S
// ============================================================
// Verschijnt alleen als minstens één addon een menu heeft
// geregistreerd (window.EgodactAddons._menus). Zo staat er geen
// lege knop in de topbar als er geen addons zijn.

function egodactHamburgerMenus() {
    try {
        const api = window.EgodactAddons;
        if (!api) return [];
        let items = Array.isArray(api._hamburgerItems) ? api._hamburgerItems : [];
        // Backwards compat: if nothing registered via the hamburger API
        // but the lib/SDK only knew about registerMenu at the time, do
        // not silently drop everything. (Learning Mode also registers
        // via registerMenu as a fallback.)
        // Keep hamburger opt-in: only show explicit hamburger items.
        let filtered = items.filter(function (m) { return m && m.title; });
        const hidden = egodactHamburgerHiddenIds();
        if (hidden.length) {
            filtered = filtered.filter(function (m) {
                const id = String((m && (m.id || m.title)) || '');
                return hidden.indexOf(id) === -1;
            });
        }
        if (egodactLearningModeEnabled()) {
            filtered = filtered.filter(function (m) { return egodactKeepInLearningMode(m); });
        }
        return filtered.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    } catch (err) { return []; }
}


function egodactHamburgerHiddenIds() {
    try { return Array.isArray(window.__egodactHiddenHamburgerIds) ? window.__egodactHiddenHamburgerIds : []; } catch (e) { return []; }
}


function egodactShortcutsAvailable() {
    try { return typeof window.egodactOpenShortcutsModal === 'function'; } catch (e) { return false; }
}


function egodactLearningModeEnabled() {
    try { return localStorage.getItem('egodact_learning_mode') === '1'; } catch (e) { return false; }
}
function egodactSetLearningMode(v) {
    try { localStorage.setItem('egodact_learning_mode', v ? '1' : '0'); } catch (e) {}
    window.__egodactLearningMode = !!v;
}
window.__egodactLearningMode = egodactLearningModeEnabled();

function egodactKeepInLearningMode(item) {
    if (!item) return false;
    if (item.keepInLearningMode === true) return true;
    const id = String(item.id || '').toLowerCase();
    const title = String(item.title || '').toLowerCase();
    return id.indexOf('compact') !== -1 || title.indexOf('compact') !== -1;
}
function egodactHamburgerStyle() {
    if (document.getElementById('egodact-hamburger-stijl')) return;
    const style = document.createElement('style');
    style.id = 'egodact-hamburger-stijl';
    style.textContent = `
        #egodact-hamburger-knop {
            display: inline-flex; align-items: center; justify-content: center;
            border: none; background: transparent; cursor: pointer;
            padding: 0 6px; margin: 0 10px 0 12px;
            color: var(--egd-header-icoon, var(--egd-tekst, #fff));
            opacity: .85; transition: opacity 150ms ease; flex-shrink: 0;
        }
        #egodact-hamburger-knop:hover { opacity: 1; }
        #egodact-hamburger-knop .egd-ham-icon {
            display: flex; flex-direction: column; justify-content: space-between;
            width: 20px; height: 14px;
            transition: transform 220ms cubic-bezier(.4,0,.2,1);
            transform: rotate(0deg);
        }
        #egodact-hamburger-knop.egd-ham-open .egd-ham-icon { transform: rotate(90deg); }
        #egodact-hamburger-knop .egd-ham-icon span {
            display: block; height: 2px; width: 100%;
            background: currentColor; border-radius: 2px;
        }
        #egodact-hamburger-dropdown {
            position: fixed; background: var(--egd-modal, #424242); color: var(--egd-tekst, #fff);
            border: 1px solid var(--egd-rand, #555); border-radius: 8px;
            box-shadow: var(--egd-schaduw, 0 8px 24px rgba(0,0,0,.4));
            padding: 6px; display: flex; flex-direction: column; gap: 2px; min-width: 190px;
            opacity: 0; transform: translateY(-8px) scale(.98); transform-origin: top right;
            pointer-events: none;
            transition: opacity 180ms ease, transform 180ms cubic-bezier(.4,0,.2,1);
            z-index: 2147483000;
        }
        #egodact-hamburger-dropdown.egd-ham-open {
            opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
        }
        #egodact-hamburger-dropdown button {
            text-align: left; padding: 9px 12px; border: none; background: transparent;
            color: var(--egd-tekst, #fff); cursor: pointer; border-radius: 5px;
            font-size: 13px; font-family: inherit; width: 100%;
        }
        #egodact-hamburger-dropdown button:hover { background: var(--egd-hover, rgba(255,255,255,.08)); }
        #egodact-hamburger-dropdown button.egd-ham-item {
            display: grid; grid-template-columns: 20px minmax(0, 1fr);
            align-items: center; column-gap: 10px; line-height: 1.2;
        }
        #egodact-hamburger-dropdown .egd-ham-item-icon {
            width: 20px; height: 20px; display: inline-flex;
            align-items: center; justify-content: center;
            flex-shrink: 0; overflow: hidden; line-height: 1;
            font-size: 15px; text-align: center;
        }
        #egodact-hamburger-dropdown .egd-ham-item-icon svg {
            width: 16px; height: 16px; display: block; flex-shrink: 0;
        }
        #egodact-hamburger-dropdown .egd-ham-item-label {
            display: block; min-width: 0; overflow: hidden;
            text-overflow: ellipsis; white-space: nowrap; text-align: left;
        }
    `;
    document.head.appendChild(style);
}

function egodactVindNaamElement() {
    const nodes = document.querySelectorAll('header *, nav *');
    let best = null;
    nodes.forEach(function (el) {
        const txt = (el.textContent || '').trim();
        if (/welkom|welcome|hallo|goedemorgen|goedemiddag/i.test(txt) && txt.length < 60) {
            if (!best || el.children.length < best.children.length) best = el;
        }
    });
    return best;
}

// ============================================================
// TOPBAR-SLOTS
// ============================================================
// Addons kunnen vragen om een plek in de topbar ("name" of
// "actions") met een order. Zo hoeft niemand zelf in de DOM te
// prikken. Zonder slot/order blijft het oude gedrag werken.

function egodactTopbarSlot(naam) {
    naam = (naam === 'name') ? 'name' : 'actions';
    const id = 'egodact-slot-' + naam;

    let slot = document.getElementById(id);
    if (slot && slot.isConnected) {
        // If the slot is no longer right after the name element, recreate it.
        if (naam === 'name') {
            const doel = egodactVindNaamElement();
            if (doel && doel.parentNode && slot.previousSibling !== doel) {
                if (slot.parentNode) slot.parentNode.removeChild(slot);
                slot = null;
            }
        }
        if (slot) return slot;
    }
    if (slot && slot.parentNode) slot.parentNode.removeChild(slot);

    slot = document.createElement('div');
    slot.id = id;
    slot.setAttribute('data-egodact-slot', naam);
    slot.style.cssText = 'display:inline-flex; align-items:center; gap:2px; flex-shrink:0;';

    if (naam === 'name') {
        const doel = egodactVindNaamElement();
        if (doel && doel.parentNode) {
            doel.parentNode.insertBefore(slot, doel.nextSibling);
            return slot;
        }
    }

    const groep = document.getElementById('egodact-knop-groep');
    if (groep) { groep.appendChild(slot); return slot; }

    const info = document.getElementById('egodact-info-knop');
    if (info && info.parentNode) {
        info.insertAdjacentElement('afterend', slot);
        return slot;
    }

    return null;
}

function egodactSlotAdd(naam, element, order) {
    const slot = egodactTopbarSlot(naam);
    if (!slot) return false;

    const volgorde = (typeof order === 'number') ? order : 0;
    element.setAttribute('data-egodact-order', String(volgorde));

    const volgende = Array.prototype.slice.call(slot.children)
        .filter(function (el) { return el !== element; })
        .find(function (el) {
            const o = parseFloat(el.getAttribute('data-egodact-order') || '0');
            return o > volgorde;
        });

    if (!volgende) slot.appendChild(element);
    else slot.insertBefore(element, volgende);

    return true;
}

function egodactUpdateHamburger() {
    const menus = egodactHamburgerMenus();
    const bestaand = document.getElementById('egodact-hamburger-knop');

    const showShortcuts = egodactShortcutsAvailable();
    if (!menus.length && !showShortcuts) {
        if (bestaand && bestaand.parentNode) bestaand.parentNode.removeChild(bestaand);
        const oudeDropdown = document.getElementById('egodact-hamburger-dropdown');
        if (oudeDropdown && oudeDropdown.parentNode) oudeDropdown.parentNode.removeChild(oudeDropdown);
        return;
    }

    egodactHamburgerStyle();

    let knop = bestaand;
    if (!knop) {
        knop = document.createElement('button');
        knop.id = 'egodact-hamburger-knop';
        knop.type = 'button';
        knop.title = 'Addon-menu';
        knop.innerHTML = '<span class="egd-ham-icon"><span></span><span></span><span></span></span>';

        if (!egodactSlotAdd('name', knop, 0)) {
            // Fallback: try to place right of the name.
            const doel = egodactVindNaamElement();
            if (doel && doel.parentNode) {
                doel.parentNode.insertBefore(knop, doel.nextSibling);
            } else {
                const groep = document.getElementById('egodact-knop-groep');
                if (groep) groep.appendChild(knop);
                else {
                    const infoKnop = document.getElementById('egodact-info-knop');
                    if (infoKnop && infoKnop.parentNode) infoKnop.insertAdjacentElement('afterend', knop);
                }
            }
        }
    }

    // Make sure the hamburger follows the (possibly changed) name element.
    const naamEl = egodactVindNaamElement();
    if (naamEl && naamEl.parentNode && knop.parentNode !== naamEl.parentNode) {
        egodactTopbarSlot('name'); // (re)create slot after the new name
    }
    if (naamEl && naamEl.parentNode && knop.parentNode !== naamEl.parentNode) {
        naamEl.parentNode.insertBefore(knop, naamEl.nextSibling);
    } else if (naamEl && naamEl.parentNode && knop.previousSibling !== naamEl) {
        naamEl.parentNode.insertBefore(knop, naamEl.nextSibling);
    }

    if (!knop.isConnected) {
        // The slot/name container was re-rendered by the host page.
        egodactSlotAdd('name', knop, 0);
    }

    // Sync size with the name area (a bit bigger).
    const naam = egodactVindNaamElement();
    if (naam) {
        const rect = naam.getBoundingClientRect();
        const h = Math.min(48, Math.max(32, Math.round((rect.height || 22) * 1.4)));
        knop.style.height = h + 'px';
        knop.style.minWidth = h + 'px';
    }

    let dropdown = document.getElementById('egodact-hamburger-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'egodact-hamburger-dropdown';
        document.body.appendChild(dropdown);
    }

    let open = false;
    function position() {
        const r = knop.getBoundingClientRect();
        const w = dropdown.offsetWidth || 200;
        dropdown.style.top = (r.bottom + 6) + 'px';
        dropdown.style.left = Math.max(8, Math.min(window.innerWidth - w - 12, r.left)) + 'px';
    }
    function openMenu() { open = true; position(); dropdown.classList.add('egd-ham-open'); knop.classList.add('egd-ham-open'); }
    function closeMenu() { open = false; dropdown.classList.remove('egd-ham-open'); knop.classList.remove('egd-ham-open'); }

    // Rebuild items.
    dropdown.innerHTML = '';
    menus.forEach(function (m) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'egd-ham-item';
        item.dataset.egdHamId = String(m.id || m.title || '');
        if (m.addonId) item.dataset.egdHamAddon = String(m.addonId);
        if (egodactKeepInLearningMode(m)) item.dataset.egdHamKeep = '1';

        // Icons can be plain text, HTML entities (&#10024;) or an SVG string.
        const icon = document.createElement('span');
        icon.className = 'egd-ham-item-icon';
        if (m.icon) icon.innerHTML = String(m.icon);
        else icon.textContent = '';

        const label = document.createElement('span');
        label.className = 'egd-ham-item-label';
        label.textContent = m.title || 'Menu';

        item.append(icon, label);
        item.addEventListener('click', function () {
            closeMenu();
            try { if (typeof m.open === 'function') m.open(); } catch (err) { console.error(err); }
        });
        dropdown.appendChild(item);
    });

    // Vast item: Sneltoetsen (altijd beschikbaar als shortcuts geladen zijn).
    if (egodactShortcutsAvailable()) {
        const scItem = document.createElement('button');
        scItem.type = 'button';
        scItem.className = 'egd-ham-item';
        scItem.dataset.egdHamId = 'shortcuts';
        scItem.dataset.egdHamKeep = '1';
        const scIcon = document.createElement('span');
        scIcon.className = 'egd-ham-item-icon';
        scIcon.textContent = '⌨';
        const scLabel = document.createElement('span');
        scLabel.className = 'egd-ham-item-label';
        scLabel.textContent = 'Sneltoetsen';
        scItem.append(scIcon, scLabel);
        scItem.addEventListener('click', function () {
            closeMenu();
            try { window.egodactOpenShortcutsModal(); } catch (e) { console.error(e); }
        });
        dropdown.appendChild(scItem);
    }

    dropdown.dataset.egdHamSig = menus.map(function (m) { return m.id || m.title; }).join('|');

    if (!knop.dataset.egdHamBound) {
        knop.dataset.egdHamBound = '1';
        knop.addEventListener('click', function (e) {
            e.stopPropagation();
            if (open) closeMenu(); else openMenu();
        });
        document.addEventListener('click', function (e) {
            if (open && !dropdown.contains(e.target) && e.target !== knop) closeMenu();
        });
        window.addEventListener('resize', function () { if (open) position(); });
        window.addEventListener('scroll', function () { if (open) position(); }, true);
    }
}

function voegKnoppenToe() {

    // Voorkom herhaalde uitvoering door eigen DOM-wijzigingen (MutationObserver).
    if (window.__egodactVoegKnoppenToeBezig) return;
    // Na het uitschakelen van de extensie niets meer opbouwen.
    if (window.__egodactUitgeschakeld) return;
    window.__egodactVoegKnoppenToeBezig = true;
    try {

    // Alleen op Pantagora
    if (
        !window.location.href.includes(
            "https://app.egodact.com/"
        )
    ) {

        const bestaandeInfo =
            document.getElementById(
                'egodact-info-knop'
            );

        const bestaandeTaken =
            document.getElementById(
                'egodact-taken-knop'
            );

        const bestaandeWeekplanning =
            document.getElementById(
                'egodact-weekplanning-knop'
            );

        const bestaandeBetaFeatures =
            document.getElementById(
                'egodact-beta-features-knop'
            );

        const bestaandeTijd =
            document.getElementById(
                'egodact-tijd-knop'
            );

        const bestaandeAddons =
            document.getElementById(
                'egodact-addons-knop'
            );

        if (bestaandeBetaFeatures) {
            bestaandeBetaFeatures.remove();
        }

        if (bestaandeTijd) {
            bestaandeTijd.remove();
        }

        if (bestaandeAddons) {
            bestaandeAddons.remove();
        }

        if (bestaandeInfo) {
            bestaandeInfo.remove();
        }

        if (bestaandeTaken) {
            bestaandeTaken.remove();
        }

        if (bestaandeWeekplanning) {
            bestaandeWeekplanning.remove();
        }

        document.querySelectorAll('[data-egodact-addon-btn="1"]').forEach(function (el) {
            el.remove();
        });

        const knopGroep = document.getElementById('egodact-knop-groep');
        if (knopGroep) knopGroep.remove();

        return;
    }

    // ========================================================
    // BESTAANDE KNOPPEN
    // ========================================================

    const bestaandeInfo =
        document.getElementById(
            'egodact-info-knop'
        );

    const bestaandeTaken =
        document.getElementById(
            'egodact-taken-knop'
        );

    const bestaandeWeekplanning =
        document.getElementById(
            'egodact-weekplanning-knop'
        );

    const bestaandeBetaFeatures =
        document.getElementById(
            'egodact-beta-features-knop'
        );

    const bestaandeTijd =
        document.getElementById(
            'egodact-tijd-knop'
        );

    const bestaandeAddons =
        document.getElementById(
            'egodact-addons-knop'
        );

    const knownAddonsList = (window.EgodactAddons && typeof window.EgodactAddons.knownAddons === 'function') ? window.EgodactAddons.knownAddons() : [];
    const addonsZichtbaar =
        !!( 
            (window.EgodactAddons &&
            typeof window.EgodactAddons.hasContent === 'function' &&
            window.EgodactAddons.hasContent()) ||
            (knownAddonsList && knownAddonsList.length)
        );

    let addonEntries = (window.EgodactAddons && Array.isArray(window.EgodactAddons._buttons))
        ? window.EgodactAddons._buttons.filter(function (entry) {
            return !(entry && egodactButtonDisabled(entry.key));
        })
        : [];
    if (egodactLearningModeEnabled()) {
        addonEntries = addonEntries.filter(function (entry) { return egodactKeepInLearningMode(entry); });
    }
    const addonButtonsComplete = addonEntries.every(function (entry) {
        if (!entry || !entry.id) return true;
        const addonBtnId = 'egodact-addon-btn-' + String(entry.id).replace(/[^a-z0-9_-]/gi, '-');
        return !!document.getElementById(addonBtnId);
    });

    const hamburgerMenus = egodactHamburgerMenus();
    const hamburgerBestaat = !!document.getElementById('egodact-hamburger-knop');
    const hamburgerDropdown = document.getElementById('egodact-hamburger-dropdown');
    const hamburgerSig = hamburgerMenus.map(function (m) { return m.id || m.title; }).join('|');
    const hamburgerItemsOk = !!hamburgerDropdown && hamburgerDropdown.dataset.egdHamSig === hamburgerSig;
    const hasHamburgerContent = hamburgerMenus.length > 0 || egodactShortcutsAvailable();
    const hamburgerOk = hasHamburgerContent ? (hamburgerBestaat && (hamburgerMenus.length === 0 || hamburgerItemsOk)) : !hamburgerBestaat;

    if (
        bestaandeInfo &&
        bestaandeTaken &&
        bestaandeWeekplanning &&
        (bestaandeBetaFeatures || !EGODACT_BETA_ZICHTBAAR) &&
        (bestaandeTijd || !EGODACT_TIJD_ZICHTBAAR) &&
        (bestaandeAddons || !addonsZichtbaar) &&
        addonButtonsComplete &&
        hamburgerOk &&
        !apiHasDisabledButtonInDom()
    ) {
        return;
    }

    // ========================================================
    // ZOEK CONTAINER
    // ========================================================

    const alleSvgs =
        document.querySelectorAll(
            'svg'
        );

    let zoekKnopElement =
        null;

    let menuContainer =
        null;

    for (
        let svg of alleSvgs
    ) {

        const button =
            svg.closest(
                'button'
            );

        if (
            button &&
            button.parentNode &&
            button.parentNode.children.length >= 2
        ) {

            if (
                button.closest('header') ||
                button.closest('nav') ||
                button.offsetTop < 100
            ) {

                menuContainer =
                    button.parentNode;

                if (
                    svg.getAttribute(
                        'data-icon'
                    ) === 'search' ||
                    svg.innerHTML.includes(
                        'M15.5'
                    )
                ) {

                    zoekKnopElement =
                        button;
                }
            }
        }
    }

    // ========================================================
    // FALLBACK
    // ========================================================

    if (!menuContainer) {

        const profielFoto =
            document.querySelector(
                'img[src*="avatar"], div[style*="background-image"]'
            );

        if (
            profielFoto &&
            profielFoto.parentNode
        ) {

            menuContainer =
                profielFoto.parentNode;
        }
    }

    if (!menuContainer) {
        return;
    }

    // ========================================================
    // ZOEKKNOP NAAR LINKS
    // ========================================================

    // De zoekknop van de pagina laten we met rust. Onze knoppen komen in
    // een eigen flexgroep te staan, zodat de koptekst netjes blijft.


    // ========================================================
    // EIGEN KNOPPENGROEP
    // ========================================================
    // Alle Egodact-knoppen staan in één flexgroep. Zo verandert de indeling
    // van de pagina-koptekst niet en kunnen de pictogrammen niet over
    // elkaar heen vallen.

    let egodactKnopGroep = document.getElementById('egodact-knop-groep');

    if (!egodactKnopGroep) {
        egodactKnopGroep = document.createElement('div');
        egodactKnopGroep.id = 'egodact-knop-groep';
        Object.assign(egodactKnopGroep.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0',
            height: '32px',
            margin: '0',
            padding: '0',
            flex: '0 0 auto',
            position: 'relative',
            zIndex: '999998'
        });
        menuContainer.insertBefore(egodactKnopGroep, menuContainer.firstChild);
    }

    // ========================================================
    // SMART
    // ========================================================

    if (
        !document.getElementById(
            'egodact-info-knop'
        )
    ) {

        const infoKnop =
            document.createElement(
                'button'
            );

        infoKnop.id =
            'egodact-info-knop';

        infoKnop.type =
            'button';

        infoKnop.title =
            'SMART methode';

        Object.assign(
            infoKnop.style,
            {
                background:
                    'none',
                border:
                    'none',
                cursor:
                    'pointer',
                padding:
                    '0',
                margin:
                    '0 8px 0 0',
                width:
                    '28px',
                minWidth:
                    '28px',
                height:
                    '32px',
                display:
                    'inline-flex',
                alignItems:
                    'center',
                justifyContent:
                    'center',
                verticalAlign:
                    'middle',
                outline:
                    'none',
                position:
                    'relative',
                zIndex:
                    '999999',
                flexShrink:
                    '0'
            }
        );

        infoKnop.innerHTML = `
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="
                    opacity: 1;
                    display: block;
                    pointer-events: none;
                "
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                ></circle>

                <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                ></line>

                <circle
                    cx="12"
                    cy="16"
                    r="1"
                ></circle>
            </svg>
        `;

        infoKnop.addEventListener(
            'click',
            openSMARTMenu
        );

        egodactKnopGroep.appendChild(infoKnop);
    }

    // ========================================================
    // BETA FEATURES
    // ========================================================

    if (
        EGODACT_BETA_ZICHTBAAR &&
        !document.getElementById(
            'egodact-beta-features-knop'
        )
    ) {
        const betaKnop = document.createElement('button');
        betaKnop.id = 'egodact-beta-features-knop';
        betaKnop.type = 'button';
        betaKnop.title = 'Beta Features';

        Object.assign(betaKnop.style, {
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
            flexShrink: '0'
        });

        betaKnop.innerHTML = `
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="opacity:1;display:block;pointer-events:none;"
            >
                <path d="M9 3h6"></path>
                <path d="M10 3v7.2L4.8 19a1.5 1.5 0 0 0 1.3 2.2h11.8a1.5 1.5 0 0 0 1.3-2.2L14 10.2V3"></path>
                <path d="M7.5 16h9"></path>
            </svg>
        `;

        betaKnop.addEventListener('click', openBetaFeaturesMenu);

        const infoKnopVoorBeta = document.getElementById('egodact-info-knop');
        if (infoKnopVoorBeta) {
            infoKnopVoorBeta.insertAdjacentElement('afterend', betaKnop);
        } else {
            egodactKnopGroep.appendChild(betaKnop);
        }
    }


    // ========================================================
    // TIJD (klok, timer, stopwatch, wekker)
    // ========================================================

    if (
        EGODACT_TIJD_ZICHTBAAR &&
        !document.getElementById(
            'egodact-tijd-knop'
        )
    ) {
        const tijdKnop = document.createElement('button');
        tijdKnop.id = 'egodact-tijd-knop';
        tijdKnop.type = 'button';
        tijdKnop.title = 'Klok, timer, stopwatch en wekker';

        Object.assign(tijdKnop.style, {
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
            flexShrink: '0'
        });

        // Klok-icoon (zelf getekend, in dezelfde lijnstijl als de andere knoppen)
        tijdKnop.innerHTML = `
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="opacity:1;display:block;pointer-events:none;"
            >
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 7v5l3 2"></path>
            </svg>
        `;

        tijdKnop.addEventListener('click', openTijdMenu);

        const infoKnopVoorTijd = document.getElementById('egodact-info-knop');
        if (infoKnopVoorTijd) {
            infoKnopVoorTijd.insertAdjacentElement('afterend', tijdKnop);
        } else {
            egodactKnopGroep.appendChild(tijdKnop);
        }
    }

    // ========================================================
    // TAKENLIJST
    // ========================================================

    if (
        !document.getElementById(
            'egodact-taken-knop'
        )
    ) {

        const takenKnop =
            document.createElement(
                'button'
            );

        takenKnop.id =
            'egodact-taken-knop';

        takenKnop.type =
            'button';

        takenKnop.title =
            'Takenlijst';

        Object.assign(
            takenKnop.style,
            {
                background:
                    'none',
                border:
                    'none',
                cursor:
                    'pointer',
                padding:
                    '0',
                margin:
                    '0 8px 0 0',
                width:
                    '28px',
                minWidth:
                    '28px',
                height:
                    '32px',
                display:
                    'inline-flex',
                alignItems:
                    'center',
                justifyContent:
                    'center',
                verticalAlign:
                    'middle',
                outline:
                    'none',
                position:
                    'relative',
                zIndex:
                    '999999',
                flexShrink:
                    '0'
            }
        );

        takenKnop.innerHTML = `
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="
                    opacity: 1;
                    display: block;
                    pointer-events: none;
                "
            >
                <path
                    d="M9 11l3 3L22 4"
                ></path>

                <path
                    d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                ></path>
            </svg>
        `;

        takenKnop.addEventListener(
            'click',
            openTakenMenu
        );

        const infoKnop =
            document.getElementById(
                'egodact-info-knop'
            );

        if (infoKnop) {

            infoKnop.insertAdjacentElement(
                'afterend',
                takenKnop
            );

        } else {

            egodactKnopGroep.appendChild(takenKnop);
        }
    }


    // ========================================================
    // WEEKPLANNING
    // ========================================================

    if (
        !document.getElementById(
            'egodact-weekplanning-knop'
        )
    ) {

        const weekplanningKnop =
            document.createElement(
                'button'
            );

        weekplanningKnop.id =
            'egodact-weekplanning-knop';

        weekplanningKnop.type =
            'button';

        weekplanningKnop.title =
            'Weekplanning';

        Object.assign(
            weekplanningKnop.style,
            {
                background:
                    'none',
                border:
                    'none',
                cursor:
                    'pointer',
                padding:
                    '0',
                margin:
                    '0 8px 0 0',
                width:
                    '28px',
                minWidth:
                    '28px',
                height:
                    '32px',
                display:
                    'inline-flex',
                alignItems:
                    'center',
                justifyContent:
                    'center',
                verticalAlign:
                    'middle',
                outline:
                    'none',
                position:
                    'relative',
                zIndex:
                    '999999',
                flexShrink:
                    '0'
            }
        );

        weekplanningKnop.innerHTML = `
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="
                    opacity: 1;
                    display: block;
                    pointer-events: none;
                "
            >
                <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                ></rect>

                <line
                    x1="16"
                    y1="2"
                    x2="16"
                    y2="6"
                ></line>

                <line
                    x1="8"
                    y1="2"
                    x2="8"
                    y2="6"
                ></line>

                <line
                    x1="3"
                    y1="10"
                    x2="21"
                    y2="10"
                ></line>
            </svg>
        `;

        weekplanningKnop.addEventListener(
            'click',
            openWeekplanning
        );

        const takenKnopVoorWeekplanning =
            document.getElementById(
                'egodact-taken-knop'
            );

        if (
            takenKnopVoorWeekplanning
        ) {

            takenKnopVoorWeekplanning
                .insertAdjacentElement(
                    'afterend',
                    weekplanningKnop
                );

        } else {

            egodactKnopGroep.appendChild(weekplanningKnop);
        }
    }

    // ========================================================
    // ADDONS
    // ========================================================
    if (
        addonsZichtbaar &&
        !document.getElementById(
            'egodact-addons-knop'
        )
    ) {
        const addonsKnop = document.createElement('button');
        addonsKnop.id = 'egodact-addons-knop';
        addonsKnop.type = 'button';
        addonsKnop.title = 'Addons';

        Object.assign(addonsKnop.style, {
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

        addonsKnop.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:1; display:block; pointer-events:none;"><path d="M12 2l3 3-3 3-3-3 3-3z"></path><path d="M19 9l3 3-3 3-3-3 3-3z"></path><path d="M5 9l3 3-3 3-3-3 3-3z"></path><path d="M12 16l3 3-3 3-3-3 3-3z"></path></svg>';

        addonsKnop.addEventListener('click', openAddonsMenu);

        const infoKnopVoorAddons = document.getElementById('egodact-info-knop');
        if (infoKnopVoorAddons) {
            infoKnopVoorAddons.insertAdjacentElement('afterend', addonsKnop);
        } else {
            egodactKnopGroep.appendChild(addonsKnop);
        }
    }

    // ========================================================
    // ADDON KNOPPEN (header of zwevend)
    // ========================================================
    try {
        const api = window.EgodactAddons;
        if (api && Array.isArray(api._buttons)) {
            // Verwijder knoppen die inmiddels zijn uitgeschakeld.
            api._buttons.forEach(function (entry) {
                if (!entry || !entry.id) return;
                if (!egodactButtonDisabled(entry.key)) return;
                const btnId = 'egodact-addon-btn-' + String(entry.id).replace(/[^a-z0-9_-]/gi, '-');
                const el = document.getElementById(btnId);
                if (el && el.parentNode) el.parentNode.removeChild(el);
            });
            api._buttons.forEach(function (entry) {
                if (!entry || !entry.id) return;
                if (egodactButtonDisabled(entry.key)) return;

                const veiligeId = String(entry.id).replace(/[^a-z0-9_-]/gi, '-');
                const btnId = 'egodact-addon-btn-' + veiligeId;
                if (document.getElementById(btnId)) return;

                const positie = entry.position;
                const isFloating =
                    positie === 'floating' ||
                    (positie && typeof positie === 'object') ||
                    typeof entry.x === 'number' ||
                    typeof entry.y === 'number';

                const knop = document.createElement('button');
                knop.id = btnId;
                knop.type = 'button';
                knop.title = entry.title || 'Addon';
                knop.setAttribute('data-egodact-addon-btn', '1');

                let verplaatst = false;

                if (isFloating) {
                    let startX = 24;
                    let startY = 120;

                    if (positie && typeof positie === 'object') {
                        if (typeof positie.x === 'number') startX = positie.x;
                        if (typeof positie.y === 'number') startY = positie.y;
                    }
                    if (typeof entry.x === 'number') startX = entry.x;
                    if (typeof entry.y === 'number') startY = entry.y;

                    try {
                        const opgeslagen = localStorage.getItem('egodact_addon_btn_pos_' + entry.id);
                        if (opgeslagen) {
                            const pos = JSON.parse(opgeslagen);
                            if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
                                startX = pos.x;
                                startY = pos.y;
                            }
                        }
                    } catch (err) {}

                    startX = Math.min(Math.max(0, startX), Math.max(0, window.innerWidth - 40));
                    startY = Math.min(Math.max(0, startY), Math.max(0, window.innerHeight - 40));

                    Object.assign(knop.style, {
                        position: 'fixed',
                        left: startX + 'px',
                        top: startY + 'px',
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0',
                        margin: '0',
                        border: '1px solid var(--egd-rand, #555)',
                        borderRadius: '50%',
                        background: 'var(--egd-achtergrond, #2b2b2b)',
                        color: 'var(--egd-header-icoon, #e0e0e0)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                        cursor: entry.draggable !== false ? 'grab' : 'pointer',
                        zIndex: '2147483000',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        touchAction: 'none',
                        lineHeight: '1',
                        boxSizing: 'border-box',
                        outline: 'none'
                    });

                    let dragging = false;
                    let offsetX = 0;
                    let offsetY = 0;
                    let startClientX = 0;
                    let startClientY = 0;

                    knop.addEventListener('pointerdown', function (e) {
                        if (entry.draggable === false) return;
                        if (e.pointerType === 'mouse' && e.button !== 0) return;
                        dragging = true;
                        verplaatst = false;
                        startClientX = e.clientX;
                        startClientY = e.clientY;

                        const rect = knop.getBoundingClientRect();
                        offsetX = e.clientX - rect.left;
                        offsetY = e.clientY - rect.top;

                        knop.style.cursor = 'grabbing';
                        try { knop.setPointerCapture(e.pointerId); } catch (err) {}
                    });

                    knop.addEventListener('pointermove', function (e) {
                        if (!dragging) return;

                        if (
                            Math.abs(e.clientX - startClientX) > 3 ||
                            Math.abs(e.clientY - startClientY) > 3
                        ) {
                            verplaatst = true;
                        }

                        const maxPosX = Math.max(0, window.innerWidth - knop.offsetWidth);
                        const maxPosY = Math.max(0, window.innerHeight - knop.offsetHeight);
                        const nieuwX = Math.min(Math.max(0, e.clientX - offsetX), maxPosX);
                        const nieuwY = Math.min(Math.max(0, e.clientY - offsetY), maxPosY);

                        knop.style.left = nieuwX + 'px';
                        knop.style.top = nieuwY + 'px';
                    });

                    function stopDrag() {
                        if (!dragging) return;
                        dragging = false;
                        knop.style.cursor = 'grab';
                        try {
                            localStorage.setItem(
                                'egodact_addon_btn_pos_' + entry.id,
                                JSON.stringify({
                                    x: parseFloat(knop.style.left) || 0,
                                    y: parseFloat(knop.style.top) || 0
                                })
                            );
                        } catch (err) {}
                        // Als er geen click volgt (bijv. pointercancel), flag opruimen.
                        setTimeout(function () { verplaatst = false; }, 400);
                    }

                    knop.addEventListener('pointerup', stopDrag);
                    knop.addEventListener('pointercancel', stopDrag);
                } else {
                    Object.assign(knop.style, {
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
                        lineHeight: '1',
                        boxSizing: 'border-box',
                        color: 'var(--egd-header-icoon)'
                    });
                }

                knop.innerHTML = entry.icon
                    ? '<span style="font-size:18px; line-height:1; display:block; pointer-events:none;">' + entry.icon + '</span>'
                    : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:1; display:block; pointer-events:none;"><circle cx="12" cy="12" r="9"></circle></svg>';

                knop.addEventListener('click', function () {
                    if (isFloating && verplaatst) {
                        verplaatst = false;
                        return;
                    }
                    try {
                        if (typeof entry.onClick === 'function') entry.onClick();
                    } catch (err) {
                        console.error(err);
                    }
                });

                if (isFloating) {
                    document.body.appendChild(knop);
                } else if (typeof entry.order === 'number' || entry.slot === 'name') {
                    if (!egodactSlotAdd(entry.slot || 'actions', knop, entry.order)) {
                        const zoekBinnen = menuContainer || document;
                        const bestaandeAddonKnoppen = zoekBinnen.querySelectorAll('[data-egodact-addon-btn="1"]');
                        const laatsteAddonKnop = bestaandeAddonKnoppen[bestaandeAddonKnoppen.length - 1];
                        const anker = document.getElementById('egodact-addons-knop') ||
                            document.getElementById('egodact-info-knop');
                        if (laatsteAddonKnop && laatsteAddonKnop.parentNode) {
                            laatsteAddonKnop.insertAdjacentElement('afterend', knop);
                        } else if (anker && anker.parentNode) {
                            anker.insertAdjacentElement('afterend', knop);
                        } else if (menuContainer) {
                            egodactKnopGroep.appendChild(knop);
                        }
                    }
                } else {
                    const zoekBinnen = menuContainer || document;
                    const bestaandeAddonKnoppen = zoekBinnen.querySelectorAll('[data-egodact-addon-btn="1"]');
                    const laatsteAddonKnop = bestaandeAddonKnoppen[bestaandeAddonKnoppen.length - 1];
                    const anker = document.getElementById('egodact-addons-knop') ||
                        document.getElementById('egodact-info-knop');

                    if (laatsteAddonKnop && laatsteAddonKnop.parentNode) {
                        laatsteAddonKnop.insertAdjacentElement('afterend', knop);
                    } else if (anker && anker.parentNode) {
                        anker.insertAdjacentElement('afterend', knop);
                    } else if (menuContainer) {
                        egodactKnopGroep.appendChild(knop);
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
    }

    try { egodactUpdateHamburger(); } catch (err) { console.error('Hamburger update failed:', err); }

    egodactSyncMenuButtonTheme();
    } finally { window.__egodactVoegKnoppenToeBezig = false; }
}




// ============================================================
// LEARNING MODE API (voor addons)
// ============================================================
window.egodactLearningModeEnabled = egodactLearningModeEnabled;
window.egodactSetLearningMode = function (v) {
    egodactSetLearningMode(!!v);
    try { voegKnoppenToe(); } catch (e) { console.error(e); }
    try { egodactUpdateHamburger(); } catch (e) { console.error(e); }
};

// Verberg specifieke hamburger-items (addon-API). Lege lijst = alles terug.
window.egodactSetHamburgerHidden = function (ids) {
    const next = Array.isArray(ids) ? ids.map(String) : [];
    const prev = Array.isArray(window.__egodactHiddenHamburgerIds) ? window.__egodactHiddenHamburgerIds : [];
    if (next.length === prev.length && next.every(function (v, i) { return v === prev[i]; })) return;
    window.__egodactHiddenHamburgerIds = next;
    try { egodactUpdateHamburger(); } catch (e) { console.error(e); }
};

// Geeft de momenteel zichtbare hamburger-items terug (id/title/addonId).
window.egodactGetHamburgerItems = function () {
    try {
        return egodactHamburgerMenus().map(function (m) {
            return { id: m.id || m.title, title: m.title || '', addonId: m.addonId || null, keepInLearningMode: egodactKeepInLearningMode(m) };
        });
    } catch (e) { return []; }
};
