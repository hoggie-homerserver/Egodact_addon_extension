/* Egodact diagnoseconsole — external script (MV3 CSP: no inline scripts) */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];

  /* ---------- mock chrome when running outside an extension (tests/http) ---------- */
  const hasChrome = !!(window.chrome && chrome.runtime && typeof chrome.runtime.getManifest === "function");
  if (!hasChrome) {
    window.chrome = window.chrome || {};
    chrome.runtime = {
      id: "test-extension-id",
      getManifest: function () {
        return {
          manifest_version: 3,
          name: "Egodact Pantagora (mock)",
          version: "0.0.0",
          description: "Mock manifest for local testing",
          permissions: [],
          host_permissions: ["https://api.egodact.com/*"],
          content_scripts: [{ matches: ["https://app.egodact.com/*"], js: ["src/main.js"] }],
          web_accessible_resources: [{ resources: ["test-page.html"], matches: ["https://app.egodact.com/*"] }]
        };
      },
      getURL: function (p) { return location.origin + "/" + String(p).replace(/^\//, ""); }
    };
    const sample = {
      foo: "bar",
      settings: { theme: "dark", reduceMotion: false },
      lastSeen: Date.now(),
      addons: ["chat", "games"]
    };
    chrome.storage = {
      local: {
        get: function (keys, cb) {
          const out = {};
          let resolveKeys = keys;
          if (keys === null) {
            Object.assign(out, sample);
          } else if (Array.isArray(keys)) {
            keys.forEach(function (k) { if (Object.prototype.hasOwnProperty.call(sample, k)) out[k] = sample[k]; });
          } else if (typeof keys === "string") {
            if (Object.prototype.hasOwnProperty.call(sample, keys)) out[keys] = sample[keys];
          } else if (keys && typeof keys === "object") {
            Object.keys(keys).forEach(function (k) {
              out[k] = Object.prototype.hasOwnProperty.call(sample, k) ? sample[k] : keys[k];
            });
          }
          if (typeof cb === "function") { cb(out); }
          return Promise.resolve(out);
        },
        getKeys: function (cb) { const ks = Object.keys(sample); if (typeof cb === "function") cb(ks); return Promise.resolve(ks); },
        getBytesInUse: function (cb) { if (typeof cb === "function") cb(1234); return Promise.resolve(1234); }
      }
    };
    window.__EGD_MOCK__ = true;
  }

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const SUN = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>';
  const MOON = '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>';
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const icon = $("#theme-icon");
    if (icon) icon.innerHTML = theme === "light" ? MOON : SUN;
    try { localStorage.setItem("egd_console_theme", theme); } catch (e) {}
  }
  function toggleTheme() {
    applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  }
  let initialTheme = "dark";
  try { initialTheme = localStorage.getItem("egd_console_theme") || initialTheme; } catch (e) {}
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches && !localStorage.getItem("egd_console_theme")) {
    initialTheme = "light";
  }
  applyTheme(initialTheme);
  $("#theme-btn").addEventListener("click", toggleTheme);

  /* ---------- event log ---------- */
  const eventLog = [];
  const MAX_LOG = 200;
  function logEvent(type, detail, source) {
    const entry = { time: new Date().toISOString(), type: type, source: source || "window", detail: sanitize(detail) };
    eventLog.unshift(entry);
    if (eventLog.length > MAX_LOG) eventLog.length = MAX_LOG;
    renderEventLog();
  }
  function sanitize(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "function") return "[function]";
    if (obj instanceof Node || (obj && obj.nodeType)) return "[DOM node]";
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (typeof obj === "object") {
      const out = {};
      Object.keys(obj).forEach(function (k) { out[k] = sanitize(obj[k]); });
      return out;
    }
    return obj;
  }
  function renderEventLog() {
    const el = $("#event-log");
    if (!el) return;
    el.textContent = eventLog.map(function (e) {
      return e.time.slice(11, 19) + "  " + e.source + " → " + e.type + (e.detail !== undefined ? "  " + JSON.stringify(e.detail) : "");
    }).join("\n");
  }

  const EVENT_NAMES = ["egodact:addon:open", "egodact:addon:ready", "egodact:addon:close", "egodact:theme:change"];
  EVENT_NAMES.forEach(function (name) {
    window.addEventListener(name, function (ev) {
      logEvent(name, ev && ev.detail, "ontvangen");
    }, true);
  });
  window.addEventListener("error", function (ev) {
    logEvent("window:error", { message: ev.message, source: ev.filename, line: ev.lineno }, "browser");
  });
  window.addEventListener("unhandledrejection", function (ev) {
    logEvent("unhandledrejection", { reason: String(ev.reason) }, "browser");
  });

  $("#dispatch-open").addEventListener("click", function () {
    const detail = { id: "test-addon", containerId: "egodact-addon-container" };
    const ev = new CustomEvent("egodact:addon:open", { detail: detail, bubbles: true });
    window.dispatchEvent(ev);
    logEvent("egodact:addon:open", detail, "verzonden");
  });
  $("#dispatch-ready").addEventListener("click", function () {
    const detail = { id: "test-addon", version: "1.0.0" };
    const ev = new CustomEvent("egodact:addon:ready", { detail: detail, bubbles: true });
    window.dispatchEvent(ev);
    logEvent("egodact:addon:ready", detail, "verzonden");
  });
  $("#clear-log").addEventListener("click", function () {
    eventLog.length = 0;
    renderEventLog();
  });

  /* ---------- status ---------- */
  let statusData = {};
  function renderStatus() {
    const m = chrome.runtime.getManifest();
    const isDev = /dev/i.test(m.name || "");
    const rows = [
      ["Naam", m.name],
      ["Versie", m.version],
      ["Manifest-versie", "MV" + m.manifest_version],
      ["Extensie-ID", chrome.runtime.id],
      ["Modus", isDev ? "Development" : "Productie"],
      ["Beschrijving", m.description || "—"],
      ["Pagina-URL", location.href],
      ["User agent", navigator.userAgent]
    ];
    const container = $("#status-body");
    container.innerHTML = "";
    rows.forEach(function (r) {
      const div = document.createElement("div");
      div.className = "row";
      const k = document.createElement("span");
      k.className = "k";
      k.textContent = r[0];
      const v = document.createElement("span");
      v.className = "v";
      v.textContent = r[1];
      div.appendChild(k);
      div.appendChild(v);
      container.appendChild(div);
    });
    const badge = document.createElement("span");
    badge.className = "badge " + (isDev ? "warn" : "ok");
    badge.textContent = isDev ? "DEV BUILD" : "STORE BUILD";
    const lastRow = container.lastChild;
    if (lastRow) {
      const v = lastRow.querySelector(".v");
      v.textContent = "";
      v.appendChild(badge);
      v.appendChild(document.createTextNode("  " + (isDev ? "Development" : "Productie")));
    }
    statusData = { name: m.name, version: m.version, manifestVersion: m.manifest_version, id: chrome.runtime.id, dev: isDev, description: m.description, url: location.href, userAgent: navigator.userAgent };
  }

  /* ---------- files ---------- */
  const FILES_TO_CHECK = [
    "test-page.html", "test-page.css", "test-page.js", "manifest.json",
    "src/menus/beta-menu.js", "src/config.js", "src/theme.js", "src/main.js",
    "src/addon-api.js", "src/addon-installer.js"
  ];
  let filesData = [];
  async function checkFiles() {
    const tbody = $("#files-body");
    tbody.innerHTML = '<p class="card-sub">Bezig met controleren…</p>';
    const results = [];
    for (const f of FILES_TO_CHECK) {
      const url = chrome.runtime.getURL(f);
      let status = "fail", detail = "";
      try {
        const r = await fetch(url, { method: "GET", cache: "no-store" });
        if (r.ok) {
          const text = await r.text();
          status = "ok";
          detail = r.status + " " + r.statusText + " · " + text.length + " bytes";
        } else {
          detail = r.status + " " + r.statusText;
        }
      } catch (e) {
        detail = String(e && e.message ? e.message : e);
      }
      results.push({ file: f, url: url, status: status, detail: detail });
    }
    filesData = results;
    renderFiles(results);
  }
  function renderFiles(results) {
    const tbody = $("#files-body");
    const okCount = results.filter(function (r) { return r.status === "ok"; }).length;
    let html = '<p class="card-sub">' + okCount + ' / ' + results.length + ' bestanden bereikbaar.</p>';
    html += '<table class="files"><thead><tr><th>Bestand</th><th>Status</th><th>Detail</th></tr></thead><tbody>';
    results.forEach(function (r) {
      html += '<tr>';
      html += '<td class="file">' + escapeHtml(r.file) + '</td>';
      html += '<td class="status"><span class="badge ' + (r.status === "ok" ? "ok" : "fail") + '">' + (r.status === "ok" ? "OK" : "FAIL") + '</span></td>';
      html += '<td class="detail">' + escapeHtml(r.detail) + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    tbody.innerHTML = html;
  }

  /* ---------- storage ---------- */
  let storageData = {};
  async function dumpStorage() {
    const container = $("#storage-body");
    if (!chrome || !chrome.storage) {
      storageData = { available: false, reason: "Geen storage-permissie in manifest (chrome.storage is undefined)." };
      container.innerHTML = '<div class="notice warn">chrome.storage is niet beschikbaar in deze build — de extensie vraagt geen <code>storage</code>-permissie. Dump overgeslagen.</div>';
      return storageData;
    }
    const areas = ["local", "sync", "session", "managed"];
    const result = { available: true, areas: {} };
    container.innerHTML = '<p class="card-sub">Bezig met lezen…</p>';
    let html = "";
    for (const area of areas) {
      if (!chrome.storage[area]) {
        result.areas[area] = { available: false };
        continue;
      }
      try {
        const values = await new Promise(function (resolve, reject) {
          try {
            chrome.storage[area].get(null, function (v) {
              if (chrome.runtime && chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
              resolve(v || {});
            });
          } catch (e) { reject(e); }
        });
        const keys = Object.keys(values || {});
        result.areas[area] = { available: true, keys: keys, values: values, count: keys.length };
        html += '<div class="storage-area">';
        html += '<h3>' + area + ' <span class="badge info">' + keys.length + ' keys</span></h3>';
        html += '<pre>' + escapeHtml(JSON.stringify(values, null, 2)) + '</pre>';
        html += '</div>';
      } catch (e) {
        result.areas[area] = { available: false, error: String(e && e.message ? e.message : e) };
        html += '<div class="storage-area"><h3>' + area + '</h3><div class="notice fail">' + escapeHtml(String(e)) + '</div></div>';
      }
    }
    if (!html) html = '<div class="notice info">Geen opslaggebieden beschikbaar.</div>';
    container.innerHTML = html;
    storageData = result;
    return result;
  }

  /* ---------- manifest raw ---------- */
  function renderManifestRaw() {
    const el = $("#manifest-raw");
    if (el) el.textContent = JSON.stringify(chrome.runtime.getManifest(), null, 2);
  }

  /* ---------- copy diagnostics ---------- */
  async function copyDiagnostics() {
    const payload = {
      timestamp: new Date().toISOString(),
      extension: statusData,
      mock: !!window.__EGD_MOCK__,
      files: filesData,
      storage: storageData,
      events: eventLog.slice(0, 50),
      page: { url: location.href, referrer: document.referrer, language: navigator.language },
      manifest: chrome.runtime.getManifest()
    };
    const text = JSON.stringify(payload, null, 2);
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { ok = false; }
    }
    const btn = $("#copy-btn");
    const original = btn.textContent;
    btn.textContent = ok ? "Gekopieerd ✓" : "Kopiëren mislukt";
    setTimeout(function () { btn.textContent = original; }, 1800);
    logEvent("diagnostics:copy", { ok: ok, bytes: text.length }, "console");
  }
  $("#copy-btn").addEventListener("click", copyDiagnostics);

  /* ---------- links ---------- */
  $("#copy-ext-url").addEventListener("click", async function () {
    const text = "chrome://extensions";
    try { if (navigator.clipboard) await navigator.clipboard.writeText(text); } catch (e) {}
    logEvent("link:copy", { url: text }, "console");
  });
  $("#open-options").addEventListener("click", function () {
    logEvent("hint", { msg: "Herlaad de extensie op chrome://extensions en refresh deze tab." }, "console");
    alert("Open chrome://extensions in je browser, klik op 🔄 bij Egodact en refresh daarna deze tab (Ctrl+Shift+R).");
  });

  /* ---------- refresh ---------- */
  async function refreshAll() {
    renderStatus();
    renderManifestRaw();
    await checkFiles();
    await dumpStorage();
    $("#foot-time").textContent = new Date().toLocaleTimeString("nl-NL");
  }
  $("#refresh-btn").addEventListener("click", refreshAll);

  /* ---------- helpers ---------- */
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- boot ---------- */
  refreshAll();
  setInterval(function () { $("#foot-time").textContent = new Date().toLocaleTimeString("nl-NL"); }, 1000);
})();
