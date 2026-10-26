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
#egodact-beta-features-knop,
#egodact-test-features-knop {
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
            document.getElementById('egodact-beta-features-knop') ||
            document.getElementById('egodact-test-features-knop');

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

