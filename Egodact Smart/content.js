// ============================================================
// BETA FEATURES ALLEEN IN DE DEV BUILD
// ============================================================
// De publieke versie toont geen Beta-knop. Een lokaal geladen
// testversie waarvan de naam in manifest.json "Dev" bevat 
// (bijvoorbeeld "Egodact Pantagora Dev Build") toont hem wel.
const EGODACT_BETA_ZICHTBAAR = (() => {
    try {
        return /\bdev\b/i.test(chrome.runtime.getManifest().name);
    } catch (err) {
        return false;
    }
})();

// ============================================================
// THEMA: DONKER / LICHT
// ============================================================
//
// Egodact heeft een donkere en een lichte modus. Alle kleuren van de
// extensie zijn CSS-variabelen (--egd-...) die hieronder voor beide
// modi zijn gedefinieerd. De modus wordt uit de pagina zelf afgeleid
// (eerst class/data-theme, dan de achtergrondkleur), en elke seconde
// opnieuw gecontroleerd. Omschakelen terwijl een venster open staat
// werkt direct, want alleen de variabelen veranderen.

const EGODACT_THEMA_CSS = `
:root {
    --egd-modal: #424242;
    --egd-veld: #2e2e2e;
    --egd-paneel: #333333;
    --egd-info: #2b2b2b;
    --egd-rand: #555555;
    --egd-lijn: #444444;
    --egd-lijn-zacht: #3c3c3c;
    --egd-tekst: #ffffff;
    --egd-tekst-zacht: #b0b0b0;
    --egd-uit: #777777;
    --egd-accent: #90caf9;
    --egd-accent-tekst: #0d47a1;
    --egd-selectie: rgba(144, 202, 249, 0.35);
    --egd-hover: rgba(144, 202, 249, 0.08);
    --egd-gevaar: #ef5350;
    --egd-fout: #ef9a9a;
    --egd-backdrop: rgba(0, 0, 0, 0.65);
    --egd-schaduw:
        0px 11px 15px -7px rgba(0, 0, 0, 0.3),
        0px 24px 38px 3px rgba(0, 0, 0, 0.2),
        0px 9px 46px 8px rgba(0, 0, 0, 0.15);
    --egd-s-streep: #0d47a1;
    --egd-s-letter: #90caf9;
    --egd-m-streep: #00b0ff;
    --egd-m-letter: #40c4ff;
    --egd-a-streep: #ffb300;
    --egd-a-letter: #ffe082;
    --egd-r-streep: #9c27b0;
    --egd-r-letter: #f48fb1;
    --egd-t-streep: #0288d1;
    --egd-t-letter: #81d4fa;
    --egd-header-icoon: #ffffff;
}

:root[data-egodact-thema="licht"] {
    --egd-modal: #ffffff;
    --egd-veld: #f5f6f8;
    --egd-paneel: #edf0f4;
    --egd-info: #f1f3f6;
    --egd-rand: #c9d0d8;
    --egd-lijn: #e1e5ea;
    --egd-lijn-zacht: #eef0f3;
    --egd-tekst: #1b2733;
    --egd-tekst-zacht: #5d6975;
    --egd-uit: #a3acb5;
    --egd-accent: #1565c0;
    --egd-accent-tekst: #ffffff;
    --egd-selectie: rgba(21, 101, 192, 0.18);
    --egd-hover: rgba(21, 101, 192, 0.06);
    --egd-gevaar: #d32f2f;
    --egd-fout: #c62828;
    --egd-backdrop: rgba(15, 23, 42, 0.42);
    --egd-schaduw:
        0px 11px 15px -7px rgba(15, 23, 42, 0.16),
        0px 24px 38px 3px rgba(15, 23, 42, 0.10),
        0px 9px 46px 8px rgba(15, 23, 42, 0.08);
    --egd-s-streep: #1565c0;
    --egd-s-letter: #0d47a1;
    --egd-m-streep: #0091ea;
    --egd-m-letter: #0277bd;
    --egd-a-streep: #ffa000;
    --egd-a-letter: #a65f00;
    --egd-r-streep: #8e24aa;
    --egd-r-letter: #ad1457;
    --egd-t-streep: #0277bd;
    --egd-t-letter: #01579b;
    --egd-header-icoon: #757575;
}

/* Formulierelementen, kiezers en scrollbalken in onze vensters volgen
   het thema (bijvoorbeeld het klokje bij een tijdveld). */
#egodact-custom-modal-backdrop {
    color-scheme: dark;
}

#egodact-custom-modal-backdrop ::placeholder {
    color: var(--egd-uit);
    opacity: 1;
}

:root[data-egodact-thema="licht"] #egodact-custom-modal-backdrop {
    color-scheme: light;
}

/* Lichte modus: een venster krijgt een fijne rand, zodat het loskomt
   van een witte pagina erachter, en invoervelden een duidelijke focus. */
:root[data-egodact-thema="licht"] #egodact-custom-modal-backdrop > div {
    border: 1px solid #d9dee5;
}

:root[data-egodact-thema="licht"] #egodact-custom-modal-backdrop input:focus,
:root[data-egodact-thema="licht"] #egodact-custom-modal-backdrop select:focus,
:root[data-egodact-thema="licht"] #egodact-custom-modal-backdrop textarea:focus {
    outline: 2px solid var(--egd-accent);
    outline-offset: -1px;
}

/* Knoppen die we in de koptekst van Egodact zetten. */
#egodact-info-knop,
#egodact-taken-knop,
#egodact-weekplanning-knop,
#egodact-beta-features-knop {
    color: var(--egd-header-icoon) !important;
}
`;

function egodactParseRgb(waarde) {
    const m =
        /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)/
            .exec(waarde || '');

    if (!m) return null;

    let alpha = 1;

    if (m[4] !== undefined) {
        alpha = m[4].endsWith('%')
            ? parseFloat(m[4]) / 100
            : parseFloat(m[4]);
    }

    return { r: +m[1], g: +m[2], b: +m[3], a: alpha };
}

function egodactIsDonkerKleur(c) {
    return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) < 140;
}

function egodactOpaakeAchtergrond(el) {
    const c = egodactParseRgb(getComputedStyle(el).backgroundColor);
    return c && c.a >= 0.9 ? c : null;
}

// Is de pagina (Egodact zelf, niet onze vensters) donker of licht?
function egodactPaginaIsDonker() {
    const eigen = el => !!(el.closest && el.closest('[id^="egodact-"]'));

    // 1. Duidelijke aanwijzingen: classes en data-theme op html, body
    //    en de eerste laag eronder (bijvoorbeeld "dark-theme").
    let licht = false;
    let donker = false;

    const hint = tekst => {
        for (const token of String(tekst || '').toLowerCase().split(/\s+/)) {
            if (!token) continue;

            if (/(^|[-_])(light|lichte?|day)([-_]|$)/.test(token)) licht = true;
            if (/(^|[-_])(dark|donkere?|night)([-_]|$)/.test(token)) donker = true;
        }
    };

    const lagen = [
        document.documentElement,
        document.body,
        ...(document.body ? document.body.children : [])
    ];

    for (const el of lagen) {
        if (!el || eigen(el)) continue;

        hint(el.getAttribute('class'));
        hint(el.getAttribute('data-theme'));
        hint(el.getAttribute('data-bs-theme'));
        hint(el.getAttribute('data-mode'));
    }

    if (licht && !donker) return false;
    if (donker && !licht) return true;

    // 2. Grote omhullende vlakken van de app: de buitenste met een
    //    effen achtergrond is de achtergrond van de pagina.
    const breed = window.innerWidth * 0.8;
    const hoog = window.innerHeight * 0.5;

    const wrappers = document.querySelectorAll(
        'body > *, body > * > *, body > * > * > *'
    );

    for (const el of wrappers) {
        if (eigen(el)) continue;

        const rect = el.getBoundingClientRect();
        if (rect.width < breed || rect.height < hoog) continue;

        const c = egodactOpaakeAchtergrond(el);
        if (c) return egodactIsDonkerKleur(c);
    }

    // 3. body en html.
    for (const el of [document.body, document.documentElement]) {
        if (!el) continue;

        const c = egodactOpaakeAchtergrond(el);
        if (c) return egodactIsDonkerKleur(c);
    }

    // 4. Voorkeur van het systeem; anders donker (zoals voorheen).
    try {
        return window.matchMedia('(prefers-color-scheme: light)')
            .matches === false;
    } catch (err) {
        return true;
    }
}

function egodactPasThemaToe() {
    try {
        const root = document.documentElement;
        if (!root) return;

        if (!document.getElementById('egodact-thema-stijl')) {
            const stijl = document.createElement('style');
            stijl.id = 'egodact-thema-stijl';
            stijl.textContent = EGODACT_THEMA_CSS;
            (document.head || root).appendChild(stijl);
        }

        const donker = egodactPaginaIsDonker();
        const thema = donker ? 'donker' : 'licht';

        if (root.getAttribute('data-egodact-thema') !== thema) {
            root.setAttribute('data-egodact-thema', thema);
        }

        // Pictogramkleur voor onze knoppen in de koptekst: gebaseerd op
        // de achtergrond van de koptekst zelf, want die kan anders zijn
        // dan de pagina (bijvoorbeeld een gekleurde balk).
        let koptekstDonker = donker;

        const knop = document.getElementById('egodact-info-knop') ||
            document.getElementById('egodact-taken-knop') ||
            document.getElementById('egodact-weekplanning-knop') ||
            document.getElementById('egodact-beta-features-knop');

        if (knop) {
            for (let el = knop.parentElement; el; el = el.parentElement) {
                const c = egodactOpaakeAchtergrond(el);

                if (c) {
                    koptekstDonker = egodactIsDonkerKleur(c);
                    break;
                }
            }
        }

        const icoon = koptekstDonker ? '#ffffff' : '#757575';

        if (root.style.getPropertyValue('--egd-header-icoon') !== icoon) {
            root.style.setProperty('--egd-header-icoon', icoon);
        }
    } catch (err) {
        console.warn('Egodact thema bijwerken mislukt:', err);
    }
}

// Blijft bestaan voor de aanroep in voegKnoppenToe().
function egodactSyncMenuButtonTheme() {
    egodactPasThemaToe();
}

egodactPasThemaToe();
setInterval(egodactPasThemaToe, 1000);

// ============================================================
// SMART MENU
// ============================================================

function openSMARTMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    if (document.getElementById('egodact-custom-modal-backdrop')) return;

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
        width: '520px',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow:
            'var(--egd-schaduw)'
    });

    let currentModalPage = 0;

    const modalPagesData = [
        {
            title: "SMART methode",
            content: `
            <div style="
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        margin-top: 5px;
                    ">
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-s-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-s-letter);
                                min-width: 20px;
                                text-align: center;
                            ">S</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Specifiek
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Is het doel duidelijk en concreet omschreven?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-m-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-m-letter);
                                min-width: 20px;
                                text-align: center;
                            ">M</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Meetbaar
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Kun je achteraf bewijzen of meten dat het doel is gehaald?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-a-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-a-letter);
                                min-width: 20px;
                                text-align: center;
                            ">A</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Aantrekkelijk
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Is het doel motiverend, uitdagend en de moeite waard?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-r-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-r-letter);
                                min-width: 20px;
                                text-align: center;
                            ">R</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Realistisch
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Is het doel haalbaar en uitvoerbaar binnen jouw planning?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-t-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-t-letter);
                                min-width: 20px;
                                text-align: center;
                            ">T</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Tijdsgebonden
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Wanneer, op welke datum of na hoeveel weken is het klaar?
                                </div>
                            </div>
                        </div>
            
                    </div>
            `
        },
        {
            title: "Geheugenpaleis",
            content: `
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
                    <p style="margin:0 0 4px; color:var(--egd-tekst-zacht); font-size:13px;">Onthoud informatie door die te koppelen aan een plek die je goed kent.</p>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-s-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-s-letter); min-width:20px;">1</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Kies een plek</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Bijvoorbeeld je huis of klaslokaal.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-m-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-m-letter); min-width:20px;">2</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Kies je route</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Loop in gedachten langs vaste plekken.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-a-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-a-letter); min-width:20px;">3</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Maak beelden</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Koppel elk punt aan iets opvallends en iets dat je moet onthouden.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-r-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-r-letter); min-width:20px;">4</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Oefen je route</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Loop hem in gedachten na om alles terug te halen.</div>
                        </div>
                    </div>
                </div>
            `
        }
    ];  

    modal.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--egd-rand); padding-bottom:10px; margin-bottom:5px;">
            <h2 id="modal-title-text" style="margin:0; font-size:22px; font-weight:500;">${modalPagesData[currentModalPage].title}</h2>
            <div style="display:flex; align-items:center; gap:4px;">
                <button id="modal-prev-btn" type="button" aria-label="Vorige pagina" title="Vorige pagina" style="background-color:transparent; border:1px solid var(--egd-accent); border-radius:4px; color:var(--egd-accent); cursor:pointer; padding:3px 9px; font-size:18px; font-weight:600; line-height:1.2; transition:background-color 120ms ease, color 120ms ease;" onmouseenter="this.style.backgroundColor='var(--egd-accent)'; this.style.color='var(--egd-accent-tekst)';" onmouseleave="this.style.backgroundColor='transparent'; this.style.color='var(--egd-accent)';">‹</button>
                <span id="modal-page-indicator" aria-live="polite" style="min-width:28px; text-align:center; color:var(--egd-tekst-zacht); font-size:12px;">1 / 2</span>
                <button id="modal-next-btn" type="button" aria-label="Volgende pagina" title="Volgende pagina" style="background-color:transparent; border:1px solid var(--egd-accent); border-radius:4px; color:var(--egd-accent); cursor:pointer; padding:3px 9px; font-size:18px; font-weight:600; line-height:1.2; transition:background-color 120ms ease, color 120ms ease;" onmouseenter="this.style.backgroundColor='var(--egd-accent)'; this.style.color='var(--egd-accent-tekst)';" onmouseleave="this.style.backgroundColor='transparent'; this.style.color='var(--egd-accent)';">›</button>
            </div>
        </div>
        <div id="modal-dynamic-content" style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
            ${modalPagesData[currentModalPage].content}
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:15px;">
            <button id="egodact-modal-sluiten" style="background-color:var(--egd-accent); border:none; color:var(--egd-accent-tekst); cursor:pointer; padding:10px 20px; font-weight:bold; font-size:14px; text-transform:uppercase; border-radius:4px; box-shadow:0px 3px 1px -2px rgba(0,0,0,0.2);">Sluiten</button>
        </div>
    `;

    const modalTitle = modal.querySelector('#modal-title-text');
    const modalBody = modal.querySelector('#modal-dynamic-content');
    const prevButton = modal.querySelector('#modal-prev-btn');
    const nextButton = modal.querySelector('#modal-next-btn');
    const pageIndicator = modal.querySelector('#modal-page-indicator');

    function updateModalView() {
        modalTitle.textContent = modalPagesData[currentModalPage].title;
        modalBody.innerHTML = modalPagesData[currentModalPage].content;
        pageIndicator.textContent = `${currentModalPage + 1} / ${modalPagesData.length}`;
        prevButton.disabled = currentModalPage === 0;
        nextButton.disabled = currentModalPage === modalPagesData.length - 1;

        [prevButton, nextButton].forEach(button => {
            button.style.opacity = button.disabled ? '0.35' : '1';
            button.style.cursor = button.disabled ? 'default' : 'pointer';
            button.style.color = button.disabled ? 'var(--egd-uit)' : 'var(--egd-accent)';
            button.style.borderColor = button.disabled ? 'var(--egd-uit)' : 'var(--egd-accent)';
        });
    }

    nextButton.addEventListener('click', () => {
        if (currentModalPage < modalPagesData.length - 1) {
            currentModalPage++;
            updateModalView();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentModalPage > 0) {
            currentModalPage--;
            updateModalView();
        }
    });

    updateModalView();


    const sluitMenu = () => backdrop.remove();

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    document
        .getElementById('egodact-modal-sluiten')
        .addEventListener('click', sluitMenu);

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            sluitMenu();
        }
    });
}


// ============================================================
// BETA FEATURES MENU
// ============================================================

function openBetaFeaturesMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    if (document.getElementById('egodact-custom-modal-backdrop')) return;

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
        width: '520px',
        maxWidth: 'calc(100vw - 32px)',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow:
            'var(--egd-schaduw)'
    });

    modal.innerHTML = `
        <h2 style="
            margin: 0;
            font-size: 22px;
            font-weight: 500;
            border-bottom: 1px solid var(--egd-rand);
            padding-bottom: 10px;
        ">Beta Features</h2>

        <button
            id="egodact-open-test-page"
            type="button"
            style="
                background-color: var(--egd-veld);
                border: 1px solid var(--egd-accent);
                color: var(--egd-accent);
                cursor: pointer;
                padding: 12px 14px;
                font-size: 14px;
                text-align: left;
                border-radius: 4px;
            "
        >Open test page</button>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 5px;
        ">
            <button
                id="egodact-beta-modal-sluiten"
                style="
                    background-color: var(--egd-accent);
                    border: none;
                    color: var(--egd-accent-tekst);
                    cursor: pointer;
                    padding: 10px 20px;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    border-radius: 4px;
                    box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2);
                "
            >Sluiten</button>
        </div>
    `;

    const sluitMenu = () => backdrop.remove();

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    modal
        .querySelector('#egodact-open-test-page')
        .addEventListener('click', () => {
            window.open(chrome.runtime.getURL('test-page.html'), '_blank');
            sluitMenu();
        });

    modal
        .querySelector('#egodact-beta-modal-sluiten')
        .addEventListener('click', sluitMenu);

    backdrop.addEventListener('click', event => {
        if (event.target === backdrop) sluitMenu();
    });
}


// ============================================================
// GAMES MENU
// ============================================================
//
// Geheim menu: typ "games" in de zoekbalk van de weekplanning.

function openGamesMenu(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (document.getElementById('egodact-custom-modal-backdrop')) return;

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
        width: '520px',
        maxWidth: 'calc(100vw - 32px)',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--egd-schaduw)'
    });

    // Tetris-icoon: een paar gekleurde blokjes op een donkere tegel.
    const tetrisBlokjes = [
        ['#00b0ff', [[0,1],[0,2],[0,3],[0,4]]],
        ['#ffb300', [[1,3],[2,3],[1,4],[2,4]]],
        ['#e53935', [[1,1],[2,1],[2,2],[3,2]]],
        ['#43a047', [[4,2],[4,3],[4,4],[3,4]]],
        ['#ab47bc', [[2,0],[3,0],[4,0],[3,1]]]
    ];

    const tetrisIcoon = `
        <svg width="56" height="56" viewBox="0 0 50 50" aria-hidden="true"
            style="display:block; flex-shrink:0; border-radius:10px; background:#1b2333;">
            ${tetrisBlokjes.map(([kleur, cellen]) => cellen.map(([c, r]) =>
                `<rect x="${2.5 + c * 9}" y="${2.5 + r * 9}" width="8" height="8" rx="1.5" fill="${kleur}"/>`
            ).join('')).join('')}
        </svg>`;

    const flappyIcoon = `
        <svg width="56" height="56" viewBox="0 0 50 50" aria-hidden="true"
            style="display:block; flex-shrink:0; border-radius:10px; background:#4fc3f7;">
            <rect x="34" y="0" width="12" height="18" fill="#43a047"/>
            <rect x="32" y="14" width="16" height="6" rx="1" fill="#2e7d32"/>
            <rect x="34" y="34" width="12" height="16" fill="#43a047"/>
            <rect x="32" y="32" width="16" height="6" rx="1" fill="#2e7d32"/>
            <circle cx="20" cy="26" r="9" fill="#fdd835" stroke="#b28900" stroke-width="1.5"/>
            <ellipse cx="17" cy="29" rx="5" ry="3" fill="#f9a825"/>
            <circle cx="24" cy="23" r="3" fill="#fff"/>
            <circle cx="25" cy="23" r="1.4" fill="#212121"/>
            <path d="M28 26 L35 28 L28 30 Z" fill="#ff7043"/>
        </svg>`;

    


    const snakeIcoon = `
        <svg width="56" height="56" viewBox="0 0 50 50" aria-hidden="true"
            style="display:block; flex-shrink:0; border-radius:10px; background:#1b2333;">

            <path d="M15 15 H29 Q35 15 35 21 V27 Q35 33 29 33 H20"
                fill="none"
                stroke="#43a047"
                stroke-width="8"
                stroke-linecap="round"
                stroke-linejoin="round"/>

            <rect x="8" y="8" width="14" height="14" rx="4" fill="#66bb6a"/>

            <circle cx="13" cy="12.5" r="1.5" fill="#1b2333"/>
            <circle cx="18" cy="12.5" r="1.5" fill="#1b2333"/>

            <path d="M20 33 H12"
                stroke="#43a047"
                stroke-width="6"
                stroke-linecap="round"/>

            <path d="M8 16 H4"
                fill="none"
                stroke="#ef5350"
                stroke-width="1.5"
                stroke-linecap="round"/>
        </svg>`;




    const controllerIcoon = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true"
            style="display:block; flex-shrink:0; color:var(--egd-accent);">
            <line x1="6" y1="12" x2="10" y2="12"/>
            <line x1="8" y1="10" x2="8" y2="14"/>
            <line x1="15" y1="13" x2="15.01" y2="13"/>
            <line x1="18" y1="11" x2="18.01" y2="11"/>
            <rect x="2" y="6" width="20" height="12" rx="2"/>
        </svg>`;

    modal.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--egd-rand);
            padding-bottom: 10px;
        ">
            ${controllerIcoon}
            <h2 style="
                margin: 0;
                font-size: 22px;
                font-weight: 500;
            ">Games</h2>
        </div>

        <button
            id="egodact-game-tetris"
            type="button"
            style="
                display: flex;
                align-items: center;
                gap: 16px;
                width: 100%;
                text-align: left;
                background-color: var(--egd-veld);
                color: var(--egd-tekst);
                border: 1px solid var(--egd-rand);
                border-radius: 6px;
                padding: 14px;
                cursor: pointer;
                font-family: inherit;
            "
        >
            ${tetrisIcoon}
            <span style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px;">
                <span style="font-size:17px; font-weight:bold;">Challenge Tetris</span>
                <span style="font-size:13px; color:var(--egd-tekst-zacht); line-height:1.4;">
                    Tetris met jouw challenges als blokjes. Je spel wordt bewaard.
                </span>
            </span>
            <span style="
                background-color: var(--egd-accent);
                color: var(--egd-accent-tekst);
                border-radius: 4px;
                padding: 8px 14px;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
            ">Spelen</span>
        </button>

        <button
            id="egodact-game-flappy"
            type="button"
            style="
                display: flex;
                align-items: center;
                gap: 16px;
                width: 100%;
                text-align: left;
                background-color: var(--egd-veld);
                color: var(--egd-tekst);
                border: 1px solid var(--egd-rand);
                border-radius: 6px;
                padding: 14px;
                cursor: pointer;
                font-family: inherit;
            "
        >
            ${flappyIcoon}
            <span style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px;">
                <span style="font-size:17px; font-weight:bold;">Challenge Flappy</span>
                <span style="font-size:13px; color:var(--egd-tekst-zacht); line-height:1.4;">
                    Vlieg tussen jouw challenges door. Hoe ver kom je?
                </span>
            </span>
            <span style="
                background-color: var(--egd-accent);
                color: var(--egd-accent-tekst);
                border-radius: 4px;
                padding: 8px 14px;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
            ">Spelen</span>
        </button>

        <button
            id="egodact-game-snake"
            type="button"
            style="
                display: flex;
                align-items: center;
                gap: 16px;
                width: 100%;
                text-align: left;
                background-color: var(--egd-veld);
                color: var(--egd-tekst);
                border: 1px solid var(--egd-rand);
                border-radius: 6px;
                padding: 14px;
                cursor: pointer;
                font-family: inherit;
            "
        >
            ${snakeIcoon}
            <span style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px;">
                <span style="font-size:17px; font-weight:bold;">Challenge Snake</span>
                <span style="font-size:13px; color:var(--egd-tekst-zacht); line-height:1.4;">
                    Speel het klassieke Snake-spel. Hoeveel punten kun je halen?
                </span>
            </span>
            <span style="
                background-color: var(--egd-accent);
                color: var(--egd-accent-tekst);
                border-radius: 4px;
                padding: 8px 14px;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
            ">Spelen</span>
        </button>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 5px;
        ">
            <button
                id="egodact-games-sluiten"
                type="button"
                style="
                    background-color: var(--egd-accent);
                    border: none;
                    color: var(--egd-accent-tekst);
                    cursor: pointer;
                    padding: 10px 20px;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    border-radius: 4px;
                    box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2);
                "
            >Sluiten</button>
        </div>
    `;

    const sluitMenu = () => backdrop.remove();

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    modal.querySelectorAll('[id^="egodact-game-"]').forEach(kaart => {
        kaart.addEventListener('mouseenter', () => {
            kaart.style.borderColor = 'var(--egd-accent)';
        });
        kaart.addEventListener('mouseleave', () => {
            kaart.style.borderColor = 'var(--egd-rand)';
        });
    });

    modal.querySelector('#egodact-game-tetris').addEventListener('click', () => {
        sluitMenu();
        // Na het spelen terug naar het gamesmenu.
        openTetris(null, openGamesMenu);
    });

    modal
        .querySelector('#egodact-game-flappy')
        .addEventListener('click', () => {
            sluitMenu();
            openFlappy(null, openGamesMenu);
        });

    modal
        .querySelector('#egodact-game-snake')
        .addEventListener('click', () => {
            sluitMenu();
            openSnakeMenu();
        });

    modal
        .querySelector('#egodact-games-sluiten')
        .addEventListener('click', sluitMenu);

    backdrop.addEventListener('click', event => {
        if (event.target === backdrop) sluitMenu();
    });
}

// ============================================================
// Snake (beta)
// ============================================================

function openSnakeMenu() {
    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const B = 360;
    const H = 540;
    const CEL = 18;
    const KOLOMMEN = B / CEL;
    const RIJEN = H / CEL;
    const SNELHEID = 115;

    const backdrop = document.createElement('div');
    backdrop.id = 'egodact-custom-modal-backdrop';

    Object.assign(backdrop.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '9999999',
        backgroundColor: 'var(--egd-backdrop)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    const modal = document.createElement('div');

    Object.assign(modal.style, {
        backgroundColor: 'var(--egd-modal)',
        color: 'var(--egd-tekst)',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: 'var(--egd-schaduw)',
        display: 'flex',
        gap: '20px',
        fontFamily: 'inherit',
        maxHeight: '96vh',
        maxWidth: 'calc(100vw - 24px)',
        boxSizing: 'border-box'
    });

    modal.innerHTML = `
        <canvas
            width="${B}"
            height="${H}"
            tabindex="0"
            aria-label="Snake speelveld"
            style="
                display:block;
                width:min(360px, 45vw);
                height:auto;
                aspect-ratio:2 / 3;
                background:#111923;
                border:1px solid var(--egd-rand);
                align-self:flex-start;
                box-sizing:border-box;
                outline:none;
            "
        ></canvas>

        <div style="
            width:200px;
            min-width:0;
            display:flex;
            flex-direction:column;
            gap:10px;
            font-size:13px;
        ">
            <h2 style="margin:0; font-weight:500;">
                Challenge Snake
            </h2>

            <div style="
                background:var(--egd-veld);
                border:1px solid var(--egd-rand);
                border-radius:4px;
                padding:10px;
            ">
                <div style="
                    color:var(--egd-tekst-zacht);
                    font-size:11px;
                    text-transform:uppercase;
                    letter-spacing:.5px;
                ">Score</div>
                <div id="egd-snake-score" style="
                    font-size:28px;
                    font-weight:bold;
                    margin-top:3px;
                ">0</div>
            </div>

            <div style="
                color:var(--egd-tekst-zacht);
                font-size:11px;
                text-transform:uppercase;
                letter-spacing:.5px;
                margin-top:4px;
            ">Besturing</div>

            <div style="
                color:var(--egd-tekst);
                line-height:1.8;
            ">
                ↑ ↓ ← → bewegen<br>
                WASD bewegen<br>
                Enter opnieuw starten<br>
                Esc terug naar Games
            </div>

            <div id="egd-snake-status" style="
                color:#66bb6a;
                font-weight:bold;
                margin-top:auto;
            ">Klaar om te spelen</div>

            <button
                id="egd-snake-sluiten"
                type="button"
                style="
                    background:var(--egd-accent);
                    color:var(--egd-accent-tekst);
                    border:none;
                    border-radius:4px;
                    padding:8px 12px;
                    font-weight:bold;
                    font-size:13px;
                    cursor:pointer;
                "
            >SLUITEN</button>
        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const canvas = modal.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = modal.querySelector('#egd-snake-score');
    const statusEl = modal.querySelector('#egd-snake-status');

    let slang;
    let richting;
    let volgendeRichting;
    let eten;
    let score;
    let status;
    let laatsteStap = 0;
    let raf;
    let gesloten = false;

    function plaatsEten() {
        do {
            eten = {
                x: Math.floor(Math.random() * KOLOMMEN),
                y: Math.floor(Math.random() * RIJEN)
            };
        } while (slang.some(deel =>
            deel.x === eten.x && deel.y === eten.y
        ));
    }

    function nieuwSpel() {
        slang = [
            { x: 5, y: 15 },
            { x: 4, y: 15 },
            { x: 3, y: 15 }
        ];

        richting = { x: 1, y: 0 };
        volgendeRichting = { x: 1, y: 0 };
        score = 0;
        status = 'wacht';

        scoreEl.textContent = '0';
        statusEl.textContent = 'Klaar om te spelen';
        statusEl.style.color = '#66bb6a';

        plaatsEten();
        teken();
    }

    function teken() {
        ctx.fillStyle = '#111923';
        ctx.fillRect(0, 0, B, H);

        // Subtiel raster
        ctx.strokeStyle = 'rgba(255,255,255,0.045)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= B; x += CEL) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }

        for (let y = 0; y <= H; y += CEL) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(B, y);
            ctx.stroke();
        }

        // Appel
        const ex = eten.x * CEL + CEL / 2;
        const ey = eten.y * CEL + CEL / 2;

        ctx.fillStyle = '#ef5350';
        ctx.beginPath();
        ctx.arc(ex, ey + 1, CEL * 0.36, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#66bb6a';
        ctx.beginPath();
        ctx.ellipse(ex + 4, ey - 6, 4, 2, -0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#a5d6a7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ex, ey - 5);
        ctx.lineTo(ex + 1, ey - 9);
        ctx.stroke();

        // Slang
        slang.forEach((deel, i) => {
            const marge = i === 0 ? 1 : 2;

            ctx.fillStyle = i === 0 ? '#a5d6a7' : '#43a047';
            ctx.fillRect(
                deel.x * CEL + marge,
                deel.y * CEL + marge,
                CEL - marge * 2,
                CEL - marge * 2
            );

            if (i === 0) {
                // Ogen kijken in de bewegingsrichting
                ctx.fillStyle = '#102015';

                let oog1;
                let oog2;

                if (richting.x === 1) {
                    oog1 = [12, 5];
                    oog2 = [12, 12];
                } else if (richting.x === -1) {
                    oog1 = [5, 5];
                    oog2 = [5, 12];
                } else if (richting.y === -1) {
                    oog1 = [5, 5];
                    oog2 = [12, 5];
                } else {
                    oog1 = [5, 12];
                    oog2 = [12, 12];
                }

                [oog1, oog2].forEach(([ox, oy]) => {
                    ctx.beginPath();
                    ctx.arc(
                        deel.x * CEL + ox,
                        deel.y * CEL + oy,
                        1.6,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                });
            }
        });

        // Bericht in het speelveld
        if (status === 'wacht' || status === 'dood' || status === 'gewonnen') {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(18, H / 2 - 55, B - 36, 110);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = status === 'gewonnen' ? '#66bb6a' : '#ffffff';
            ctx.font = 'bold 23px Arial';

            const titel = status === 'wacht'
                ? 'SNAKE'
                : status === 'gewonnen'
                    ? 'Gewonnen!'
                    : 'Game over';

            ctx.fillText(titel, B / 2, H / 2 - 19);

            ctx.fillStyle = '#c6d0dc';
            ctx.font = '13px Arial';

            const uitleg = status === 'wacht'
                ? 'Druk op een pijltjestoets'
                : 'Score: ' + score + '  ·  Enter = opnieuw';

            ctx.fillText(uitleg, B / 2, H / 2 + 17);
        }
    }

    function stap() {
        richting = { ...volgendeRichting };

        const kop = {
            x: slang[0].x + richting.x,
            y: slang[0].y + richting.y
        };

        // Muur geraakt?
        if (
            kop.x < 0 || kop.x >= KOLOMMEN ||
            kop.y < 0 || kop.y >= RIJEN
        ) {
            eindig();
            return;
        }

        const eet = kop.x === eten.x && kop.y === eten.y;

        // De staart beweegt normaal weg, behalve als er gegeten wordt.
        const lichaam = eet ? slang : slang.slice(0, -1);

        if (lichaam.some(deel =>
            deel.x === kop.x && deel.y === kop.y
        )) {
            eindig();
            return;
        }

        slang.unshift(kop);

        if (eet) {
            score++;
            scoreEl.textContent = String(score);

            if (slang.length === KOLOMMEN * RIJEN) {
                status = 'gewonnen';
                statusEl.textContent = 'Je hebt gewonnen!';
                statusEl.style.color = '#66bb6a';
                teken();
                return;
            }

            plaatsEten();
        } else {
            slang.pop();
        }

        teken();
    }

    function eindig() {
        status = 'dood';
        statusEl.textContent = 'Game over';
        statusEl.style.color = '#ef5350';
        teken();
    }

    function start() {
        if (status === 'dood' || status === 'gewonnen') {
            nieuwSpel();
        }

        status = 'bezig';
        laatsteStap = 0;
        statusEl.textContent = 'Aan het spelen';
        statusEl.style.color = '#66bb6a';
    }

    function kiesRichting(x, y) {
        if (status === 'dood' || status === 'gewonnen') return;

        // Voorkom dat de slang direct omkeert.
        if (x === -richting.x && y === -richting.y) return;

        volgendeRichting = { x, y };

        if (status === 'wacht') {
            start();
        }
    }

    function lus(nu) {
        if (gesloten) return;

        raf = requestAnimationFrame(lus);

        if (status === 'bezig') {
            if (!laatsteStap) laatsteStap = nu;

            if (nu - laatsteStap >= SNELHEID) {
                laatsteStap = nu;
                stap();
            }
        }
    }

    function toets(ev) {
        if (ev.key === 'Escape') {
            ev.preventDefault();
            ev.stopPropagation();
            terugNaarGames();
            return;
        }

        const k = ev.key.toLowerCase();
        const toetsen = [
            'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
            'w', 'a', 's', 'd', 'enter', ' '
        ];

        if (!toetsen.includes(k)) return;

        ev.preventDefault();
        ev.stopPropagation();

        if (k === 'enter' || k === ' ') {
            if (status !== 'bezig') start();
            return;
        }

        if (k === 'arrowup' || k === 'w') kiesRichting(0, -1);
        if (k === 'arrowdown' || k === 's') kiesRichting(0, 1);
        if (k === 'arrowleft' || k === 'a') kiesRichting(-1, 0);
        if (k === 'arrowright' || k === 'd') kiesRichting(1, 0);
    }

    function terugNaarGames() {
        if (gesloten) return;

        gesloten = true;
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', toets, true);
        backdrop.remove();

        openGamesMenu();
    }

    document.addEventListener('keydown', toets, true);

    modal.querySelector('#egd-snake-sluiten')
        .addEventListener('click', terugNaarGames);

    backdrop.addEventListener('click', ev => {
        if (ev.target === backdrop) terugNaarGames();
    });

    canvas.addEventListener('pointerdown', () => {
        canvas.focus();

        if (status !== 'bezig') start();
    });

    nieuwSpel();
    raf = requestAnimationFrame(lus);
}


// ============================================================
// FLAPPY BIRD MET CHALLENGES (beta)
// ============================================================
//
// De buizen zijn je challenges: kleur en naam komen uit Egodact.
// Het record wordt bewaard in localStorage.

function openFlappy(e, naSluiten) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const B = 360, H = 540, GROND = 46;
    const VOGEL_X = 96, STRAAL = 13;
    const ZWAARTEKRACHT = 1500, SPRONG = -430;
    const SNELHEID = 150, BUIS_B = 58, OPENING = 158, AFSTAND = 210;
    const RECORD_KEY = 'egodact_flappy_record';
    const STANDAARD_KLEUREN = [
        '#43a047', '#1976d2', '#e53935', '#fb8c00', '#8e24aa', '#00acc1'
    ];

    // ---------- venster ----------
    const backdrop = document.createElement('div');
    backdrop.id = 'egodact-custom-modal-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed', inset: '0', zIndex: '9999999',
        backgroundColor: 'var(--egd-backdrop)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        backgroundColor: 'var(--egd-modal)', color: 'var(--egd-tekst)',
        padding: '20px', borderRadius: '4px', boxShadow: 'var(--egd-schaduw)',
        display: 'flex', gap: '20px', fontFamily: 'inherit',
        maxHeight: '96vh', boxSizing: 'border-box'
    });

    modal.innerHTML = `
        <canvas width="${B}" height="${H}"
            style="background:var(--egd-veld); border:1px solid var(--egd-rand); align-self:flex-start; cursor:pointer;"></canvas>
        <div style="width:200px; display:flex; flex-direction:column; gap:8px; font-size:13px;">
            <h2 style="margin:0; font-weight:500;">Challenge Flappy</h2>
            <div>Score: <b id="egd-flappy-score">0</b> &nbsp; Record: <b id="egd-flappy-record">0</b></div>

            <div style="color:var(--egd-tekst-zacht); font-size:11px; text-transform:uppercase; letter-spacing:.5px; margin-top:4px;">Gepasseerd per challenge</div>
            <div id="egd-flappy-stats" style="display:flex; flex-direction:column; gap:4px; min-width:0;"></div>

            <div style="color:var(--egd-tekst-zacht); font-size:11px; line-height:1.6; margin-top:auto;">
                Spatie, ↑ of klik: omhoog<br>
                P: pauze · Esc: sluiten<br>
                Vlieg tussen de challenges door.
            </div>
            <button id="egd-flappy-sluiten" type="button" style="
                background:var(--egd-accent); color:var(--egd-accent-tekst);
                border:none; border-radius:4px; padding:8px 12px;
                font-weight:bold; font-size:13px; cursor:pointer;">SLUITEN</button>
        </div>`;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const canvas = modal.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const $ = id => modal.querySelector('#' + id);

    // ---------- challenges als buizen ----------
    let bronnen = [];
    let zak = [];

    const trekBron = () => {
        if (!bronnen.length) {
            return {
                n: 'Buis',
                k: STANDAARD_KLEUREN[Math.floor(Math.random() * STANDAARD_KLEUREN.length)]
            };
        }
        if (!zak.length) {
            zak = bronnen.map((_, i) => i);
            for (let i = zak.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [zak[i], zak[j]] = [zak[j], zak[i]];
            }
        }
        const b = bronnen[zak.pop()];
        return { n: b.naam, k: b.kleur };
    };

    egodactLaadChallenges().then(lijst => {
        const actief = lijst.filter(c => c.fase !== 'DONE');
        const gekozen = actief.length ? actief : lijst;
        bronnen = gekozen.map((c, i) => ({
            naam: c.naam,
            kleur: c.kleur || STANDAARD_KLEUREN[i % STANDAARD_KLEUREN.length]
        }));
    }).catch(err => {
        console.warn('Flappy: challenges laden mislukt, standaardbuizen gebruikt.', err);
    });

    // ---------- spelstatus ----------
    let vogel, buizen, score, stats, status, raf;
    // status: 'wacht' (wacht op eerste sprong), 'bezig', 'pauze', 'dood'
    let record = 0;
    try { record = Number(localStorage.getItem(RECORD_KEY)) || 0; } catch (err) {}
    let vloer = 0;   // voor het verschuiven van de grond

    const initialen = naam =>
        (naam || '?').replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2).toUpperCase();

    const nieuwSpel = () => {
        vogel = { y: H / 2 - 30, v: 0 };
        buizen = [];
        score = 0;
        stats = {};
        status = 'wacht';
        updateUi();
    };

    const maakBuis = x => {
        const bron = trekBron();
        const min = 70, max = H - GROND - OPENING - 70;
        return {
            x,
            gat: min + Math.random() * (max - min),
            k: bron.k, n: bron.n,
            geteld: false
        };
    };

    const updateUi = () => {
        $('egd-flappy-score').textContent = score;
        $('egd-flappy-record').textContent = record;

        const statsEl = $('egd-flappy-stats');
        statsEl.innerHTML = '';

        const top = Object.entries(stats)
            .sort((a, b) => b[1].aantal - a[1].aantal)
            .slice(0, 5);

        if (!top.length) {
            const leeg = document.createElement('span');
            leeg.textContent = 'Nog niets';
            leeg.style.color = 'var(--egd-tekst-zacht)';
            statsEl.appendChild(leeg);
        }

        top.forEach(([naam, s]) => {
            const regel = document.createElement('div');
            Object.assign(regel.style, {
                display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0'
            });

            const vlak = document.createElement('span');
            Object.assign(vlak.style, {
                width: '10px', height: '10px', borderRadius: '2px',
                background: s.k, flexShrink: '0'
            });

            const tekst = document.createElement('span');
            tekst.textContent = naam;
            tekst.title = naam;
            Object.assign(tekst.style, {
                flex: '1', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            });

            const aantal = document.createElement('b');
            aantal.textContent = s.aantal;

            regel.append(vlak, tekst, aantal);
            statsEl.appendChild(regel);
        });
    };

    const spring = () => {
        if (status === 'dood' || status === 'pauze') return;
        if (status === 'wacht') {
            status = 'bezig';
            buizen = [maakBuis(B + 40)];
        }
        vogel.v = SPRONG;
    };

    const sterf = () => {
        status = 'dood';
        if (score > record) {
            record = score;
            try { localStorage.setItem(RECORD_KEY, String(record)); } catch (err) {}
        }
        updateUi();
    };

    const raaktBuis = b => {
        // cirkel tegen twee rechthoeken (boven- en onderbuis)
        const hit = (rx, ry, rb, rh) => {
            const cx = Math.max(rx, Math.min(VOGEL_X, rx + rb));
            const cy = Math.max(ry, Math.min(vogel.y, ry + rh));
            return (VOGEL_X - cx) ** 2 + (vogel.y - cy) ** 2 < STRAAL ** 2;
        };
        return hit(b.x, 0, BUIS_B, b.gat) ||
               hit(b.x, b.gat + OPENING, BUIS_B, H);
    };

    const update = dt => {
        vloer = (vloer + SNELHEID * dt) % 24;

        if (status === 'wacht') {
            // zweeft rustig op en neer
            vogel.y = H / 2 - 30 + Math.sin(performance.now() / 220) * 8;
            return;
        }
        if (status !== 'bezig') return;

        vogel.v += ZWAARTEKRACHT * dt;
        vogel.y += vogel.v * dt;

        buizen.forEach(b => { b.x -= SNELHEID * dt; });

        const laatste = buizen[buizen.length - 1];
        if (laatste && laatste.x < B - AFSTAND) buizen.push(maakBuis(B + 10));
        buizen = buizen.filter(b => b.x + BUIS_B > -10);

        buizen.forEach(b => {
            if (!b.geteld && b.x + BUIS_B < VOGEL_X - STRAAL) {
                b.geteld = true;
                score++;
                if (!stats[b.n]) stats[b.n] = { k: b.k, aantal: 0 };
                stats[b.n].aantal++;
                updateUi();
            }
        });

        if (vogel.y + STRAAL >= H - GROND || vogel.y - STRAAL <= 0 ||
            buizen.some(raaktBuis)) {
            vogel.y = Math.min(vogel.y, H - GROND - STRAAL);
            sterf();
        }
    };

    // ---------- tekenen ----------
    const kleurVar = naam =>
        getComputedStyle(backdrop).getPropertyValue(naam).trim();

    const buisTekenen = b => {
        const rand = 'rgba(0,0,0,0.3)';
        const kap = 16;

        const deel = (y, h, kapBoven) => {
            ctx.fillStyle = b.k;
            ctx.fillRect(b.x, y, BUIS_B, h);
            ctx.strokeStyle = rand;
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x + 1, y + 1, BUIS_B - 2, h - 2);

            // rand ("kap") bij de opening, iets breder
            const ky = kapBoven ? y : y + h - kap;
            ctx.fillStyle = b.k;
            ctx.fillRect(b.x - 4, ky, BUIS_B + 8, kap);
            ctx.strokeRect(b.x - 3, ky + 1, BUIS_B + 6, kap - 2);

            // lichte glans
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(b.x + 8, y, 8, h);
        };

        deel(0, b.gat, false);
        deel(b.gat + OPENING, H - (b.gat + OPENING), true);

        // initialen op de bovenbuis, net boven de opening
        ctx.fillStyle = egodactKleurIsDonker(b.k) ? '#ffffff' : '#212121';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initialen(b.n), b.x + BUIS_B / 2, Math.max(14, b.gat - 32));
    };

    const vogelTekenen = () => {
        ctx.save();
        ctx.translate(VOGEL_X, vogel.y);
        const hoek = status === 'wacht'
            ? 0
            : Math.max(-0.5, Math.min(1.2, vogel.v / 600));
        ctx.rotate(hoek);

        // lichaam
        ctx.fillStyle = '#fdd835';
        ctx.beginPath();
        ctx.arc(0, 0, STRAAL + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // vleugel
        ctx.fillStyle = '#f9a825';
        ctx.beginPath();
        ctx.ellipse(-4, 4, 8, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // oog
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(7.5, -5, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // snavel
        ctx.fillStyle = '#ff7043';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(21, 3);
        ctx.lineTo(10, 7);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    };

    const tekst = (regel1, regel2) => {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, H / 2 - 70, B, 110);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(regel1, B / 2, H / 2 - 24);
        ctx.font = '14px sans-serif';
        ctx.fillText(regel2, B / 2, H / 2 + 6);
    };

    const teken = () => {
        ctx.fillStyle = kleurVar('--egd-veld');
        ctx.fillRect(0, 0, B, H);

        buizen.forEach(buisTekenen);

        // grond
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(0, H - GROND, B, GROND);
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(0, H - GROND, B, 6);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let x = -vloer; x < B; x += 24) {
            ctx.fillRect(x, H - GROND + 12, 12, 6);
            ctx.fillRect(x + 12, H - GROND + 28, 12, 6);
        }

        vogelTekenen();

        // score bovenin
        if (status === 'bezig' || status === 'dood') {
            ctx.fillStyle = kleurVar('--egd-tekst');
            ctx.font = 'bold 34px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(String(score), B / 2, 56);
        }

        if (status === 'wacht') tekst('Klaar?', 'Spatie, ↑ of klik om te starten');
        if (status === 'pauze') tekst('Pauze', 'Druk op P om verder te gaan');
        if (status === 'dood') tekst('Game over', `Score ${score} · Enter of klik = opnieuw`);
    };

    // ---------- spelloop ----------
    let vorige = performance.now();

    const lus = nu => {
        raf = requestAnimationFrame(lus);
        const dt = Math.min(0.05, (nu - vorige) / 1000);
        vorige = nu;
        update(dt);
        teken();
    };

    // ---------- invoer ----------
    const sluit = () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', toets, true);
        backdrop.remove();
        if (typeof naSluiten === 'function') naSluiten();
    };

    const actie = () => {
        if (status === 'dood') { nieuwSpel(); return; }
        spring();
    };

    function toets(ev) {
        const k = ev.key;
        if (![' ', 'ArrowUp', 'p', 'P', 'Escape', 'Enter'].includes(k)) return;
        ev.preventDefault();
        ev.stopPropagation(); // Egodact zelf reageert er niet op

        if (k === 'Escape') return sluit();
        if (ev.repeat) return;

        if (k === 'p' || k === 'P') {
            if (status === 'bezig') status = 'pauze';
            else if (status === 'pauze') status = 'bezig';
            return;
        }
        if (k === 'Enter') { if (status === 'dood') nieuwSpel(); return; }

        if (status === 'pauze') { status = 'bezig'; return; }
        actie();
    }

    canvas.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        if (status === 'pauze') { status = 'bezig'; return; }
        actie();
    });
    $('egd-flappy-sluiten').addEventListener('click', sluit);
    backdrop.addEventListener('click', ev => { if (ev.target === backdrop) sluit(); });
    document.addEventListener('keydown', toets, true);

    nieuwSpel();
    raf = requestAnimationFrame(lus);
}


