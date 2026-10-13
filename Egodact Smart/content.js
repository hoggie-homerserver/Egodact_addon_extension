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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: '9999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
    });

    const modal = document.createElement('div');

    Object.assign(modal.style, {
        backgroundColor: '#424242',
        color: '#ffffff',
        width: '520px',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow:
            '0px 11px 15px -7px rgba(0,0,0,0.3), ' +
            '0px 24px 38px 3px rgba(0,0,0,0.2), ' +
            '0px 9px 46px 8px rgba(0,0,0,0.15)'
    });

    modal.innerHTML = `
        <h2 style="
            margin: 0;
            font-size: 22px;
            font-weight: 500;
            border-bottom: 1px solid #555;
            padding-bottom: 10px;
        ">
            SMART methode
        </h2>

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
                background: #2e2e2e;
                padding: 12px;
                border-radius: 4px;
                border-left: 5px solid #0d47a1;
            ">
                <span style="
                    font-size: 20px;
                    font-weight: bold;
                    color: #90caf9;
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
                        color: #b0b0b0;
                    ">
                        Is het doel duidelijk en concreet omschreven?
                    </div>
                </div>
            </div>

            <div style="
                display: flex;
                align-items: center;
                gap: 14px;
                background: #2e2e2e;
                padding: 12px;
                border-radius: 4px;
                border-left: 5px solid #00b0ff;
            ">
                <span style="
                    font-size: 20px;
                    font-weight: bold;
                    color: #40c4ff;
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
                        color: #b0b0b0;
                    ">
                        Kun je achteraf bewijzen of meten dat het doel is gehaald?
                    </div>
                </div>
            </div>

            <div style="
                display: flex;
                align-items: center;
                gap: 14px;
                background: #2e2e2e;
                padding: 12px;
                border-radius: 4px;
                border-left: 5px solid #ffb300;
            ">
                <span style="
                    font-size: 20px;
                    font-weight: bold;
                    color: #ffe082;
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
                        color: #b0b0b0;
                    ">
                        Is het doel motiverend, uitdagend en de moeite waard?
                    </div>
                </div>
            </div>

            <div style="
                display: flex;
                align-items: center;
                gap: 14px;
                background: #2e2e2e;
                padding: 12px;
                border-radius: 4px;
                border-left: 5px solid #9c27b0;
            ">
                <span style="
                    font-size: 20px;
                    font-weight: bold;
                    color: #f48fb1;
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
                        color: #b0b0b0;
                    ">
                        Is het doel haalbaar en uitvoerbaar binnen jouw planning?
                    </div>
                </div>
            </div>

            <div style="
                display: flex;
                align-items: center;
                gap: 14px;
                background: #2e2e2e;
                padding: 12px;
                border-radius: 4px;
                border-left: 5px solid #0288d1;
            ">
                <span style="
                    font-size: 20px;
                    font-weight: bold;
                    color: #81d4fa;
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
                        color: #b0b0b0;
                    ">
                        Wanneer, op welke datum of na hoeveel weken is het klaar?
                    </div>
                </div>
            </div>

        </div>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 5px;
        ">
            <button
                id="egodact-modal-sluiten"
                style="
                    background-color: #90caf9;
                    border: none;
                    color: #0d47a1;
                    cursor: pointer;
                    padding: 10px 20px;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    border-radius: 4px;
                    box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2);
                "
            >
                Sluiten
            </button>
        </div>
    `;

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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: '9999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
    });

    const modal = document.createElement('div');

    Object.assign(modal.style, {
        backgroundColor: '#424242',
        color: '#ffffff',
        width: '1100px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 48px)',
        boxSizing: 'border-box',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow:
            '0px 11px 15px -7px rgba(0,0,0,0.3), ' +
            '0px 24px 38px 3px rgba(0,0,0,0.2), ' +
            '0px 9px 46px 8px rgba(0,0,0,0.15)'
    });

    modal.innerHTML = `
        <h2 style="
            margin: 0;
            font-size: 22px;
            font-weight: 500;
            border-bottom: 1px solid #555;
            padding-bottom: 10px;
        ">Beta Features</h2>

        
        <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            background: #2e2e2e;
            border: 1px solid #555;
            border-radius: 6px;
            padding: 11px 13px;
            transition: border-color 0.2s, box-shadow 0.2s;
        ">
            <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#90caf9"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="flex-shrink: 0;"
            >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>

            <input
                id="egodact-beta-search"
                type="text"
                placeholder="Zoek een feature..."
                autocomplete="off"
                style="
                    flex: 1;
                    min-width: 0;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #ffffff;
                    font-family: inherit;
                    font-size: 14px;
                "
            >
        </div>

        <div
            id="egodact-beta-challenges"
            style="
                flex: 1;
                min-height: 0;
                max-height: calc(100vh - 280px);
                overflow-y: auto;
            "
        >
            <div style="color: #aaa; font-size: 13px;">
                Challenges laden...
            </div>
        </div>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 5px;
        ">
            <button
                id="egodact-beta-modal-sluiten"
                style="
                    background-color: #90caf9;
                    border: none;
                    color: #0d47a1;
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

    
const CHALLENGE_FASES = [
    { key: 'TODO', label: 'To do' },
    { key: 'IN_PROGRESS', label: 'In progress' },
    { key: 'DONE', label: 'Done' }
];

// De API geeft alleen bestandsnamen. De volledige URL leren we van
// afbeeldingen die Egodact zelf al op de pagina heeft geladen.
function verzamelPaginaAfbeeldingen() {
    const urls = new Set();

    // 1. Alles wat de browser al heeft geladen (ongeacht hoe het in de
    //    pagina is gezet: <img>, CSS-achtergrond, canvas, ...).
    try {
        performance.getEntriesByType('resource').forEach(entry => {
            if (entry.name) urls.add(entry.name);
        });
    } catch (err) {
        // performance API niet beschikbaar
    }

    // 2. <img>-tags en achtergrondafbeeldingen in de DOM.
    document.querySelectorAll('img').forEach(img => {
        urls.add(img.currentSrc || img.src || '');
    });

    document.querySelectorAll('*').forEach(el => {
        const bg = getComputedStyle(el).backgroundImage;
        if (!bg || bg === 'none') return;

        for (const m of bg.matchAll(/url\(["']?([^"')]+)/g)) {
            urls.add(m[1]);
        }
    });

    urls.delete('');

    // Zowel de ruwe als de gedecodeerde variant, voor het zoeken.
    const result = [];
    urls.forEach(url => {
        result.push(url);
        try {
            const decoded = decodeURIComponent(url);
            if (decoded !== url) result.push(decoded);
        } catch (err) {
            // ongeldige encoding, negeren
        }
    });

    return result;
}

function leerBasisUrl(urls, bestandsnamen) {
    for (const naam of bestandsnamen) {
        if (!naam) continue;

        for (const url of urls) {
            const i = url.indexOf(naam);
            if (i > 0) return url.slice(0, i);
        }
    }

    return null;
}

function kleurIsDonker(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return true;

    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;

    return (0.299 * r + 0.587 * g + 0.114 * b) < 150;
}

function afbeeldingUrlVan(el) {
    if (el.tagName === 'IMG') return el.currentSrc || el.src || null;

    const bg = getComputedStyle(el).backgroundImage;
    const m = bg && bg !== 'none' && /url\(["']?([^"')]+)/.exec(bg);
    return m ? m[1] : null;
}

function rgbVan(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return null;

    const n = parseInt(m[1], 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

// Zoekt de echte kaart op het Egodact-bord (achter dit menu) op naam en
// leest daar de afbeeldingen uit. Volgorde in een kaart: thumbnail,
// wereld-icoontjes, daarna de avatars van de gebruikers.
function schraapBord(challenges, modalEl) {
    const resultaat = { thumbs: {}, users: {} };

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

        const kleur = rgbVan(c.color);
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

        const urls = [];
        kaart.querySelectorAll('*').forEach(el => {
            const url = afbeeldingUrlVan(el);
            if (url) urls.push(url);
        });

        const metFoto = (c.users || []).filter(u => u.picture);
        const heeftThumb = !!(c.thumbnail && c.thumbnail.file);

        const userUrls = urls.slice(
            Math.max(urls.length - metFoto.length, 0)
        );

        metFoto.forEach((u, i) => {
            if (userUrls[i] && !resultaat.users[u.name]) {
                resultaat.users[u.name] = userUrls[i];
            }
        });

        if (heeftThumb && urls.length > metFoto.length) {
            resultaat.thumbs[c.id] = urls[0];
        }
    }

    return resultaat;
}

function maakAvatar(user, url) {
    const size = '26px';
    const wrap = document.createElement('div');

    Object.assign(wrap.style, {
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: '0',
        background: '#757575',
        color: '#fff',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    wrap.title = user.name || '';
    wrap.textContent = (user.firstName || '?')[0].toUpperCase();

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

function maakChallengeKaart(challenge, thumbBase, pictureBase, schraap) {
    const donker = kleurIsDonker(challenge.color);
    const card = document.createElement('div');

    card.dataset.name = (challenge.name || '').toLowerCase();

    Object.assign(card.style, {
        background: challenge.color || '#616161',
        color: challenge.color
            ? (donker ? '#fff' : '#212121')
            : '#fff',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '13px',
        overflowWrap: 'anywhere',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
    });

    const file = challenge.thumbnail && challenge.thumbnail.file;
    const thumbName = file &&
        (file.thumbnailStorageFilename || file.storageFilename);

    const thumbUrl = schraap.thumbs[challenge.id] ||
        (thumbName && thumbBase ? thumbBase + thumbName : null);

    if (thumbUrl) {
        const img = document.createElement('img');
        img.src = thumbUrl;
        img.alt = '';
        Object.assign(img.style, {
            width: '100%',
            height: '90px',
            objectFit: 'cover',
            borderRadius: '3px',
            display: 'none',
            background: '#fff'
        });
        img.addEventListener('load', () => {
            img.style.display = 'block';
        });
        card.appendChild(img);
    }

    const users = document.createElement('div');
    Object.assign(users.style, {
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
    });
    (challenge.users || []).forEach(u => {
        const url = schraap.users[u.name] ||
            (u.picture && pictureBase ? pictureBase + u.picture : null);
        users.appendChild(maakAvatar(u, url));
    });
    if (users.childNodes.length) card.appendChild(users);

    const name = document.createElement('div');
    name.textContent = challenge.name || 'Naamloze challenge';
    name.style.fontWeight = '500';
    card.appendChild(name);

    if (challenge.plannedEndDate) {
        const datum = document.createElement('div');
        datum.textContent = new Date(challenge.plannedEndDate)
            .toLocaleDateString('nl-NL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        datum.style.fontSize = '12px';
        datum.style.opacity = '0.8';
        card.appendChild(datum);
    }

    return card;
}

function toonChallengePortfolio(container, data) {
    const challenges = data.challenges || {};
    const rows = Object.values(data.rows || {})
        .sort((a, b) => (b.position || 0) - (a.position || 0));

    // Challenges die in geen enkele rij staan.
    const ingedeeld = new Set(rows.flatMap(r => r.challenges || []));
    const losse = Object.values(challenges)
        .filter(c => !ingedeeld.has(c.id))
        .map(c => c.id);

    if (losse.length) {
        rows.push({ id: 'los', name: 'Zonder rij', challenges: losse });
    }

    if (Object.keys(challenges).length === 0) {
        container.textContent =
            'Geen challenges gevonden in de API-response.';
        return;
    }

    const paginaAfbeeldingen = verzamelPaginaAfbeeldingen();
    const alleChallenges = Object.values(challenges);

    const thumbBase = leerBasisUrl(
        paginaAfbeeldingen,
        alleChallenges.flatMap(c => {
            const f = c.thumbnail && c.thumbnail.file;
            return f ? [f.thumbnailStorageFilename, f.storageFilename] : [];
        })
    );

    const pictureBase = leerBasisUrl(
        paginaAfbeeldingen,
        alleChallenges.flatMap(c =>
            (c.users || []).map(u => u.picture)
        )
    );

    const modalEl = container.parentElement || container;
    const schraap = schraapBord(alleChallenges, modalEl);

    console.log('Egodact extensie: thumbnail-basis =', thumbBase);
    console.log('Egodact extensie: avatar-basis =', pictureBase);
    console.log(
        'Egodact extensie: van bord gelezen thumbnails =',
        Object.keys(schraap.thumbs).length,
        'gebruikers =',
        Object.keys(schraap.users).length,
        schraap
    );

    const LIJN = '1px solid #616161';

    container.replaceChildren();

    const gridStijl = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '0'
    };

    const kop = document.createElement('div');
    Object.assign(kop.style, gridStijl, {
        position: 'sticky',
        top: '0',
        background: '#424242',
        zIndex: '1',
        color: '#bdbdbd',
        fontSize: '14px',
        borderBottom: LIJN
    });
    CHALLENGE_FASES.forEach((f, i) => {
        const el = document.createElement('div');
        el.textContent = f.label;
        Object.assign(el.style, {
            padding: '8px 12px',
            borderLeft: i > 0 ? LIJN : 'none'
        });
        kop.appendChild(el);
    });
    container.appendChild(kop);

    for (const row of rows) {
        const titel = document.createElement('div');
        titel.textContent = row.name || '';
        Object.assign(titel.style, {
            fontSize: '18px',
            fontWeight: '500',
            padding: '12px',
            borderBottom: LIJN
        });
        container.appendChild(titel);

        const grid = document.createElement('div');
        Object.assign(grid.style, gridStijl, {
            borderBottom: LIJN
        });

        const kolommen = {};
        CHALLENGE_FASES.forEach((f, i) => {
            const kol = document.createElement('div');
            Object.assign(kol.style, {
                display: 'grid',
                gridTemplateColumns:
                    'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '8px',
                alignContent: 'start',
                padding: '12px',
                minHeight: '56px',
                borderLeft: i > 0 ? LIJN : 'none'
            });
            kolommen[f.key] = kol;
            grid.appendChild(kol);
        });

        for (const id of row.challenges || []) {
            const challenge = challenges[id];
            if (!challenge) continue;

            const kol = kolommen[challenge.phase] || kolommen.TODO;
            kol.appendChild(
                maakChallengeKaart(
                    challenge, thumbBase, pictureBase, schraap
                )
            );
        }

        container.appendChild(grid);
    }
}

async function laadChallenges() {
    const container = modal.querySelector(
        '#egodact-beta-challenges'
    );

    container.textContent = 'Challenges laden...';

    try {
        const ACCESS_TOKEN_KEY =
            'pYfkT6ZWcUB98Sla76HppFpk4aYdTAp0_CACHE_0';

        const SCHOOL_KEY = 'selectedSchool';

        const accessToken = localStorage.getItem(
            ACCESS_TOKEN_KEY
        );

        const selectedSchool = localStorage.getItem(
            SCHOOL_KEY
        );

        if (!accessToken) {
            throw new Error(
                'Geen access token gevonden. Log opnieuw in bij Egodact.'
            );
        }

        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        };

        if (selectedSchool) {
            headers['School'] = selectedSchool;
        }

        const response = await fetch(
            'https://api.egodact.com/challenge-portfolio',
            {
                method: 'GET',
                headers,
                credentials: 'omit'
            }
        );

        if (!response.ok) {
            const details = await response.text();

            throw new Error(
                `API-fout ${response.status}: ${details.slice(0, 250)}`
            );
        }

        const data = await response.json();

        console.log('Challenge portfolio:', data);
        console.log('Portfolio rows:', data.rows);
        console.log('Challenges:', data.challenges);

        toonChallengePortfolio(container, data);
    } catch (error) {
        console.error(
            'Challenges laden mislukt:',
            error
        );

        container.textContent =
            `Challenges konden niet worden geladen. Fout: ${
                error?.message || error
            }`;
    }
}

    // Zoekveld en sluiten-knop activeren nadat het menu in de DOM staat.
    const searchInput = modal.querySelector('#egodact-beta-search');
    const searchWrapper = searchInput.parentElement;

    searchInput.addEventListener('focus', () => {
        searchWrapper.style.borderColor = '#90caf9';
        searchWrapper.style.boxShadow = '0 0 0 2px rgba(144, 202, 249, 0.15)';
    });

    searchInput.addEventListener('blur', () => {
        searchWrapper.style.borderColor = '#555';
        searchWrapper.style.boxShadow = 'none';
    });

    modal
        .querySelector('#egodact-beta-modal-sluiten')
        .addEventListener('click', sluitMenu);

    backdrop.addEventListener('click', event => {
        if (event.target === backdrop) sluitMenu();
    });

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();

        modal
            .querySelectorAll('#egodact-beta-challenges [data-name]')
            .forEach(card => {
                card.style.display =
                    !q || card.dataset.name.includes(q) ? '' : 'none';
            });
    });

    laadChallenges();
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
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: "9999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
    });

    const modal = document.createElement("div");

    Object.assign(modal.style, {
        backgroundColor: "#424242",
        color: "#ffffff",
        width: "580px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        borderRadius: "6px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow:
            "0px 11px 15px -7px rgba(0,0,0,0.3), " +
            "0px 24px 38px 3px rgba(0,0,0,0.2), " +
            "0px 9px 46px 8px rgba(0,0,0,0.15)"
    });

    modal.innerHTML = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #555;
            padding-bottom: 10px;
        ">
            <h2 style="
                margin: 0;
                font-size: 22px;
                font-weight: 500;
            ">
                Flexibele Dagplanning
            </h2>

            <input
                type="text"
                id="egodact-planner-search"
                placeholder="Search.."
                style="background:#2e2e2e;color:#fff;border:1px solid #555;padding:4px 8px;border-radius:4px;font-family:inherit;width:150px;"
            >
            <input
                type="date"
                id="egodact-planner-datum"
                value="${vandaag}"
                style="
                    background-color: #2e2e2e;
                    color: #fff;
                    border: 1px solid #555;
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
            background: #333;
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
                    background-color: #90caf9;
                    border: none;
                    color: #0d47a1;
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
                        background: "#2e2e2e",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        borderLeft:
                            "4px solid #90caf9"
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
                        background: "#1e1e1e",
                        border: "1px solid #444",
                        color: "#90caf9",
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
                        color: "#ffffff",
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
                        color: "#ef5350",
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
                "rgba(0, 0, 0, 0.65)",
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
            backgroundColor: "#424242",
            color: "#ffffff",
            width: "1200px",
            maxWidth: "95vw",
            maxHeight: "90vh",
            borderRadius: "6px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow:
                "0px 11px 15px -7px rgba(0,0,0,0.3), " +
                "0px 24px 38px 3px rgba(0,0,0,0.2), " +
                "0px 9px 46px 8px rgba(0,0,0,0.15)",
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
            border-bottom: 1px solid #555;
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
                        background: #333;
                        color: white;
                        border: 1px solid #555;
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
                        background: #333;
                        color: white;
                        border: 1px solid #555;
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
                        background: #333;
                        color: white;
                        border: 1px solid #555;
                        border-radius: 4px;
                        padding: 7px 12px;
                        cursor: pointer;
                        font-size: 16px;
                    "
                >
                    ›
                </button>

                <span
                    id="egodact-week-titel"
                    style="
                        min-width: 150px;
                        text-align: center;
                        font-size: 14px;
                        color: #ddd;
                    "
                ></span>

                <button
                    id="egodact-week-blok-toevoegen"
                    type="button"
                    style="
                        background: #90caf9;
                        color: #0d47a1;
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
                grid-template-columns: minmax(0, 1fr) 190px;
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
                    background-color: #90caf9;
                    border: none;
                    color: #0d47a1;
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
        bestaandBlok = null
    ) {

        const isBewerken =
            bestaandBlok !== null;

        const editorBackdrop =
            document.createElement("div");

        Object.assign(
            editorBackdrop.style,
            {
                position: "absolute",
                inset: "0",
                background:
                    "rgba(0,0,0,0.55)",
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
                background: "#424242",
                width: "420px",
                maxWidth: "90%",
                borderRadius: "6px",
                padding: "20px",
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
                color: #bbb;
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
                    background: #2e2e2e;
                    color: white;
                    border: 1px solid #555;
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
                color: #bbb;
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
                    background: #2e2e2e;
                    color: white;
                    border: 1px solid #555;
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
                color: #bbb;
            ">
                Dag
            </label>

            <select
                id="egodact-blok-dag"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    background: #2e2e2e;
                    color: white;
                    border: 1px solid #555;
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
                        color: #bbb;
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
                            background: #2e2e2e;
                            color: white;
                            border: 1px solid #555;
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
                        color: #bbb;
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
                            background: #2e2e2e;
                            color: white;
                            border: 1px solid #555;
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
                            background: #333;
                            color: white;
                            border: 1px solid #555;
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
                            background: #90caf9;
                            color: #0d47a1;
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
                                onderwerp
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
    // WEEK RENDEREN
    // ========================================================

    function renderWeek() {

        // Oude drag-status nooit meenemen naar
        // een opnieuw gerenderde kalender.
        window.__egodactDraggedWeekBlock =
            null;

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
                background: "#2e2e2e",
                border:
                    "1px solid #555",
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
                background: "#333",
                borderBottom:
                    "1px solid #555"
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
                        color: #aaa;
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
                            "1px solid #444"
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
                        "#aaa",
                    fontSize:
                        "11px",
                    borderBottom:
                        "1px solid #444"
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

        let actieveSelectie = null;

        // Gebruik één pointerup-listener per render.
        // Deze blijft bestaan zolang deze kalender bestaat.
        const selectiePointerUp =
            () => {

                if (
                    !actieveSelectie
                ) {
                    return;
                }

                const huidigeSelectie =
                    actieveSelectie;

                actieveSelectie =
                    null;

                const startUur =
                    huidigeSelectie.getStart();

                const eindeUur =
                    huidigeSelectie.getEinde();

                const laagste =
                    Math.min(
                        startUur,
                        eindeUur
                    );

                const hoogste =
                    Math.max(
                        startUur,
                        eindeUur
                    );

                huidigeSelectie.dagKolom
                    .querySelectorAll(
                        ".egodact-selectie"
                    )
                    .forEach(
                        el =>
                            el.remove()
                    );

                openBlokEditor(
                    Number(
                        huidigeSelectie
                            .dagKolom
                            .dataset
                            .dag
                    ),
                    laagste * 60,
                    (hoogste + 1) * 60
                );
            };

        document.addEventListener(
            "pointerup",
            selectiePointerUp
        );

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
                        "1px solid #444",
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
                            "1px solid #444",
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
                                "1px dashed #3c3c3c",
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
            // SELECTIE
            // ================================================

            let selectieStart =
                null;

            let selectieEinde =
                null;

            function toonSelectie() {

                dagKolom
                    .querySelectorAll(
                        ".egodact-selectie"
                    )
                    .forEach(
                        el =>
                            el.remove()
                    );

                if (
                    selectieStart === null ||
                    selectieEinde === null
                ) {
                    return;
                }

                const laagste =
                    Math.min(
                        selectieStart,
                        selectieEinde
                    );

                const hoogste =
                    Math.max(
                        selectieStart,
                        selectieEinde
                    );

                const selectie =
                    document.createElement(
                        "div"
                    );

                selectie.className =
                    "egodact-selectie";

                Object.assign(
                    selectie.style,
                    {
                        position:
                            "absolute",
                        left: "3px",
                        right: "3px",
                        top:
                            `${(
                                laagste -
                                eersteUur
                            ) *
                            hoogtePerUur}px`,
                        height:
                            `${(
                                hoogste -
                                laagste +
                                1
                            ) *
                            hoogtePerUur}px`,
                        background:
                            "rgba(144, 202, 249, 0.35)",
                        border:
                            "2px solid #90caf9",
                        borderRadius:
                            "4px",
                        pointerEvents:
                            "none",
                        zIndex: "4"
                    }
                );

                dagKolom.appendChild(
                    selectie
                );
            }

            dagKolom
                .querySelectorAll(
                    ".egodact-tijdslot"
                )
                .forEach(
                    slot => {

                        slot.addEventListener(
                            "pointerdown",
                            event => {

                                if (
                                    event.button !== 0
                                ) {
                                    return;
                                }

                                event.preventDefault();
                                event.stopPropagation();

                                selectieStart =
                                    Number(
                                        slot.dataset.uur
                                    );

                                selectieEinde =
                                    selectieStart;

                                actieveSelectie = {
                                    dagKolom,
                                    getStart: () =>
                                        selectieStart,
                                    getEinde: () =>
                                        selectieEinde,
                                    toonSelectie
                                };

                                try {
                                    dagKolom.setPointerCapture(
                                        event.pointerId
                                    );
                                } catch (error) {}

                                toonSelectie();
                            }
                        );

                        slot.addEventListener(
                            "pointerenter",
                            event => {

                                if (
                                    !actieveSelectie ||
                                    actieveSelectie.dagKolom !==
                                        dagKolom
                                ) {
                                    return;
                                }

                                selectieEinde =
                                    Number(
                                        slot.dataset.uur
                                    );

                                toonSelectie();
                            }
                        );
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
                            "#1976d2",
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
                            "4px solid #90caf9"
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
                        color: #dbeeff;
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

        Object.assign(
            vakken.style,
            {
                background: "#333",
                border:
                    "1px solid #555",
                borderRadius: "5px",
                padding: "12px",
                overflowY: "auto",
                maxHeight: "620px"
            }
        );

        vakken.innerHTML = `

            <div style="
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            ">
                Vakken
            </div>

            <div style="
                font-size: 11px;
                color: #aaa;
                margin-bottom: 12px;
            ">
                Sleep een vak naar de kalender
            </div>
        `;

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

        vakNamen.forEach(
            vak => {

                const vakBlok =
                    document.createElement(
                        "div"
                    );

                vakBlok.draggable =
                    true;

                vakBlok.dataset.vak =
                    vak;

                Object.assign(
                    vakBlok.style,
                    {
                        background:
                            "#1976d2",
                        borderRadius:
                            "5px",
                        padding:
                            "10px",
                        marginBottom:
                            "8px",
                        cursor:
                            "grab",
                        fontSize:
                            "13px",
                        fontWeight:
                            "bold",
                        borderLeft:
                            "4px solid #90caf9",
                        userSelect:
                            "none"
                    }
                );

                vakBlok.textContent =
                    vak;

                vakBlok.addEventListener(
                    "dragstart",
                    event => {

                        event.dataTransfer.effectAllowed =
                            "copy";

                        event.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify({
                                type:
                                    "subject",
                                subject:
                                    vak
                            })
                        );

                        window.__egodactDraggedWeekBlock =
                            {
                                type:
                                    "subject",
                                subject:
                                    vak
                            };
                    }
                );

                vakBlok.addEventListener(
                    "dragend",
                    () => {

                        window.__egodactDraggedWeekBlock =
                            null;
                    }
                );

                vakken.appendChild(
                    vakBlok
                );
            }
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
                            "rgba(144, 202, 249, 0.08)";
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
                                data.subject
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
    // START
    // ========================================================

    renderWeek();
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
        bestaandeBetaFeatures
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
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="
                    opacity: 0.85;
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
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="opacity:0.85;display:block;pointer-events:none;"
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
                stroke="#ffffff"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="
                    opacity: 0.85;
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
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="
                    opacity: 0.85;
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
