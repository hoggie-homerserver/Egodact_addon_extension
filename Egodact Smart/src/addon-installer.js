// ============================================================
// ADDON VALIDATOR (easy install guide)
// ============================================================
// Valideert een addon-map of GitHub-link (manifest + bestanden)
// en toont installatiestappen voor Chrome, Edge en Firefox.
// Er wordt NIETS "nep" toegevoegd aan de Addons-lijst; de addon
// draait pas als echte browser-extensie na handmatige installatie.

(function () {
    'use strict';

    function findFile(filesMap, name) {
        const keys = Object.keys(filesMap || {});
        if (filesMap[name]) return filesMap[name];
        const candidates = keys.filter(k => k === name || k.endsWith('/' + name) || k.endsWith('\\' + name));
        if (candidates.length) return filesMap[candidates[0]];
        return null;
    }

    function validateFiles(filesMap) {
        const manifestText = findFile(filesMap, 'manifest.json');
        if (!manifestText) return { ok: false, error: 'manifest.json niet gevonden in deze map.' };
        let manifest;
        try { manifest = JSON.parse(manifestText); }
        catch (err) { return { ok: false, error: 'manifest.json is geen geldige JSON.' }; }
        if (!manifest || !manifest.name) return { ok: false, error: 'manifest.json mist een "name".' };
        if (!manifest.manifest_version) return { ok: false, error: 'manifest.json mist "manifest_version".' };

        const entryFiles = [];
        try {
            (manifest.content_scripts || []).forEach(cs => {
                (cs.js || []).forEach(f => { if (entryFiles.indexOf(f) === -1) entryFiles.push(f); });
            });
        } catch (err) {}
        if (!entryFiles.length) entryFiles.push('content.js');

        const missing = entryFiles.filter(f => findFile(filesMap, f) === null);
        if (missing.length) {
            return { ok: false, error: 'Ontbrekende bestanden: ' + missing.join(', ') };
        }

        return {
            ok: true,
            addon: {
                name: manifest.name,
                version: manifest.version || '1.0.0',
                description: manifest.description || '',
                author: manifest.author || '',
                entryFiles: entryFiles
            }
        };
    }

    function parseGitHubUrl(url) {
        url = String(url || '').trim();
        const m = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)(?:\/(.*))?)?/i);
        if (!m) return null;
        let branch = m[3] || 'main';
        let path = (m[4] || '').replace(/\/+$/, '');
        if (path && path.toLowerCase().endsWith('manifest.json')) {
            path = path.replace(/\/manifest\.json$/i, '');
        }
        return { user: m[1], repo: m[2].replace(/\.git$/i, ''), branch: branch, path: path };
    }

    async function fetchText(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.text();
    }

    async function validateGitHub(url) {
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
                await Promise.all(entryFiles.map(async (f) => {
                    try { filesMap[f] = await fetchText(base + f); } catch (err) {}
                }));
                return validateFiles(filesMap);
            } catch (err) {
                lastErr = err;
            }
        }
        return { ok: false, error: (lastErr && lastErr.message) || 'Ophalen mislukt.' };
    }

    function escapeHtml(tekst) {
        return String(tekst == null ? '' : tekst)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function maakModal(titel, bodyNode) {
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

    function toonGids(addon) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:10px;';
        const ok = document.createElement('div');
        ok.style.cssText = 'padding:12px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:6px;';
        ok.innerHTML = '<strong style="font-size:15px;">✓ ' + escapeHtml(addon.name) + '</strong> <span style="font-size:12px; color:var(--egd-tekst-zacht);">v' + escapeHtml(addon.version) + '</span><div style="font-size:13px; color:var(--egd-tekst-zacht); margin-top:4px;">Validatie geslaagd: dit is een geldige Egodact-addon. De addon draait als echte browser-extensie; volg hieronder de stappen voor jouw browser.</div>';
        wrap.appendChild(ok);

        const tabs = document.createElement('div');
        tabs.style.cssText = 'display:flex; gap:6px; flex-wrap:wrap;';
        const inhoud = document.createElement('div');
        inhoud.style.cssText = 'padding:12px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:6px; font-size:13px; line-height:1.6; min-height:60px;';

        const guides = {
            Chrome: '<strong>Google Chrome</strong><ol style="margin:6px 0 0 18px; padding:0;"><li>Open <code>chrome://extensions</code>.</li><li>Zet rechtsboven <em>Ontwikkelaarsmodus</em> aan.</li><li>Klik <em>Uitgepakte extensie laden</em>.</li><li>Selecteer de addon-map (met manifest.json).</li><li>Herlaad <code>app.egodact.com</code>. De addon verschijnt in het Addons-menu met toggle.</li></ol>',
            Edge: '<strong>Microsoft Edge</strong><ol style="margin:6px 0 0 18px; padding:0;"><li>Open <code>edge://extensions</code>.</li><li>Zet links <em>Ontwikkelaarsmodus</em> aan.</li><li>Klik <em>Uitgepakte extensie laden</em>.</li><li>Selecteer de addon-map.</li><li>Herlaad <code>app.egodact.com</code>.</li></ol>',
            Firefox: '<strong>Mozilla Firefox</strong><ol style="margin:6px 0 0 18px; padding:0;"><li>Open <code>about:debugging#/runtime/this-firefox</code>.</li><li>Klik <em>Tijdelijke invoegtoepassing laden...</em>.</li><li>Selecteer het <code>manifest.json</code> in de addon-map.</li><li>Herlaad <code>app.egodact.com</code>. (Tijdelijk: verdwijnt bij herstart van Firefox.)</li></ol>'
        };

        let actief = 'Chrome';
        function renderGuide() { inhoud.innerHTML = guides[actief]; }

        Object.keys(guides).forEach(naam => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = naam;
            Object.assign(btn.style, { padding:'6px 12px', border:'1px solid var(--egd-rand)', borderRadius:'4px', background: naam===actief?'var(--egd-accent)':'transparent', color: naam===actief?'var(--egd-accent-tekst)':'var(--egd-tekst)', cursor:'pointer', fontSize:'12px', fontWeight:'bold' });
            btn.addEventListener('click', () => {
                actief = naam;
                tabs.querySelectorAll('button').forEach(b => {
                    const on = b.textContent === actief;
                    b.style.background = on ? 'var(--egd-accent)' : 'transparent';
                    b.style.color = on ? 'var(--egd-accent-tekst)' : 'var(--egd-tekst)';
                });
                renderGuide();
            });
            tabs.appendChild(btn);
        });
        renderGuide();

        wrap.appendChild(tabs);
        wrap.appendChild(inhoud);
        return wrap;
    }

    function openValidator() {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:14px;';

        // Upload
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
        fileInput.style.display = 'none';
        uploadSectie.appendChild(fileInput);

        const fileLabel = document.createElement('label');
        fileLabel.style.cssText = 'display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border:1px dashed var(--egd-accent); border-radius:6px; background:var(--egd-veld); color:var(--egd-tekst); cursor:pointer; font-size:13px; align-self:flex-start;';
        fileLabel.innerHTML = '<span style="font-size:18px;">\ud83d\udcc1</span><span id="egodact-file-label-text">Kies een map...</span>';
        fileLabel.addEventListener('click', function (e) { e.preventDefault(); fileInput.click(); });
        uploadSectie.appendChild(fileLabel);

        const validateBtn = document.createElement('button');
        validateBtn.type = 'button';
        validateBtn.textContent = 'Valideren';
        Object.assign(validateBtn.style, { padding: '10px 16px', border: 'none', borderRadius: '6px', background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start', boxShadow: '0px 2px 4px rgba(0,0,0,0.2)' });
        uploadSectie.appendChild(validateBtn);

        fileInput.addEventListener('change', function () {
            const txt = fileLabel.querySelector('#egodact-file-label-text');
            if (fileInput.files && fileInput.files.length) {
                const first = fileInput.files[0].webkitRelativePath || fileInput.files[0].name;
                const folder = (first.split('/')[0] || first.split('\\')[0]);
                txt.textContent = folder + ' (' + fileInput.files.length + ' bestanden)';
            } else {
                txt.textContent = 'Kies een map...';
            }
        });

        validateBtn.addEventListener('click', async function () {
            if (!fileInput.files || !fileInput.files.length) {
                alert('Selecteer eerst een map.');
                return;
            }
            validateBtn.disabled = true;
            validateBtn.textContent = 'Bezig...';
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
                const res = validateFiles(map);
                if (!res.ok) { alert(res.error); return; }
                const { body } = maakModal('Addon gevalideerd', null);
                body.innerHTML = '';
                body.appendChild(toonGids(res.addon));
            } catch (err) {
                alert('Fout bij upload: ' + (err && err.message));
            } finally {
                validateBtn.disabled = false;
                validateBtn.textContent = 'Valideren';
            }
        });

        wrap.appendChild(uploadSectie);

        // GitHub
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
        ghBtn.textContent = 'Valideren';
        Object.assign(ghBtn.style, { padding: '10px 16px', border: 'none', borderRadius: '6px', background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start', boxShadow: '0px 2px 4px rgba(0,0,0,0.2)' });
        ghSectie.appendChild(ghBtn);
        wrap.appendChild(ghSectie);

        ghBtn.addEventListener('click', async function () {
            const url = ghInput.value.trim();
            if (!url) { alert('Vul een GitHub-link in.'); return; }
            ghBtn.disabled = true;
            ghBtn.textContent = 'Bezig...';
            try {
                const res = await validateGitHub(url);
                if (!res.ok) { alert(res.error || 'Ophalen mislukt.'); return; }
                const { body } = maakModal('Addon gevalideerd', null);
                body.innerHTML = '';
                body.appendChild(toonGids(res.addon));
            } catch (err) {
                alert('Fout: ' + (err && err.message));
            } finally {
                ghBtn.disabled = false;
                ghBtn.textContent = 'Valideren';
            }
        });

        maakModal('Addon valideren', wrap);
    }

    window.EgodactAddonValidator = { open: openValidator, validateFiles: validateFiles, validateGitHub: validateGitHub };

    // backward compat
    window.EgodactAddonInstaller = window.EgodactAddonValidator;
})();
