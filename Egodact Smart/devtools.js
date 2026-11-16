(function () {
  'use strict';
  var logEl = document.getElementById('log');
  var statusEl = document.getElementById('status');
  var statsEl = document.getElementById('stats');
  var qEl = document.getElementById('q');
  var kindEl = document.getElementById('kind');
  var levelEl = document.getElementById('level');
  var autoEl = document.getElementById('auto');

  var entries = [];
  var port = null;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtTime(t) {
    try { var d = new Date(t); return d.toLocaleTimeString('nl-NL', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3,'0'); } catch(e){ return ''; }
  }

  function connect() {
    try {
      if (!chrome || !chrome.runtime || !chrome.runtime.connect) {
        statusEl.textContent = 'geen chrome.runtime (open via extensie)';
        return;
      }
      port = chrome.runtime.connect({ name: 'devlog-viewer' });
      statusEl.textContent = 'verbonden';
      port.onMessage.addListener(function (msg) {
        if (!msg) return;
        if (msg.type === 'init' && Array.isArray(msg.entries)) { entries = msg.entries.slice(); render(true); }
        else if (msg.type === 'append' && Array.isArray(msg.entries)) { entries = entries.concat(msg.entries); if (entries.length > 1000) entries = entries.slice(-1000); render(false); }
        else if (msg.type === 'cleared') { entries = []; render(true); }
      });
      port.onDisconnect.addListener(function () {
        statusEl.textContent = 'verbinding verbroken';
        port = null;
        try { void chrome.runtime.lastError; } catch(e){}
        if (autoEl.checked) setTimeout(connect, 1500);
      });
    } catch (e) { statusEl.textContent = 'fout: ' + e.message; }
  }

  function filtered() {
    var q = (qEl.value || '').toLowerCase().trim();
    var k = kindEl.value;
    var l = levelEl.value;
    return entries.filter(function (e) {
      if (k && e.kind !== k) return false;
      if (l && e.level !== l) return false;
      if (q) {
        var hay = [e.name, e.subType, e.addonId, e.id, e.summary, e.detail, e.kind, e.level].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function render(full) {
    var list = filtered();
    var nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 80);
    statsEl.textContent = 'Totaal: ' + entries.length + ' · Getoond: ' + list.length + ' · egodact:* events, addon-gerelateerde console/errors';
    if (!list.length) {
      logEl.innerHTML = '<div class="empty">Nog geen logs. Open/gebruik app.egodact.com en voer addon-acties uit (met herladen na extensie-update).</div>';
      return;
    }
    var html = '';
    var show = list.slice(-400);
    for (var i = 0; i < show.length; i++) {
      var e = show[i] || {};
      var lvl = e.level || 'info';
      var kind = e.kind || 'event';
      var detail = e.detail && e.detail !== e.summary ? e.detail : '';
      html += '<div class="entry level-' + esc(lvl) + '">' +
        '<div class="head">' +
          '<span class="time">' + esc(fmtTime(e.t)) + '</span>' +
          '<span class="badge ' + esc(kind) + '">' + esc(kind) + '</span>' +
          '<span class="badge">' + esc(lvl) + '</span>' +
          '<span class="name">' + esc(e.name || '') + '</span>' +
          (e.subType ? '<span class="badge">' + esc(e.subType) + '</span>' : '') +
          (e.addonId ? '<span class="addon">addon: ' + esc(e.addonId) + '</span>' : '') +
          (e.id ? '<span class="muted">id: ' + esc(e.id) + '</span>' : '') +
        '</div>' +
        '<div class="summary">' + esc(e.summary || '') + '</div>' +
        (detail ? '<pre class="detail">' + esc(detail) + '</pre>' : '') +
      '</div>';
    }
    logEl.innerHTML = html;
    if (autoEl.checked && (full || nearBottom)) window.scrollTo(0, document.body.scrollHeight);
  }

  document.getElementById('refresh').addEventListener('click', function () {
    if (port) { try { port.postMessage({ type: 'get' }); } catch(e){} } else { connect(); }
  });
  document.getElementById('clear').addEventListener('click', function () {
    if (port) { try { port.postMessage({ type: 'clear' }); } catch(e){} }
    entries = []; render(true);
  });
  qEl.addEventListener('input', function(){ render(true); });
  kindEl.addEventListener('change', function(){ render(true); });
  levelEl.addEventListener('change', function(){ render(true); });

  try {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'devlog:get' }, function (res) {
        if (chrome.runtime.lastError) return;
        if (res && Array.isArray(res.entries) && entries.length === 0) { entries = res.entries; render(true); }
      });
    }
  } catch(e){}

  connect();
  setInterval(function () { if (autoEl.checked && port) { try { port.postMessage({ type: 'get' }); } catch(e){} } }, 2000);
})();