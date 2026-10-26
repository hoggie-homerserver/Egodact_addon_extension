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