// ============================================================
// TETRIS MET CHALLENGES (beta)
// ============================================================
//
// Elk blokje is een van je challenges: de kleur en naam komen uit
// Egodact. Het spel wordt bewaard in localStorage, dus je kunt het
// menu sluiten (of de pagina verversen) en later verder spelen.

function openTetris(e, naSluiten) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const COLS = 10, ROWS = 20, CEL = 24;
    const SAVE_KEY = 'egodact_tetris_save_v2';
    const RECORD_KEY = 'egodact_tetris_record';
    const VORMEN = [
        [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
        [[1,1],[1,1]],
        [[0,1,0],[1,1,1],[0,0,0]],
        [[0,1,1],[1,1,0],[0,0,0]],
        [[1,1,0],[0,1,1],[0,0,0]],
        [[1,0,0],[1,1,1],[0,0,0]],
        [[0,0,1],[1,1,1],[0,0,0]]
    ];
    const STANDAARD_KLEUREN = [
        '#1976d2', '#e53935', '#43a047', '#fb8c00',
        '#8e24aa', '#00acc1', '#fdd835', '#6d4c41'
    ];

    // ---------- venster ----------
    const backdrop = document.createElement('div');
    backdrop.id = 'egodact-custom-modal-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed', inset: '0', zIndex: '9999999',
        backgroundColor: 'var(--egd-backdrop)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        backgroundColor: 'var(--egd-modal)', color: 'var(--egd-tekst)',
        padding: '20px', borderRadius: '4px', boxShadow: 'var(--egd-schaduw)',
        display: 'flex', gap: '20px', fontFamily: 'inherit',
        maxHeight: '96vh', boxSizing: 'border-box'
    });

    const knopStijl = `
        border:1px solid var(--egd-accent); background:var(--egd-veld);
        color:var(--egd-accent); border-radius:4px; padding:8px 12px;
        font-size:13px; cursor:pointer;`;

    modal.innerHTML = `
        <canvas width="${COLS * CEL}" height="${ROWS * CEL}"
            style="background:var(--egd-veld); border:1px solid var(--egd-rand); align-self:flex-start;"></canvas>
        <div style="width:200px; display:flex; flex-direction:column; gap:8px; font-size:13px;">
            <h2 style="margin:0; font-weight:500;">Challenge Tetris</h2>
            <div>Score: <b id="egd-tetris-score">0</b> &nbsp; Level: <b id="egd-tetris-level">1</b></div>
            <div>Lijnen: <b id="egd-tetris-lijnen">0</b> &nbsp; Record: <b id="egd-tetris-record">0</b></div>

            <div style="color:var(--egd-tekst-zacht); font-size:11px; text-transform:uppercase; letter-spacing:.5px; margin-top:4px;">Nu</div>
            <div id="egd-tetris-nu" style="display:flex; align-items:center; gap:8px; min-width:0;"></div>
            <div style="color:var(--egd-tekst-zacht); font-size:11px; text-transform:uppercase; letter-spacing:.5px;">Volgende</div>
            <div id="egd-tetris-volgende" style="display:flex; align-items:center; gap:8px; min-width:0;"></div>

            <div style="color:var(--egd-tekst-zacht); font-size:11px; text-transform:uppercase; letter-spacing:.5px; margin-top:4px;">Opgeruimd per challenge</div>
            <div id="egd-tetris-stats" style="display:flex; flex-direction:column; gap:4px; min-width:0;"></div>

            <div style="color:var(--egd-tekst-zacht); font-size:11px; line-height:1.6; margin-top:auto;">
                ← → bewegen · ↑ draaien · ↓ sneller<br>
                Spatie: laten vallen · P: pauze · Esc: sluiten<br>
                Je spel wordt automatisch bewaard.
            </div>
            <div style="display:flex; gap:8px;">
                <button id="egd-tetris-nieuw" type="button" style="${knopStijl}">Nieuw spel</button>
                <button id="egd-tetris-sluiten" type="button" style="
                    flex:1; background:var(--egd-accent); color:var(--egd-accent-tekst);
                    border:none; border-radius:4px; padding:8px 12px;
                    font-weight:bold; font-size:13px; cursor:pointer;">SLUITEN</button>
            </div>
        </div>`;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const canvas = modal.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const $ = id => modal.querySelector('#' + id);

    // ---------- challenges als bron van de blokjes ----------
    let bronnen = [];       // [{ naam, kleur }]
    let zak = [];           // willekeurige volgorde, zodat ze allemaal aan bod komen

    const trekBron = () => {
        if (!bronnen.length) {
            return { n: 'Tetris', k: STANDAARD_KLEUREN[Math.floor(Math.random() * STANDAARD_KLEUREN.length)] };
        }
        if (!zak.length) {
            zak = bronnen.map((_, i) => i);
            for (let i = zak.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [zak[i], zak[j]] = [zak[j], zak[i]];
            }
        }
        const b = bronnen[zak.pop()];
        return { n: b.naam, k: b.kleur };
    };

    const laadBronnen = async () => {
        try {
            const lijst = await egodactLaadChallenges();
            const actief = lijst.filter(c => c.fase !== 'DONE');
            const gekozen = actief.length ? actief : lijst;

            bronnen = gekozen.map((c, i) => ({
                naam: c.naam,
                kleur: c.kleur || STANDAARD_KLEUREN[i % STANDAARD_KLEUREN.length]
            }));
        } catch (err) {
            console.warn('Tetris: challenges laden mislukt, standaardblokjes gebruikt.', err);
        }
    };

    // ---------- spelstatus ----------
    let bord, stuk, volgende, score, lijnen, einde, pauze, teller, raf;
    let stats = {};         // { naam: { k, aantal } }
    let record = 0;
    try { record = Number(localStorage.getItem(RECORD_KEY)) || 0; } catch (err) {}

    const level = () => Math.floor(lijnen / 10) + 1;

    const initialen = naam =>
        (naam || '?').replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2).toUpperCase();

    const maakStuk = bron => {
        const vorm = VORMEN[Math.floor(Math.random() * VORMEN.length)].map(r => [...r]);
        return {
            vorm, k: bron.k, n: bron.n,
            x: Math.floor((COLS - vorm[0].length) / 2), y: 0
        };
    };

    const botst = (vorm, x, y) => vorm.some((rij, r) => rij.some((v, c) => {
        if (!v) return false;
        const nx = x + c, ny = y + r;
        return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && bord[ny][nx]);
    }));

    const draai = vorm => vorm[0].map((_, i) => vorm.map(r => r[i]).reverse());

    const ankerVan = vorm => {
        for (let r = 0; r < vorm.length; r++) {
            for (let c = 0; c < vorm[r].length; c++) {
                if (vorm[r][c]) return { r, c };
            }
        }
        return { r: 0, c: 0 };
    };

    // ---------- bewaren en hervatten ----------
    const bewaar = () => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                bord, stuk, volgende, score, lijnen, einde, stats, tijd: Date.now()
            }));
        } catch (err) {}
    };

    const herstel = () => {
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
            if (!s || !Array.isArray(s.bord) || s.bord.length !== ROWS ||
                !s.bord.every(r => Array.isArray(r) && r.length === COLS) ||
                !s.stuk || !Array.isArray(s.stuk.vorm)) {
                return false;
            }
            bord = s.bord;
            stuk = s.stuk;
            volgende = s.volgende || null;
            score = Number(s.score) || 0;
            lijnen = Number(s.lijnen) || 0;
            einde = !!s.einde;
            stats = s.stats && typeof s.stats === 'object' ? s.stats : {};
            pauze = !einde;   // hervat altijd gepauzeerd
            teller = 0;
            return true;
        } catch (err) {
            return false;
        }
    };

    const nieuwSpel = () => {
        bord = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        score = 0; lijnen = 0; einde = false; pauze = false; teller = 0;
        stats = {};
        stuk = maakStuk(trekBron());
        volgende = trekBron();
        bewaar();
        updateUi();
    };

    // ---------- zijbalk ----------
    const bronRegel = (el, b) => {
        el.innerHTML = '';
        if (!b) return;

        const vlak = document.createElement('span');
        Object.assign(vlak.style, {
            width: '18px', height: '18px', borderRadius: '3px',
            background: b.k, flexShrink: '0',
            border: '1px solid rgba(0,0,0,0.25)'
        });

        const naam = document.createElement('span');
        naam.textContent = b.n;
        naam.title = b.n;
        Object.assign(naam.style, {
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        });

        el.append(vlak, naam);
    };

    const updateUi = () => {
        $('egd-tetris-score').textContent = score;
        $('egd-tetris-level').textContent = level();
        $('egd-tetris-lijnen').textContent = lijnen;
        $('egd-tetris-record').textContent = record;

        bronRegel($('egd-tetris-nu'), stuk);
        bronRegel($('egd-tetris-volgende'), volgende);

        const statsEl = $('egd-tetris-stats');
        statsEl.innerHTML = '';

        const top = Object.entries(stats)
            .sort((a, b) => b[1].aantal - a[1].aantal)
            .slice(0, 5);

        if (!top.length) {
            const leeg = document.createElement('span');
            leeg.textContent = 'Nog niets';
            leeg.style.color = 'var(--egd-tekst-zacht)';
            statsEl.appendChild(leeg);
        }

        top.forEach(([naam, s]) => {
            const regel = document.createElement('div');
            Object.assign(regel.style, {
                display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0'
            });

            const vlak = document.createElement('span');
            Object.assign(vlak.style, {
                width: '10px', height: '10px', borderRadius: '2px',
                background: s.k, flexShrink: '0'
            });

            const tekst = document.createElement('span');
            tekst.textContent = naam;
            tekst.title = naam;
            Object.assign(tekst.style, {
                flex: '1', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            });

            const aantal = document.createElement('b');
            aantal.textContent = s.aantal;

            regel.append(vlak, tekst, aantal);
            statsEl.appendChild(regel);
        });
    };

    // ---------- spelregels ----------
    const vergrendel = () => {
        const anker = ankerVan(stuk.vorm);

        stuk.vorm.forEach((rij, r) => rij.forEach((v, c) => {
            if (v && stuk.y + r >= 0) {
                bord[stuk.y + r][stuk.x + c] = {
                    k: stuk.k,
                    n: stuk.n,
                    l: (r === anker.r && c === anker.c) ? initialen(stuk.n) : ''
                };
            }
        }));

        let weg = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (bord[r].every(Boolean)) {
                bord[r].forEach(cel => {
                    if (!stats[cel.n]) stats[cel.n] = { k: cel.k, aantal: 0 };
                    stats[cel.n].aantal++;
                });
                bord.splice(r, 1);
                bord.unshift(Array(COLS).fill(null));
                weg++;
                r++; // deze rij opnieuw controleren
            }
        }
        if (weg) {
            score += [0, 100, 300, 500, 800][weg] * level();
            lijnen += weg;
        }

        stuk = maakStuk(volgende || trekBron());
        volgende = trekBron();

        if (botst(stuk.vorm, stuk.x, stuk.y)) {
            einde = true;
            if (score > record) {
                record = score;
                try { localStorage.setItem(RECORD_KEY, String(record)); } catch (err) {}
            }
        }

        bewaar();
        updateUi();
    };

    const stap = () => {
        if (!botst(stuk.vorm, stuk.x, stuk.y + 1)) stuk.y++;
        else vergrendel();
    };

    const beweeg = dx => {
        if (!botst(stuk.vorm, stuk.x + dx, stuk.y)) stuk.x += dx;
    };

    const roteer = () => {
        const nieuw = draai(stuk.vorm);
        for (const kick of [0, -1, 1, -2, 2]) { // "wall kick"
            if (!botst(nieuw, stuk.x + kick, stuk.y)) {
                stuk.vorm = nieuw;
                stuk.x += kick;
                return;
            }
        }
    };

    const valNeer = () => {
        while (!botst(stuk.vorm, stuk.x, stuk.y + 1)) { stuk.y++; score += 2; }
        vergrendel();
    };

    // ---------- tekenen ----------
    const kleurVar = naam =>
        getComputedStyle(backdrop).getPropertyValue(naam).trim();

    const cel = (c, r, kleur, label) => {
        ctx.fillStyle = kleur;
        ctx.fillRect(c * CEL + 1, r * CEL + 1, CEL - 2, CEL - 2);

        if (label) {
            ctx.fillStyle = egodactKleurIsDonker(kleur) ? '#ffffff' : '#212121';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, c * CEL + CEL / 2, r * CEL + CEL / 2 + 1);
        }
    };

    const teken = () => {
        ctx.fillStyle = kleurVar('--egd-veld');
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = kleurVar('--egd-lijn-zacht');
        for (let c = 1; c < COLS; c++) {
            ctx.beginPath(); ctx.moveTo(c * CEL, 0); ctx.lineTo(c * CEL, canvas.height); ctx.stroke();
        }
        for (let r = 1; r < ROWS; r++) {
            ctx.beginPath(); ctx.moveTo(0, r * CEL); ctx.lineTo(canvas.width, r * CEL); ctx.stroke();
        }

        bord.forEach((rij, r) => rij.forEach((c, i) => {
            if (c) cel(i, r, c.k, c.l);
        }));

        const anker = ankerVan(stuk.vorm);
        stuk.vorm.forEach((rij, r) => rij.forEach((v, c) => {
            if (v) {
                cel(stuk.x + c, stuk.y + r, stuk.k,
                    (r === anker.r && c === anker.c) ? initialen(stuk.n) : '');
            }
        }));

        if (einde || pauze) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(einde ? 'Game over' : 'Pauze', canvas.width / 2, canvas.height / 2 - 6);
            ctx.font = '14px sans-serif';
            ctx.fillText(einde ? 'Enter = nieuw spel' : 'Druk op P om verder te gaan',
                canvas.width / 2, canvas.height / 2 + 18);
        }
    };

    // ---------- spelloop ----------
    let laatste = performance.now();
    let laatsteBewaar = laatste;

    const lus = nu => {
        raf = requestAnimationFrame(lus);
        const dt = nu - laatste;
        laatste = nu;

        if (!einde && !pauze) {
            teller += dt;
            const snelheid = Math.max(100, 800 - (level() - 1) * 70);
            if (teller >= snelheid) { teller = 0; stap(); }
        }

        if (nu - laatsteBewaar > 2000) { laatsteBewaar = nu; bewaar(); }
        teken();
    };

    // ---------- sluiten en toetsen ----------
    const sluit = () => {
        bewaar();
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', toets, true);
        window.removeEventListener('pagehide', bewaar);
        backdrop.remove();
        if (typeof naSluiten === 'function') naSluiten();
    };

    function toets(ev) {
        const k = ev.key;
        if (!['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','p','P','Escape','Enter'].includes(k)) return;
        ev.preventDefault();
        ev.stopPropagation(); // Egodact zelf reageert er niet op

        if (k === 'Escape') return sluit();
        if (einde) { if (k === 'Enter') nieuwSpel(); return; }
        if (k === 'p' || k === 'P') { pauze = !pauze; bewaar(); return; }
        if (pauze) { pauze = false; }   // elke pijltoets hervat

        if (k === 'ArrowLeft') beweeg(-1);
        else if (k === 'ArrowRight') beweeg(1);
        else if (k === 'ArrowDown') { stap(); teller = 0; }
        else if (k === 'ArrowUp') roteer();
        else if (k === ' ') valNeer();
    }

    $('egd-tetris-sluiten').addEventListener('click', sluit);
    $('egd-tetris-nieuw').addEventListener('click', () => {
        if (!einde && score > 0 && !confirm('Je huidige spel wordt gewist. Doorgaan?')) return;
        nieuwSpel();
    });
    backdrop.addEventListener('click', ev => { if (ev.target === backdrop) sluit(); });
    document.addEventListener('keydown', toets, true);
    window.addEventListener('pagehide', bewaar);

    // ---------- starten ----------
    const hersteld = herstel();
    if (!hersteld) nieuwSpel();
    updateUi();
    raf = requestAnimationFrame(lus);

    // Challenges op de achtergrond laden. Een hervat spel gebruikt de
    // opgeslagen kleuren en namen, nieuwe blokjes komen uit de lijst.
    laadBronnen().then(() => {
        if (!hersteld && !bronnen.length) return;

        if (!hersteld && bord.every(rij => rij.every(c => !c)) && score === 0) {
            stuk = maakStuk(trekBron());
            volgende = trekBron();
            bewaar();
        } else if (hersteld && !volgende) {
            volgende = trekBron();
        }
        updateUi();
    });
}


