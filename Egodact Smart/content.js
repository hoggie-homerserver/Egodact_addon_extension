// ============================================================
// THEMAKLEUR VOOR DE VIER MENUKNOPPEN
// ============================================================
function egodactSyncMenuButtonTheme() {
    const isLightTheme = () => {
        const root = document.documentElement, body = document.body;
        const classes = `${root.className || ""} ${body?.className || ""} ${root.getAttribute("data-theme") || ""} ${body?.getAttribute("data-theme") || ""}`.toLowerCase();
        if (/light|lichte|day-mode/.test(classes)) return true;
        if (/dark|donkere|night-mode/.test(classes)) return false;
        for (const node of [body, root]) {
            if (!node) continue;
            const color = getComputedStyle(node).backgroundColor;
            const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (m && color !== "rgba(0, 0, 0, 0)") {
                const lum = (Number(m[1])*299 + Number(m[2])*587 + Number(m[3])*114)/1000;
                if (lum > 165) return true;
                if (lum < 100) return false;
            }
        }
        return false;
    };
    const update = () => {
        const stroke = isLightTheme() ? "#757575" : "#ffffff";
        ["egodact-info-knop", "egodact-beta-features-knop", "egodact-taken-knop", "egodact-weekplanning-knop"]
            .forEach(id => {
                const button = document.getElementById(id);
                const svg = button?.querySelector("svg");
                if (svg) svg.setAttribute("stroke", stroke);
            });
    };
    update();
    if (!document.documentElement.dataset.egodactButtonThemeObserver) {
        document.documentElement.dataset.egodactButtonThemeObserver = "true";
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {attributes:true, attributeFilter:["class","style","data-theme"]});
        observer.observe(document.body, {attributes:true, attributeFilter:["class","style","data-theme"]});
        const buttonsObserver = new MutationObserver(update);
        buttonsObserver.observe(document.body, {childList:true, subtree:true});
    }
}

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
            `
        },
        {
            title: "Geheugenpaleis",
            content: `
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
                    <p style="margin:0 0 4px; color:#b0b0b0; font-size:13px;">Onthoud informatie door die te koppelen aan een plek die je goed kent.</p>

                    <div style="display:flex; align-items:center; gap:12px; background:#2e2e2e; padding:12px; border-radius:4px; border-left:4px solid #0d47a1;">
                        <span style="font-size:18px; font-weight:bold; color:#90caf9; min-width:20px;">1</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Kies een plek</div>
                            <div style="font-size:13px; color:#b0b0b0;">Bijvoorbeeld je huis of klaslokaal.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:#2e2e2e; padding:12px; border-radius:4px; border-left:4px solid #00b0ff;">
                        <span style="font-size:18px; font-weight:bold; color:#40c4ff; min-width:20px;">2</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Kies je route</div>
                            <div style="font-size:13px; color:#b0b0b0;">Loop in gedachten langs vaste plekken.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:#2e2e2e; padding:12px; border-radius:4px; border-left:4px solid #ffb300;">
                        <span style="font-size:18px; font-weight:bold; color:#ffe082; min-width:20px;">3</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Maak beelden</div>
                            <div style="font-size:13px; color:#b0b0b0;">Koppel elk punt aan iets opvallends en iets dat je moet onthouden.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:#2e2e2e; padding:12px; border-radius:4px; border-left:4px solid #9c27b0;">
                        <span style="font-size:18px; font-weight:bold; color:#f48fb1; min-width:20px;">4</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Oefen je route</div>
                            <div style="font-size:13px; color:#b0b0b0;">Loop hem in gedachten na om alles terug te halen.</div>
                        </div>
                    </div>
                </div>
            `
        }
    ];  

    modal.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #555; padding-bottom:10px; margin-bottom:5px;">
            <h2 id="modal-title-text" style="margin:0; font-size:22px; font-weight:500;">${modalPagesData[currentModalPage].title}</h2>
            <div style="display:flex; align-items:center; gap:4px;">
                <button id="modal-prev-btn" type="button" aria-label="Vorige pagina" title="Vorige pagina" style="background-color:transparent; border:1px solid #90caf9; border-radius:4px; color:#90caf9; cursor:pointer; padding:3px 9px; font-size:18px; font-weight:600; line-height:1.2; transition:background-color 120ms ease, color 120ms ease;" onmouseenter="this.style.backgroundColor='#90caf9'; this.style.color='#0d47a1';" onmouseleave="this.style.backgroundColor='transparent'; this.style.color='#90caf9';">‹</button>
                <span id="modal-page-indicator" aria-live="polite" style="min-width:28px; text-align:center; color:#b0b0b0; font-size:12px;">1 / 2</span>
                <button id="modal-next-btn" type="button" aria-label="Volgende pagina" title="Volgende pagina" style="background-color:transparent; border:1px solid #90caf9; border-radius:4px; color:#90caf9; cursor:pointer; padding:3px 9px; font-size:18px; font-weight:600; line-height:1.2; transition:background-color 120ms ease, color 120ms ease;" onmouseenter="this.style.backgroundColor='#90caf9'; this.style.color='#0d47a1';" onmouseleave="this.style.backgroundColor='transparent'; this.style.color='#90caf9';">›</button>
            </div>
        </div>
        <div id="modal-dynamic-content" style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
            ${modalPagesData[currentModalPage].content}
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:15px;">
            <button id="egodact-modal-sluiten" style="background-color:#90caf9; border:none; color:#0d47a1; cursor:pointer; padding:10px 20px; font-weight:bold; font-size:14px; text-transform:uppercase; border-radius:4px; box-shadow:0px 3px 1px -2px rgba(0,0,0,0.2);">Sluiten</button>
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
            button.style.color = button.disabled ? '#777777' : '#90caf9';
            button.style.borderColor = button.disabled ? '#777777' : '#90caf9';
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
        maxWidth: 'calc(100vw - 32px)',
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

    modal
        .querySelector('#egodact-beta-modal-sluiten')
        .addEventListener('click', sluitMenu);

    backdrop.addEventListener('click', event => {
        if (event.target === backdrop) sluitMenu();
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
        background: '#2b2b2b',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '11px',
        color: '#e0e0e0',
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
    metaEl.style.color = '#bdbdbd';
    blok.appendChild(metaEl);

    const kopje = tekst => {
        const el = document.createElement('div');
        el.textContent = tekst;
        Object.assign(el.style, {
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#9e9e9e',
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
                background: '#424242',
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
                Dagplanning
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

                <input
                    id="egodact-week-zoek"
                    type="text"
                    placeholder="Zoek challenge of vak..."
                    autocomplete="off"
                    style="
                        background: #2e2e2e;
                        color: white;
                        border: 1px solid #555;
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
                        color: #ddd;
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
                    background: "#2b2b2b",
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
                color: "#bbb"
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
                            ? "3px solid #ffffff"
                            : "2px solid rgba(255,255,255,0.2)";

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
                borderTop: "1px solid #555",
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
                color: "#bdbdbd",
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
                color: "#aaa",
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
                    color: "#ef9a9a",
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
                    color: "#aaa",
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
                        color: "#aaa",
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
                        "rgba(144, 202, 249, 0.35)",
                    border:
                        "2px solid #90caf9",
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
                        "#ffffff",
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
                                : "4px solid #90caf9"
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
                background: "#333",
                border:
                    "1px solid #555",
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
