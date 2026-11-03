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

function voegKnoppenToe() {

    // Na het uitschakelen van de extensie niets meer opbouwen.
    if (window.__egodactUitgeschakeld) return;

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

    const addonEntries = (window.EgodactAddons && Array.isArray(window.EgodactAddons._buttons))
        ? window.EgodactAddons._buttons.filter(function (entry) {
            return !(entry && egodactButtonDisabled(entry.key));
        })
        : [];
    const addonButtonsComplete = addonEntries.every(function (entry) {
        if (!entry || !entry.id) return true;
        const addonBtnId = 'egodact-addon-btn-' + String(entry.id).replace(/[^a-z0-9_-]/gi, '-');
        return !!document.getElementById(addonBtnId);
    });

    if (
        bestaandeInfo &&
        bestaandeTaken &&
        bestaandeWeekplanning &&
        (bestaandeBetaFeatures || !EGODACT_BETA_ZICHTBAAR) &&
        (bestaandeTijd || !EGODACT_TIJD_ZICHTBAAR) &&
        (bestaandeAddons || !addonsZichtbaar) &&
        addonButtonsComplete
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

    egodactSyncMenuButtonTheme();
}



