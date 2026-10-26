// ============================================================
// 2048
// ============================================================
// Klassiek 2048 met toetsenbord, knoppen, swipen en automatisch opslaan.

function open2048(e, naSluiten) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const SAVE_KEY = 'egodact_2048_save_v1';
    const RECORD_KEY = 'egodact_2048_record';
    const backdrop = document.createElement('div');
    backdrop.id = 'egodact-custom-modal-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed', inset: '0', zIndex: '9999999',
        backgroundColor: 'var(--egd-backdrop)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '12px', boxSizing: 'border-box'
    });
    const modal = document.createElement('div');
    Object.assign(modal.style, {
        width: '460px', maxWidth: '100%', maxHeight: '96vh',
        overflowY: 'auto', boxSizing: 'border-box', padding: '20px',
        borderRadius: '6px', backgroundColor: 'var(--egd-modal)',
        color: 'var(--egd-tekst)', boxShadow: 'var(--egd-schaduw)',
        fontFamily: 'Arial, sans-serif', display: 'flex',
        flexDirection: 'column', gap: '12px'
    });
    modal.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
            '<div><h2 style="margin:0;font-size:22px;font-weight:500;">2048</h2>' +
            '<div style="font-size:12px;color:var(--egd-tekst-zacht);margin-top:4px;">Schuif tegels samen en maak 2048.</div></div>' +
            '<span style="font-size:25px;color:var(--egd-accent);font-weight:bold;">2048</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
            '<div style="flex:1;background:var(--egd-veld);border:1px solid var(--egd-rand);border-radius:5px;padding:8px;text-align:center;"><div style="font-size:10px;color:var(--egd-tekst-zacht);text-transform:uppercase;letter-spacing:.5px;">Score</div><b id="egd-2048-score" style="font-size:19px;">0</b></div>' +
            '<div style="flex:1;background:var(--egd-veld);border:1px solid var(--egd-rand);border-radius:5px;padding:8px;text-align:center;"><div style="font-size:10px;color:var(--egd-tekst-zacht);text-transform:uppercase;letter-spacing:.5px;">Record</div><b id="egd-2048-best" style="font-size:19px;">0</b></div>' +
        '</div>' +
        '<div id="egd-2048-status" role="status" style="font-size:12px;color:var(--egd-tekst-zacht);min-height:17px;text-align:center;">Gebruik de pijltjestoetsen of WASD. Swipen kan ook.</div>' +
        '<div id="egd-2048-board" aria-label="2048 speelbord" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:9px;border-radius:7px;background:var(--egd-veld);border:1px solid var(--egd-rand);width:100%;max-width:370px;align-self:center;box-sizing:border-box;touch-action:none;user-select:none;"></div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,52px);gap:5px;justify-content:center;">' +
            '<span></span><button type="button" data-move="up" aria-label="Omhoog">↑</button><span></span>' +
            '<button type="button" data-move="left" aria-label="Links">←</button><button type="button" data-move="down" aria-label="Omlaag">↓</button><button type="button" data-move="right" aria-label="Rechts">→</button>' +
        '</div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;"><button id="egd-2048-new" type="button">Nieuw spel</button><button id="egd-2048-close" type="button">Terug naar games</button></div>' +
        '<div style="font-size:11px;line-height:1.5;color:var(--egd-tekst-zacht);">Pijltjes of WASD: bewegen · Op mobiel: veeg over het bord · Esc: terug naar Games.</div>';

    modal.querySelectorAll('button').forEach(btn => Object.assign(btn.style, {
        border: '1px solid var(--egd-rand)', borderRadius: '4px',
        background: 'var(--egd-veld)', color: 'var(--egd-tekst)',
        padding: '8px 10px', fontSize: '13px', cursor: 'pointer',
        fontFamily: 'inherit', fontWeight: 'bold'
    }));
    ['egd-2048-new', 'egd-2048-close'].forEach(id => Object.assign(modal.querySelector('#' + id).style, {
        background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)', borderColor: 'var(--egd-accent)'
    }));
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const $ = id => modal.querySelector('#' + id);
    const boardEl = $('egd-2048-board'), scoreEl = $('egd-2048-score');
    const bestEl = $('egd-2048-best'), statusEl = $('egd-2048-status');
    let board = Array(16).fill(0), score = 0, best = 0, won = false, gameOver = false, gesloten = false;
    let touchStart = null;
    try { best = Number(localStorage.getItem(RECORD_KEY)) || 0; } catch (err) {}

    const save = () => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({ board, score, best, won, gameOver }));
            localStorage.setItem(RECORD_KEY, String(best));
        } catch (err) { console.warn('2048: opslaan mislukt.', err); }
    };
    const tileColors = value => {
        const colors = {
            0:['var(--egd-paneel)','var(--egd-paneel)'], 2:['var(--egd-modal)','var(--egd-tekst)'], 4:['var(--egd-info)','var(--egd-tekst)'],
            8:['#f2b179','#fff'], 16:['#f59563','#fff'], 32:['#f67c5f','#fff'],
            64:['#f65e3b','#fff'], 128:['#edcf72','#fff'], 256:['#edcc61','#fff'],
            512:['#edc850','#fff'], 1024:['#edc53f','#fff'], 2048:['#edc22e','#fff']
        };
        return colors[value] || (value > 2048 ? ['var(--egd-accent)','var(--egd-accent-tekst)'] : colors[0]);
    };
    const updateStatus = () => {
        scoreEl.textContent = score.toLocaleString('nl-NL');
        bestEl.textContent = best.toLocaleString('nl-NL');
        if (gameOver) {
            statusEl.textContent = 'Geen zetten meer mogelijk. Start een nieuw spel om opnieuw te proberen.';
            statusEl.style.color = '#ef5350';
        } else if (won) {
            statusEl.textContent = '2048 gehaald! Je kunt doorspelen om je record te verbeteren.';
            statusEl.style.color = '#66bb6a';
        } else {
            statusEl.textContent = 'Gebruik de pijltjestoetsen of WASD. Swipen kan ook.';
            statusEl.style.color = 'var(--egd-tekst-zacht)';
        }
    };
    const render = () => {
        boardEl.innerHTML = '';
        board.forEach(value => {
            const tile = document.createElement('div'), colors = tileColors(value);
            tile.textContent = value ? String(value) : '';
            Object.assign(tile.style, {
                aspectRatio: '1 / 1', minWidth: '0', minHeight: '0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '5px', background: colors[0], color: colors[1],
                fontSize: value >= 1024 ? '17px' : value >= 128 ? '21px' : '25px',
                fontWeight: 'bold', lineHeight: '1', overflow: 'hidden'
            });
            boardEl.appendChild(tile);
        });
        updateStatus();
    };
    const addRandomTile = () => {
        const empty = [];
        board.forEach((v, i) => { if (!v) empty.push(i); });
        if (empty.length) {
            const index = empty[Math.floor(Math.random() * empty.length)];
            board[index] = Math.random() < .9 ? 2 : 4;
        }
    };
    const noMoves = () => {
        if (board.some(v => !v)) return false;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
            const i = r * 4 + c;
            if (c < 3 && board[i] === board[i + 1]) return false;
            if (r < 3 && board[i] === board[i + 4]) return false;
        }
        return true;
    };
    const newGame = () => {
        board = Array(16).fill(0); score = 0; won = false; gameOver = false;
        addRandomTile(); addRandomTile(); render(); save();
    };
    const restore = () => {
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
            if (!s || !Array.isArray(s.board) || s.board.length !== 16) return false;
            if (s.board.some(v => !Number.isInteger(v) || v < 0)) return false;
            board = s.board; score = Math.max(0, Number(s.score) || 0);
            best = Math.max(best, Number(s.best) || 0, score);
            won = !!s.won; gameOver = !!s.gameOver;
            return true;
        } catch (err) { return false; }
    };
    const move = direction => {
        if (gameOver) return;
        const nextBoard = board.slice();
        let gained = 0;
        for (let line = 0; line < 4; line++) {
            let indexes;
            if (direction === 'left') indexes = [0,1,2,3].map(c => line * 4 + c);
            else if (direction === 'right') indexes = [3,2,1,0].map(c => line * 4 + c);
            else if (direction === 'up') indexes = [0,1,2,3].map(r => r * 4 + line);
            else indexes = [3,2,1,0].map(r => r * 4 + line);
            const values = indexes.map(i => board[i]).filter(v => v !== 0);
            const merged = [];
            for (let i = 0; i < values.length; i++) {
                if (values[i] === values[i + 1]) {
                    const double = values[i] * 2;
                    merged.push(double); gained += double; i++;
                } else merged.push(values[i]);
            }
            while (merged.length < 4) merged.push(0);
            indexes.forEach((index, i) => { nextBoard[index] = merged[i]; });
        }
        if (!nextBoard.some((v, i) => v !== board[i])) return;
        board = nextBoard; score += gained; best = Math.max(best, score);
        if (!won && board.some(v => v >= 2048)) won = true;
        addRandomTile(); gameOver = noMoves(); render(); save();
    };
    const close = () => {
        if (gesloten) return;
        gesloten = true; save();
        document.removeEventListener('keydown', onKey, true);
        window.removeEventListener('pagehide', save);
        backdrop.remove();
        if (typeof naSluiten === 'function') naSluiten();
    };
    function onKey(ev) {
        if (ev.key === 'Escape') {
            ev.preventDefault(); ev.stopPropagation(); close(); return;
        }
        if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
        const keys = {
            ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down',
            a:'left', A:'left', d:'right', D:'right', w:'up', W:'up', s:'down', S:'down'
        };
        const direction = keys[ev.key];
        if (!direction) return;
        ev.preventDefault(); ev.stopPropagation(); move(direction);
    }

    modal.querySelectorAll('[data-move]').forEach(btn => btn.addEventListener('click', () => move(btn.dataset.move)));
    $('egd-2048-new').addEventListener('click', newGame);
    $('egd-2048-close').addEventListener('click', close);
    backdrop.addEventListener('click', ev => { if (ev.target === backdrop) close(); });
    boardEl.addEventListener('touchstart', ev => {
        if (ev.changedTouches && ev.changedTouches.length) touchStart = {
            x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY
        };
    }, { passive: true });
    boardEl.addEventListener('touchend', ev => {
        if (!touchStart || !ev.changedTouches || !ev.changedTouches.length) return;
        const dx = ev.changedTouches[0].clientX - touchStart.x;
        const dy = ev.changedTouches[0].clientY - touchStart.y;
        touchStart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }, { passive: true });
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('pagehide', save);
    if (!restore()) newGame();
    render();
}