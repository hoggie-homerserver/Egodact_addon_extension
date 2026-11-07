// ============================================================
// ADDON INSTALLER (easy install)
// ============================================================
// Laat gebruikers een addon toevoegen via een lokale map (upload)
// of een GitHub-link. De addon wordt in de browser als echte
// extensie geladen (uitgepakt); deze helper bewaart de metadata
// en toont de installatiestappen. Toggles werken daarna via het
// bestaande Addons-menu.

(function () {
    'use strict';

    const STORAGE_KEY = 'egodact_installed_addons';

    function getInstalled() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (err) { return []; }
    }

    function saveInstalled(list) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list || [])); } catch (err) {}
    }

    function slugify(text) {
        return String(text || 'addon').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'addon';
    }

    function findFile(filesMap, name) {
        const keys = Object.keys(filesMap || {});
        // exact
        if (filesMap[name]) return filesMap[name];
        // basename match
        const candidates = keys.filter(k => k === name || k.endsWith('/' + name) || k.endsWith('\\' + name));
        if (candidates.length) return filesMap[candidates[0]];
        return null;
    }

    function parseManifest(filesMap) {
        const text = findFile(filesMap, 'manifest.json');
        if (!text) throw new Error('manifest.json niet gevonden in deze map.');
        let manifest;
        try { manifest = JSON.parse(text); } catch (err) { throw new Error('manifest.json is geen geldige JSON.'); }
        if (!manifest || !manifest.name) throw new Error('manifest.json mist een "name".');
        const entryFiles = [];
        try {
            (manifest.content_scripts || []).forEach(cs => {
                (cs.js || []).forEach(f => { if (entryFiles.indexOf(f) === -1) entryFiles.push(f); });
            });
        } catch (err) {}
        if (!entryFiles.length) entryFiles.push('content.js');
        return { manifest, entryFiles };
    }

    function installFromFiles(filesMap, source, url) {
        let manifest, entryFiles;
        try {
            const parsed = parseManifest(filesMap);
            manifest = parsed.manifest;
            entryFiles = parsed.entryFiles;
        } catch (err) {
            return { ok: false, error: err.message };
        }
        const baseId = slugify(manifest.name);
        const list = getInstalled();
        let id = baseId;
        let n = 2;
        while (list.some(a => a.id === id)) { id = baseId + '-' + n; n++; }
        const addon = {
            id: id,
            name: manifest.name,
            version: manifest.version || '1.0.0',
            description: manifest.description || '',
            author: (manifest.author) || '',
            source: source || 'upload',
            url: url || '',
            entryFiles: entryFiles,
            files: {},
            enabled: true,
            installedAt: Date.now()
        };
        // store entry file contents (best effort)
        entryFiles.forEach(f => {
            const c = findFile(filesMap, f);
            if (c !== null) addon.files[f] = c;
        });
        // also store manifest
        const mtext = findFile(filesMap, 'manifest.json');
        if (mtext !== null) addon.files['manifest.json'] = mtext;

        list.push(addon);
        saveInstalled(list);
        return { ok: true, addon: addon };
    }

    // GitHub helpers
    function parseGitHubUrl(url) {
        url = String(url || '').trim();
        const m = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)(?:\/(.*))?)?/i);
        if (!m) return null;
        let branch = m[3] || 'main';
        let path = (m[4] || '').replace(/\/+$/, '');
        // strip trailing file
        if (path && path.toLowerCase().endsWith('manifest.json')) {
            path = path.replace(/\/manifest\.json$/i, '');
        }
        return { user: m[1], repo: m[2].replace(/\.git$/i, ''), branch: branch, path: path };
    }

    async function fetchText(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status + ' bij ' + url);
        return await res.text();
    }

    async function installFromGitHub(url) {
        const info = parseGitHubUrl(url);
        if (!info) return { ok: false, error: 'Ongeldige GitHub-URL.' };
        const branchesToTry = [info.branch];
        if (info.branch === 'main') branchesToTry.push('master');
        let lastErr = null;
        for (const br of branchesToTry) {
            try {
                const base = 'https://raw.githubusercontent.com/' + info.user + '/' + info.repo + '/' + br + '/' + (info.path ? info.path + '/' : '');
                const manifestText = await fetchText(base + 'manifest.json');
                const filesMap = { 'manifest.json': manifestText };
                const manifest = JSON.parse(manifestText);
                const entryFiles = [];
                try {
                    (manifest.content_scripts || []).forEach(cs => (cs.js || []).forEach(f => { if (entryFiles.indexOf(f) === -1) entryFiles.push(f); }));
                } catch (err) {}
                if (!entryFiles.length) entryFiles.push('content.js');
                // fetch entry files
                await Promise.all(entryFiles.map(async (f) => {
                    try { filesMap[f] = await fetchText(base + f); } catch (err) { /* ignore */ }
                }));
                const result = installFromFiles(filesMap, 'github', url);
                if (result.ok) {
                    result.addon._github = { user: info.user, repo: info.repo, branch: br, path: info.path };
                    // persist the _github marker too
                    const list = getInstalled();
                    const idx = list.findIndex(a => a.id === result.addon.id);
                    if (idx !== -1) { list[idx] = result.addon; saveInstalled(list); }
                    return result;
                }
                return result;
            } catch (err) {
                lastErr = err;
            }
        }
        return { ok: false, error: (lastErr && lastErr.message) || 'Ophalen mislukt.' };
    }

    function uninstallAddon(id) {
        const list = getInstalled().filter(a => a.id !== id);
        saveInstalled(list);
        // also remove from disabled list
        try {
            const raw = localStorage.getItem('egodact_disabled_addons');
            const arr = raw ? JSON.parse(raw) : [];
            if (Array.isArray(arr)) {
                const idx = arr.indexOf(id);
                if (idx !== -1) { arr.splice(idx, 1); localStorage.setItem('egodact_disabled_addons', JSON.stringify(arr)); }
            }
        } catch (err) {}
    }

    function setEnabled(id, enabled) {
        const list = getInstalled();
        const addon = list.find(a => a.id === id);
        if (addon) { addon.enabled = !!enabled; saveInstalled(list); }
        // sync with host disabled list (uses addon id)
        try {
            const raw = localStorage.getItem('egodact_disabled_addons');
            let arr = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(arr)) arr = [];
            const idx = arr.indexOf(id);
            if (enabled) { if (idx !== -1) arr.splice(idx, 1); }
            else { if (idx === -1) arr.push(id); }
            localStorage.setItem('egodact_disabled_addons', JSON.stringify(arr));
        } catch (err) {}
    }

    function isEnabled(id) {
        const addon = getInstalled().find(a => a.id === id);
        if (addon) return addon.enabled !== false;
        // fallback to host disabled list
        try {
            const raw = localStorage.getItem('egodact_disabled_addons');
            const arr = raw ? JSON.parse(raw) : [];
            return !(Array.isArray(arr) && arr.indexOf(id) !== -1);
        } catch (err) { return true; }
    }

    // ---------- UI ----------

    function maakModal(titel, bodyNode, opties) {
        opties = opties || {};
        const bestaand = document.getElementById('egodact-custom-modal-backdrop');
        if (bestaand) bestaand.remove();
        const backdrop = document.createElement('div');
        backdrop.id = 'egodact-custom-modal-backdrop';
        Object.assign(backdrop.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: 'var(--egd-backdrop)', zIndex: '9999999', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif'
        });
        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: 'var(--egd-modal)', color: 'var(--egd-tekst)',
            width: 'min(620px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)',
            boxSizing: 'border-box', overflow: 'hidden', borderRadius: '6px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--egd-schaduw)'
        });
        const header = document.createElement('div');
        header.style.cssText = 'display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--egd-rand); padding-bottom:10px;';
        const h = document.createElement('h2');
        h.textContent = titel;
        h.style.cssText = 'margin:0; font-size:22px; font-weight:500;';
        const sluitBtn = document.createElement('button');
        sluitBtn.type = 'button';
        sluitBtn.textContent = 'Sluiten';
        Object.assign(sluitBtn.style, { backgroundColor: 'var(--egd-accent)', border: 'none', color: 'var(--egd-accent-tekst)', cursor: 'pointer', padding: '8px 14px', fontWeight: 'bold', fontSize: '13px', borderRadius: '4px' });
        sluitBtn.addEventListener('click', () => backdrop.remove());
        header.append(h, sluitBtn);
        modal.appendChild(header);
        const body = document.createElement('div');
        body.style.cssText = 'overflow-y:auto; min-height:0; max-height:calc(100vh - 190px); padding-right:4px; display:flex; flex-direction:column; gap:14px;';
        if (bodyNode) body.appendChild(bodyNode);
        modal.appendChild(body);
        backdrop.appendChild(modal);
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
        document.body.appendChild(backdrop);
        return { backdrop, modal, body };
    }

    function toonStappen(addon, source) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:10px;';
        const ok = document.createElement('div');
        ok.style.cssText = 'padding:12px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:6px;';
        ok.innerHTML = '<strong style="font-size:15px;">' + escapeHtml(addon.name) + '</strong> <span style="font-size:12px; color:var(--egd-tekst-zacht);">v' + escapeHtml(addon.version) + '</span><div style="font-size:13px; color:var(--egd-tekst-zacht); margin-top:4px;">Opgeslagen in de host. Om de addon echt te draaien, laad je hem als uitgepakte extensie in je browser.</div>';
        wrap.appendChild(ok);

        const stappen = document.createElement('div');
        stappen.style.cssText = 'padding:12px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:6px; font-size:13px; line-height:1.6;';
        if (source === 'upload') {
            stappen.innerHTML = '<strong>Volgende stappen (Chrome/Edge):</strong><ol style="margin:6px 0 0 18px; padding:0;"><li>Open <code>chrome://extensions</code> (of <code>edge://extensions</code>).</li><li>Zet <em>Ontwikkelaarsmodus</em> aan (rechtsboven).</li><li>Klik <em>Uitgepakte extensie laden</em>.</li><li>Selecteer de map die je zojuist hebt geüpload.</li><li>Herlaad <code>app.egodact.com</code>. De addon verschijnt in het Addons-menu met toggle.</li></ol>';
        } else {
            stappen.innerHTML = '<strong>Volgende stappen:</strong><ol style="margin:6px 0 0 18px; padding:0;"><li>Download/clone de repository naar je computer.</li><li>Open <code>chrome://extensions</code> en zet <em>Ontwikkelaarsmodus</em> aan.</li><li>Klik <em>Uitgepakte extensie laden</em> en selecteer de addon-map.</li><li>Herlaad <code>app.egodact.com</code>.</li></ol>';
        }
        wrap.appendChild(stappen);

        // download manifest/files as a single JSON bundle (best effort)
        const dl = document.createElement('button');
        dl.type = 'button';
        dl.textContent = 'Download bundle (.json)';
        Object.assign(dl.style, { padding: '8px 12px', border: '1px solid var(--egd-rand)', borderRadius: '4px', background: 'transparent', color: 'var(--egd-tekst)', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start' });
        dl.addEventListener('click', () => {
            try {
                const blob = new Blob([JSON.stringify(addon, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = addon.id + '.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (err) {}
        });
        wrap.appendChild(dl);
        return wrap;
    }

    function escapeHtml(tekst) {
        return String(tekst == null ? '' : tekst)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function openInstallModal() {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:14px;';

        // --- Upload folder ---
        const uploadSectie = document.createElement('div');
        uploadSectie.style.cssText = 'padding:12px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:6px; display:flex; flex-direction:column; gap:8px;';
        const uploadTitel = document.createElement('strong');
        uploadTitel.textContent = 'Upload een map';
        uploadTitel.style.fontSize = '14px';
        uploadSectie.appendChild(uploadTitel);
        const uploadHint = document.createElement('div');
        uploadHint.textContent = 'Selecteer de addon-map (met manifest.json).';
        uploadHint.style.cssText = 'font-size:12px; color:var(--egd-tekst-zacht);';
        uploadSectie.appendChild(uploadHint);
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.setAttribute('webkitdirectory', '');
        fileInput.setAttribute('directory', '');
        fileInput.multiple = true;
        fileInput.style.cssText = 'font-size:13px;';
        uploadSectie.appendChild(fileInput);
        const uploadBtn = document.createElement('button');
        uploadBtn.type = 'button';
        uploadBtn.textContent = 'Installeren vanuit map';
        Object.assign(uploadBtn.style, { padding: '8px 12px', border: 'none', borderRadius: '4px', background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start' });
        uploadSectie.appendChild(uploadBtn);
        wrap.appendChild(uploadSectie);

        uploadBtn.addEventListener('click', async () => {
            if (!fileInput.files || !fileInput.files.length) {
                alert('Selecteer eerst een map.');
                return;
            }
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Bezig...';
            try {
                const files = Array.from(fileInput.files);
                const map = {};
                await new Promise((resolve) => {
                    let pending = files.length;
                    files.forEach(f => {
                        const r = new FileReader();
                        r.onload = () => {
                            map[f.webkitRelativePath || f.name] = r.result;
                            if (--pending === 0) resolve();
                        };
                        r.onerror = () => { if (--pending === 0) resolve(); };
                        r.readAsText(f);
                    });
                });
                const res = installFromFiles(map, 'upload', '');
                if (!res.ok) { alert(res.error); return; }
                // show steps
                const { backdrop, body } = maakModal('Addon geïnstalleerd', null);
                // replace body content
                body.innerHTML = '';
                body.appendChild(toonStappen(res.addon, 'upload'));
                // remove previous backdrop? maakModal already removed old; but we are inside old backdrop. Close old by removing.
                const old = document.getElementById('egodact-custom-modal-backdrop');
                // careful: maakModal created new backdrop with same id after removing old? It removed old first. So current old reference gone.
            } catch (err) {
                alert('Fout bij upload: ' + (err && err.message));
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Installeren vanuit map';
            }
        });

        // --- GitHub ---
        const ghSectie = document.createElement('div');
        ghSectie.style.cssText = 'padding:12px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:6px; display:flex; flex-direction:column; gap:8px;';
        const ghTitel = document.createElement('strong');
        ghTitel.textContent = 'Vanaf een GitHub-link';
        ghTitel.style.fontSize = '14px';
        ghSectie.appendChild(ghTitel);
        const ghHint = document.createElement('div');
        ghHint.textContent = 'Plak een link naar de addon-map (bijv. https://github.com/user/repo/tree/main/addon).';
        ghHint.style.cssText = 'font-size:12px; color:var(--egd-tekst-zacht);';
        ghSectie.appendChild(ghHint);
        const ghInput = document.createElement('input');
        ghInput.type = 'text';
        ghInput.placeholder = 'https://github.com/...';
        ghInput.style.cssText = 'box-sizing:border-box; width:100%; padding:8px; border:1px solid var(--egd-rand); border-radius:4px; background:var(--egd-modal); color:var(--egd-tekst); font:inherit; font-size:13px;';
        ghSectie.appendChild(ghInput);
        const ghBtn = document.createElement('button');
        ghBtn.type = 'button';
        ghBtn.textContent = 'Ophalen en installeren';
        Object.assign(ghBtn.style, { padding: '8px 12px', border: 'none', borderRadius: '4px', background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start' });
        ghSectie.appendChild(ghBtn);
        wrap.appendChild(ghSectie);

        ghBtn.addEventListener('click', async () => {
            const url = ghInput.value.trim();
            if (!url) { alert('Vul een GitHub-link in.'); return; }
            ghBtn.disabled = true;
            ghBtn.textContent = 'Bezig...';
            try {
                const res = await installFromGitHub(url);
                if (!res.ok) { alert(res.error || 'Ophalen mislukt.'); return; }
                const { body } = maakModal('Addon geïnstalleerd', null);
                body.innerHTML = '';
                body.appendChild(toonStappen(res.addon, 'github'));
            } catch (err) {
                alert('Fout: ' + (err && err.message));
            } finally {
                ghBtn.disabled = false;
                ghBtn.textContent = 'Ophalen en installeren';
            }
        });

        // --- Installed list ---
        const listSectie = document.createElement('div');
        listSectie.style.cssText = 'display:flex; flex-direction:column; gap:8px;';
        const listTitel = document.createElement('strong');
        listTitel.textContent = 'Geïnstalleerde addons';
        listTitel.style.fontSize = '14px';
        listSectie.appendChild(listTitel);
        const listBody = document.createElement('div');
        listBody.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
        listSectie.appendChild(listBody);

        function renderList() {
            listBody.innerHTML = '';
            const installed = getInstalled();
            if (!installed.length) {
                const leeg = document.createElement('div');
                leeg.textContent = 'Nog geen addons geïnstalleerd.';
                leeg.style.cssText = 'font-size:13px; color:var(--egd-tekst-zacht); padding:8px;';
                listBody.appendChild(leeg);
                return;
            }
            installed.forEach(addon => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 10px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:6px;';
                const info = document.createElement('div');
                info.innerHTML = '<strong style="font-size:13px;">' + escapeHtml(addon.name) + '</strong> <span style="font-size:11px; color:var(--egd-tekst-zacht);">v' + escapeHtml(addon.version) + '</span><div style="font-size:11px; color:var(--egd-tekst-zacht);">' + escapeHtml(addon.source) + '</div>';
                row.appendChild(info);
                const actions = document.createElement('div');
                actions.style.cssText = 'display:flex; align-items:center; gap:8px;';
                // toggle
                const toggleWrap = document.createElement('label');
                toggleWrap.style.cssText = 'position:relative;display:inline-block;width:40px;height:22px;cursor:pointer;';
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = addon.enabled !== false;
                cb.style.cssText = 'opacity:0;width:0;height:0;position:absolute;';
                const slider = document.createElement('span');
                Object.assign(slider.style, { position:'absolute', top:'0', left:'0', right:'0', bottom:'0', backgroundColor: (addon.enabled!==false)?'var(--egd-accent)':'var(--egd-uit)', borderRadius:'22px', transition:'background-color 150ms ease' });
                const knob = document.createElement('span');
                Object.assign(knob.style, { position:'absolute', top:'2px', left:(addon.enabled!==false)?'20px':'2px', width:'18px', height:'18px', borderRadius:'50%', backgroundColor:'#fff', transition:'left 150ms ease', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' });
                slider.appendChild(knob);
                toggleWrap.append(cb, slider);
                toggleWrap.addEventListener('click', (e) => {
                    e.preventDefault();
                    const nu = addon.enabled !== false;
                    setEnabled(addon.id, !nu);
                    addon.enabled = !nu;
                    renderList();
                });
                actions.appendChild(toggleWrap);
                // uninstall
                const del = document.createElement('button');
                del.type = 'button';
                del.textContent = '×';
                Object.assign(del.style, { padding:'2px 8px', border:'1px solid var(--egd-rand)', borderRadius:'4px', background:'transparent', color:'var(--egd-gevaar)', cursor:'pointer', fontSize:'14px' });
                del.addEventListener('click', () => {
                    if (!confirm('Addon "' + addon.name + '" verwijderen uit de lijst?')) return;
                    uninstallAddon(addon.id);
                    renderList();
                });
                actions.appendChild(del);
                row.appendChild(actions);
                listBody.appendChild(row);
            });
        }
        renderList();
        wrap.appendChild(listSectie);

        maakModal('Addon installeren', wrap);
    }

    // expose
    window.EgodactAddonInstaller = {
        getInstalled: getInstalled,
        installFromFiles: installFromFiles,
        installFromGitHub: installFromGitHub,
        uninstall: uninstallAddon,
        setEnabled: setEnabled,
        isEnabled: isEnabled,
        open: openInstallModal
    };

    // helper for addons-menu to include installed addons
    window.egodactGetInstalledAddons = getInstalled;
})();
