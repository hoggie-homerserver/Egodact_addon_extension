window.EGODACT_BETA_ZICHTBAAR = true;
  window.EGODACT_TIJD_ZICHTBAAR = true;
  function openSMARTMenu() {}
  function openTakenMenu() {}
  function openBetaFeaturesMenu() {}
  function openAddonsMenu() {}
  function openTijdMenu() {}
  function egodactSyncMenuButtonTheme() {}
  function egodactTijdStart() {}

  (function () {
    'use strict';

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
    let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const store = {
      get(key, fallback) {
        try {
          const raw = localStorage.getItem('egd_demo_' + key);
          return raw === null ? fallback : JSON.parse(raw);
        } catch (err) { return fallback; }
      },
      set(key, value) {
        try { localStorage.setItem('egd_demo_' + key, JSON.stringify(value)); } catch (err) {}
      }
    };

    const PALETTE = ['#90caf9', '#42a5f5', '#ffb300', '#40c4ff', '#f06292'];

    /* ---------------- toasts ---------------- */
    const toastBox = $('#toasts');
    function toast(message, kind) {
      if (!toastBox) return;
      const el = document.createElement('div');
      el.className = 'toast' + (kind ? ' ' + kind : '');
      const dot = document.createElement('i');
      const text = document.createElement('span');
      text.textContent = message;
      el.append(dot, text);
      toastBox.appendChild(el);
      while (toastBox.children.length > 4) toastBox.firstChild.remove();
      setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 260);
      }, 3400);
    }

    /* ---------------- theme ---------------- */
    const root = document.documentElement;
    const themeIcon = $('#theme-icon');
    const SUN = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>';
    const MOON = '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>';

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      if (document.body) {
        document.body.classList.toggle('is-dark', theme !== 'light');
        document.body.classList.toggle('is-light', theme === 'light');
      }
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = theme === 'light' ? '#f6f7fb' : '#303030';
      if (themeIcon) themeIcon.innerHTML = theme === 'light' ? MOON : SUN;
      store.set('theme', theme);
      syncThemeSegments();
    }

    function toggleTheme() {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      toast(next === 'light' ? 'Licht thema actief.' : 'Donker thema actief.');
    }

    applyTheme(store.get('theme', 'dark'));
    $('#theme-btn').addEventListener('click', toggleTheme);

    /* ---------------- greeting, date, clock ---------------- */
    const greetEl = $('#greet');
    const dateEl = $('#date-line');
    const clockEl = $('#clock');

    function updateClock() {
      const now = new Date();
      const hour = now.getHours();
      if (greetEl) {
        greetEl.textContent = hour < 6 ? 'Goedenacht'
          : hour < 12 ? 'Goedemorgen'
            : hour < 18 ? 'Goedemiddag' : 'Goedenavond';
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('nl-NL', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
      }
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('nl-NL', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      }
    }
    updateClock();
    setInterval(updateClock, 1000);

    /* ---------------- counters + rings ---------------- */
    function animateCount(node) {
      const target = parseFloat(node.getAttribute('data-count') || '0');
      const suffix = node.getAttribute('data-suffix') || '';
      const decimals = (String(target).split('.')[1] || '').length;
      const start = performance.now();
      const duration = reduceMotion ? 1 : 1100;

      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        node.textContent = value.toFixed(decimals).replace('.', ',') + suffix;
        if (t < 1) requestAnimationFrame(frame);
        else node.textContent = String(target).replace('.', ',') + suffix;
      }
      requestAnimationFrame(frame);
    }

    $$('[data-count]').forEach(animateCount);

    requestAnimationFrame(() => {
      $$('.ring .val').forEach(circle => {
        const p = Math.max(0, Math.min(100, parseFloat(circle.getAttribute('data-p') || '0')));
        const circumference = 113.1;
        circle.style.strokeDashoffset = String(circumference * (1 - p / 100));
      });
    });

    // Gradient defs shared by the rings (appended to the page).
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    defs.setAttribute('width', '0');
    defs.setAttribute('height', '0');
    defs.style.position = 'absolute';
    defs.innerHTML = '<defs>' +
      '<linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#90caf9"></stop><stop offset="100%" stop-color="#42a5f5"></stop></linearGradient>' +
      '<linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#90caf9"></stop><stop offset="100%" stop-color="#42a5f5"></stop></linearGradient>' +
      '</defs>';
    document.body.appendChild(defs);

    /* ---------------- sparkline ---------------- */
    const sparkValues = [34, 58, 41, 72, 55, 88, 63];
    const spark = $('#spark');
    sparkValues.forEach((value, index) => {
      const bar = document.createElement('i');
      bar.style.height = Math.round(value * 0.3) + 'px';
      bar.style.animationDelay = (index * 60) + 'ms';
      spark.appendChild(bar);
    });

    /* ---------------- week ---------------- */
    const weekDays = $('#week-days');
    const dayNames = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
    const loads = [2, 1, 3, 2, 1, 0, 0];
    const today = new Date();
    const monday = new Date(today);
    const dow = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - dow);

    function renderWeek() {
      weekDays.replaceChildren();
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'day' + (i === dow ? ' today' : '');
        button.setAttribute('aria-label', dayNames[i] + ' ' + date.getDate());

        const dowEl = document.createElement('span');
        dowEl.className = 'dow';
        dowEl.textContent = dayNames[i];

        const numEl = document.createElement('span');
        numEl.className = 'num';
        numEl.textContent = String(date.getDate());

        const loadEl = document.createElement('span');
        loadEl.className = 'load';
        for (let d = 0; d < 3; d++) {
          const dot = document.createElement('i');
          if (d < loads[i]) dot.className = 'on';
          loadEl.appendChild(dot);
        }

        button.append(dowEl, numEl, loadEl);
        button.addEventListener('click', () => {
          toast(dayNames[i] + ' ' + date.getDate() + ': ' + loads[i] + ' geplande blokken.', 'good');
        });
        weekDays.appendChild(button);
      }

      const hint = $('#week-hint');
      if (hint) {
        const onejan = new Date(today.getFullYear(), 0, 1);
        const week = Math.ceil((((today - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        hint.textContent = 'week ' + week;
      }
    }
    renderWeek();

    /* ---------------- tasks ---------------- */
    const DEFAULT_TASKS = [
      { id: 't1', text: 'Wiskunde PO afronden', tag: 'School', time: '09:30', done: false },
      { id: 't2', text: 'Challenges bijwerken', tag: 'Egodact', time: '11:00', done: true },
      { id: 't3', text: 'Frans woordjes leren', tag: 'Toets', time: '14:15', done: false },
      { id: 't4', text: 'Weekplanning controleren', tag: 'Planning', time: '16:00', done: false }
    ];

    let tasks = store.get('tasks', null);
    if (!Array.isArray(tasks) || !tasks.length) tasks = DEFAULT_TASKS.slice();

    const taskList = $('#task-list');
    const taskBar = $('#task-bar');
    const taskCount = $('#task-count');
    const heroOpen = $('#hero-open');
    const taskAdd = $('#task-add');
    const taskInput = $('#task-input');

    function saveTasks() { store.set('tasks', tasks); }

    function paintTasks() {
      taskList.replaceChildren();

      let done = 0;
      tasks.forEach(task => {
        if (task.done) done++;

        const row = document.createElement('div');
        row.className = 'task' + (task.done ? ' done' : '');

        const check = document.createElement('button');
        check.type = 'button';
        check.className = 'check';
        check.setAttribute('aria-label', task.done ? 'Markeer als open' : 'Markeer als klaar');
        check.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>';
        check.addEventListener('click', () => {
          task.done = !task.done;
          saveTasks();
          paintTasks();
          if (task.done) {
            toast('Lekker bezig: ' + task.text, 'good');
            if (tasks.every(t => t.done)) celebrate();
          }
        });

        const body = document.createElement('div');
        body.className = 'task-body';

        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;

        const meta = document.createElement('div');
        meta.className = 'task-meta';
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = task.tag || 'Taak';
        const time = document.createElement('span');
        time.className = 'task-time';
        time.textContent = task.time || '';
        meta.append(tag, time);

        body.append(text, meta);
        row.append(check, body);
        taskList.appendChild(row);
      });

      const total = tasks.length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      taskBar.style.width = pct + '%';
      taskCount.textContent = done + ' / ' + total;
      if (heroOpen) heroOpen.textContent = String(total - done);
    }

    function addTask(label) {
      const value = String(label || '').trim();
      if (!value) return;
      const now = new Date();
      tasks.push({
        id: 't' + Date.now().toString(36),
        text: value.slice(0, 80),
        tag: 'Nieuw',
        time: now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        done: false
      });
      saveTasks();
      paintTasks();
      toast('Taak toegevoegd.', 'good');
    }

    function openAddTask() {
      taskAdd.hidden = false;
      taskInput.focus();
      taskInput.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function resetTasks() {
      tasks = DEFAULT_TASKS.map(task => Object.assign({}, task, { id: task.id + '_' + Date.now() }));
      saveTasks();
      paintTasks();
      toast('Taken teruggezet naar de demo-lijst.');
    }

    $('#new-task-btn').addEventListener('click', openAddTask);
    taskAdd.addEventListener('submit', event => {
      event.preventDefault();
      addTask(taskInput.value);
      taskInput.value = '';
      taskAdd.hidden = true;
    });

    paintTasks();

    /* ---------------- focus timer ---------------- */
    const focusTime = $('#focus-time');
    const focusState = $('#focus-state');
    const focusVal = $('#focus-val');
    const focusToggle = $('#focus-toggle');
    const focusReset = $('#focus-reset');
    const sessionsEl = $('#sessions');
    const CIRC = 439.8;

    let focusTotal = 25 * 60;
    let focusLeft = focusTotal;
    let focusRunning = false;
    let focusTimer = null;

    const sessionData = store.get('sessions', null) || { date: '', count: 0 };
    const todayKey = new Date().toDateString();
    let sessions = sessionData.date === todayKey ? sessionData.count : 0;

    function paintSessions() {
      $$('i', sessionsEl).forEach((dot, index) => {
        dot.classList.toggle('on', index < sessions);
      });
    }

    function focusText() {
      const minutes = Math.floor(focusLeft / 60);
      const seconds = focusLeft % 60;
      focusTime.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    function paintFocus() {
      focusText();
      focusVal.style.strokeDashoffset = String(CIRC * (1 - focusLeft / focusTotal));
      focusToggle.textContent = focusRunning ? 'Pauze' : (focusLeft === focusTotal ? 'Start' : 'Ga verder');
      focusState.textContent = focusRunning ? 'aan het werk' : (focusLeft === 0 ? 'klaar' : 'klaar om te starten');
    }

    function stopFocus() {
      focusRunning = false;
      if (focusTimer) clearInterval(focusTimer);
      focusTimer = null;
      paintFocus();
    }

    function completeFocus() {
      stopFocus();
      focusLeft = 0;
      paintFocus();
      sessions = Math.min(6, sessions + 1);
      store.set('sessions', { date: todayKey, count: sessions });
      paintSessions();
      toast('Focusblok klaar. Even strekken!', 'good');
      celebrate(70);
    }

    function toggleFocus() {
      if (focusRunning) { stopFocus(); return; }
      if (focusLeft <= 0) { focusLeft = focusTotal; }
      focusRunning = true;
      focusTimer = setInterval(() => {
        focusLeft = Math.max(0, focusLeft - 1);
        paintFocus();
        if (focusLeft === 0) completeFocus();
      }, 1000);
      paintFocus();
    }

    focusToggle.addEventListener('click', toggleFocus);
    focusReset.addEventListener('click', () => {
      stopFocus();
      focusLeft = focusTotal;
      paintFocus();
    });

    paintSessions();
    paintFocus();

    /* ---------------- heatmap ---------------- */
    const heatGrid = $('#heat-grid');
    let heatTotal = 0;
    for (let i = 0; i < 84; i++) {
      const cell = document.createElement('i');
      const wave = Math.sin(i * 0.55) + Math.cos(i * 1.7);
      let level = Math.floor((wave + 2) * 1.05);
      if (i % 11 === 0) level = 0;
      if (i % 17 === 0) level = 4;
      level = Math.max(0, Math.min(4, level));
      if (level) cell.className = 'l' + level;
      cell.style.animationDelay = reduceMotion ? '0ms' : (i * 6) + 'ms';
      cell.title = (level ? level * 2 : 0) + ' activiteit';
      heatTotal += level;
      heatGrid.appendChild(cell);
    }
    $('#heat-summary').textContent = heatTotal + ' focuspunten';

    /* ---------------- card glow + tilt ---------------- */
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      $$('.card').forEach(card => {
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width) * 100 + '%');
          card.style.setProperty('--my', ((event.clientY - rect.top) / rect.height) * 100 + '%');
        });
      });

      $$('.stat').forEach(card => {
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = 'perspective(700px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 5) + 'deg)';
        });
        card.addEventListener('pointerleave', () => {
          card.style.transform = '';
        });
      });
    }

    /* ---------------- particles ---------------- */
    const fx = $('#fx');
    const fxc = fx.getContext('2d');
    let dots = [];
    let pointer = { x: -9999, y: -9999 };

    function sizeFx() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      fx.width = Math.round(window.innerWidth * dpr);
      fx.height = Math.round(window.innerHeight * dpr);
      fx.style.width = window.innerWidth + 'px';
      fx.style.height = window.innerHeight + 'px';
      fxc.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(64, Math.max(26, Math.round(window.innerWidth / 26)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.6 + 0.7
      }));
    }

    function paintFx() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      fxc.clearRect(0, 0, w, h);

      const isLight = root.getAttribute('data-theme') === 'light';
      const base = isLight ? '21, 101, 192' : '144, 202, 249';

      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < -20) dot.x = w + 20;
        if (dot.x > w + 20) dot.x = -20;
        if (dot.y < -20) dot.y = h + 20;
        if (dot.y > h + 20) dot.y = -20;

        const dx = dot.x - pointer.x;
        const dy = dot.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0.1) {
          dot.x += (dx / dist) * 0.5;
          dot.y += (dy / dist) * 0.5;
        }
      });

      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 118) {
            fxc.strokeStyle = 'rgba(' + base + ',' + (0.1 * (1 - dist / 118)) + ')';
            fxc.lineWidth = 1;
            fxc.beginPath();
            fxc.moveTo(a.x, a.y);
            fxc.lineTo(b.x, b.y);
            fxc.stroke();
          }
        }
      }

      dots.forEach(dot => {
        fxc.fillStyle = 'rgba(' + base + ',' + (isLight ? 0.16 : 0.2) + ')';
        fxc.beginPath();
        fxc.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        fxc.fill();
      });

      if (!document.hidden) requestAnimationFrame(paintFx);
    }

    if (!reduceMotion) {
      sizeFx();
      window.addEventListener('resize', sizeFx);
      window.addEventListener('pointermove', event => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      }, { passive: true });
      window.addEventListener('pointerleave', () => {
        pointer.x = -9999;
        pointer.y = -9999;
      });
      requestAnimationFrame(paintFx);
    }

    /* ---------------- confetti ---------------- */
    const confetti = $('#confetti');
    const cc = confetti.getContext('2d');
    let pieces = [];
    let confettiRunning = false;

    function sizeConfetti() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      confetti.width = Math.round(window.innerWidth * dpr);
      confetti.height = Math.round(window.innerHeight * dpr);
      confetti.style.width = window.innerWidth + 'px';
      confetti.style.height = window.innerHeight + 'px';
      cc.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeConfetti();
    window.addEventListener('resize', sizeConfetti);

    function celebrate(count) {
      if (reduceMotion) {
        toast('Feest! (confetti staat uit met reduced motion)');
        return;
      }
      const originX = window.innerWidth / 2;
      const originY = window.innerHeight * 0.42;
      const amount = count || 110;

      for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 3;
        pieces.push({
          x: originX + (Math.random() - 0.5) * 80,
          y: originY + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          w: Math.random() * 8 + 4,
          h: Math.random() * 5 + 3,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.25,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          life: 1
        });
      }

      if (!confettiRunning) {
        confettiRunning = true;
        requestAnimationFrame(paintConfetti);
      }
    }

    function paintConfetti() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      cc.clearRect(0, 0, w, h);

      pieces = pieces.filter(piece => piece.life > 0 && piece.y < h + 60);
      pieces.forEach(piece => {
        piece.vy += 0.22;
        piece.vx *= 0.992;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rot += piece.vr;
        piece.life -= 0.004;

        cc.save();
        cc.globalAlpha = Math.max(0, piece.life);
        cc.translate(piece.x, piece.y);
        cc.rotate(piece.rot);
        cc.fillStyle = piece.color;
        cc.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        cc.restore();
      });

      if (pieces.length) requestAnimationFrame(paintConfetti);
      else {
        confettiRunning = false;
        cc.clearRect(0, 0, w, h);
      }
    }

    $('#confetti-btn').addEventListener('click', () => {
      celebrate();
      toast('Geniet ervan.', 'good');
    });

    /* ---------------- command palette ---------------- */
    const palette = $('#palette');
    const paletteInput = $('#palette-input');
    const paletteList = $('#palette-list');
    let paletteIndex = 0;

    const commands = [
      { icon: '◐', label: 'Thema wisselen', hint: 'licht / donker', run: toggleTheme },
      { icon: '▶', label: 'Focus starten of pauzeren', hint: 'timer', run: () => { setView('dashboard'); toggleFocus(); } },
      { icon: '+', label: 'Nieuwe taak toevoegen', hint: 'taken', run: () => { setView('dashboard'); openAddTask(); } },
      { icon: '✦', label: 'Confetti afvuren', hint: 'plezier', run: () => celebrate(160) },
      { icon: '↺', label: 'Taken resetten', hint: 'demo', run: () => { setView('dashboard'); resetTasks(); } },
      { icon: '▤', label: 'Naar uitdagingen', hint: 'pagina', run: () => setView('challenges') },
      { icon: '▦', label: 'Naar weekplanning', hint: 'pagina', run: () => setView('planning') },
      { icon: '◇', label: 'Naar addons', hint: 'pagina', run: () => setView('addons') },
      { icon: '⚙', label: 'Naar instellingen', hint: 'pagina', run: () => setView('settings') },
      { icon: '↑', label: 'Naar boven', hint: 'scroll', run: () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }) }
    ];

    function visibleCommands() {
      const query = paletteInput.value.trim().toLowerCase();
      if (!query) return commands;
      return commands.filter(command =>
        command.label.toLowerCase().includes(query) ||
        (command.hint || '').toLowerCase().includes(query));
    }

    function paintPalette() {
      const list = visibleCommands();
      paletteIndex = Math.max(0, Math.min(paletteIndex, list.length - 1));
      paletteList.replaceChildren();

      if (!list.length) {
        const empty = document.createElement('div');
        empty.className = 'palette-empty';
        empty.textContent = 'Geen commando gevonden.';
        paletteList.appendChild(empty);
        return;
      }

      list.forEach((command, index) => {
        const item = document.createElement('div');
        item.className = 'palette-item' + (index === paletteIndex ? ' active' : '');
        item.setAttribute('role', 'button');

        const icon = document.createElement('span');
        icon.className = 'p-ico';
        icon.textContent = command.icon;

        const label = document.createElement('span');
        label.textContent = command.label;

        const hint = document.createElement('span');
        hint.className = 'p-hint';
        hint.textContent = command.hint || '';

        item.append(icon, label, hint);
        item.addEventListener('mousemove', () => {
          if (paletteIndex !== index) {
            paletteIndex = index;
            paintPalette();
          }
        });
        item.addEventListener('click', () => runCommand(command));
        paletteList.appendChild(item);
      });
    }

    function runCommand(command) {
      closePalette();
      try { command.run(); } catch (err) { console.error(err); }
    }

    function openPalette() {
      palette.hidden = false;
      paletteInput.value = '';
      paletteIndex = 0;
      paintPalette();
      setTimeout(() => paletteInput.focus(), 10);
    }

    function closePalette() {
      palette.hidden = true;
      paletteInput.blur();
    }

    function runSelected() {
      const list = visibleCommands();
      if (list[paletteIndex]) runCommand(list[paletteIndex]);
    }

    $('#page-search').addEventListener('click', event => {
      event.preventDefault();
      openPalette();
    });

    paletteInput.addEventListener('input', () => {
      paletteIndex = 0;
      paintPalette();
    });

    paletteInput.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closePalette(); return; }
      const list = visibleCommands();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        paletteIndex = (paletteIndex + 1) % Math.max(1, list.length);
        paintPalette();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        paletteIndex = (paletteIndex - 1 + list.length) % Math.max(1, list.length);
        paintPalette();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        runSelected();
      }
    });

    palette.addEventListener('click', event => {
      if (event.target === palette) closePalette();
    });

    document.addEventListener('keydown', event => {
      const tag = (event.target && event.target.tagName) || '';
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (palette.hidden) openPalette(); else closePalette();
        return;
      }
      if (event.key === '/' && !typing) {
        event.preventDefault();
        openPalette();
        return;
      }
      if (event.key === 'Escape' && !palette.hidden) closePalette();
    });

    /* ---------------- views ---------------- */
    const VIEW_LABELS = {
      dashboard: 'Dashboard',
      challenges: 'Challenges',
      planning: 'Weekplanning',
      addons: 'Addons',
      settings: 'Instellingen'
    };

    function setView(name, options) {
      const opts = options || {};
      if (!VIEW_LABELS[name]) name = 'dashboard';

      $$('.view').forEach(view => {
        view.hidden = view.getAttribute('data-view') !== name;
      });

      $$('.nav button').forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-view') === name);
      });

      const crumb = $('.crumbs b');
      if (crumb) crumb.textContent = VIEW_LABELS[name];

      document.title = name === 'dashboard'
        ? 'Egodact Playground'
        : VIEW_LABELS[name] + ' · Egodact';

      if (!opts.keepHash) {
        try { history.replaceState(null, '', '#' + name); } catch (err) {}
      }

      if (name === 'challenges') renderChallenges();
      if (name === 'planning') renderPlanning();
      if (name === 'addons') renderAddons();
      if (name === 'settings') syncSettings();

      if (!opts.noScroll) {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }

    /* ---------------- challenges ---------------- */
    const CHALLENGES = [
      { id: 'checkin', icon: '✓', title: 'Dagelijkse check-in', desc: 'Houd je stemming en energie bij.', tag: 'Dagelijks', points: 10, progress: 100, done: true },
      { id: 'focus', icon: '◷', title: '5 uur focussen', desc: 'Verzamel pomodoro-blokken deze week.', tag: 'Focus', points: 50, progress: 68, done: false },
      { id: 'tasks', icon: '☑', title: '8 taken afronden', desc: 'Werk je open taken één voor één weg.', tag: 'Taken', points: 30, progress: 75, done: false },
      { id: 'week', icon: '★', title: 'Weekdoel: alles bij', desc: 'Geen achterstallig werk op vrijdag.', tag: 'Week', points: 40, progress: 40, done: false }
    ];

    let challengeFilter = 'all';

    function renderChallenges() {
      const list = $('#challenge-list');
      if (!list) return;

      list.replaceChildren();

      const visible = CHALLENGES.filter(challenge => {
        if (challengeFilter === 'open') return !challenge.done;
        if (challengeFilter === 'done') return challenge.done;
        return true;
      });

      if (!visible.length) {
        const empty = document.createElement('p');
        empty.className = 'plan-empty';
        empty.textContent = 'Geen uitdagingen in deze filter.';
        list.appendChild(empty);
      }

      visible.forEach(challenge => {
        const row = document.createElement('div');
        row.className = 'challenge' + (challenge.done ? ' done' : '');

        const icon = document.createElement('span');
        icon.className = 'ch-ico';
        icon.textContent = challenge.icon;

        const main = document.createElement('div');
        main.className = 'challenge-main';

        const top = document.createElement('div');
        top.className = 'challenge-top';

        const title = document.createElement('h3');
        title.textContent = challenge.title;

        const chip = document.createElement('span');
        chip.className = 'chip' + (challenge.done ? ' done' : '');
        chip.textContent = challenge.done ? 'Voltooid' : challenge.tag;

        top.append(title, chip);

        const desc = document.createElement('p');
        desc.textContent = challenge.desc;

        const progress = document.createElement('div');
        progress.className = 'challenge-progress';

        const bar = document.createElement('div');
        bar.className = 'bar';
        const fill = document.createElement('i');
        fill.style.width = challenge.progress + '%';
        bar.appendChild(fill);

        const pct = document.createElement('span');
        pct.className = 'challenge-pct';
        pct.textContent = challenge.progress + '%';

        const points = document.createElement('span');
        points.className = 'challenge-points';
        points.textContent = '+' + challenge.points + ' pt';

        progress.append(bar, pct, points);
        main.append(top, desc, progress);

        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'btn small' + (challenge.done ? '' : ' ghost');
        action.textContent = challenge.done ? 'Bekeken' : 'Claim';
        action.addEventListener('click', () => {
          if (challenge.done) {
            toast('Deze uitdaging is al voltooid.', 'good');
            return;
          }
          challenge.done = true;
          challenge.progress = 100;
          renderChallenges();
          toast('Uitdaging voltooid: ' + challenge.title + ' (+' + challenge.points + ' pt)', 'good');
          celebrate(60);
        });

        row.append(icon, main, action);
        list.appendChild(row);
      });

      const activeCount = CHALLENGES.filter(challenge => !challenge.done).length;
      const doneCount = CHALLENGES.length - activeCount;
      const totalPoints = CHALLENGES.reduce((sum, challenge) => sum + challenge.points, 0);

      const activeEl = $('#challenge-active');
      const doneEl = $('#challenge-done');
      const pointsEl = $('#challenge-points');
      if (activeEl) activeEl.textContent = String(activeCount);
      if (doneEl) doneEl.textContent = String(doneCount);
      if (pointsEl) pointsEl.textContent = String(totalPoints);
    }

    $$('#challenge-filter button').forEach(button => {
      button.addEventListener('click', () => {
        const next = button.getAttribute('data-filter');
        challengeFilter = next === 'open' || next === 'done' ? next : 'all';
        $$('#challenge-filter button').forEach(other => {
          other.classList.toggle('active', other === button);
        });
        renderChallenges();
      });
    });

    /* ---------------- planning ---------------- */
    const PLAN = [
      [{ time: '09:30', dur: 50, title: 'Wiskunde PO', k: 's' }, { time: '11:20', dur: 30, title: 'Frans leren', k: 'a' }],
      [{ time: '09:00', dur: 60, title: 'Wiskunde PO', k: 's' }, { time: '14:15', dur: 45, title: 'Frans leren', k: 'a' }, { time: '16:00', dur: 30, title: 'Weekplanning', k: 't' }],
      [{ time: '10:00', dur: 45, title: 'Engels', k: 'm' }],
      [{ time: '08:45', dur: 50, title: 'Natuurkunde', k: 's' }, { time: '13:30', dur: 40, title: 'Challenge-portfolio', k: 'r' }],
      [{ time: '09:15', dur: 50, title: 'Wiskunde', k: 's' }, { time: '15:00', dur: 45, title: 'Frans SO', k: 'a' }],
      [],
      []
    ];

    const PLAN_SUBJECTS = [
      { title: 'Wiskunde', k: 's' },
      { title: 'Frans', k: 'a' },
      { title: 'Engels', k: 'm' },
      { title: 'Natuurkunde', k: 's' },
      { title: 'Challenge-portfolio', k: 'r' },
      { title: 'Weekplanning', k: 't' }
    ];

    function renderPlanning() {
      const board = $('#plan-board');
      if (!board) return;

      board.replaceChildren();

      const todayColumn = [];
      let totalBlocks = 0;
      let totalMinutes = 0;

      for (let day = 0; day < 7; day++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + day);

        const column = document.createElement('div');
        column.className = 'plan-day' + (day === dow ? ' today' : '');

        const head = document.createElement('div');
        head.className = 'plan-day-head';
        const dayName = document.createElement('b');
        dayName.textContent = dayNames[day];
        const dayNumber = document.createElement('span');
        dayNumber.textContent = String(date.getDate());
        head.append(dayName, dayNumber);
        column.appendChild(head);

        if (!PLAN[day].length) {
          const empty = document.createElement('div');
          empty.className = 'plan-empty';
          empty.textContent = 'Vrij';
          column.appendChild(empty);
        }

        PLAN[day].forEach(block => {
          totalBlocks++;
          totalMinutes += block.dur;

          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'plan-block k-' + block.k;

          const time = document.createElement('span');
          time.className = 't';
          time.textContent = block.time + ' · ' + block.dur + 'm';

          const name = document.createElement('span');
          name.className = 'n';
          name.textContent = block.title;

          button.append(time, name);
          button.addEventListener('click', () => {
            toast(block.title + ' · ' + dayNames[day] + ' ' + date.getDate() + ' · ' + block.time, 'good');
          });

          column.appendChild(button);
          if (day === dow) todayColumn.push(block);
        });

        board.appendChild(column);
      }

      const summary = $('#plan-summary');
      if (summary) {
        const hours = (totalMinutes / 60).toFixed(1).replace('.', ',');
        summary.textContent = totalBlocks + ' blokken · ' + hours + ' uur';
      }

      const datesEl = $('#plan-dates');
      if (datesEl) {
        const end = new Date(monday);
        end.setDate(monday.getDate() + 6);
        datesEl.textContent = monday.getDate() + ' – ' + end.getDate() + ' ' + end.toLocaleDateString('nl-NL', { month: 'long' });
      }

      const weekEl = $('#plan-week');
      if (weekEl) {
        const end = new Date(monday);
        end.setDate(monday.getDate() + 6);
        weekEl.textContent = monday.getDate() + ' – ' + end.getDate() + ' ' + end.toLocaleDateString('nl-NL', { month: 'short' });
      }

      const todayList = $('#plan-today-list');
      const todayLabel = $('#plan-today-label');
      const todayDate = new Date(monday);
      todayDate.setDate(monday.getDate() + dow);
      if (todayLabel) {
        todayLabel.textContent = dayNames[dow] + ' ' + todayDate.getDate() + ' ' + todayDate.toLocaleDateString('nl-NL', { month: 'short' });
      }

      if (todayList) {
        todayList.replaceChildren();
        if (!todayColumn.length) {
          const empty = document.createElement('p');
          empty.className = 'plan-empty';
          empty.textContent = 'Geen blokken vandaag. Lekker rustig.';
          todayList.appendChild(empty);
        }
        todayColumn.forEach(block => {
          const item = document.createElement('div');
          item.className = 'plan-today-item';

          const time = document.createElement('span');
          time.className = 't';
          time.textContent = block.time;

          const body = document.createElement('div');
          const name = document.createElement('div');
          name.className = 'n';
          name.textContent = block.title;
          const meta = document.createElement('div');
          meta.className = 'd';
          meta.textContent = 'Duur ' + block.dur + ' minuten';
          body.append(name, meta);

          item.append(time, body);
          todayList.appendChild(item);
        });
      }
    }

    $('#plan-add').addEventListener('click', () => {
      const subject = PLAN_SUBJECTS[Math.floor(Math.random() * PLAN_SUBJECTS.length)];
      const hour = 8 + Math.floor(Math.random() * 9);
      const block = { time: String(hour).padStart(2, '0') + ':00', dur: 45, title: subject.title, k: subject.k };
      PLAN[dow].push(block);
      PLAN[dow].sort((a, b) => a.time.localeCompare(b.time));
      renderPlanning();
      toast('Blok toegevoegd: ' + block.title + ' om ' + block.time, 'good');
    });

    $('#plan-today').addEventListener('click', () => {
      const column = $('.plan-day.today');
      if (column) {
        column.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      }
      toast('Vandaag: ' + dayNames[dow] + ' — focus op je eerste blok.', 'good');
    });

    /* ---------------- addons ---------------- */
    const ADDONS = [
      { id: 'chat', name: 'Egodact Chat', desc: 'Live gesprekken en groepschats.', version: '1.0.7', letter: 'C', on: true },
      { id: 'games', name: 'Pauze-spellen', desc: 'Snake, 2048, Tetris en meer.', version: '2.1.0', letter: 'S', on: true },
      { id: 'tijd', name: 'Tijdregistratie', desc: 'Houd bij waar je focus naartoe gaat.', version: '1.4.2', letter: 'T', on: false },
      { id: 'planner', name: 'Weekplanner+', desc: 'Extra weergaven voor je planning.', version: '0.9.3', letter: 'W', on: true }
    ];

    const savedAddons = store.get('addons', null);
    if (savedAddons && typeof savedAddons === 'object') {
      ADDONS.forEach(addon => {
        if (typeof savedAddons[addon.id] === 'boolean') addon.on = savedAddons[addon.id];
      });
    }

    const addonLog = [];

    function paintAddonLog() {
      const list = $('#addon-log');
      if (!list) return;

      list.replaceChildren();

      if (!addonLog.length) {
        const item = document.createElement('li');
        item.textContent = 'Nog geen events — klik op Open bij een addon.';
        list.appendChild(item);
        return;
      }

      addonLog.forEach(entry => {
        const item = document.createElement('li');
        item.textContent = entry.time + '  ' + entry.text;
        list.appendChild(item);
      });
    }

    function logAddonEvent(text) {
      addonLog.unshift({
        time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: text
      });
      if (addonLog.length > 6) addonLog.length = 6;
      paintAddonLog();
    }

    function saveAddons() {
      const state = {};
      ADDONS.forEach(addon => { state[addon.id] = addon.on; });
      store.set('addons', state);
    }

    function renderAddons() {
      const list = $('#addon-list');
      if (!list) return;

      list.replaceChildren();

      ADDONS.forEach(addon => {
        const row = document.createElement('div');
        row.className = 'addon';

        const icon = document.createElement('span');
        icon.className = 'addon-ico';
        icon.textContent = addon.letter;

        const main = document.createElement('div');
        main.className = 'addon-main';

        const nameRow = document.createElement('div');
        nameRow.className = 'addon-name';
        const name = document.createElement('span');
        name.textContent = addon.name;
        const version = document.createElement('span');
        version.className = 'addon-version';
        version.textContent = 'v' + addon.version;
        nameRow.append(name, version);

        const desc = document.createElement('div');
        desc.className = 'addon-desc';
        desc.textContent = addon.desc;

        main.append(nameRow, desc);

        const actions = document.createElement('div');
        actions.className = 'addon-actions';

        if (addon.on) {
          const open = document.createElement('button');
          open.type = 'button';
          open.className = 'btn small ghost';
          open.textContent = 'Open';
          open.addEventListener('click', () => {
            logAddonEvent('egodact:addon:open → ' + addon.id);
            try {
              document.dispatchEvent(new CustomEvent('egodact:addon:open', { detail: { id: addon.id } }));
            } catch (err) {}
            toast('Event verstuurd: ' + addon.name, 'good');
          });
          actions.appendChild(open);
        }

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'switch';
        toggle.setAttribute('role', 'switch');
        toggle.setAttribute('aria-checked', String(addon.on));
        toggle.setAttribute('aria-label', addon.name + ' aan of uit');
        const knob = document.createElement('span');
        toggle.appendChild(knob);

        toggle.addEventListener('click', () => {
          addon.on = !addon.on;
          saveAddons();
          renderAddons();
          toast(addon.name + (addon.on ? ' ingeschakeld.' : ' uitgeschakeld.'), addon.on ? 'good' : 'warn');
        });

        actions.appendChild(toggle);
        row.append(icon, main, actions);
        list.appendChild(row);
      });

      const activeEl = $('#addon-active');
      const totalEl = $('#addon-total');
      if (activeEl) activeEl.textContent = String(ADDONS.filter(addon => addon.on).length);
      if (totalEl) totalEl.textContent = String(ADDONS.length);

      paintAddonLog();
    }

    document.addEventListener('egodact:addon:open', event => {
      const detail = event.detail || {};
      if (detail.id) logAddonEvent('ontvangen: egodact:addon:open → ' + detail.id);
    });

    document.addEventListener('egodact:addons:changed', () => {
      logAddonEvent('ontvangen: egodact:addons:changed');
    });

    $('#addon-refresh').addEventListener('click', () => {
      renderAddons();
      toast('Addon-status ververst.', 'good');
    });

    /* ---------------- settings ---------------- */
    function syncThemeSegments() {
      const segmented = $('#theme-seg');
      if (!segmented) return;
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      $$('#theme-seg button').forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-theme-value') === current);
      });
    }

    function syncSettings() {
      syncThemeSegments();
      const motion = $('#motion-switch');
      if (motion) motion.setAttribute('aria-checked', String(reduceMotion));
    }

    $$('#theme-seg button').forEach(button => {
      button.addEventListener('click', () => {
        applyTheme(button.getAttribute('data-theme-value') === 'light' ? 'light' : 'dark');
      });
    });

    const motionSwitch = $('#motion-switch');
    if (motionSwitch) {
      motionSwitch.setAttribute('aria-checked', String(reduceMotion));
      motionSwitch.addEventListener('click', () => {
        reduceMotion = !reduceMotion;
        document.documentElement.classList.toggle('reduce-motion', reduceMotion);
        store.set('reduceMotion', reduceMotion);
        motionSwitch.setAttribute('aria-checked', String(reduceMotion));
        toast(reduceMotion ? 'Beweging uitgeschakeld.' : 'Beweging weer aan.', 'good');
      });
    }

    if (store.get('reduceMotion', false)) {
      reduceMotion = true;
      document.documentElement.classList.add('reduce-motion');
    }

    const resetDemo = $('#reset-demo');
    if (resetDemo) {
      resetDemo.addEventListener('click', () => {
        Object.keys(localStorage)
          .filter(key => key.indexOf('egd_demo_') === 0)
          .forEach(key => localStorage.removeItem(key));
        toast('Demo-data gewist. Herladen…', 'warn');
        setTimeout(() => location.reload(), 600);
      });
    }

    /* ---------------- nav + bell ---------------- */
    $$('.nav button').forEach(button => {
      button.addEventListener('click', () => {
        setView(button.getAttribute('data-view'));
      });
    });

    const startView = (location.hash || '').replace('#', '');
    setView(VIEW_LABELS[startView] ? startView : 'dashboard', { keepHash: true, noScroll: true });

    window.addEventListener('hashchange', () => {
      const next = (location.hash || '').replace('#', '');
      setView(VIEW_LABELS[next] ? next : 'dashboard', { keepHash: true });
    });

    $('#page-bell').addEventListener('click', () => {
      toast('2 nieuwe meldingen: challenge-deadline en een nieuw chatbericht.', 'warn');
    });

    /* ---------------- expose a tiny test API ---------------- */
    window.EGD_DEMO = {
      toast: toast,
      celebrate: celebrate,
      toggleTheme: toggleTheme,
      openPalette: openPalette,
      tasks: () => tasks.map(task => Object.assign({}, task)),
      addTask: addTask,
      resetTasks: resetTasks
    };

    setTimeout(() => toast('Tip: Ctrl+K opent het commando-paneel.', 'good'), 1200);
  })();
