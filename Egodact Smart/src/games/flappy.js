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