// ============================================================
// CHALLENGES VOOR DE WEEKPLANNING
// ============================================================

let egodactChallengeCache = null;

const EGODACT_FASE_VOLGORDE = {
    IN_PROGRESS: 0,
    TODO: 1,
    DONE: 2
};

const EGODACT_FASE_NAAM = {
    IN_PROGRESS: 'In progress',
    TODO: 'To do',
    DONE: 'Done'
};

// Maakt van het API-antwoord een platte lijst, gesorteerd op fase
// (In progress, To do, Done) en daarbinnen op rij (nieuwste bovenaan).
function egodactBouwChallengeLijst(data) {
    const challenges = data.challenges || {};
    const rijen = Object.values(data.rows || {})
        .sort((a, b) => (b.position || 0) - (a.position || 0));

    const rijVan = new Map();
    rijen.forEach((rij, index) => {
        (rij.challenges || []).forEach(id => {
            if (!rijVan.has(id)) {
                rijVan.set(id, { naam: rij.name || '', index });
            }
        });
    });

    return Object.values(challenges)
        .map(c => ({
            id: c.id,
            naam: c.name || 'Naamloze challenge',
            kleur: c.color || null,
            fase: c.phase || 'TODO',
            rij: (rijVan.get(c.id) || {}).naam || '',
            rijIndex: rijVan.has(c.id) ? rijVan.get(c.id).index : 999,
            users: c.users || [],
            werelden: c.worlds || [],
            einddatum: c.plannedEndDate || null,
            raw: c
        }))
        .sort((a, b) =>
            (EGODACT_FASE_VOLGORDE[a.fase] ?? 9) -
            (EGODACT_FASE_VOLGORDE[b.fase] ?? 9) ||
            a.rijIndex - b.rijIndex
        );
}

async function egodactLaadChallenges() {
    // Vijf minuten onthouden, zodat het menu snel opent.
    if (egodactChallengeCache &&
        Date.now() - egodactChallengeCache.tijd < 5 * 60 * 1000) {
        return egodactChallengeCache.lijst;
    }

    const ACCESS_TOKEN_KEY = 'pYfkT6ZWcUB98Sla76HppFpk4aYdTAp0_CACHE_0';
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const selectedSchool = localStorage.getItem('selectedSchool');

    if (!accessToken) {
        throw new Error(
            'Geen access token gevonden. Log opnieuw in bij Egodact.'
        );
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
    };

    if (selectedSchool) headers['School'] = selectedSchool;

    const response = await fetch(
        'https://api.egodact.com/challenge-portfolio',
        { method: 'GET', headers, credentials: 'omit' }
    );

    if (!response.ok) {
        const details = await response.text();
        throw new Error(
            `API-fout ${response.status}: ${details.slice(0, 250)}`
        );
    }

    const lijst = egodactBouwChallengeLijst(await response.json());
    egodactChallengeCache = { tijd: Date.now(), lijst };

    return lijst;
}

function egodactKleurIsDonker(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return true;

    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;

    return (0.299 * r + 0.587 * g + 0.114 * b) < 150;
}

