(function () {
  'use strict';

  var logEl = document.getElementById('log');
  var statusEl = document.getElementById('status');
  var statsEl = document.getElementById('stats');
  var qEl = document.getElementById('q');
  var kindEl = document.getElementById('kind');
  var levelEl = document.getElementById('level');
  var pageEl = document.getElementById('page');
  var liveEl = document.getElementById('live');
  var groupEl = document.getElementById('group');
  var scrollEl = document.getElementById('autoscroll');

  var entries = [];
  var port = null;
  var connected = false;
  var renderTimer = null;
  var pendingNew = 0;
  var lastGroups = [];
  var knownPages = '';

  // ---------- preferences ----------
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem('egdDevViewer') || '{}') || {}; } catch (e) { prefs = {}; }
  if (typeof prefs.q === 'string') qEl.value = prefs.q;
  if (typeof prefs.kind === 'string') kindEl.value = prefs.kind;
  if (typeof prefs.level === 'string') levelEl.value = prefs.level;
  if (typeof prefs.page === 'string') pageEl.value = prefs.page;
  if (typeof prefs.pause === 'boolean') liveEl.checked = !prefs.pause;
  if (typeof prefs.group === 'boolean') groupEl.checked = prefs.group;
  if (typeof prefs.autoscroll === 'boolean') scrollEl.checked = prefs.autoscroll;

  function savePrefs() {
    try {
      localStorage.setItem('egdDevViewer', JSON.stringify({
        q: qEl.value,
        kind: kindEl.value,
        level: levelEl.value,
        page: pageEl.value,
        pause: !liveEl.checked,
        group: groupEl.checked,
        autoscroll: scrollEl.checked
      }));
    } catch (e) {}
  }

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtTime(t) {
    try {
      var d = new Date(t);
      return d.toLocaleTimeString('nl-NL', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
    } catch (e) { return ''; }
  }
  function shortPage(e) {
    var raw = e.page || '';
    if (!raw) return e.tabId != null ? 'tab ' + e.tabId : '';
    try {
      var u = new URL(raw);
      var label = u.host + (u.pathname && u.pathname !== '/' ? u.pathname : '');
      if (label.length > 46) label = label.slice(0, 44) + '…';
      return (e.tabId != null ? '#' + e.tabId + ' ' : '') + label;
    } catch (err) {
      return raw.length > 60 ? raw.slice(0, 58) + '…' : raw;
    }
  }
  function signature(e) {
    return [e.kind, e.name, e.subType, e.addonId, e.id, e.summary, e.tabId, e.page].join('\u0001');
  }
  function entryKey(e) {
    return [e.t || 0, e.kind, e.name, e.id, e.addonId, e.summary, e.detail, e.tabId].join('\u0001');
  }
  function mergeEntries(list) {
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (!e || typeof e !== 'object') continue;
      var k = entryKey(e);
      if (seen[k]) continue;
      seen[k] = 1;
      out.push(e);
    }
    out.sort(function (a, b) { return (a.t || 0) - (b.t || 0); });
    if (out.length > 1000) out = out.slice(-1000);
    return out;
  }

  // ---------- filters ----------
  function matches(e) {
    var k = kindEl.value;
    if (k && e.kind !== k) return false;
    var l = levelEl.value;
    if (l && e.level !== l) return false;
    var p = pageEl.value;
    if (p && String(e.tabId == null ? '' : e.tabId) !== p) return false;
    var q = (qEl.value || '').toLowerCase().trim();
    if (q) {
      var hay = [e.name, e.subType, e.addonId, e.id, e.summary, e.detail, e.kind, e.level, e.page].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function refreshPageFilter() {
    var map = {};
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.tabId == null) continue;
      var key = String(e.tabId);
      if (!map[key]) map[key] = shortPage(e);
    }
    var keys = Object.keys(map).sort();
    var sig = keys.join(',');
    if (sig === knownPages) return;
    knownPages = sig;
    var current = pageEl.value;
    var html = '<option value="">Alle pagina\'s</option>';
    keys.forEach(function (k) {
      html += '<option value="' + esc(k) + '">' + esc(map[k]) + '</option>';
    });
    pageEl.innerHTML = html;
    if (current && keys.indexOf(current) !== -1) pageEl.value = current;
    else pageEl.value = '';
  }

  // ---------- grouping ----------
  function buildGroups() {
    var out = [];
    var groupOn = groupEl.checked;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!matches(e)) continue;
      if (groupOn && out.length) {
        var last = out[out.length - 1];
        if (last.sig === signature(e) && (e.t - last.lastT) <= 60000) {
          last.count++;
          last.lastT = e.t;
          last.items.push(e);
          continue;
        }
      }
      out.push({ sig: signature(e), count: 1, firstT: e.t, lastT: e.t, entry: e, items: [e] });
    }
    return out;
  }

  // ---------- rendering ----------
  function scheduleRender() {
    if (renderTimer) return;
    renderTimer = setTimeout(function () {
      renderTimer = null;
      render();
    }, 120);
  }

  function nearBottom() {
    return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 120);
  }

  function render() {
    var wasNearBottom = nearBottom();
    refreshPageFilter();

    var groups = buildGroups();
    var shown = groups.slice(-500);
    lastGroups = shown;

    var total = entries.length;
    var shownCount = 0;
    for (var s = 0; s < shown.length; s++) shownCount += shown[s].count;

    var statusBits = [];
    statusBits.push(connected ? 'verbonden' : 'niet verbonden');
    if (!liveEl.checked) statusBits.push('gepauzeerd' + (pendingNew ? ' (+' + pendingNew + ' nieuw)' : ''));
    statusEl.textContent = statusBits.join(' · ');
    statusEl.className = 'status' + (connected ? '' : ' bad');

    statsEl.textContent = 'Totaal: ' + total + ' · Getoond: ' + shownCount +
      ' · ' + shown.length + ' regels' + (groupEl.checked ? ' (identieke events samengevat)' : '') +
      ' · egodact:* events, addon-gerelateerde console/errors';

    if (!shown.length) {
      logEl.innerHTML = '<div class="empty">Nog geen logs. Open/gebruik <b>app.egodact.com</b> en voer addon-acties uit (herlaad de extensie na een update).</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < shown.length; i++) {
      var g = shown[i];
      var e = g.entry || {};
      var lvl = e.level || 'info';
      var kind = e.kind || 'event';
      var detail = e.detail && e.detail !== e.summary ? e.detail : '';
      var timeLabel = fmtTime(g.firstT);
      if (g.count > 1) timeLabel = fmtTime(g.firstT) + ' – ' + fmtTime(g.lastT);

      html += '<div class="entry level-' + esc(lvl) + ' kind-' + esc(kind) + '" data-i="' + i + '">' +
        '<div class="head">' +
          '<span class="time">' + esc(timeLabel) + '</span>' +
          '<span class="badge kind">' + esc(kind) + '</span>' +
          '<span class="badge lvl">' + esc(lvl) + '</span>' +
          '<span class="name">' + esc(e.name || '') + '</span>' +
          (e.subType ? '<span class="badge">' + esc(e.subType) + '</span>' : '') +
          (e.addonId ? '<span class="addon">addon: ' + esc(e.addonId) + '</span>' : '') +
          (e.id ? '<span class="muted">id: ' + esc(e.id) + '</span>' : '') +
          (g.count > 1 ? '<span class="count" title="identieke events binnen 60s">×' + g.count + '</span>' : '') +
          '<span class="grow"></span>' +
          '<button type="button" class="copy" data-copy="' + i + '" title="Kopieer als JSON">kopieer</button>' +
        '</div>' +
        (e.page || e.tabId != null ? '<div class="meta">' + esc(shortPage(e)) + '</div>' : '') +
        '<div class="summary">' + esc(e.summary || '') + '</div>' +
        (detail ? '<details><summary>details</summary><pre class="detail">' + esc(detail) + '</pre></details>' : '') +
      '</div>';
    }
    logEl.innerHTML = html;

    if (scrollEl.checked && (wasNearBottom || !liveEl.checked)) {
      window.scrollTo(0, document.body.scrollHeight);
    }
    pendingNew = 0;
  }

  logEl.addEventListener('click', function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest('.copy') : null;
    if (!btn) return;
    var idx = parseInt(btn.getAttribute('data-copy'), 10);
    var g = lastGroups[idx];
    if (!g) return;
    var data = g.items.length === 1 ? g.entry : g.items;
    var text = JSON.stringify(data, null, 2);
    try {
      navigator.clipboard.writeText(text);
      btn.textContent = 'gekopieerd';
      setTimeout(function () { btn.textContent = 'kopieer'; }, 1200);
    } catch (e) {
      try { window.prompt('Kopieer:', text); } catch (e2) {}
    }
  });

  // ---------- connection ----------
  function setDisconnected(reason) {
    connected = false;
    statusEl.textContent = reason || 'niet verbonden';
    statusEl.className = 'status bad';
  }

  function connect() {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.connect) {
        setDisconnected('geen chrome.runtime (open via de extensie)');
        return;
      }
      port = chrome.runtime.connect({ name: 'devlog-viewer' });
      connected = true;
      statusEl.textContent = 'verbonden';
      statusEl.className = 'status';
      port.onMessage.addListener(function (msg) {
        if (!msg) return;
        if (msg.type === 'init' && Array.isArray(msg.entries)) {
          entries = mergeEntries(msg.entries);
          if (liveEl.checked) scheduleRender();
          else pendingNew = 0;
        } else if (msg.type === 'append' && Array.isArray(msg.entries)) {
          entries = mergeEntries(entries.concat(msg.entries));
          if (liveEl.checked) scheduleRender();
          else {
            pendingNew += msg.entries.length;
            statusEl.textContent = 'gepauzeerd (+' + pendingNew + ' nieuw)';
            statusEl.className = 'status';
          }
        } else if (msg.type === 'cleared') {
          entries = [];
          pendingNew = 0;
          render();
        }
      });
      port.onDisconnect.addListener(function () {
        try { void chrome.runtime.lastError; } catch (e) {}
        connected = false;
        port = null;
        setDisconnected('verbinding verbroken — opnieuw proberen...');
        setTimeout(connect, 2000);
      });
      try { port.postMessage({ type: 'get' }); } catch (e) {}
    } catch (e) {
      setDisconnected('fout: ' + e.message);
      setTimeout(connect, 3000);
    }
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'devlog:get' }, function (res) {
        if (chrome.runtime.lastError) return;
        if (res && Array.isArray(res.entries) && !entries.length) {
          entries = mergeEntries(res.entries);
          scheduleRender();
        }
      });
    }
  } catch (e) {}

  // ---------- controls ----------
  document.getElementById('refresh').addEventListener('click', function () {
    if (port) { try { port.postMessage({ type: 'get' }); } catch (e) {} } else { connect(); }
    pendingNew = 0;
    scheduleRender();
  });
  document.getElementById('clear').addEventListener('click', function () {
    if (port) { try { port.postMessage({ type: 'clear' }); } catch (e) {} }
    entries = [];
    pendingNew = 0;
    render();
  });
  document.getElementById('export').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'egodact-devlog-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  });

  qEl.addEventListener('input', function () { savePrefs(); scheduleRender(); });
  kindEl.addEventListener('change', function () { savePrefs(); scheduleRender(); });
  levelEl.addEventListener('change', function () { savePrefs(); scheduleRender(); });
  pageEl.addEventListener('change', function () { savePrefs(); scheduleRender(); });
  groupEl.addEventListener('change', function () { savePrefs(); scheduleRender(); });
  scrollEl.addEventListener('change', function () { savePrefs(); if (scrollEl.checked) window.scrollTo(0, document.body.scrollHeight); });
  liveEl.addEventListener('change', function () {
    savePrefs();
    if (liveEl.checked) { pendingNew = 0; scheduleRender(); }
    else render();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === '/' && document.activeElement !== qEl) { ev.preventDefault(); qEl.focus(); qEl.select(); }
    else if (ev.key === 'Escape' && document.activeElement === qEl) { qEl.value = ''; savePrefs(); scheduleRender(); qEl.blur(); }
  });

  // slow safety resync (in case a push was missed); pushes still arrive instantly
  setInterval(function () {
    if (!port || !liveEl.checked) return;
    try { port.postMessage({ type: 'get' }); } catch (e) {}
  }, 15000);

  connect();
  render();
})();
