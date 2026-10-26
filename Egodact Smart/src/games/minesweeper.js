// ============================================================
// MINESWEEPER
// ============================================================
// Zelfstandig spel in de stijl van Egodact Smart. Voortgang wordt
// lokaal bewaard; Escape of Terug brengt je terug naar Games.

function openMinesweeper(e, naSluiten) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    const SAVE_KEY = 'egodact_minesweeper_save_v1';
    const PRESETS = {
        beginner: { rows: 9, cols: 9, mines: 10 },
        gemiddeld: { rows: 12, cols: 12, mines: 22 },
        expert: { rows: 16, cols: 16, mines: 40 }
    };

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
        width: '560px', maxWidth: '100%', maxHeight: '96vh',
        overflowY: 'auto', boxSizing: 'border-box', padding: '20px',
        borderRadius: '6px', backgroundColor: 'var(--egd-modal)',
        color: 'var(--egd-tekst)', boxShadow: 'var(--egd-schaduw)',
        fontFamily: 'Arial, sans-serif', display: 'flex',
        flexDirection: 'column', gap: '12px'
    });
    modal.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
            '<div><h2 style="margin:0;font-size:22px;font-weight:500;">Minesweeper</h2>' +
            '<div style="font-size:12px;color:var(--egd-tekst-zacht);margin-top:4px;">Zoek de mijnen en markeer ze met een vlag.</div></div>' +
            '<span style="font-size:27px;color:var(--egd-accent);font-weight:bold;">✹</span>' +
        '</div>' +
        '<div id="egd-minesweeper-levels" style="display:flex;flex-wrap:wrap;gap:6px;">' +
            '<button type="button" data-level="beginner">Beginner · 9×9</button>' +
            '<button type="button" data-level="gemiddeld">Gemiddeld · 12×12</button>' +
            '<button type="button" data-level="expert">Expert · 16×16</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:13px;">' +
            '<span id="egd-minesweeper-count">Mijnen: 10</span>' +
            '<span>Tijd: <b id="egd-minesweeper-time">0:00</b></span>' +
            '<button id="egd-minesweeper-mark" type="button">Markeermodus: uit</button>' +
        '</div>' +
        '<div id="egd-minesweeper-board" aria-label="Minesweeper speelbord" style="display:grid;gap:3px;width:100%;max-width:500px;align-self:center;padding:7px;background:#172238;border-radius:6px;box-sizing:border-box;touch-action:manipulation;"></div>' +
        '<div id="egd-minesweeper-status" role="status" style="font-size:13px;min-height:18px;color:var(--egd-tekst-zacht);text-align:center;">Klik op een vakje om te beginnen.</div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">' +
            '<button id="egd-minesweeper-new" type="button">Nieuw spel</button>' +
            '<button id="egd-minesweeper-close" type="button">Terug naar games</button>' +
        '</div>' +
        '<div style="font-size:11px;line-height:1.5;color:var(--egd-tekst-zacht);">Getallen tonen hoeveel mijnen er direct naast liggen. Op mobiel kun je Markeermodus aanzetten.</div>';

    modal.querySelectorAll('button').forEach(btn => Object.assign(btn.style, {
        border: '1px solid var(--egd-rand)', borderRadius: '4px',
        background: 'var(--egd-veld)', color: 'var(--egd-tekst)',
        padding: '7px 10px', fontSize: '12px', cursor: 'pointer',
        fontFamily: 'inherit'
    }));
    ['egd-minesweeper-new', 'egd-minesweeper-close'].forEach(id => Object.assign(
        modal.querySelector('#' + id).style, {
            background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)',
            borderColor: 'var(--egd-accent)', fontWeight: 'bold'
        }
    ));
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const $ = id => modal.querySelector('#' + id);
    const boardEl = $('egd-minesweeper-board');
    const timeEl = $('egd-minesweeper-time');
    const countEl = $('egd-minesweeper-count');
    const statusEl = $('egd-minesweeper-status');
    const markBtn = $('egd-minesweeper-mark');

    let difficulty = 'beginner', rows = 9, cols = 9, mineCount = 10;
    let board = [], started = false, over = false, won = false, markMode = false;
    let elapsed = 0, startedAt = 0, ticker = null, gesloten = false;

    const formatTime = n => {
        n = Math.max(0, Math.floor(n));
        return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
    };
    const currentTime = () => elapsed + (started && !over ? Math.floor((Date.now() - startedAt) / 1000) : 0);
    const newBoard = () => Array.from({ length: rows * cols }, () => ({
        mine: false, adjacent: 0, revealed: false, flagged: false
    }));
    const neighbors = index => {
        const r = Math.floor(index / cols), c = index % cols, out = [];
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
        }
        return out;
    };
    const save = () => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                difficulty, board, started, over, won, markMode, elapsed: currentTime()
            }));
        } catch (err) { console.warn('Minesweeper: opslaan mislukt.', err); }
    };
    const updateStatus = () => {
        countEl.textContent = 'Vlaggen: ' + board.filter(c => c.flagged).length + ' / ' + mineCount;
        timeEl.textContent = formatTime(currentTime());
        if (won) {
            statusEl.textContent = 'Gewonnen! Alle vakjes zonder mijnen zijn geopend.';
            statusEl.style.color = '#66bb6a';
        } else if (over) {
            statusEl.textContent = 'BOEM! Je raakte een mijn. Start een nieuw spel om opnieuw te proberen.';
            statusEl.style.color = '#ef5350';
        } else {
            statusEl.textContent = markMode
                ? 'Markeermodus staat aan: tik op een vakje om een vlag te zetten.'
                : (started ? 'Goed bezig! Zoek verder naar de verborgen mijnen.' : 'Klik op een vakje om te beginnen.');
            statusEl.style.color = 'var(--egd-tekst-zacht)';
        }
        markBtn.textContent = 'Markeermodus: ' + (markMode ? 'aan' : 'uit');
        markBtn.style.borderColor = markMode ? 'var(--egd-accent)' : 'var(--egd-rand)';
        markBtn.style.color = markMode ? 'var(--egd-accent)' : 'var(--egd-tekst)';
        modal.querySelectorAll('[data-level]').forEach(btn => {
            const active = btn.dataset.level === difficulty;
            btn.style.borderColor = active ? 'var(--egd-accent)' : 'var(--egd-rand)';
            btn.style.color = active ? 'var(--egd-accent)' : 'var(--egd-tekst)';
            btn.style.fontWeight = active ? 'bold' : 'normal';
        });
    };
    const render = () => {
        boardEl.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))';
        boardEl.innerHTML = '';
        board.forEach((cell, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Vakje ' + (index + 1));
            Object.assign(btn.style, {
                minWidth: '0', width: '100%', aspectRatio: '1 / 1',
                padding: '0', borderRadius: '3px', border: '1px solid #35435c',
                fontFamily: 'Arial, sans-serif', fontWeight: 'bold',
                fontSize: cols >= 16 ? '11px' : '14px',
                cursor: over || cell.revealed ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: '1', userSelect: 'none'
            });
            if (cell.revealed) {
                btn.style.background = cell.mine ? '#ef5350' : '#d9e0ea';
                btn.style.borderColor = '#c1cad7';
                btn.style.color = cell.mine ? '#fff' : '#1b2333';
                if (cell.mine) btn.textContent = '✹';
                else if (cell.adjacent) {
                    btn.textContent = String(cell.adjacent);
                    btn.style.color = ({1:'#1976d2',2:'#2e7d32',3:'#d32f2f',4:'#4527a0',5:'#6d4c41',6:'#00838f',7:'#263238',8:'#616161'})[cell.adjacent];
                }
            } else {
                btn.style.background = '#2a3851';
                btn.style.color = '#ffd54f';
                btn.style.borderColor = cell.flagged ? '#ffca28' : '#3b4b65';
                btn.textContent = cell.flagged ? '⚑' : '';
            }
            btn.addEventListener('click', () => markMode ? toggleFlag(index) : openCell(index));
            btn.addEventListener('contextmenu', ev => { ev.preventDefault(); toggleFlag(index); });
            boardEl.appendChild(btn);
        });
        updateStatus();
    };
    const placeMines = safeIndex => {
        const safe = new Set([safeIndex, ...neighbors(safeIndex)]);
        const candidates = [];
        for (let i = 0; i < board.length; i++) if (!safe.has(i)) candidates.push(i);
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        candidates.slice(0, mineCount).forEach(i => { board[i].mine = true; });
        board.forEach((cell, i) => {
            cell.adjacent = cell.mine ? 0 : neighbors(i).filter(n => board[n].mine).length;
        });
    };
    const checkWin = () => {
        if (board.every(cell => cell.mine || cell.revealed)) {
            elapsed = currentTime();
            over = true;
            won = true;
        }
    };
    function openCell(index) {
        if (over || board[index].flagged || board[index].revealed) return;
        if (!started) {
            placeMines(index);
            started = true;
            startedAt = Date.now();
        }
        if (board[index].mine) {
            elapsed = currentTime();
            over = true;
            board.forEach(cell => { if (cell.mine) cell.revealed = true; });
        } else {
            const stack = [index];
            while (stack.length) {
                const i = stack.pop(), cell = board[i];
                if (!cell || cell.revealed || cell.flagged || cell.mine) continue;
                cell.revealed = true;
                if (!cell.adjacent) neighbors(i).forEach(n => {
                    if (!board[n].revealed && !board[n].mine && !board[n].flagged) stack.push(n);
                });
            }
            checkWin();
        }
        render();
        save();
    }
    function toggleFlag(index) {
        if (over || board[index].revealed) return;
        board[index].flagged = !board[index].flagged;
        render();
        save();
    }
    const newGame = () => {
        board = newBoard(); started = false; over = false; won = false;
        markMode = false; elapsed = 0; startedAt = 0;
        render(); save();
    };
    const chooseLevel = name => {
        if (!PRESETS[name]) return;
        difficulty = name;
        rows = PRESETS[name].rows; cols = PRESETS[name].cols; mineCount = PRESETS[name].mines;
        newGame();
    };
    const restore = () => {
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
            if (!s || !PRESETS[s.difficulty] || !Array.isArray(s.board)) return false;
            const p = PRESETS[s.difficulty];
            if (s.board.length !== p.rows * p.cols) return false;
            difficulty = s.difficulty; rows = p.rows; cols = p.cols; mineCount = p.mines;
            board = s.board.map(c => ({
                mine: !!c.mine, adjacent: Number(c.adjacent) || 0,
                revealed: !!c.revealed, flagged: !!c.flagged
            }));
            started = !!s.started; over = !!s.over; won = !!s.won; markMode = !!s.markMode;
            elapsed = Math.max(0, Number(s.elapsed) || 0);
            startedAt = started && !over ? Date.now() : 0;
            return true;
        } catch (err) { return false; }
    };
    const close = () => {
        if (gesloten) return;
        gesloten = true; save();
        if (ticker) clearInterval(ticker);
        document.removeEventListener('keydown', onKey, true);
        window.removeEventListener('pagehide', save);
        backdrop.remove();
        if (typeof naSluiten === 'function') naSluiten();
    };
    function onKey(ev) {
        if (ev.key !== 'Escape') return;
        ev.preventDefault(); ev.stopPropagation(); close();
    }

    modal.querySelectorAll('[data-level]').forEach(btn => btn.addEventListener('click', () => chooseLevel(btn.dataset.level)));
    markBtn.addEventListener('click', () => { markMode = !markMode; render(); save(); });
    $('egd-minesweeper-new').addEventListener('click', newGame);
    $('egd-minesweeper-close').addEventListener('click', close);
    backdrop.addEventListener('click', ev => { if (ev.target === backdrop) close(); });
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('pagehide', save);

    if (!restore()) newGame();
    render();
    ticker = setInterval(() => {
        timeEl.textContent = formatTime(currentTime());
        if (started && !over) save();
    }, 1000);
}