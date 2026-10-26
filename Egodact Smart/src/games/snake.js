// ============================================================
// Snake (beta)
// ============================================================

const SNAKE_MIN_MAAT = 10;
const SNAKE_MAX_MAAT = 40;
const SNAKE_MAAT_KEY = 'egodact_snake_maat_v1';

function snakeKlemMaat(waarde, standaard) {
    const n = Math.round(Number(waarde));
    if (!Number.isFinite(n)) return standaard;
    return Math.min(SNAKE_MAX_MAAT, Math.max(SNAKE_MIN_MAAT, n));
}

// Keuzescherm: kies de grootte van het speelveld (of vul zelf een maat in).
function openSnakeMenu() {
    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const presets = [
        { naam: 'Klein', k: 12, r: 16 },
        { naam: 'Middel', k: 18, r: 24 },
        { naam: 'Groot', k: 26, r: 34 }
    ];

    let k = 12;
    let r = 16;
    try {
        const opgeslagen = JSON.parse(localStorage.getItem(SNAKE_MAAT_KEY) || 'null');
        if (opgeslagen) {
            k = snakeKlemMaat(opgeslagen.k, 12);
            r = snakeKlemMaat(opgeslagen.r, 16);
        }
    } catch (error) {}

    const backdrop = document.createElement('div');
    backdrop.id = 'egodact-custom-modal-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '9999999',
        backgroundColor: 'var(--egd-backdrop)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        backgroundColor: 'var(--egd-modal)',
        color: 'var(--egd-tekst)',
        width: '420px',
        maxWidth: 'calc(100vw - 32px)',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--egd-schaduw)',
        boxSizing: 'border-box'
    });

    const knopStijl = `
        background:var(--egd-veld);
        color:var(--egd-tekst);
        border:1px solid var(--egd-rand);
        border-radius:4px;
        padding:10px 12px;
        cursor:pointer;
        font-family:inherit;
        font-size:13px;
        text-align:left;
        flex:1;
    `;
    const veldStijl = `
        width:70px;
        background:var(--egd-veld);
        color:var(--egd-tekst);
        border:1px solid var(--egd-rand);
        border-radius:4px;
        padding:8px;
        font-size:14px;
        box-sizing:border-box;
    `;

    modal.innerHTML = `
        <h2 style="margin:0; font-size:22px; font-weight:500;
            border-bottom:1px solid var(--egd-rand); padding-bottom:10px;">
            Snake — speelveld
        </h2>

        <div style="color:var(--egd-tekst-zacht); font-size:11px;
            text-transform:uppercase; letter-spacing:.5px;">Kies een formaat</div>

        <div style="display:flex; gap:8px;">
            ${presets.map((p, i) => `
                <button type="button" data-preset="${i}" style="${knopStijl}">
                    <div style="font-weight:bold;">${p.naam}</div>
                    <div style="color:var(--egd-tekst-zacht); font-size:12px;">${p.k} × ${p.r}</div>
                </button>
            `).join('')}
        </div>

        <div style="color:var(--egd-tekst-zacht); font-size:11px;
            text-transform:uppercase; letter-spacing:.5px; margin-top:4px;">
            Eigen formaat
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
            <label style="display:flex; flex-direction:column; gap:4px; font-size:12px;
                color:var(--egd-tekst-zacht);">
                Breed (vakjes)
                <input id="egd-snake-k" type="number" min="${SNAKE_MIN_MAAT}"
                    max="${SNAKE_MAX_MAAT}" value="${k}" style="${veldStijl}">
            </label>
            <span style="margin-top:18px;">×</span>
            <label style="display:flex; flex-direction:column; gap:4px; font-size:12px;
                color:var(--egd-tekst-zacht);">
                Hoog (vakjes)
                <input id="egd-snake-r" type="number" min="${SNAKE_MIN_MAAT}"
                    max="${SNAKE_MAX_MAAT}" value="${r}" style="${veldStijl}">
            </label>
        </div>

        <div id="egd-snake-maat-info" style="color:var(--egd-tekst-zacht); font-size:12px;">
            Tussen ${SNAKE_MIN_MAAT} en ${SNAKE_MAX_MAAT} vakjes per kant.
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:6px;">
            <button id="egd-snake-terug" type="button" style="
                background:transparent; border:1px solid var(--egd-accent);
                color:var(--egd-accent); cursor:pointer; padding:10px 16px;
                font-weight:bold; font-size:13px; text-transform:uppercase;
                border-radius:4px;">Terug</button>
            <button id="egd-snake-start" type="button" style="
                background:var(--egd-accent); border:none;
                color:var(--egd-accent-tekst); cursor:pointer; padding:10px 20px;
                font-weight:bold; font-size:14px; text-transform:uppercase;
                border-radius:4px;">Spelen</button>
        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const kVeld = modal.querySelector('#egd-snake-k');
    const rVeld = modal.querySelector('#egd-snake-r');
    const info = modal.querySelector('#egd-snake-maat-info');

    const sluit = () => {
        document.removeEventListener('keydown', toets, true);
        backdrop.remove();
    };

    const terug = () => {
        sluit();
        openGamesMenu();
    };

    const spelen = () => {
        const kk = snakeKlemMaat(kVeld.value, 12);
        const rr = snakeKlemMaat(rVeld.value, 16);
        try {
            localStorage.setItem(SNAKE_MAAT_KEY, JSON.stringify({ k: kk, r: rr }));
        } catch (error) {}
        sluit();
        openSnakeSpel(kk, rr);
    };

    function toets(ev) {
        if (ev.key === 'Escape') {
            ev.preventDefault();
            ev.stopPropagation();
            terug();
        } else if (ev.key === 'Enter') {
            ev.preventDefault();
            ev.stopPropagation();
            spelen();
        }
    }

    const werkInfoBij = () => {
        const kk = Number(kVeld.value);
        const rr = Number(rVeld.value);
        const buiten = !Number.isFinite(kk) || !Number.isFinite(rr) ||
            kk < SNAKE_MIN_MAAT || kk > SNAKE_MAX_MAAT ||
            rr < SNAKE_MIN_MAAT || rr > SNAKE_MAX_MAAT;
        info.textContent = buiten
            ? `Wordt aangepast naar ${snakeKlemMaat(kk, 12)} × ${snakeKlemMaat(rr, 16)} (tussen ${SNAKE_MIN_MAAT} en ${SNAKE_MAX_MAAT}).`
            : `Speelveld: ${kk} × ${rr} = ${kk * rr} vakjes.`;
    };

    modal.querySelectorAll('[data-preset]').forEach(knop => {
        knop.addEventListener('click', () => {
            const p = presets[Number(knop.dataset.preset)];
            kVeld.value = p.k;
            rVeld.value = p.r;
            werkInfoBij();
        });
    });

    kVeld.addEventListener('input', werkInfoBij);
    rVeld.addEventListener('input', werkInfoBij);
    modal.querySelector('#egd-snake-start').addEventListener('click', spelen);
    modal.querySelector('#egd-snake-terug').addEventListener('click', terug);
    backdrop.addEventListener('click', ev => {
        if (ev.target === backdrop) terug();
    });
    document.addEventListener('keydown', toets, true);
    werkInfoBij();
}

function openSnakeSpel(KOLOMMEN, RIJEN) {
    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const CEL = 24;
    const B = KOLOMMEN * CEL;
    const H = RIJEN * CEL;
    // Elke afmeting heeft een eigen bewaard spel.
    const SAVE_KEY = `egodact_snake_save_v1_${KOLOMMEN}x${RIJEN}`;
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
                width:min(${B}px, 55vw, calc(85vh * ${KOLOMMEN} / ${RIJEN}));
                height:auto;
                aspect-ratio:${KOLOMMEN} / ${RIJEN};
                background:var(--egd-veld);
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
                P pauze/hervatten<br>
                Esc terug naar formaat kiezen
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

    // Gebruik dezelfde account-avatar die de weekplanning uit het Egodact-bord haalt.
    const accountAvatar = new Image();
    let accountAvatarGeladen = false;

    accountAvatar.onload = () => {
        accountAvatarGeladen = true;
        if (!gesloten) teken();
    };

    async function laadAccountAvatar() {
        try {
            const challenges = await egodactLaadChallenges();
            const telling = {};

            challenges.forEach(c => {
                (c.users || []).forEach(u => {
                    if (u.picture) {
                        telling[u.name] = (telling[u.name] || 0) + 1;
                    }
                });
            });

            const mijnNaam = Object.entries(telling)
                .sort((a, b) => b[1] - a[1])[0]?.[0];

            if (!mijnNaam || gesloten) return;

            const bordAfb = egodactSchraapBord(
                challenges.map(c => c.raw),
                backdrop
            );

            const avatarUrl = bordAfb.users[mijnNaam];
            if (avatarUrl) accountAvatar.src = avatarUrl;
        } catch (error) {
            console.warn('Snake: account-avatar kon niet worden geladen.', error);
        }
    }

    let slang;
    let richting;
    let volgendeRichting;
    let eten;
    let score;
    let status;
    let laatsteStap = 0;
    let raf;
    let gesloten = false;
    let laatsteBewaar = 0;

    function bewaar() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                slang, richting, volgendeRichting, eten, score,
                status: status === 'bezig' ? 'pauze' : status,
                tijd: Date.now()
            }));
        } catch (error) {}
    }

    function herstel() {
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
            if (!s || !Array.isArray(s.slang) || !s.slang.length || !s.eten ||
                !s.richting || !s.volgendeRichting || !Number.isFinite(Number(s.score))) {
                return false;
            }
            const geldigPunt = p => p && Number.isInteger(p.x) && Number.isInteger(p.y) &&
                p.x >= 0 && p.x < KOLOMMEN && p.y >= 0 && p.y < RIJEN;
            if (!s.slang.every(geldigPunt) || !geldigPunt(s.eten)) return false;
            slang = s.slang;
            richting = s.richting;
            volgendeRichting = s.volgendeRichting;
            eten = s.eten;
            score = Number(s.score) || 0;
            status = ['dood', 'gewonnen'].includes(s.status) ? s.status : 'pauze';
            scoreEl.textContent = String(score);
            statusEl.textContent = status === 'dood' ? 'Game over' :
                status === 'gewonnen' ? 'Je hebt gewonnen!' : 'Spel bewaard — druk op P of een pijltje om verder te gaan';
            statusEl.style.color = status === 'dood' ? '#ef5350' : '#66bb6a';
            return true;
        } catch (error) {
            return false;
        }
    }

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
            { x: Math.floor(KOLOMMEN / 2), y: Math.floor(RIJEN / 2) },
            { x: Math.floor(KOLOMMEN / 2) - 1, y: Math.floor(RIJEN / 2) },
            { x: Math.floor(KOLOMMEN / 2) - 2, y: Math.floor(RIJEN / 2) }
        ];

        richting = { x: 1, y: 0 };
        volgendeRichting = { x: 1, y: 0 };
        score = 0;
        status = 'wacht';

        scoreEl.textContent = '0';
        statusEl.textContent = 'Klaar om te spelen';
        statusEl.style.color = '#66bb6a';

        plaatsEten();
        bewaar();
        teken();
    }

    function teken() {
        ctx.fillStyle = getComputedStyle(backdrop).getPropertyValue('--egd-veld').trim() || '#1b2333';
        ctx.fillRect(0, 0, B, H);

        // Subtiel raster in dezelfde stijl als Tetris.
        ctx.strokeStyle = getComputedStyle(backdrop).getPropertyValue('--egd-lijn-zacht').trim() || 'rgba(255,255,255,0.045)';
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

        // De account-avatar is het eten, net als de avatar in de weekplanning.
        const ex = eten.x * CEL + CEL / 2;
        const ey = eten.y * CEL + CEL / 2;
        const avatarRadius = CEL * 0.43;

        ctx.save();
        ctx.beginPath();
        ctx.arc(ex, ey, avatarRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        if (accountAvatarGeladen && accountAvatar.complete && accountAvatar.naturalWidth) {
            // object-fit: cover in een ronde uitsnede
            const maat = Math.max(
                (avatarRadius * 2) / accountAvatar.naturalWidth,
                (avatarRadius * 2) / accountAvatar.naturalHeight
            );
            const w = accountAvatar.naturalWidth * maat;
            const h = accountAvatar.naturalHeight * maat;
            ctx.drawImage(accountAvatar, ex - w / 2, ey - h / 2, w, h);
        } else {
            // Tijdelijke weergave tot de echte account-avatar klaar is.
            ctx.fillStyle = '#43a047';
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', ex, ey);
        }
        ctx.restore();

        ctx.strokeStyle = '#a5d6a7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ex, ey, avatarRadius, 0, Math.PI * 2);
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
        if (status === 'wacht' || status === 'dood' || status === 'gewonnen' || status === 'pauze') {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(18, H / 2 - 55, B - 36, 110);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = status === 'gewonnen' ? '#66bb6a' : '#ffffff';
            ctx.font = 'bold 23px Arial';

            const titel = status === 'wacht' ? 'SNAKE' :
                status === 'pauze' ? 'Pauze' :
                status === 'gewonnen' ? 'Gewonnen!' : 'Game over';

            ctx.fillText(titel, B / 2, H / 2 - 19);

            ctx.fillStyle = '#c6d0dc';
            ctx.font = '13px Arial';

            const uitleg = status === 'wacht' ? 'Druk op een pijltjestoets' :
                status === 'pauze' ? 'P of een pijltje = verder' :
                'Score: ' + score + '  ·  Enter = opnieuw';

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
                bewaar();
                teken();
                return;
            }

            plaatsEten();
        } else {
            slang.pop();
        }

        bewaar();
        teken();
    }

    function eindig() {
        status = 'dood';
        statusEl.textContent = 'Game over';
        statusEl.style.color = '#ef5350';
        bewaar();
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
        bewaar();
    }

    function kiesRichting(x, y) {
        if (status === 'dood' || status === 'gewonnen') return;
        if (status === 'pauze') {
            status = 'bezig';
            statusEl.textContent = 'Aan het spelen';
        }

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
            if (nu - laatsteBewaar > 2000) {
                laatsteBewaar = nu;
                bewaar();
            }
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
            'w', 'a', 's', 'd', 'enter', ' ', 'p'
        ];

        if (!toetsen.includes(k)) return;

        ev.preventDefault();
        ev.stopPropagation();

        if (k === 'enter' || k === ' ') {
            if (status === 'dood' || status === 'gewonnen') nieuwSpel();
            else if (status !== 'bezig') start();
            return;
        }

        if (k === 'p') {
            if (status === 'bezig') {
                status = 'pauze';
                statusEl.textContent = 'Gepauzeerd';
                bewaar();
                teken();
            } else if (status === 'pauze') {
                start();
            }
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
        bewaar();
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', toets, true);
        window.removeEventListener('pagehide', bewaar);
        backdrop.remove();

        // Terug naar het formaatkeuzescherm, zodat je een andere maat kunt kiezen.
        openSnakeMenu();
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

    if (!herstel()) nieuwSpel();
    else teken();
    laadAccountAvatar();
    window.addEventListener('pagehide', bewaar);
    raf = requestAnimationFrame(lus);
}


