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