function egodactAfbeeldingUrlVan(el) {
    if (el.tagName === 'IMG') return el.currentSrc || el.src || null;

    const bg = getComputedStyle(el).backgroundImage;
    const m = bg && bg !== 'none' && /url\(["']?([^"')]+)/.exec(bg);
    return m ? m[1] : null;
}

function egodactRgbVan(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return null;

    const n = parseInt(m[1], 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

// Zoekt de echte kaart op het Egodact-bord (achter dit menu) op naam en
// leest daar de afbeeldingen uit. Volgorde in een kaart: thumbnail,
// wereld-icoontjes, daarna de avatars van de gebruikers.
function egodactSchraapBord(challenges, modalEl) {
    const resultaat = { thumbs: {}, users: {}, werelden: {} };
    const wereldStemmen = {};
    const kaarten = [];
    const kaartEls = [];

    const leaves = [];
    document.body.querySelectorAll('*').forEach(el => {
        if (modalEl.contains(el) || el.children.length) return;
        const tekst = el.textContent.trim();
        if (tekst) leaves.push({ el, tekst });
    });

    for (const c of challenges) {
        const naam = (c.name || '').trim();
        const kandidaten = leaves.filter(l => l.tekst === naam);
        if (!kandidaten.length) continue;

        const kleur = egodactRgbVan(c.color);
        let kaart = null;

        for (const { el } of kandidaten) {
            let node = el;

            for (let i = 0; i < 8 && node.parentElement; i++) {
                node = node.parentElement;

                if (kleur &&
                    getComputedStyle(node).backgroundColor === kleur) {
                    kaart = node;
                    break;
                }
            }

            if (kaart) break;
        }

        if (!kaart && !kleur) {
            kaart = kandidaten[0].el.parentElement &&
                kandidaten[0].el.parentElement.parentElement;
        }
        if (!kaart) continue;
        kaartEls.push(kaart);

        const urls = [];
        kaart.querySelectorAll('*').forEach(el => {
            const url = egodactAfbeeldingUrlVan(el);
            if (url) urls.push(url);
        });

        const metFoto = (c.users || []).filter(u => u.picture);
        const heeftThumb = !!(c.thumbnail && c.thumbnail.file);
        const aantalWerelden = (c.worlds || []).length;
        const kopAantal = (heeftThumb ? 1 : 0) + aantalWerelden;

        // Wereld-icoontjes staan na de thumbnail, in dezelfde volgorde
        // als c.worlds. Elke wereld heeft overal hetzelfde icoon.
        if (urls.length >= kopAantal) {
            (c.worlds || []).forEach((w, i) => {
                const url = urls[(heeftThumb ? 1 : 0) + i];
                if (!url) return;

                const stemmen = (wereldStemmen[w] ||= {});
                stemmen[url] = (stemmen[url] || 0) + 1;
            });
        }

        // Thumbnail staat bovenaan de kaart, vóór de wereld-icoontjes.
        if (heeftThumb && urls.length > aantalWerelden) {
            resultaat.thumbs[c.id] = urls[0];
        }

        // Alles na thumbnail + wereld-icoontjes zijn avatars. Een
        // kaart kan er minder tonen dan er deelnemers zijn (Egodact
        // verbergt je eigen avatar als je alleen staat), maar nooit meer.
        const tail = [...new Set(urls.slice(kopAantal))];

        kaarten.push({
            id: c.id,
            naam: c.name,
            namen: metFoto.map(u => u.name),
            tail: tail.length <= metFoto.length ? tail : null,
            ruweUrls: urls
        });
    }

    // De volgorde van deelnemers op het bord is niet betrouwbaar, dus
    // we gebruiken die niet. In plaats daarvan:
    //  1. Jouw eigen foto staat op (bijna) elke kaart: de afbeelding
    //     die op de meeste kaarten voorkomt, hoort bij de gebruiker die
    //     op de meeste kaarten voorkomt.
    //  2. Per kaart: haal bekende foto's/mensen eraf. Blijft er precies
    //     één persoon én één foto over, dan horen die bij elkaar.
    //  Wat dan nog onduidelijk is, krijgt géén foto (initiaal) in
    //  plaats van een mogelijk verkeerde.
    const bruikbaar = kaarten.filter(k => k.tail && k.tail.length);

    // Wie ben jij? Jij staat in al je eigen challenges, dus de
    // gebruiker die in de meeste challenges van de API voorkomt.
    const dataNaamTelling = {};
    challenges.forEach(c => (c.users || []).forEach(u => {
        if (u.picture) {
            dataNaamTelling[u.name] = (dataNaamTelling[u.name] || 0) + 1;
        }
    }));
    const meNaam = (Object.entries(dataNaamTelling)
        .sort((x, y) => y[1] - x[1])[0] || [])[0];

    // Welke afbeelding is jouw foto? Die staat ook buiten de kaarten,
    // in de koptekst van Egodact (avatar rechtsboven).
    const buitenUrls = new Set();
    document.body.querySelectorAll('*').forEach(el => {
        if (modalEl.contains(el)) return;
        if (kaartEls.some(ce => ce.contains(el))) return;

        const url = egodactAfbeeldingUrlVan(el);
        if (url) buitenUrls.add(url);
    });

    const urlTelling = {};
    bruikbaar.forEach(k => {
        k.tail.forEach(u => { urlTelling[u] = (urlTelling[u] || 0) + 1; });
    });
    const urlsOpFrequentie = Object.entries(urlTelling)
        .sort((x, y) => y[1] - x[1]);

    let meUrl = (urlsOpFrequentie.find(([u]) => buitenUrls.has(u)) ||
        [])[0];

    // Zonder koptekst-match alleen als één afbeelding duidelijk
    // vaker voorkomt dan alle andere (geen gelijkspel).
    if (!meUrl && urlsOpFrequentie.length &&
        (urlsOpFrequentie.length === 1 ||
         urlsOpFrequentie[0][1] > urlsOpFrequentie[1][1])) {
        meUrl = urlsOpFrequentie[0][0];
    }

    if (meNaam && meUrl) {
        resultaat.users[meNaam] = meUrl;
    }

    for (let ronde = 0; ronde < 10; ronde++) {
        let veranderd = false;
        const bekendeUrls = new Set(Object.values(resultaat.users));

        for (const k of bruikbaar) {
            const overNamen = k.namen.filter(n => !resultaat.users[n]);
            const overUrls = k.tail.filter(u => !bekendeUrls.has(u));

            if (overNamen.length === 1 && overUrls.length === 1) {
                resultaat.users[overNamen[0]] = overUrls[0];
                bekendeUrls.add(overUrls[0]);
                veranderd = true;
            }
        }

        if (!veranderd) break;
    }

    for (const [w, stemmen] of Object.entries(wereldStemmen)) {
        resultaat.werelden[w] = Object.entries(stemmen)
            .sort((x, y) => y[1] - x[1])[0][0];
    }

    return resultaat;
}



// Kleuren voor weekplanning-blokken. null = standaard (blauw).
const EGODACT_BLOK_KLEUREN = [
    null,
    '#E81C4F',
    '#FF691F',
    '#FAB81E',
    '#19CF86',
    '#7FDBB6',
    '#1B95E0',
    '#981CEB',
    '#F58EA8',
    '#B71C1C',
    '#379e00',
    '#757575'
];

const EGODACT_STANDAARD_BLOKKLEUR = '#1976d2';

const EGODACT_WERELD_NAAM = {
    artistic: 'Artistiek',
    scientific: 'Wetenschappelijk',
    social_ethic: 'Sociaal-ethisch',
    societal: 'Maatschappelijk'
};

function egodactMaakAvatar(user, url, grootte) {
    const wrap = document.createElement('div');

    Object.assign(wrap.style, {
        width: `${grootte}px`,
        height: `${grootte}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: '0',
        background: '#757575',
        color: '#fff',
        fontSize: `${Math.max(7, Math.round(grootte * 0.46))}px`,
        fontWeight: 'normal',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        border: '1px solid rgba(0,0,0,0.25)'
    });

    wrap.title = user.name || '';
    wrap.textContent =
        ((user.firstName || user.name || '?')[0] || '?').toUpperCase();

    if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        Object.assign(img.style, {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        });
        img.addEventListener('load', () => {
            wrap.textContent = '';
            wrap.appendChild(img);
        });
    }

    return wrap;
}

// Details van een challenge: thumbnail, fase, leden en werelden.
// Gebruikt in de zijbalk (uitgeklapt) en in het blok-venster.
function egodactMaakInfoBlok(c, afb, compact) {
    const blok = document.createElement('div');

    Object.assign(blok.style, {
        background: 'var(--egd-info)',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '11px',
        color: 'var(--egd-tekst)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontWeight: 'normal'
    });

    const thumb = afb && afb.thumbs && afb.thumbs[c.id];
    if (thumb) {
        const img = document.createElement('img');
        img.src = thumb;
        img.alt = '';
        Object.assign(img.style, {
            width: '100%',
            maxHeight: compact ? '80px' : '110px',
            objectFit: 'cover',
            borderRadius: '3px',
            background: '#fff',
            display: 'none'
        });
        img.addEventListener('load', () => { img.style.display = 'block'; });
        blok.appendChild(img);
    }

    const meta = [
        EGODACT_FASE_NAAM[c.fase] || c.fase,
        c.rij,
        c.einddatum
            ? 'Einddatum ' + new Date(c.einddatum).toLocaleDateString(
                'nl-NL',
                { day: '2-digit', month: '2-digit', year: 'numeric' }
            )
            : ''
    ].filter(Boolean).join(' · ');

    const metaEl = document.createElement('div');
    metaEl.textContent = meta;
    metaEl.style.color = 'var(--egd-tekst-zacht)';
    blok.appendChild(metaEl);

    const kopje = tekst => {
        const el = document.createElement('div');
        el.textContent = tekst;
        Object.assign(el.style, {
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--egd-tekst-zacht)',
            marginBottom: '4px'
        });
        return el;
    };

    if ((c.users || []).length) {
        const sectie = document.createElement('div');
        sectie.appendChild(kopje('Leden'));

        c.users.forEach(u => {
            const regel = document.createElement('div');
            Object.assign(regel.style, {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '3px'
            });

            regel.appendChild(
                egodactMaakAvatar(u, afb && afb.users && afb.users[u.name], 20)
            );

            const naam = document.createElement('span');
            naam.textContent = u.name || u.firstName || '';
            regel.appendChild(naam);

            sectie.appendChild(regel);
        });

        blok.appendChild(sectie);
    }

    if ((c.werelden || []).length) {
        const sectie = document.createElement('div');
        sectie.appendChild(
            kopje(c.werelden.length > 1 ? 'Werelden' : 'Wereld')
        );

        const chips = document.createElement('div');
        Object.assign(chips.style, {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
        });

        c.werelden.forEach(w => {
            const chip = document.createElement('div');
            Object.assign(chip.style, {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--egd-paneel)',
                borderRadius: '10px',
                padding: '2px 7px 2px 3px'
            });

            const icoon = afb && afb.werelden && afb.werelden[w];
            if (icoon) {
                const img = document.createElement('img');
                img.src = icoon;
                img.alt = '';
                Object.assign(img.style, {
                    width: '14px',
                    height: '14px',
                    objectFit: 'contain'
                });
                img.addEventListener('error', () => img.remove());
                chip.appendChild(img);
            }

            const label = document.createElement('span');
            label.textContent = EGODACT_WERELD_NAAM[w] || w;
            chip.appendChild(label);

            chips.appendChild(chip);
        });

        sectie.appendChild(chips);
        blok.appendChild(sectie);
    }

    return blok;
}

// Bepaalt wat er in de zijbalk staat.
//  - Zonder zoekterm: alleen lopende challenges (In progress en To do),
//    zodat je niet eindeloos hoeft te scrollen.
//  - Met zoekterm: álle challenges die passen (ook Done), bovenaan.
function egodactZijbalkInhoud(challenges, vakken, zoekterm) {
    const q = (zoekterm || '').trim().toLowerCase();

    const passend = (challenges || []).filter(c =>
        q
            ? (c.naam + ' ' + c.rij).toLowerCase().includes(q)
            : c.fase !== 'DONE'
    );

    return {
        challenges: passend,
        vakken: vakken.filter(v => !q || v.toLowerCase().includes(q))
    };
}


// ============================================================
// FLEXIBELE DAGPLANNER MET TEMPLATE-SYSTEM & HISTORIE
// ============================================================

function openTakenMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    if (document.getElementById("egodact-custom-modal-backdrop")) return;

    const vandaag = new Date().toLocaleDateString("sv-SE");
    let geselecteerdeDatum = vandaag;

    const backdrop = document.createElement("div");
    backdrop.id = "egodact-custom-modal-backdrop";

    Object.assign(backdrop.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--egd-backdrop)",
        zIndex: "9999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
    });

    const modal = document.createElement("div");

    Object.assign(modal.style, {
        backgroundColor: "var(--egd-modal)",
        color: "var(--egd-tekst)",
        width: "580px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        borderRadius: "6px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow:
            "var(--egd-schaduw)"
    });

    modal.innerHTML = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--egd-rand);
            padding-bottom: 10px;
        ">
            <h2 style="
                margin: 0;
                font-size: 22px;
                font-weight: 500;
            ">
                Dagplanning
            </h2>

            <input
                type="text"
                id="egodact-planner-search"
                placeholder="Search.."
                style="background:var(--egd-veld);color:var(--egd-tekst);border:1px solid var(--egd-rand);padding:4px 8px;border-radius:4px;font-family:inherit;width:150px;"
            >
            <input
                type="date"
                id="egodact-planner-datum"
                value="${vandaag}"
                style="
                    background-color: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: inherit;
                "
            >
        </div>

        <div style="
            display: flex;
            gap: 10px;
            justify-content: space-between;
            align-items: center;
            background: var(--egd-paneel);
            padding: 8px 12px;
            border-radius: 4px;
        ">
            <button
                id="egodact-voeg-blok-toe"
                style="
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 6px 12px;
                    font-weight: bold;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                + Blok Toevoegen
            </button>

            <button
                id="egodact-sla-standaard-op"
                style="
                    background-color: #ff9800;
                    border: none;
                    color: white;
                    padding: 6px 12px;
                    font-weight: bold;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                Sla op als Standaard
            </button>
        </div>

        <div
            id="egodact-uren-container"
            style="
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-height: 380px;
                overflow-y: auto;
                padding-right: 5px;
            "
        ></div>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
        ">
            <button
                id="egodact-taken-sluiten"
                style="
                    background-color: var(--egd-accent);
                    border: none;
                    color: var(--egd-accent-tekst);
                    cursor: pointer;
                    padding: 10px 20px;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    border-radius: 4px;
                "
            >
                Sluiten
            </button>
        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    function renderPlanner(datum) {

        const container =
            document.getElementById(
                "egodact-uren-container"
            );

        if (!container) return;

        container.innerHTML = "";

        let dagData =
            localStorage.getItem(
                `egodact_flex_planner_${datum}`
            );

        if (!dagData) {

            const standaardTemplate =
                localStorage.getItem(
                    "egodact_planner_template"
                );

            if (standaardTemplate) {

                try {

                    const templateTaken =
                        JSON.parse(
                            standaardTemplate
                        );

                    const gekopieerdeTaken =
                        templateTaken.map(
                            taak => ({
                                tijd:
                                    taak.tijd || "",

                                tekst:
                                    taak.tekst || "",

                                gedaan:
                                    false
                            })
                        );

                    localStorage.setItem(
                        `egodact_flex_planner_${datum}`,
                        JSON.stringify(
                            gekopieerdeTaken
                        )
                    );

                    dagData =
                        JSON.stringify(
                            gekopieerdeTaken
                        );

                } catch (error) {

                    console.error(
                        "Fout bij laden van standaard template:",
                        error
                    );
                }
            }
        }

        let takenLijst = [];

        if (dagData) {

            try {

                takenLijst =
                    JSON.parse(dagData);

                if (!Array.isArray(takenLijst)) {
                    takenLijst = [];
                }

            } catch (error) {

                console.error(
                    "Fout bij laden van planner:",
                    error
                );

                takenLijst = [];
            }
        }

        takenLijst.forEach(
            (taak, index) => {

                const rij =
                    document.createElement("div");

                Object.assign(
                    rij.style,
                    {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "var(--egd-veld)",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        borderLeft:
                            "4px solid var(--egd-accent)"
                    }
                );

                const tijdInput =
                    document.createElement("input");

                tijdInput.type = "text";
                tijdInput.value =
                    taak.tijd || "";
                tijdInput.placeholder =
                    "Tijd";

                Object.assign(
                    tijdInput.style,
                    {
                        width: "90px",
                        background: "var(--egd-veld)",
                        border: "1px solid var(--egd-lijn)",
                        color: "var(--egd-accent)",
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        outline: "none",
                        textAlign: "center"
                    }
                );

                const checkbox =
                    document.createElement("input");

                checkbox.type = "checkbox";
                checkbox.checked =
                    Boolean(taak.gedaan);

                Object.assign(
                    checkbox.style,
                    {
                        width: "18px",
                        height: "18px",
                        cursor: "pointer"
                    }
                );

                const taakInput =
                    document.createElement("input");

                taakInput.type = "text";
                taakInput.value =
                    taak.tekst || "";

                taakInput.placeholder =
                    "Typ hier je taak of focus...";

                Object.assign(
                    taakInput.style,
                    {
                        flex: "1",
                        background: "none",
                        border: "none",
                        color: "var(--egd-tekst)",
                        fontSize: "15px",
                        outline: "none",
                        fontFamily: "inherit"
                    }
                );

                if (taak.gedaan) {

                    taakInput.style.textDecoration =
                        "line-through";

                    taakInput.style.opacity =
                        "0.5";
                }

                const verwijderBtn =
                    document.createElement("button");

                verwijderBtn.innerHTML =
                    "&#x2715;";

                Object.assign(
                    verwijderBtn.style,
                    {
                        background: "none",
                        border: "none",
                        color: "var(--egd-gevaar)",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "0 6px",
                        fontWeight: "bold"
                    }
                );

                verwijderBtn.title =
                    "Blok verwijderen";

                const updateEnSlaOp =
                    () => {

                        const actueleLijst = [];

                        const alleRijen =
                            container.children;

                        for (
                            const r
                            of alleRijen
                        ) {

                            const inputs =
                                r.querySelectorAll(
                                    "input"
                                );

                            if (inputs.length >= 3) {

                                actueleLijst.push({
                                    tijd:
                                        inputs[0].value,

                                    gedaan:
                                        inputs[1].checked,

                                    tekst:
                                        inputs[2].value
                                });
                            }
                        }

                        localStorage.setItem(
                            `egodact_flex_planner_${datum}`,
                            JSON.stringify(
                                actueleLijst
                            )
                        );
                    };

                tijdInput.addEventListener(
                    "input",
                    updateEnSlaOp
                );

                taakInput.addEventListener(
                    "input",
                    updateEnSlaOp
                );

                checkbox.addEventListener(
                    "change",
                    () => {

                        if (checkbox.checked) {

                            taakInput.style.textDecoration =
                                "line-through";

                            taakInput.style.opacity =
                                "0.5";

                        } else {

                            taakInput.style.textDecoration =
                                "none";

                            taakInput.style.opacity =
                                "1";
                        }

                        updateEnSlaOp();
                    }
                );

                verwijderBtn.addEventListener(
                    "click",
                    () => {

                        rij.remove();

                        updateEnSlaOp();
                    }
                );

                rij.appendChild(
                    tijdInput
                );

                rij.appendChild(
                    checkbox
                );

                rij.appendChild(
                    taakInput
                );

                rij.appendChild(
                    verwijderBtn
                );

                container.appendChild(
                    rij
                );
            }
        );

        filterPlannerRows();
    }

    function filterPlannerRows() {
        const searchInput = document.getElementById("egodact-planner-search");
        const container = document.getElementById("egodact-uren-container");
        if (!searchInput || !container) return;
        const query = searchInput.value.trim().toLowerCase();
        Array.from(container.children).forEach(row => {
            const text = Array.from(row.querySelectorAll("input"))
                .map(input => input.type === "checkbox" ? "" : input.value)
                .join(" ")
                .toLowerCase();
            row.style.display = text.includes(query) ? "" : "none";
        });
    }

    document
        .getElementById("egodact-planner-search")
        .addEventListener("input", filterPlannerRows);

    document
        .getElementById(
            "egodact-voeg-blok-toe"
        )
        .addEventListener(
            "click",
            () => {

                const huidigeData =
                    localStorage.getItem(
                        `egodact_flex_planner_${geselecteerdeDatum}`
                    );

                let lijst = [];

                if (huidigeData) {

                    try {

                        lijst =
                            JSON.parse(
                                huidigeData
                            );

                        if (
                            !Array.isArray(
                                lijst
                            )
                        ) {
                            lijst = [];
                        }

                    } catch (error) {

                        lijst = [];
                    }
                }

                lijst.push({
                    tijd: "",
                    tekst: "",
                    gedaan: false
                });

                localStorage.setItem(
                    `egodact_flex_planner_${geselecteerdeDatum}`,
                    JSON.stringify(lijst)
                );

                renderPlanner(
                    geselecteerdeDatum
                );
            }
        );

    document
        .getElementById(
            "egodact-sla-standaard-op"
        )
        .addEventListener(
            "click",
            () => {

                const huidigeDagData =
                    localStorage.getItem(
                        `egodact_flex_planner_${geselecteerdeDatum}`
                    );

                if (!huidigeDagData) {

                    alert(
                        "Voeg eerst een aantal tijdsblokken toe voordat je deze als standaard opslaat."
                    );

                    return;
                }

                try {

                    const taken =
                        JSON.parse(
                            huidigeDagData
                        );

                    if (
                        !Array.isArray(taken) ||
                        taken.length === 0
                    ) {

                        alert(
                            "Voeg eerst een aantal tijdsblokken toe voordat je deze als standaard opslaat."
                        );

                        return;
                    }

                    const template =
                        taken.map(
                            taak => ({
                                tijd:
                                    taak.tijd || "",

                                tekst:
                                    taak.tekst || "",

                                gedaan:
                                    false
                            })
                        );

                    localStorage.setItem(
                        "egodact_planner_template",
                        JSON.stringify(
                            template
                        )
                    );

                    alert(
                        "Succes! Deze tijdsblokken en basistaken zijn opgeslagen als jouw standaard."
                    );

                } catch (error) {

                    console.error(
                        "Fout bij opslaan van template:",
                        error
                    );

                    alert(
                        "Er ging iets mis bij het opslaan van de standaard."
                    );
                }
            }
        );

    document
        .getElementById(
            "egodact-planner-datum"
        )
        .addEventListener(
            "change",
            e => {

                if (!e.target.value) {
                    return;
                }

                geselecteerdeDatum =
                    e.target.value;

                renderPlanner(
                    geselecteerdeDatum
                );
            }
        );

    const sluitMenu = () => {
        backdrop.remove();
    };

    document
        .getElementById(
            "egodact-taken-sluiten"
        )
        .addEventListener(
            "click",
            sluitMenu
        );

    backdrop.addEventListener(
        "click",
        e => {

            if (
                e.target === backdrop
            ) {
                sluitMenu();
            }
        }
    );

    const escapeHandler =
        e => {

            if (
                e.key === "Escape"
            ) {

                sluitMenu();

                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );
            }
        };

    document.addEventListener(
        "keydown",
        escapeHandler
    );

    renderPlanner(
        geselecteerdeDatum
    );
}


// ============================================================
// WEEKPLANNING MENU
// ============================================================

function openWeekplanning(e) {

    e.preventDefault();
    e.stopPropagation();

    if (
        document.getElementById(
            'egodact-custom-modal-backdrop'
        )
    ) {
        return;
    }

    // ========================================================
    // WEEK DATA
    // ========================================================

    const vandaag =
        new Date();

    function beginVanWeek(datum) {

        const d =
            new Date(datum);

        const dag =
            d.getDay();

        const verschil =
            dag === 0
                ? -6
                : 1 - dag;

        d.setDate(
            d.getDate() + verschil
        );

        d.setHours(
            0,
            0,
            0,
            0
        );

        return d;
    }

    let weekStart =
        beginVanWeek(vandaag);

    function datumKey(datum) {

        return datum
            .toISOString()
            .split("T")[0];
    }

    function weekStorageKey() {

        return (
            `egodact_weekplanning_${datumKey(
                weekStart
            )}`
        );
    }

    function laadWeek() {

        try {

            const opgeslagen =
                localStorage.getItem(
                    weekStorageKey()
                );

            if (!opgeslagen) {
                const standaardWeek = localStorage.getItem("egodact_weekplanning_template");
                if (standaardWeek) {
                    try {
                        const template = JSON.parse(standaardWeek);
                        if (Array.isArray(template) && template.length) {
                            const kopie = template.map(blok => ({
                                ...blok,
                                id: (typeof crypto !== "undefined" && crypto.randomUUID)
                                    ? crypto.randomUUID()
                                    : `weekblok-${Date.now()}-${Math.random().toString(16).slice(2)}`
                            }));
                            localStorage.setItem(weekStorageKey(), JSON.stringify(kopie));
                            return kopie;
                        }
                    } catch (error) {
                        console.error("Fout bij laden van standaard weekplanning:", error);
                    }
                }
                return [];
            }

            const data =
                JSON.parse(opgeslagen);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Fout bij laden weekplanning:",
                error
            );

            return [];
        }
    }

    function slaWeekOp(data) {

        localStorage.setItem(
            weekStorageKey(),
            JSON.stringify(data)
        );
    }

    let weekData =
        laadWeek();

    // Houdt het actieve drag-object bij.
    // Dit voorkomt problemen met dataTransfer.getData()
    // in sommige browsers.
    window.__egodactDraggedWeekBlock =
        null;

    // ========================================================
    // BACKDROP
    // ========================================================

    const backdrop =
        document.createElement("div");

    backdrop.id =
        "egodact-custom-modal-backdrop";

    Object.assign(
        backdrop.style,
        {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor:
                "var(--egd-backdrop)",
            zIndex: "9999999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily:
                "Arial, sans-serif"
        }
    );

    // ========================================================
    // MODAL
    // ========================================================

    const modal =
        document.createElement("div");

    Object.assign(
        modal.style,
        {
            backgroundColor: "var(--egd-modal)",
            color: "var(--egd-tekst)",
            width: "1200px",
            maxWidth: "95vw",
            maxHeight: "90vh",
            borderRadius: "6px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow:
                "var(--egd-schaduw)",
            position: "relative"
        }
    );

    // ========================================================
    // HEADER
    // ========================================================

    modal.innerHTML = `

        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--egd-rand);
            padding-bottom: 12px;
            gap: 15px;
        ">

            <h2 style="
                margin: 0;
                font-size: 22px;
                font-weight: 500;
            ">
                Weekplanning
            </h2>

            <div style="
                display: flex;
                align-items: center;
                gap: 8px;
            ">

                <button
                    id="egodact-vorige-week"
                    type="button"
                    style="
                        background: var(--egd-paneel);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 7px 12px;
                        cursor: pointer;
                        font-size: 16px;
                    "
                >
                    ‹
                </button>

                <button
                    id="egodact-vandaag-week"
                    type="button"
                    style="
                        background: var(--egd-paneel);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 7px 12px;
                        cursor: pointer;
                        font-size: 13px;
                    "
                >
                    Vandaag
                </button>

                <button
                    id="egodact-volgende-week"
                    type="button"
                    style="
                        background: var(--egd-paneel);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 7px 12px;
                        cursor: pointer;
                        font-size: 16px;
                    "
                >
                    ›
                </button>

                <input
                    id="egodact-week-zoek"
                    type="text"
                    placeholder="Zoek challenge of vak..."
                    autocomplete="off"
                    style="
                        background: var(--egd-veld);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 8px 10px;
                        font-size: 13px;
                        width: 210px;
                        outline: none;
                        font-family: inherit;
                    "
                >

                <span
                    id="egodact-week-titel"
                    style="
                        min-width: 150px;
                        text-align: center;
                        font-size: 14px;
                        color: var(--egd-tekst);
                    "
                ></span>

                <button
                    id="egodact-week-sla-standaard-op"
                    type="button"
                    style="background:#ff9800;color:#fff;border:none;border-radius:4px;padding:9px 12px;cursor:pointer;font-weight:bold;font-size:13px;"
                >
                    Sla op als standaard week
                </button>

                <button
                    id="egodact-week-blok-toevoegen"
                    type="button"
                    style="
                        background: var(--egd-accent);
                        color: var(--egd-accent-tekst);
                        border: none;
                        border-radius: 4px;
                        padding: 9px 14px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                    "
                >
                    + Blok toevoegen
                </button>

            </div>

        </div>

        <div
            id="egodact-weekplanning-content"
            style="
                display: grid;
                grid-template-columns: minmax(0, 1fr) 230px;
                gap: 12px;
                min-height: 0;
                overflow: hidden;
            "
        ></div>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 2px;
        ">

            <button
                id="egodact-weekplanning-sluiten"
                type="button"
                style="
                    background-color: var(--egd-accent);
                    border: none;
                    color: var(--egd-accent-tekst);
                    cursor: pointer;
                    padding: 10px 20px;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    border-radius: 4px;
                "
            >
                Sluiten
            </button>

        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // ========================================================
    // WEEK TITEL
    // ========================================================

    function updateWeekTitel() {

        const einde =
            new Date(weekStart);

        einde.setDate(
            einde.getDate() + 6
        );

        const beginTekst =
            weekStart.toLocaleDateString(
                "nl-NL",
                {
                    day: "numeric",
                    month: "short"
                }
            );

        const eindeTekst =
            einde.toLocaleDateString(
                "nl-NL",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

        document.getElementById(
            "egodact-week-titel"
        ).textContent =
            `${beginTekst} – ${eindeTekst}`;
    }

    // ========================================================
    // EDITOR
    // ========================================================

    function openBlokEditor(
        dag = 0,
        start = 9 * 60,
        einde = 10 * 60,
        onderwerp = "",
        bestaandBlok = null,
        challengeId = null
    ) {

        const isBewerken =
            bestaandBlok !== null;

        const gekoppeldeChallengeId =
            isBewerken
                ? bestaandBlok.challengeId || null
                : challengeId;

        const editorBackdrop =
            document.createElement("div");

        Object.assign(
            editorBackdrop.style,
            {
                position: "absolute",
                inset: "0",
                background:
                    "var(--egd-backdrop)",
                zIndex: "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }
        );

        const editor =
            document.createElement("div");

        Object.assign(
            editor.style,
            {
                background: "var(--egd-modal)",
                width: "420px",
                maxWidth: "90%",
                maxHeight:
                    "min(calc(100% - 24px), calc(100vh - 48px))",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "6px",
                padding: "0",
                boxShadow:
                    "0 10px 30px rgba(0,0,0,0.5)"
            }
        );

        const bestaandeNaam =
            isBewerken
                ? bestaandBlok.naam || ""
                : onderwerp || "";

        const bestaandeBeschrijving =
            isBewerken
                ? bestaandBlok.beschrijving || ""
                : "";

        editor.innerHTML = `

            <h3 style="
                margin: 0 0 18px 0;
                font-size: 19px;
                font-weight: 500;
            ">
                ${
                    isBewerken
                        ? "Blok bewerken"
                        : "Nieuw blok"
                }
            </h3>

            <label style="
                display: block;
                margin-bottom: 6px;
                font-size: 13px;
                color: var(--egd-tekst-zacht);
            ">
                Naam
            </label>

            <input
                id="egodact-blok-naam"
                type="text"
                placeholder="Bijvoorbeeld: Duits leren"
                value="${escapeHTML(
                    bestaandeNaam
                )}"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    background: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    border-radius: 4px;
                    padding: 9px;
                    margin-bottom: 14px;
                    outline: none;
                "
            >

            <label style="
                display: block;
                margin-bottom: 6px;
                font-size: 13px;
                color: var(--egd-tekst-zacht);
            ">
                Beschrijving
            </label>

            <textarea
                id="egodact-blok-beschrijving"
                placeholder="Wat moet je doen?"
                rows="4"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    resize: vertical;
                    background: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    border-radius: 4px;
                    padding: 9px;
                    margin-bottom: 14px;
                    outline: none;
                    font-family: inherit;
                "
            >${escapeHTML(
                bestaandeBeschrijving
            )}</textarea>

            <label style="
                display: block;
                margin-bottom: 6px;
                font-size: 13px;
                color: var(--egd-tekst-zacht);
            ">
                Dag
            </label>

            <select
                id="egodact-blok-dag"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    background: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    border-radius: 4px;
                    padding: 9px;
                    margin-bottom: 14px;
                "
            >
                <option value="0">Maandag</option>
                <option value="1">Dinsdag</option>
                <option value="2">Woensdag</option>
                <option value="3">Donderdag</option>
                <option value="4">Vrijdag</option>
                <option value="5">Zaterdag</option>
                <option value="6">Zondag</option>
            </select>

            <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 18px;
            ">

                <div>

                    <label style="
                        display: block;
                        margin-bottom: 6px;
                        font-size: 13px;
                        color: var(--egd-tekst-zacht);
                    ">
                        Van
                    </label>

                    <input
                        id="egodact-blok-start"
                        type="time"
                        value="${tijdAlsString(start)}"
                        style="
                            width: 100%;
                            box-sizing: border-box;
                            background: var(--egd-veld);
                            color: var(--egd-tekst);
                            border: 1px solid var(--egd-rand);
                            border-radius: 4px;
                            padding: 9px;
                        "
                    >

                </div>

                <div>

                    <label style="
                        display: block;
                        margin-bottom: 6px;
                        font-size: 13px;
                        color: var(--egd-tekst-zacht);
                    ">
                        Tot
                    </label>

                    <input
                        id="egodact-blok-einde"
                        type="time"
                        value="${tijdAlsString(einde)}"
                        style="
                            width: 100%;
                            box-sizing: border-box;
                            background: var(--egd-veld);
                            color: var(--egd-tekst);
                            border: 1px solid var(--egd-rand);
                            border-radius: 4px;
                            padding: 9px;
                        "
                    >

                </div>

            </div>

            <div style="
                display: flex;
                justify-content: space-between;
                gap: 8px;
            ">

                ${
                    isBewerken
                        ? `
                            <button
                                id="egodact-blok-verwijderen"
                                type="button"
                                style="
                                    background: #c62828;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    padding: 9px 15px;
                                    cursor: pointer;
                                    font-weight: bold;
                                "
                            >
                                Verwijderen
                            </button>
                        `
                        : `
                            <div></div>
                        `
                }

                <div style="
                    display: flex;
                    gap: 8px;
                ">

                    <button
                        id="egodact-blok-annuleren"
                        type="button"
                        style="
                            background: var(--egd-paneel);
                            color: var(--egd-tekst);
                            border: 1px solid var(--egd-rand);
                            border-radius: 4px;
                            padding: 9px 15px;
                            cursor: pointer;
                        "
                    >
                        Annuleren
                    </button>

                    <button
                        id="egodact-blok-opslaan"
                        type="button"
                        style="
                            background: var(--egd-accent);
                            color: var(--egd-accent-tekst);
                            border: none;
                            border-radius: 4px;
                            padding: 9px 15px;
                            cursor: pointer;
                            font-weight: bold;
                        "
                    >
                        Opslaan
                    </button>

                </div>

            </div>
        `;

        // ====================================================
        // CHALLENGE-INFO (standaard ingeklapt)
        // ====================================================

        const gekoppeldeChallenge =
            gekoppeldeChallengeId &&
            challengeLijst
                ? challengeLijst.find(
                    c =>
                        c.id ===
                        gekoppeldeChallengeId
                )
                : null;

        if (gekoppeldeChallenge) {

            const wrap =
                document.createElement("div");

            Object.assign(
                wrap.style,
                {
                    background: "var(--egd-info)",
                    borderRadius: "4px",
                    marginBottom: "14px"
                }
            );

            const kop =
                document.createElement("div");

            Object.assign(
                kop.style,
                {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    cursor: "pointer"
                }
            );

            const miniThumb =
                bordAfb.thumbs[
                    gekoppeldeChallenge.id
                ];

            if (miniThumb) {

                const img =
                    document.createElement("img");

                img.src =
                    miniThumb;

                img.alt =
                    "";

                Object.assign(
                    img.style,
                    {
                        width: "34px",
                        height: "34px",
                        objectFit: "cover",
                        borderRadius: "3px",
                        flexShrink: "0",
                        display: "none"
                    }
                );

                img.addEventListener(
                    "load",
                    () => {
                        img.style.display =
                            "block";
                    }
                );

                kop.appendChild(
                    img
                );
            }

            const kopTekst =
                document.createElement("div");

            kopTekst.style.flex =
                "1";

            kopTekst.style.minWidth =
                "0";

            const kopNaam =
                document.createElement("div");

            kopNaam.textContent =
                `Challenge: ${gekoppeldeChallenge.naam}`;

            Object.assign(
                kopNaam.style,
                {
                    fontSize: "12px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }
            );

            kopTekst.appendChild(
                kopNaam
            );

            const kopAvatars =
                document.createElement("div");

            Object.assign(
                kopAvatars.style,
                {
                    display: "flex",
                    gap: "2px",
                    marginTop: "3px"
                }
            );

            gekoppeldeChallenge.users
                .slice(0, 8)
                .forEach(
                    u => {

                        kopAvatars.appendChild(
                            egodactMaakAvatar(
                                u,
                                bordAfb.users[u.name],
                                16
                            )
                        );
                    }
                );

            kopTekst.appendChild(
                kopAvatars
            );

            kop.appendChild(
                kopTekst
            );

            const kopPijl =
                document.createElement("span");

            kopPijl.textContent =
                "▸";

            kopPijl.style.opacity =
                "0.7";

            kop.appendChild(
                kopPijl
            );

            const details =
                egodactMaakInfoBlok(
                    gekoppeldeChallenge,
                    bordAfb,
                    true
                );

            details.style.display =
                "none";

            details.style.borderRadius =
                "0 0 4px 4px";

            kop.addEventListener(
                "click",
                () => {

                    const open =
                        details.style.display ===
                        "none";

                    details.style.display =
                        open
                            ? "flex"
                            : "none";

                    kopPijl.textContent =
                        open
                            ? "▾"
                            : "▸";
                }
            );

            wrap.appendChild(
                kop
            );

            wrap.appendChild(
                details
            );

            editor.children[0].after(
                wrap
            );
        }

        // ====================================================
        // KLEUR
        // ====================================================

        let gekozenKleur =
            isBewerken
                ? bestaandBlok.kleur || null
                : (
                    gekoppeldeChallenge &&
                    gekoppeldeChallenge.kleur
                ) || null;

        const knoppenRij =
            editor.lastElementChild;

        const kleurSectie =
            document.createElement("div");

        kleurSectie.style.marginBottom =
            "16px";

        const kleurLabel =
            document.createElement("label");

        kleurLabel.textContent =
            "Kleur";

        Object.assign(
            kleurLabel.style,
            {
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                color: "var(--egd-tekst-zacht)"
            }
        );

        kleurSectie.appendChild(
            kleurLabel
        );

        const kleurRij =
            document.createElement("div");

        kleurRij.id =
            "egodact-blok-kleuren";

        Object.assign(
            kleurRij.style,
            {
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                alignItems: "center"
            }
        );

        const kleurKnoppen = [];

        const gelijk =
            (x, y) =>
                (x || null) === null
                    ? (y || null) === null
                    : (y || "").toLowerCase() ===
                      x.toLowerCase();

        const eigenKleur =
            document.createElement("input");

        function updateKleurKnoppen() {

            kleurKnoppen.forEach(
                ({ knop, kleur }) => {

                    const gekozen =
                        gelijk(
                            kleur,
                            gekozenKleur
                        );

                    knop.style.border =
                        gekozen
                            ? "3px solid var(--egd-tekst)"
                            : "2px solid var(--egd-rand)";

                    knop.dataset.gekozen =
                        gekozen
                            ? "ja"
                            : "nee";
                }
            );

            if (gekozenKleur) {

                eigenKleur.value =
                    gekozenKleur.toLowerCase();
            }
        }

        EGODACT_BLOK_KLEUREN.forEach(
            kleur => {

                const knop =
                    document.createElement("button");

                knop.type =
                    "button";

                knop.title =
                    kleur ||
                    "Standaard (blauw)";

                Object.assign(
                    knop.style,
                    {
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        padding: "0",
                        boxSizing: "border-box",
                        background:
                            kleur ||
                            EGODACT_STANDAARD_BLOKKLEUR
                    }
                );

                knop.addEventListener(
                    "click",
                    () => {

                        gekozenKleur =
                            kleur;

                        updateKleurKnoppen();
                    }
                );

                kleurKnoppen.push({
                    knop,
                    kleur
                });

                kleurRij.appendChild(
                    knop
                );
            }
        );

        eigenKleur.type =
            "color";

        eigenKleur.id =
            "egodact-blok-kleur-eigen";

        eigenKleur.title =
            "Eigen kleur kiezen";

        eigenKleur.value =
            (
                gekozenKleur ||
                EGODACT_STANDAARD_BLOKKLEUR
            ).toLowerCase();

        Object.assign(
            eigenKleur.style,
            {
                width: "30px",
                height: "28px",
                padding: "0",
                border: "none",
                background: "none",
                cursor: "pointer"
            }
        );

        eigenKleur.addEventListener(
            "input",
            () => {

                gekozenKleur =
                    eigenKleur.value;

                updateKleurKnoppen();
            }
        );

        kleurRij.appendChild(
            eigenKleur
        );

        kleurSectie.appendChild(
            kleurRij
        );

        editor.insertBefore(
            kleurSectie,
            knoppenRij
        );

        updateKleurKnoppen();

        // ====================================================
        // SCROLLBAAR MIDDENDEEL, KNOPPEN BLIJVEN ZICHTBAAR
        // ====================================================

        const inhoud =
            document.createElement("div");

        Object.assign(
            inhoud.style,
            {
                overflowY: "auto",
                minHeight: "0",
                flex: "1 1 auto",
                padding: "20px 20px 4px"
            }
        );

        while (
            editor.firstChild &&
            editor.firstChild !== knoppenRij
        ) {

            inhoud.appendChild(
                editor.firstChild
            );
        }

        editor.insertBefore(
            inhoud,
            knoppenRij
        );

        Object.assign(
            knoppenRij.style,
            {
                padding: "12px 20px 20px",
                borderTop: "1px solid var(--egd-rand)",
                flexShrink: "0"
            }
        );

        editorBackdrop.appendChild(
            editor
        );

        modal.appendChild(
            editorBackdrop
        );

        document.getElementById(
            "egodact-blok-dag"
        ).value =
            String(dag);

        // ====================================================
        // ANNULEREN
        // ====================================================

        document
            .getElementById(
                "egodact-blok-annuleren"
            )
            .addEventListener(
                "click",
                () => {
                    editorBackdrop.remove();
                }
            );

        // ====================================================
        // VERWIJDEREN
        // ====================================================

        if (isBewerken) {

            document
                .getElementById(
                    "egodact-blok-verwijderen"
                )
                .addEventListener(
                    "click",
                    () => {

                        const index =
                            weekData.findIndex(
                                blok =>
                                    String(
                                        blok.id
                                    ) ===
                                    String(
                                        bestaandBlok.id
                                    )
                            );

                        if (index !== -1) {

                            weekData.splice(
                                index,
                                1
                            );

                            slaWeekOp(
                                weekData
                            );

                            editorBackdrop.remove();

                            renderWeek();
                        }
                    }
                );
        }

        // ====================================================
        // OPSLAAN
        // ====================================================

        document
            .getElementById(
                "egodact-blok-opslaan"
            )
            .addEventListener(
                "click",
                () => {

                    const naam =
                        document.getElementById(
                            "egodact-blok-naam"
                        ).value.trim();

                    const beschrijving =
                        document.getElementById(
                            "egodact-blok-beschrijving"
                        ).value.trim();

                    const gekozenDag =
                        Number(
                            document.getElementById(
                                "egodact-blok-dag"
                            ).value
                        );

                    const startTijd =
                        document.getElementById(
                            "egodact-blok-start"
                        ).value;

                    const eindeTijd =
                        document.getElementById(
                            "egodact-blok-einde"
                        ).value;

                    if (!naam) {

                        alert(
                            "Geef het blok een naam."
                        );

                        return;
                    }

                    if (
                        !startTijd ||
                        !eindeTijd
                    ) {

                        alert(
                            "Kies een begin- en eindtijd."
                        );

                        return;
                    }

                    const startMinuten =
                        tijdNaarMinuten(
                            startTijd
                        );

                    const eindeMinuten =
                        tijdNaarMinuten(
                            eindeTijd
                        );

                    if (
                        eindeMinuten <=
                        startMinuten
                    ) {

                        alert(
                            "De eindtijd moet na de begintijd liggen."
                        );

                        return;
                    }

                    // ========================================
                    // BESTAAND BLOK BEWERKEN
                    // ========================================

                    if (isBewerken) {

                        const blok =
                            weekData.find(
                                b =>
                                    String(
                                        b.id
                                    ) ===
                                    String(
                                        bestaandBlok.id
                                    )
                            );

                        if (!blok) {
                            return;
                        }

                        blok.dag =
                            gekozenDag;

                        blok.start =
                            startMinuten;

                        blok.einde =
                            eindeMinuten;

                        blok.naam =
                            naam;

                        blok.beschrijving =
                            beschrijving;

                        blok.kleur =
                            gekozenKleur;

                        if (!blok.onderwerp) {

                            blok.onderwerp =
                                onderwerp;
                        }

                    }

                    // ========================================
                    // NIEUW BLOK
                    // ========================================

                    else {

                        weekData.push({

                            id:
                                Date.now() +
                                Math.random(),

                            dag:
                                gekozenDag,

                            start:
                                startMinuten,

                            einde:
                                eindeMinuten,

                            naam:
                                naam,

                            beschrijving:
                                beschrijving,

                            onderwerp:
                                onderwerp,

                            challengeId:
                                gekoppeldeChallengeId,

                            kleur:
                                gekozenKleur
                        });
                    }

                    slaWeekOp(
                        weekData
                    );

                    editorBackdrop.remove();

                    renderWeek();
                }
            );

        document
            .getElementById(
                "egodact-blok-naam"
            )
            .focus();
    }

    // ========================================================
    // TIJD HELPERS
    // ========================================================

    function tijdNaarMinuten(tijd) {

        const delen =
            tijd.split(":");

        return (
            Number(delen[0]) * 60 +
            Number(delen[1])
        );
    }

    function tijdAlsString(minuten) {

        const uren =
            Math.floor(
                minuten / 60
            );

        const minutenRest =
            minuten % 60;

        return (
            String(uren).padStart(
                2,
                "0"
            ) +
            ":" +
            String(minutenRest).padStart(
                2,
                "0"
            )
        );
    }

    function formatTijd(minuten) {

        return tijdAlsString(
            minuten
        );
    }

    // ========================================================
    // HTML VEILIG MAKEN
    // ========================================================

    function escapeHTML(tekst) {

        return String(tekst)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

    // ========================================================
    // ZIJBALK: CHALLENGES EN VAKKEN
    // ========================================================

    const vakNamen = [
        "Nederlands",
        "Engels",
        "Duits",
        "Wiskunde",
        "Biologie",
        "Geschiedenis",
        "Aardrijkskunde",
        "Natuurkunde",
        "Scheikunde",
        "Frans",
        "Economie",
        "Informatica"
    ];

    let challengeLijst = null;
    let challengeFout = null;
    let zoekTerm = "";
    let openChallengeId = null;
    let selectieOpruimen = null;
    let bordAfb = { thumbs: {}, users: {}, werelden: {} };

    // Leest thumbnails, foto's en wereld-icoontjes van het Egodact-bord
    // dat achter dit venster staat.
    function leesBord() {

        try {

            bordAfb =
                egodactSchraapBord(
                    challengeLijst.map(
                        c => c.raw
                    ),
                    backdrop
                );

        } catch (fout) {

            console.warn(
                "Egodact: afbeeldingen van het bord lezen mislukt",
                fout
            );
        }
    }

    function maakChallengeItem(c) {

        const wrapper =
            document.createElement("div");

        wrapper.style.marginBottom =
            "5px";

        const open =
            openChallengeId === c.id;

        const achtergrond =
            c.kleur || "#1976d2";

        const lichteTekst =
            !c.kleur ||
            egodactKleurIsDonker(
                c.kleur
            );

        const rij =
            document.createElement("div");

        rij.draggable =
            true;

        rij.title =
            "Klik voor details, sleep naar de kalender";

        Object.assign(
            rij.style,
            {
                background:
                    achtergrond,
                color:
                    lichteTekst
                        ? "#ffffff"
                        : "#212121",
                borderRadius:
                    open
                        ? "4px 4px 0 0"
                        : "4px",
                padding:
                    "6px 8px 6px 6px",
                cursor:
                    "grab",
                display:
                    "flex",
                alignItems:
                    "center",
                gap:
                    "8px",
                borderLeft:
                    "4px solid rgba(255,255,255,0.55)",
                userSelect:
                    "none",
                overflowWrap:
                    "anywhere"
            }
        );

        const thumbUrl =
            bordAfb.thumbs[c.id];

        if (thumbUrl) {

            const img =
                document.createElement("img");

            img.src =
                thumbUrl;

            img.alt =
                "";

            img.draggable =
                false;

            Object.assign(
                img.style,
                {
                    width: "36px",
                    height: "36px",
                    objectFit: "cover",
                    borderRadius: "3px",
                    flexShrink: "0",
                    background: "#fff",
                    display: "none"
                }
            );

            img.addEventListener(
                "load",
                () => {
                    img.style.display =
                        "block";
                }
            );

            rij.appendChild(
                img
            );
        }

        const tekstKolom =
            document.createElement("div");

        tekstKolom.style.minWidth =
            "0";

        tekstKolom.style.flex =
            "1";

        const naam =
            document.createElement("div");

        naam.textContent =
            c.naam;

        Object.assign(
            naam.style,
            {
                fontSize: "12px",
                fontWeight: "bold"
            }
        );

        tekstKolom.appendChild(
            naam
        );

        if (c.rij) {

            const sub =
                document.createElement("div");

            sub.textContent =
                c.rij;

            Object.assign(
                sub.style,
                {
                    fontSize: "10px",
                    opacity: "0.8"
                }
            );

            tekstKolom.appendChild(
                sub
            );
        }

        if (c.users.length) {

            const avatars =
                document.createElement("div");

            Object.assign(
                avatars.style,
                {
                    display: "flex",
                    gap: "2px",
                    marginTop: "3px",
                    alignItems: "center"
                }
            );

            c.users
                .slice(0, 6)
                .forEach(
                    u => {

                        avatars.appendChild(
                            egodactMaakAvatar(
                                u,
                                bordAfb.users[u.name],
                                16
                            )
                        );
                    }
                );

            if (c.users.length > 6) {

                const meer =
                    document.createElement("span");

                meer.textContent =
                    `+${c.users.length - 6}`;

                meer.style.fontSize =
                    "10px";

                avatars.appendChild(
                    meer
                );
            }

            tekstKolom.appendChild(
                avatars
            );
        }

        rij.appendChild(
            tekstKolom
        );

        const pijl =
            document.createElement("span");

        pijl.textContent =
            open
                ? "▾"
                : "▸";

        Object.assign(
            pijl.style,
            {
                fontSize: "11px",
                opacity: "0.7",
                flexShrink: "0"
            }
        );

        rij.appendChild(
            pijl
        );

        rij.addEventListener(
            "click",
            () => {

                openChallengeId =
                    open
                        ? null
                        : c.id;

                ververszijbalk();
            }
        );

        rij.addEventListener(
            "dragstart",
            event => {

                const dragData = {
                    type:
                        "subject",
                    subject:
                        c.naam,
                    challengeId:
                        c.id
                };

                event.dataTransfer.effectAllowed =
                    "copy";

                event.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify(
                        dragData
                    )
                );

                window.__egodactDraggedWeekBlock =
                    dragData;
            }
        );

        rij.addEventListener(
            "dragend",
            () => {

                window.__egodactDraggedWeekBlock =
                    null;
            }
        );

        wrapper.appendChild(
            rij
        );

        if (open) {

            const info =
                egodactMaakInfoBlok(
                    c,
                    bordAfb,
                    false
                );

            Object.assign(
                info.style,
                {
                    borderRadius:
                        "0 0 4px 4px",
                    borderLeft:
                        `4px solid ${achtergrond}`
                }
            );

            wrapper.appendChild(
                info
            );
        }

        return wrapper;
    }

    function maakSleepItem(
        tekst,
        subtekst,
        kleur
    ) {

        const item =
            document.createElement(
                "div"
            );

        item.draggable =
            true;

        const achtergrond =
            kleur || "#1976d2";

        Object.assign(
            item.style,
            {
                background:
                    achtergrond,
                color:
                    kleur &&
                    !egodactKleurIsDonker(kleur)
                        ? "#212121"
                        : "#ffffff",
                borderRadius:
                    "4px",
                padding:
                    "6px 8px",
                marginBottom:
                    "5px",
                cursor:
                    "grab",
                fontSize:
                    "12px",
                fontWeight:
                    "bold",
                borderLeft:
                    "4px solid rgba(255,255,255,0.55)",
                userSelect:
                    "none",
                overflowWrap:
                    "anywhere"
            }
        );

        const titel =
            document.createElement(
                "div"
            );

        titel.textContent =
            tekst;

        item.appendChild(
            titel
        );

        if (subtekst) {

            const sub =
                document.createElement(
                    "div"
                );

            sub.textContent =
                subtekst;

            Object.assign(
                sub.style,
                {
                    fontSize:
                        "10px",
                    fontWeight:
                        "normal",
                    opacity:
                        "0.8",
                    marginTop:
                        "1px"
                }
            );

            item.appendChild(
                sub
            );
        }

        item.addEventListener(
            "dragstart",
            event => {

                const dragData = {
                    type:
                        "subject",
                    subject:
                        tekst
                };

                event.dataTransfer.effectAllowed =
                    "copy";

                event.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify(
                        dragData
                    )
                );

                window.__egodactDraggedWeekBlock =
                    dragData;
            }
        );

        item.addEventListener(
            "dragend",
            () => {

                window.__egodactDraggedWeekBlock =
                    null;
            }
        );

        return item;
    }

    function maakZijbalkKop(
        tekst
    ) {

        const kop =
            document.createElement(
                "div"
            );

        kop.textContent =
            tekst;

        Object.assign(
            kop.style,
            {
                fontSize: "11px",
                fontWeight: "bold",
                color: "var(--egd-tekst-zacht)",
                textTransform:
                    "uppercase",
                letterSpacing:
                    "0.5px",
                margin:
                    "12px 0 6px"
            }
        );

        return kop;
    }

    function vulZijbalk(
        zijbalk
    ) {

        zijbalk.replaceChildren();

        const titel =
            document.createElement(
                "div"
            );

        titel.textContent =
            "Challenges & vakken";

        Object.assign(
            titel.style,
            {
                fontSize: "15px",
                fontWeight: "bold"
            }
        );

        const uitleg =
            document.createElement(
                "div"
            );

        uitleg.textContent =
            zoekTerm.trim()
                ? "Sleep naar de kalender"
                : "Sleep naar de kalender, of zoek hierboven";

        Object.assign(
            uitleg.style,
            {
                fontSize: "11px",
                color: "var(--egd-tekst-zacht)",
                marginTop: "3px"
            }
        );

        zijbalk.appendChild(
            titel
        );

        zijbalk.appendChild(
            uitleg
        );

        const inhoud =
            egodactZijbalkInhoud(
                challengeLijst,
                vakNamen,
                zoekTerm
            );

        // ---- Challenges ----

        if (challengeFout) {

            const fout =
                document.createElement(
                    "div"
                );

            fout.textContent =
                `Challenges laden mislukt: ${challengeFout}`;

            Object.assign(
                fout.style,
                {
                    fontSize: "11px",
                    color: "var(--egd-fout)",
                    marginTop: "10px"
                }
            );

            zijbalk.appendChild(
                fout
            );

        } else if (!challengeLijst) {

            const laden =
                document.createElement(
                    "div"
                );

            laden.textContent =
                "Challenges laden...";

            Object.assign(
                laden.style,
                {
                    fontSize: "12px",
                    color: "var(--egd-tekst-zacht)",
                    marginTop: "10px"
                }
            );

            zijbalk.appendChild(
                laden
            );

        } else {

            let huidigeFase =
                null;

            inhoud.challenges.forEach(
                c => {

                    if (
                        c.fase !==
                        huidigeFase
                    ) {

                        huidigeFase =
                            c.fase;

                        zijbalk.appendChild(
                            maakZijbalkKop(
                                EGODACT_FASE_NAAM[
                                    c.fase
                                ] || c.fase
                            )
                        );
                    }

                    zijbalk.appendChild(
                        maakChallengeItem(
                            c
                        )
                    );
                }
            );

            if (
                zoekTerm.trim() &&
                !inhoud.challenges.length
            ) {

                const leeg =
                    document.createElement(
                        "div"
                    );

                leeg.textContent =
                    "Geen challenges gevonden.";

                Object.assign(
                    leeg.style,
                    {
                        fontSize: "12px",
                        color: "var(--egd-tekst-zacht)",
                        marginTop: "10px"
                    }
                );

                zijbalk.appendChild(
                    leeg
                );
            }
        }

        // ---- Vakken ----

        if (inhoud.vakken.length) {

            zijbalk.appendChild(
                maakZijbalkKop(
                    "Vakken"
                )
            );

            inhoud.vakken.forEach(
                vak => {

                    zijbalk.appendChild(
                        maakSleepItem(
                            vak,
                            "",
                            null
                        )
                    );
                }
            );
        }
    }

    function ververszijbalk() {

        const zijbalk =
            document.getElementById(
                "egodact-vakken-zijbalk"
            );

        if (zijbalk) {

            vulZijbalk(
                zijbalk
            );
        }
    }

    // ========================================================
    // WEEK RENDEREN
    // ========================================================

    function renderWeek() {

        // Oude drag-status nooit meenemen naar
        // een opnieuw gerenderde kalender.
        window.__egodactDraggedWeekBlock =
            null;

        if (selectieOpruimen) {
            selectieOpruimen();
        }

        weekData =
            laadWeek();

        const content =
            document.getElementById(
                "egodact-weekplanning-content"
            );

        if (!content) {
            return;
        }

        content.innerHTML = "";

        updateWeekTitel();

        const calendar =
            document.createElement("div");

        Object.assign(
            calendar.style,
            {
                minWidth: "0",
                background: "var(--egd-veld)",
                border:
                    "1px solid var(--egd-rand)",
                borderRadius: "5px",
                overflow: "auto",
                maxHeight: "620px"
            }
        );

        // ====================================================
        // HEADER
        // ====================================================

        const header =
            document.createElement("div");

        Object.assign(
            header.style,
            {
                display: "grid",
                gridTemplateColumns:
                    "55px repeat(7, minmax(90px, 1fr))",
                position: "sticky",
                top: "0",
                zIndex: "15",
                background: "var(--egd-paneel)",
                borderBottom:
                    "1px solid var(--egd-rand)"
            }
        );

        header.appendChild(
            document.createElement("div")
        );

        const dagen = [
            "MA",
            "DI",
            "WO",
            "DO",
            "VR",
            "ZA",
            "ZO"
        ];

        dagen.forEach(
            (dagNaam, index) => {

                const dag =
                    document.createElement(
                        "div"
                    );

                const datum =
                    new Date(
                        weekStart
                    );

                datum.setDate(
                    datum.getDate() +
                    index
                );

                const dagNummer =
                    datum.getDate();

                dag.innerHTML = `
                    <div style="
                        font-size: 11px;
                        color: var(--egd-tekst-zacht);
                    ">
                        ${dagNaam}
                    </div>

                    <div style="
                        font-size: 17px;
                        font-weight: bold;
                        margin-top: 3px;
                    ">
                        ${dagNummer}
                    </div>
                `;

                Object.assign(
                    dag.style,
                    {
                        textAlign: "center",
                        padding: "8px 3px",
                        borderLeft:
                            "1px solid var(--egd-lijn)"
                    }
                );

                header.appendChild(
                    dag
                );
            }
        );

        calendar.appendChild(
            header
        );

        // ====================================================
        // TIJDSLIJN
        // ====================================================

        const body =
            document.createElement("div");

        Object.assign(
            body.style,
            {
                display: "grid",
                gridTemplateColumns:
                    "55px repeat(7, minmax(90px, 1fr))"
            }
        );

        const eersteUur = 7;
        const laatsteUur = 22;
        const hoogtePerUur = 60;

        // ====================================================
        // TIJDKOLOM
        // ====================================================

        const tijdKolom =
            document.createElement("div");

        for (
            let uur = eersteUur;
            uur < laatsteUur;
            uur++
        ) {

            const tijd =
                document.createElement("div");

            tijd.textContent =
                `${String(uur).padStart(
                    2,
                    "0"
                )}:00`;

            Object.assign(
                tijd.style,
                {
                    height:
                        `${hoogtePerUur}px`,
                    boxSizing:
                        "border-box",
                    padding:
                        "4px 5px",
                    color:
                        "var(--egd-tekst-zacht)",
                    fontSize:
                        "11px",
                    borderBottom:
                        "1px solid var(--egd-lijn)"
                }
            );

            tijdKolom.appendChild(
                tijd
            );
        }

        body.appendChild(
            tijdKolom
        );

        // ====================================================
        // DAGKOLOMMEN
        // ====================================================

        const alleDagKolommen = [];

        // Klikken en slepen in een dagkolom: de selectie werkt in cellen
        // van 30 minuten. Een enkele klik geeft (zoals altijd) het hele
        // uur; slepen geeft precies het gesleepte bereik.
        const CEL_MINUTEN = 30;

        const aantalCellen =
            (laatsteUur - eersteUur) *
            60 /
            CEL_MINUTEN;

        let actieveSelectie = null;
        let scrollTimer = null;

        function celBij(dagKolom, clientY) {

            const rect =
                dagKolom.getBoundingClientRect();

            const cel =
                Math.floor(
                    (clientY - rect.top) /
                    (
                        hoogtePerUur *
                        CEL_MINUTEN /
                        60
                    )
                );

            return Math.max(
                0,
                Math.min(
                    aantalCellen - 1,
                    cel
                )
            );
        }

        function selectieBereik(selectie) {

            // Klik zonder slepen: het hele uur.
            if (
                selectie.anker ===
                selectie.huidig
            ) {

                const uur =
                    eersteUur +
                    Math.floor(
                        selectie.anker *
                        CEL_MINUTEN /
                        60
                    );

                return {
                    start: uur * 60,
                    einde: (uur + 1) * 60
                };
            }

            const laagste =
                Math.min(
                    selectie.anker,
                    selectie.huidig
                );

            const hoogste =
                Math.max(
                    selectie.anker,
                    selectie.huidig
                );

            return {
                start:
                    eersteUur * 60 +
                    laagste * CEL_MINUTEN,
                einde:
                    eersteUur * 60 +
                    (hoogste + 1) * CEL_MINUTEN
            };
        }

        function toonSelectie(selectie) {

            selectie.dagKolom
                .querySelectorAll(
                    ".egodact-selectie"
                )
                .forEach(
                    el =>
                        el.remove()
                );

            const bereik =
                selectieBereik(
                    selectie
                );

            const el =
                document.createElement(
                    "div"
                );

            el.className =
                "egodact-selectie";

            Object.assign(
                el.style,
                {
                    position:
                        "absolute",
                    left: "3px",
                    right: "3px",
                    top:
                        `${(
                            bereik.start -
                            eersteUur * 60
                        ) /
                        60 *
                        hoogtePerUur}px`,
                    height:
                        `${(
                            bereik.einde -
                            bereik.start
                        ) /
                        60 *
                        hoogtePerUur}px`,
                    background:
                        "var(--egd-selectie)",
                    border:
                        "2px solid var(--egd-accent)",
                    borderRadius:
                        "4px",
                    boxSizing:
                        "border-box",
                    padding:
                        "3px 6px",
                    fontSize:
                        "11px",
                    fontWeight:
                        "bold",
                    color:
                        "var(--egd-tekst)",
                    pointerEvents:
                        "none",
                    zIndex: "4",
                    overflow:
                        "hidden"
                }
            );

            el.textContent =
                `${formatTijd(bereik.start)} - ${formatTijd(bereik.einde)}`;

            selectie.dagKolom.appendChild(
                el
            );
        }

        // Scrolt de kalender mee als je bij de rand sleept, zodat je
        // lange blokken kunt maken zonder los te laten.
        function startAutoScroll() {

            if (scrollTimer) {
                return;
            }

            scrollTimer =
                setInterval(
                    () => {

                        if (!actieveSelectie) {
                            return;
                        }

                        const rect =
                            calendar.getBoundingClientRect();

                        const y =
                            actieveSelectie.laatsteY;

                        // De dagkop blijft bovenaan staan.
                        const bovenGrens =
                            rect.top + 64;

                        const onderGrens =
                            rect.bottom - 40;

                        let delta = 0;

                        if (y < bovenGrens) {

                            delta =
                                -Math.min(
                                    25,
                                    (bovenGrens - y) / 3 + 4
                                );

                        } else if (y > onderGrens) {

                            delta =
                                Math.min(
                                    25,
                                    (y - onderGrens) / 3 + 4
                                );
                        }

                        if (!delta) {
                            return;
                        }

                        calendar.scrollTop += delta;

                        actieveSelectie.huidig =
                            celBij(
                                actieveSelectie.dagKolom,
                                y
                            );

                        toonSelectie(
                            actieveSelectie
                        );
                    },
                    30
                );
        }

        function stopSelectie(annuleer) {

            if (scrollTimer) {

                clearInterval(
                    scrollTimer
                );

                scrollTimer =
                    null;
            }

            const selectie =
                actieveSelectie;

            actieveSelectie =
                null;

            if (!selectie) {
                return;
            }

            selectie.dagKolom
                .querySelectorAll(
                    ".egodact-selectie"
                )
                .forEach(
                    el =>
                        el.remove()
                );

            try {

                selectie.dagKolom
                    .releasePointerCapture(
                        selectie.pointerId
                    );

            } catch (error) {}

            if (annuleer) {
                return;
            }

            const bereik =
                selectieBereik(
                    selectie
                );

            openBlokEditor(
                Number(
                    selectie.dagKolom
                        .dataset
                        .dag
                ),
                bereik.start,
                bereik.einde
            );
        }

        const selectiePointerUp =
            () =>
                stopSelectie(false);

        const selectiePointerCancel =
            () =>
                stopSelectie(true);

        document.addEventListener(
            "pointerup",
            selectiePointerUp
        );

        document.addEventListener(
            "pointercancel",
            selectiePointerCancel
        );

        // Bij het opnieuw tekenen of sluiten de oude listeners weghalen.
        selectieOpruimen =
            () => {

                if (scrollTimer) {

                    clearInterval(
                        scrollTimer
                    );

                    scrollTimer =
                        null;
                }

                actieveSelectie =
                    null;

                document.removeEventListener(
                    "pointerup",
                    selectiePointerUp
                );

                document.removeEventListener(
                    "pointercancel",
                    selectiePointerCancel
                );
            };

        for (
            let dagIndex = 0;
            dagIndex < 7;
            dagIndex++
        ) {

            const dagKolom =
                document.createElement("div");

            dagKolom.className =
                "egodact-dagkolom";

            dagKolom.dataset.dag =
                dagIndex;

            Object.assign(
                dagKolom.style,
                {
                    position: "relative",
                    borderLeft:
                        "1px solid var(--egd-lijn)",
                    height:
                        `${(
                            laatsteUur -
                            eersteUur
                        ) * hoogtePerUur}px`,
                    userSelect:
                        "none",
                    transition:
                        "background 0.1s ease"
                }
            );

            alleDagKolommen.push(
                dagKolom
            );

            // ================================================
            // UREN
            // ================================================

            for (
                let uur = eersteUur;
                uur < laatsteUur;
                uur++
            ) {

                const slot =
                    document.createElement(
                        "div"
                    );

                slot.className =
                    "egodact-tijdslot";

                slot.dataset.dag =
                    dagIndex;

                slot.dataset.uur =
                    uur;

                Object.assign(
                    slot.style,
                    {
                        height:
                            `${hoogtePerUur}px`,
                        boxSizing:
                            "border-box",
                        borderBottom:
                            "1px solid var(--egd-lijn)",
                        position:
                            "relative",
                        userSelect:
                            "none"
                    }
                );

                dagKolom.appendChild(
                    slot
                );
            }

            // ================================================
            // HALF UUR LIJNEN
            // ================================================

            for (
                let half = 0;
                half <
                (
                    laatsteUur -
                    eersteUur
                ) * 2;
                half++
            ) {

                if (
                    half % 2 === 1
                ) {

                    const lijn =
                        document.createElement(
                            "div"
                        );

                    Object.assign(
                        lijn.style,
                        {
                            position:
                                "absolute",
                            left: "0",
                            right: "0",
                            top:
                                `${half * 30}px`,
                            borderTop:
                                "1px dashed var(--egd-lijn-zacht)",
                            pointerEvents:
                                "none"
                        }
                    );

                    dagKolom.appendChild(
                        lijn
                    );
                }
            }

            // ================================================
            // SELECTIE (KLIKKEN EN SLEPEN)
            // ================================================

            dagKolom.addEventListener(
                "pointerdown",
                event => {

                    if (
                        event.button !== 0
                    ) {
                        return;
                    }

                    // Op een bestaand blok klikken/slepen werkt zoals
                    // eerst (bewerken of verplaatsen).
                    if (
                        event.target.closest(
                            "[data-id]"
                        )
                    ) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    const cel =
                        celBij(
                            dagKolom,
                            event.clientY
                        );

                    actieveSelectie = {
                        dagKolom,
                        anker: cel,
                        huidig: cel,
                        pointerId:
                            event.pointerId,
                        laatsteY:
                            event.clientY
                    };

                    try {

                        dagKolom.setPointerCapture(
                            event.pointerId
                        );

                    } catch (error) {}

                    toonSelectie(
                        actieveSelectie
                    );

                    startAutoScroll();
                }
            );

            dagKolom.addEventListener(
                "pointermove",
                event => {

                    if (
                        !actieveSelectie ||
                        actieveSelectie.dagKolom !==
                            dagKolom
                    ) {
                        return;
                    }

                    actieveSelectie.laatsteY =
                        event.clientY;

                    const cel =
                        celBij(
                            dagKolom,
                            event.clientY
                        );

                    if (
                        cel !==
                        actieveSelectie.huidig
                    ) {

                        actieveSelectie.huidig =
                            cel;

                        toonSelectie(
                            actieveSelectie
                        );
                    }
                }
            );

            body.appendChild(
                dagKolom
            );
        }

        // ====================================================
        // BESTAANDE BLOKKEN
        // ====================================================

        weekData.forEach(
            blok => {

                const dagKolom =
                    alleDagKolommen[
                        Number(blok.dag)
                    ];

                if (!dagKolom) {
                    return;
                }

                const blokElement =
                    document.createElement(
                        "div"
                    );

                blokElement.draggable =
                    true;

                blokElement.dataset.id =
                    String(blok.id);

                blokElement.style.userSelect =
                    "none";

                const top =
                    (
                        blok.start -
                        eersteUur * 60
                    ) /
                    60 *
                    hoogtePerUur;

                const hoogte =
                    (
                        blok.einde -
                        blok.start
                    ) /
                    60 *
                    hoogtePerUur;

                const blokKleur =
                    blok.kleur ||
                    EGODACT_STANDAARD_BLOKKLEUR;

                const lichteTekst =
                    egodactKleurIsDonker(
                        blokKleur
                    );

                Object.assign(
                    blokElement.style,
                    {
                        position:
                            "absolute",
                        top:
                            `${top}px`,
                        left:
                            "4px",
                        right:
                            "4px",
                        height:
                            `${Math.max(
                                hoogte - 4,
                                35
                            )}px`,
                        background:
                            blokKleur,
                        color:
                            lichteTekst
                                ? "#ffffff"
                                : "#212121",
                        borderRadius:
                            "4px",
                        padding:
                            "6px 8px",
                        boxSizing:
                            "border-box",
                        overflow:
                            "hidden",
                        cursor:
                            "grab",
                        zIndex:
                            "10",
                        borderLeft:
                            blok.kleur
                                ? (
                                    lichteTekst
                                        ? "4px solid rgba(255,255,255,0.55)"
                                        : "4px solid rgba(0,0,0,0.35)"
                                )
                                : "4px solid var(--egd-accent)"
                    }
                );

                blokElement.innerHTML = `

                    <div style="
                        font-weight: bold;
                        font-size: 12px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        pointer-events: none;
                    ">
                        ${escapeHTML(
                            blok.naam
                        )}
                    </div>

                    <div style="
                        font-size: 10px;
                        opacity: 0.85;
                        margin-top: 2px;
                        pointer-events: none;
                    ">
                        ${formatTijd(
                            blok.start
                        )}
                        -
                        ${formatTijd(
                            blok.einde
                        )}
                    </div>

                    ${
                        blok.beschrijving
                            ? `
                                <div style="
                                    font-size: 10px;
                                    margin-top: 4px;
                                    opacity: 0.85;
                                    pointer-events: none;
                                ">
                                    ${escapeHTML(
                                        blok.beschrijving
                                    )}
                                </div>
                            `
                            : ""
                    }
                `;

                // ============================================
                // KLIK = BEWERKEN
                // ============================================

                let blokWasGesleept =
                    false;

                blokElement.addEventListener(
                    "click",
                    event => {

                        if (
                            blokWasGesleept
                        ) {
                            event.stopPropagation();
                            return;
                        }

                        event.stopPropagation();

                        openBlokEditor(
                            blok.dag,
                            blok.start,
                            blok.einde,
                            blok.naam,
                            blok
                        );
                    }
                );

                // ============================================
                // DRAG BESTAAND BLOK
                // ============================================

                blokElement.addEventListener(
                    "dragstart",
                    event => {

                        event.stopPropagation();

                        blokWasGesleept =
                            true;

                        const dragData = {
                            type:
                                "existing",
                            id:
                                String(
                                    blok.id
                                )
                        };

                        window.__egodactDraggedWeekBlock =
                            dragData;

                        event.dataTransfer.effectAllowed =
                            "move";

                        event.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify(
                                dragData
                            )
                        );

                        blokElement.style.opacity =
                            "0.45";

                        blokElement.style.cursor =
                            "grabbing";

                        document.body.style.cursor =
                            "grabbing";
                    }
                );

                blokElement.addEventListener(
                    "dragend",
                    event => {

                        event.stopPropagation();

                        window.__egodactDraggedWeekBlock =
                            null;

                        blokElement.style.opacity =
                            "1";

                        blokElement.style.cursor =
                            "grab";

                        document.body.style.cursor =
                            "";

                        setTimeout(
                            () => {
                                blokWasGesleept =
                                    false;
                            },
                            0
                        );
                    }
                );

                dagKolom.appendChild(
                    blokElement
                );
            }
        );

        calendar.appendChild(
            body
        );

        // ====================================================
        // VAKKEN
        // ====================================================

        const vakken =
            document.createElement(
                "div"
            );

        vakken.id =
            "egodact-vakken-zijbalk";

        Object.assign(
            vakken.style,
            {
                background: "var(--egd-paneel)",
                border:
                    "1px solid var(--egd-rand)",
                borderRadius: "5px",
                padding: "12px",
                overflowY: "auto",
                maxHeight:
                    "calc(90vh - 190px)"
            }
        );

        vulZijbalk(
            vakken
        );

        content.appendChild(
            calendar
        );

        content.appendChild(
            vakken
        );

        // ====================================================
        // DROP OP DAGKOLOMMEN
        // ====================================================

        alleDagKolommen.forEach(
            dagKolom => {

                // ============================================
                // DRAGOVER
                // ============================================

                dagKolom.addEventListener(
                    "dragover",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        const dragData =
                            window.__egodactDraggedWeekBlock;

                        if (
                            dragData &&
                            dragData.type ===
                                "existing"
                        ) {

                            event.dataTransfer.dropEffect =
                                "move";

                        } else {

                            event.dataTransfer.dropEffect =
                                "copy";
                        }

                        dagKolom.style.background =
                            "var(--egd-hover)";
                    }
                );

                // ============================================
                // DRAGLEAVE
                // ============================================

                dagKolom.addEventListener(
                    "dragleave",
                    event => {

                        const target =
                            event.relatedTarget;

                        if (
                            target &&
                            dagKolom.contains(
                                target
                            )
                        ) {
                            return;
                        }

                        dagKolom.style.background =
                            "";
                    }
                );

                // ============================================
                // DROP
                // ============================================

                dagKolom.addEventListener(
                    "drop",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        dagKolom.style.background =
                            "";

                        let data =
                            window.__egodactDraggedWeekBlock;

                        // Fallback naar dataTransfer
                        if (!data) {

                            const gegevens =
                                event.dataTransfer.getData(
                                    "text/plain"
                                );

                            if (gegevens) {

                                try {

                                    data =
                                        JSON.parse(
                                            gegevens
                                        );

                                } catch (error) {

                                    console.error(
                                        "Ongeldige drag-data:",
                                        error
                                    );

                                    return;
                                }
                            }
                        }

                        if (!data) {
                            return;
                        }

                        // ====================================
                        // POSITIE IN DAG BEREKENEN
                        // ====================================

                        const rect =
                            dagKolom.getBoundingClientRect();

                        const y =
                            event.clientY -
                            rect.top;

                        const maximaleMinuten =
                            (
                                laatsteUur -
                                eersteUur
                            ) * 60;

                        let minutenVanafStart =
                            Math.floor(
                                (
                                    y /
                                    hoogtePerUur
                                ) * 60
                            );

                        minutenVanafStart =
                            Math.max(
                                0,
                                Math.min(
                                    maximaleMinuten,
                                    minutenVanafStart
                                )
                            );

                        const afgerondeMinuten =
                            Math.floor(
                                minutenVanafStart /
                                30
                            ) * 30;

                        const start =
                            eersteUur * 60 +
                            afgerondeMinuten;

                        const dag =
                            Number(
                                dagKolom.dataset.dag
                            );

                        // ====================================
                        // VAK NAAR KALENDER
                        // ====================================

                        if (
                            data.type ===
                            "subject"
                        ) {

                            window.__egodactDraggedWeekBlock =
                                null;

                            openBlokEditor(
                                dag,
                                start,
                                Math.min(
                                    start + 60,
                                    laatsteUur * 60
                                ),
                                data.subject,
                                null,
                                data.challengeId || null
                            );

                            return;
                        }

                        // ====================================
                        // BESTAAND BLOK VERPLAATSEN
                        // ====================================

                        if (
                            data.type !==
                            "existing"
                        ) {
                            return;
                        }

                        const blok =
                            weekData.find(
                                b =>
                                    String(
                                        b.id
                                    ) ===
                                    String(
                                        data.id
                                    )
                            );

                        if (!blok) {

                            console.warn(
                                "Kon gesleept blok niet vinden:",
                                data.id
                            );

                            return;
                        }

                        // Bewaar oorspronkelijke duur
                        const duur =
                            blok.einde -
                            blok.start;

                        // Nieuwe dag
                        blok.dag =
                            dag;

                        // Nieuwe begintijd
                        blok.start =
                            start;

                        // Zelfde duur behouden
                        blok.einde =
                            Math.min(
                                start + duur,
                                laatsteUur * 60
                            );

                        // Opslaan
                        slaWeekOp(
                            weekData
                        );

                        // Drag-status wissen
                        window.__egodactDraggedWeekBlock =
                            null;

                        // Kalender opnieuw tekenen
                        renderWeek();
                    }
                );
            }
        );
    }

    // ========================================================
    // SLUITEN / ESCAPE
    // ========================================================

    let gesloten = false;

    const sluitMenu =
        () => {

            if (gesloten) {
                return;
            }

            gesloten = true;

            window.__egodactDraggedWeekBlock =
                null;

            if (selectieOpruimen) {
                selectieOpruimen();
            }

            document.removeEventListener(
                "keydown",
                escapeHandler
            );

            backdrop.remove();
        };

    const escapeHandler =
        event => {

            if (
                event.key === "Escape"
            ) {

                sluitMenu();
            }
        };

    document.addEventListener(
        "keydown",
        escapeHandler
    );

    document
        .getElementById(
            "egodact-weekplanning-sluiten"
        )
        .addEventListener(
            "click",
            sluitMenu
        );

    backdrop.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                backdrop
            ) {

                sluitMenu();
            }
        }
    );

    // ========================================================
    // WEEK NAVIGATIE
    // ========================================================

    document
        .getElementById(
            "egodact-vorige-week"
        )
        .addEventListener(
            "click",
            () => {

                weekStart.setDate(
                    weekStart.getDate() -
                    7
                );

                weekData =
                    laadWeek();

                renderWeek();
            }
        );

    document
        .getElementById(
            "egodact-volgende-week"
        )
        .addEventListener(
            "click",
            () => {

                weekStart.setDate(
                    weekStart.getDate() +
                    7
                );

                weekData =
                    laadWeek();

                renderWeek();
            }
        );

    document
        .getElementById(
            "egodact-vandaag-week"
        )
        .addEventListener(
            "click",
            () => {

                weekStart =
                    beginVanWeek(
                        new Date()
                    );

                weekData =
                    laadWeek();

                renderWeek();
            }
        );

    // ========================================================
    // STANDAARD WEEK OPSLAAN
    // ========================================================
    document.getElementById("egodact-week-sla-standaard-op").addEventListener("click", () => {
        const actueleWeek = laadWeek();
        if (!actueleWeek.length) {
            alert("Voeg eerst een aantal blokken toe voordat je deze week als standaard opslaat.");
            return;
        }
        try {
            const template = actueleWeek.map(blok => {
                const kopie = { ...blok };
                delete kopie.id;
                delete kopie.challengeId;
                return kopie;
            });
            localStorage.setItem("egodact_weekplanning_template", JSON.stringify(template));
            alert("Deze week is opgeslagen als jouw standaard week. Nieuwe lege weken krijgen deze planning automatisch.");
        } catch (error) {
            console.error("Fout bij opslaan van standaard weekplanning:", error);
            alert("Er ging iets mis bij het opslaan van de standaard week.");
        }
    });

    // ========================================================
    // + BLOK TOEVOEGEN
    // ========================================================

    document
        .getElementById(
            "egodact-week-blok-toevoegen"
        )
        .addEventListener(
            "click",
            () => {

                openBlokEditor(
                    0,
                    9 * 60,
                    10 * 60
                );
            }
        );

    // ========================================================
    // ZOEKEN IN CHALLENGES EN VAKKEN
    // ========================================================

    document
        .getElementById(
            "egodact-week-zoek"
        )
        .addEventListener(
            "input",
            event => {

                // Geheim: "games" in de zoekbalk opent het gamesmenu.
                if (
                    event.target.value
                        .trim()
                        .toLowerCase() === "games"
                ) {
                    event.target.value = "";
                    sluitMenu();
                    openGamesMenu();
                    return;
                }

                zoekTerm =
                    event.target.value;

                ververszijbalk();
            }
        );

    // ========================================================
    // START
    // ========================================================

    renderWeek();

    egodactLaadChallenges()
        .then(
            lijst => {

                challengeLijst =
                    lijst;

                leesBord();

                ververszijbalk();

                // Het bord kan nog bezig zijn met laden.
                if (
                    !Object.keys(
                        bordAfb.thumbs
                    ).length
                ) {

                    setTimeout(
                        () => {

                            if (gesloten) {
                                return;
                            }

                            leesBord();

                            ververszijbalk();
                        },
                        1500
                    );
                }
            }
        )
        .catch(
            fout => {

                console.error(
                    "Challenges laden mislukt:",
                    fout
                );

                challengeFout =
                    fout && fout.message
                        ? fout.message
                        : String(fout);

                ververszijbalk();
            }
        );
}


// ============================================================
// KNOPPEN TOEVOEGEN
// ============================================================

function voegKnoppenToe() {

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

        if (bestaandeBetaFeatures) {
            bestaandeBetaFeatures.remove();
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

    if (
        bestaandeInfo &&
        bestaandeTaken &&
        bestaandeWeekplanning &&
        (bestaandeBetaFeatures || !EGODACT_BETA_ZICHTBAAR)
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

    if (zoekKnopElement) {

        zoekKnopElement.style.transform =
            'translateX(-50px)';

        zoekKnopElement.style.transition =
            'transform 0.15s ease';
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

        menuContainer.insertBefore(
            infoKnop,
            menuContainer.firstChild
        );
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
            menuContainer.insertBefore(betaKnop, menuContainer.firstChild);
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

            menuContainer.insertBefore(
                takenKnop,
                menuContainer.firstChild
            );
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

            menuContainer.insertBefore(
                weekplanningKnop,
                menuContainer.firstChild
            );
        }
    }

    egodactSyncMenuButtonTheme();
}


// ============================================================
// OBSERVER
// ============================================================

const observer =
    new MutationObserver(
        () => {
            voegKnoppenToe();
        }
    );

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


// ============================================================
// EERSTE UITVOERING
// ============================================================

voegKnoppenToe();
