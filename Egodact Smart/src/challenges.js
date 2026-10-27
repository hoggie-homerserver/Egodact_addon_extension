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
            kleur: egodactVeiligeKleur(c.color),
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
    const sessie = egodactLeesSessie();
    const { accessToken, school: selectedSchool } = sessie;
    if (!accessToken) {
        egodactChallengeCache = null;
        throw new Error('Geen access token gevonden. Log opnieuw in bij Egodact.');
    }
    // Cache hoort bij de exacte login en school, ook bij tokenvernieuwing.
    if (egodactChallengeCache &&
        egodactChallengeCache.accessToken === accessToken &&
        egodactChallengeCache.school === selectedSchool &&
        Date.now() - egodactChallengeCache.tijd < 5 * 60 * 1000) {
        return egodactChallengeCache.lijst;
    }
    egodactChallengeCache = null;

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
    if (!egodactSessieIsActief(sessie)) {
        throw new Error('Je login of school is gewijzigd. Open de weekplanning opnieuw.');
    }
    egodactChallengeCache = { tijd: Date.now(), lijst, accessToken, school: selectedSchool };

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


