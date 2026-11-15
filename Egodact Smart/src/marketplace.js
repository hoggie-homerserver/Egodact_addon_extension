// ============================================================
// EGODACT MARKETPLACE
// ============================================================
// Addon catalog that installs addons straight into the host
// extension. The actual file download + injection is handled by
// background.js (the addon injector service worker).
//
// On open, installed addons whose stored file list no longer
// matches the registry are updated automatically, so an outdated
// install never silently breaks.

(function () {
    'use strict';

    const REGISTRY_URL = 'https://raw.githubusercontent.com/hoggie-homerserver/Egodact_addon_marketplace/main/registry.json';
    const MARKETPLACE_SITE = 'https://hoggie-homerserver.github.io/Egodact_addon_marketplace/';
    const RAW_BRANCHES = ['main', 'master'];

    const ICON_CART = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    const ICON_PACKAGE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
    const ICON_WARN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    let cachedRegistry = null;
    let cacheTime = 0;
    const CACHE_MS = 5 * 60 * 1000;
    const installResults = {};
    const busyState = {};
    let activeModal = null;

    async function fetchRegistry() {
        if (cachedRegistry && (Date.now() - cacheTime) < CACHE_MS) return cachedRegistry;
        try {
            const res = await fetch(REGISTRY_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            cachedRegistry = await res.json();
            cacheTime = Date.now();
            return cachedRegistry;
        } catch (err) {
            console.warn('[Marketplace] Registry laden mislukt:', err);
            return cachedRegistry || { addons: [], categories: [] };
        }
    }

    function bgMessage(payload) {
        return new Promise(function (resolve) {
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
                resolve({ success: false, error: 'Geen chrome.runtime' });
                return;
            }
            chrome.runtime.sendMessage(payload, function (response) {
                if (chrome.runtime.lastError) {
                    resolve({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    resolve(response || {});
                }
            });
        });
    }

    function rawBaseFor(repo, branch) {
        const match = String(repo || '').match(/^https?:\/\/github\.com\/([^\/#?]+)\/([^\/#?]+)/i);
        if (!match) return null;
        const user = match[1];
        const name = match[2].replace(/\.git$/i, '');
        return 'https://raw.githubusercontent.com/' + user + '/' + name + '/' + branch + '/';
    }

    async function fetchAddonFile(repo, path, preferredBranch) {
        let lastError = null;
        const branches = [];
        // Addons can pin their branch in the registry (e.g. Tower Stack
        // still uses master); fall back to the defaults afterwards so a
        // stale branch value never blocks an install.
        if (preferredBranch) branches.push(preferredBranch);
        RAW_BRANCHES.forEach(function (branch) {
            if (branches.indexOf(branch) === -1) branches.push(branch);
        });
        for (const branch of branches) {
            const base = rawBaseFor(repo, branch);
            if (!base) return { ok: false, error: 'Ongeldige repo-URL: ' + repo };
            try {
                const res = await fetch(base + path, { cache: 'no-store' });
                if (res.ok) return { ok: true, text: await res.text(), branch: branch };
                lastError = 'HTTP ' + res.status + ' voor ' + path + ' (' + branch + ')';
            } catch (err) {
                lastError = err.message + ' (' + path + ')';
            }
        }
        return { ok: false, error: lastError || ('Kon ' + path + ' niet laden') };
    }

    function styleButton(button, variant) {
        const base = {
            padding: '6px 14px', borderRadius: '4px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '12px', fontFamily: 'inherit'
        };
        if (variant === 'primary') {
            Object.assign(button.style, base, { border: 'none', background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)' });
        } else if (variant === 'done') {
            Object.assign(button.style, base, { border: 'none', background: '#2e7d32', color: '#fff' });
        } else if (variant === 'danger') {
            Object.assign(button.style, base, { border: '1px solid #c62828', background: 'transparent', color: '#ef5350' });
        } else {
            Object.assign(button.style, base, { border: '1px solid var(--egd-rand)', background: 'var(--egd-veld)', color: 'var(--egd-tekst)' });
        }
    }

    function openMarketplace(event) {
        if (event) {
            if (typeof event.preventDefault === 'function') event.preventDefault();
            if (typeof event.stopPropagation === 'function') event.stopPropagation();
        }

        const existing = document.getElementById('egodact-marketplace-backdrop');
        if (existing) existing.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'egodact-marketplace-backdrop';
        Object.assign(backdrop.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: 'var(--egd-backdrop, rgba(0,0,0,0.65))', zIndex: '9999999',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Arial, sans-serif', overflow: 'auto', padding: '16px 0'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: 'var(--egd-modal, #424242)', color: 'var(--egd-tekst, #fff)',
            width: 'min(720px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)',
            boxSizing: 'border-box', overflow: 'auto', borderRadius: '6px',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: 'var(--egd-schaduw, 0 4px 12px rgba(0,0,0,.3))'
        });

        const header = document.createElement('div');
        Object.assign(header.style, { display: 'flex', alignItems: 'center', gap: '12px' });

        const title = document.createElement('h2');
        title.innerHTML = ICON_CART + '<span>Addon Marketplace</span>';
        title.style.cssText = 'margin:0;font-size:20px;flex:1;display:flex;align-items:center;gap:8px;font-weight:600;';

        const devBtn = document.createElement('button');
        devBtn.type = 'button';
        devBtn.textContent = 'Ontwikkelaar';
        devBtn.title = 'Addon aanmelden / publiceren op de marketplace';
        styleButton(devBtn, 'ghost');
        devBtn.addEventListener('click', function () {
            try { window.open(MARKETPLACE_SITE + '#developer', '_blank', 'noopener'); } catch (e) {}
        });

        const diagnoseBtn = document.createElement('button');
        diagnoseBtn.type = 'button';
        diagnoseBtn.textContent = 'Diagnose';
        styleButton(diagnoseBtn, 'ghost');
        diagnoseBtn.addEventListener('click', function () { openDiagnose(); });

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = 'Sluiten';
        styleButton(closeBtn, 'primary');
        closeBtn.addEventListener('click', function () { backdrop.remove(); activeModal = null; });

        header.append(title, devBtn, diagnoseBtn, closeBtn);
        modal.appendChild(header);

        const banner = document.createElement('div');
        banner.style.display = 'none';
        modal.appendChild(banner);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Zoek addons...';
        Object.assign(searchInput.style, {
            boxSizing: 'border-box', width: '100%', padding: '8px 12px',
            border: '1px solid var(--egd-rand, #555)', borderRadius: '4px',
            background: 'var(--egd-veld, #383838)', color: 'var(--egd-tekst, #fff)',
            fontSize: '13px', fontFamily: 'inherit'
        });
        modal.appendChild(searchInput);

        const catWrap = document.createElement('div');
        Object.assign(catWrap.style, { display: 'flex', gap: '6px', flexWrap: 'wrap' });
        modal.appendChild(catWrap);

        const listContainer = document.createElement('div');
        Object.assign(listContainer.style, { display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '180px' });

        const loading = document.createElement('div');
        loading.textContent = 'Addons laden...';
        loading.style.cssText = 'padding:20px;text-align:center;color:var(--egd-tekst-zacht, #b0b0b0);';
        listContainer.appendChild(loading);
        modal.appendChild(listContainer);

        const footer = document.createElement('div');
        Object.assign(footer.style, { fontSize: '11px', color: 'var(--egd-tekst-zacht, #b0b0b0)', textAlign: 'center', borderTop: '1px solid var(--egd-rand, #555)', paddingTop: '12px', lineHeight: '1.6' });
        footer.innerHTML = 'Addons worden gevalideerd door de maintainer. <a href="' + MARKETPLACE_SITE + '" target="_blank" rel="noopener" style="color:var(--egd-accent);">Bekijk marketplace</a>' +
            ' &middot; <a href="' + MARKETPLACE_SITE + '#developer" target="_blank" rel="noopener" style="color:var(--egd-accent);font-weight:bold;">Addon aanmelden / publiceren (ontwikkelaars)</a>';
        modal.appendChild(footer);

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', function (event) { if (event.target === backdrop) backdrop.remove(); });

        activeModal = { render: function () { return renderAddons(); } };

        let allAddons = [];
        let activeCategory = 'all';
        let installedMap = {};

        function showBanner() {
            bgMessage({ type: 'injector:capabilities' }).then(function (caps) {
                if (caps && caps.userScripts) {
                    banner.style.display = 'none';
                    return;
                }
                banner.style.display = 'flex';
                Object.assign(banner.style, {
                    alignItems: 'flex-start', gap: '10px', padding: '12px',
                    background: 'rgba(198,40,40,0.15)', border: '1px solid #c62828',
                    borderRadius: '6px', fontSize: '12px', lineHeight: '1.5'
                });
                banner.innerHTML = '<span style="color:#ef5350;flex-shrink:0;margin-top:1px;">' + ICON_WARN + '</span>' +
                    '<span><strong>Gebruikersscripts staan uit.</strong> Addons kunnen dan niet worden uitgevoerd. ' +
                    'Open <code>chrome://extensions</code>, klik bij deze extensie op <em>Details</em> en zet ' +
                    '<strong>Gebruikersscripts toestaan</strong> aan. Herlaad daarna deze pagina.</span>';
            });
        }

        async function refreshInstalled() {
            const map = {};
            await Promise.all(allAddons.map(function (addon) {
                return bgMessage({ type: 'injector:isInstalled', addonId: addon.id }).then(function (res) {
                    map[addon.id] = res && res.installed ? res : null;
                });
            }));
            installedMap = map;
        }

        function isOutdated(addon) {
            const record = installedMap[addon.id];
            if (!record) return false;
            const expected = (addon.files || []).length;
            if (!expected) return false;
            return record.version !== addon.version || (record.fileCount || 0) !== expected;
        }

        async function loadAddons() {
            const registry = await fetchRegistry();
            allAddons = (registry && registry.addons) || [];
            renderCategories((registry && registry.categories) || []);
            await refreshInstalled();
            await renderAddons();

            // Repair installs that were made with an older registry.
            for (const addon of allAddons) {
                if (isOutdated(addon)) {
                    await installAddon(addon, 'bijwerken');
                }
            }
        }

        function renderCategories(categories) {
            catWrap.innerHTML = '';
            const makeButton = function (id, label) {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = label;
                Object.assign(button.style, {
                    padding: '4px 10px', border: '1px solid var(--egd-rand, #555)', borderRadius: '4px',
                    background: activeCategory === id ? 'var(--egd-accent)' : 'var(--egd-veld, #383838)',
                    color: activeCategory === id ? 'var(--egd-accent-tekst, #0d47a1)' : 'var(--egd-tekst, #fff)',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', fontFamily: 'inherit'
                });
                button.addEventListener('click', function () {
                    activeCategory = id;
                    renderCategories(categories);
                    renderAddons();
                });
                catWrap.appendChild(button);
            };
            makeButton('all', 'Alle');
            categories.forEach(function (category) { makeButton(category.id, category.name || category.id); });
        }

        async function renderAddons() {
            const query = searchInput.value.trim().toLowerCase();
            let filtered = allAddons.slice();
            if (activeCategory !== 'all') {
                filtered = filtered.filter(function (addon) { return addon.category === activeCategory; });
            }
            if (query) {
                filtered = filtered.filter(function (addon) {
                    const haystack = [
                        addon.name || '', addon.description || '', (addon.tags || []).join(' ')
                    ].join(' ').toLowerCase();
                    return haystack.indexOf(query) !== -1;
                });
            }

            listContainer.innerHTML = '';
            if (!filtered.length) {
                const empty = document.createElement('div');
                empty.textContent = 'Geen addons gevonden.';
                empty.style.cssText = 'padding:20px;text-align:center;color:var(--egd-tekst-zacht, #b0b0b0);';
                listContainer.appendChild(empty);
                return;
            }

            filtered.forEach(function (addon) {
                listContainer.appendChild(buildCard(addon));
            });
        }

        function buildCard(addon) {
            const record = installedMap[addon.id];
            const isInstalled = !!(record && record.installed);
            const outdated = isOutdated(addon);
            const busy = busyState[addon.id];

            const card = document.createElement('div');
            Object.assign(card.style, {
                background: 'var(--egd-veld, #383838)', border: '1px solid var(--egd-rand, #555)',
                borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px'
            });

            const top = document.createElement('div');
            Object.assign(top.style, { display: 'flex', alignItems: 'center', gap: '10px' });

            const icon = document.createElement('div');
            icon.style.cssText = 'width:40px;height:40px;border-radius:8px;background:var(--egd-paneel, #2f2f2f);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--egd-tekst-zacht, #b0b0b0);';
            icon.innerHTML = ICON_PACKAGE;
            top.appendChild(icon);

            const info = document.createElement('div');
            Object.assign(info.style, { flex: '1', minWidth: '0' });
            const name = document.createElement('div');
            name.textContent = addon.name + ' v' + addon.version;
            name.style.cssText = 'font-weight:bold;font-size:14px;';
            info.appendChild(name);
            const author = document.createElement('div');
            author.textContent = 'door ' + (addon.author || 'Onbekend');
            author.style.cssText = 'font-size:11px;color:var(--egd-tekst-zacht, #b0b0b0);';
            info.appendChild(author);
            top.appendChild(info);

            if (addon.verified) {
                const badge = document.createElement('span');
                badge.textContent = 'Official';
                badge.style.cssText = 'font-size:10px;padding:2px 8px;border-radius:4px;background:#2e7d32;color:#fff;font-weight:bold;';
                top.appendChild(badge);
            }
            card.appendChild(top);

            const description = document.createElement('div');
            description.textContent = addon.description || '';
            description.style.cssText = 'font-size:12px;color:var(--egd-tekst-zacht, #b0b0b0);line-height:1.5;';
            card.appendChild(description);

            if (addon.tags && addon.tags.length) {
                const tagsWrap = document.createElement('div');
                Object.assign(tagsWrap.style, { display: 'flex', gap: '6px', flexWrap: 'wrap' });
                addon.tags.forEach(function (tagText) {
                    const tag = document.createElement('span');
                    tag.textContent = tagText;
                    tag.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:4px;background:var(--egd-paneel, #2f2f2f);color:var(--egd-tekst-zacht, #b0b0b0);';
                    tagsWrap.appendChild(tag);
                });
                card.appendChild(tagsWrap);
            }

            const actions = document.createElement('div');
            Object.assign(actions.style, { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' });

            const installBtn = document.createElement('button');
            installBtn.type = 'button';
            let label = 'Installeren';
            let variant = 'primary';
            let disabled = false;
            if (busy) {
                label = busy.label;
                disabled = true;
                variant = 'ghost';
            } else if (outdated) {
                label = 'Bijwerken';
            } else if (isInstalled) {
                label = 'Geinstalleerd';
                variant = 'done';
                disabled = true;
            }
            installBtn.textContent = label;
            styleButton(installBtn, variant);
            installBtn.disabled = disabled;
            if (!disabled) {
                installBtn.addEventListener('click', function () { installAddon(addon, 'installeren'); });
            }
            actions.appendChild(installBtn);

            if (isInstalled && !busy) {
                const uninstallBtn = document.createElement('button');
                uninstallBtn.type = 'button';
                uninstallBtn.textContent = 'Verwijderen';
                styleButton(uninstallBtn, 'danger');
                uninstallBtn.addEventListener('click', function () {
                    uninstallAddon(addon.id);
                });
                actions.appendChild(uninstallBtn);
            }

            if (addon.repo) {
                const link = document.createElement('a');
                link.href = addon.repo;
                link.target = '_blank';
                link.rel = 'noopener';
                link.textContent = 'Broncode';
                link.style.cssText = 'font-size:11px;color:var(--egd-accent);text-decoration:none;';
                actions.appendChild(link);
            }
            card.appendChild(actions);

            const result = installResults[addon.id];
            if (result) {
                const message = document.createElement('div');
                message.style.cssText = 'font-size:11px;line-height:1.5;padding:8px;border-radius:4px;';
                if (result.ok) {
                    message.textContent = 'Addon is geladen en actief.';
                    message.style.background = 'rgba(46,125,50,0.18)';
                    message.style.color = '#81c784';
                } else {
                    message.textContent = 'Laden mislukt: ' + (result.error || 'onbekende fout');
                    message.style.background = 'rgba(198,40,40,0.15)';
                    message.style.color = '#ef5350';
                }
                card.appendChild(message);
            }

            return card;
        }

        async function installAddon(addon, mode) {
            if (busyState[addon.id]) return;
            const order = (addon.files || []).slice();
            const verb = mode === 'bijwerken' ? 'Bijwerken' : 'Installeren';

            busyState[addon.id] = { label: verb + '...' };
            delete installResults[addon.id];
            await renderAddons();

            try {
                if (!order.length) throw new Error('Registry bevat geen bestanden voor deze addon');
                if (!rawBaseFor(addon.repo, 'main')) throw new Error('Ongeldige repo-URL in registry');

                const files = {};
                for (let index = 0; index < order.length; index++) {
                    const path = order[index];
                    busyState[addon.id] = { label: verb + '... (' + (index + 1) + '/' + order.length + ')' };
                    await renderAddons();
                    const loaded = await fetchAddonFile(addon.repo, path, addon.branch);
                    if (!loaded.ok) throw new Error(loaded.error);
                    files[path] = loaded.text;
                }

                busyState[addon.id] = { label: 'Injecteren...' };
                await renderAddons();

                const response = await bgMessage({
                    type: 'injector:install',
                    addonData: {
                        id: addon.id,
                        name: addon.name,
                        version: addon.version,
                        order: order,
                        files: files,
                        force: mode === 'bijwerken'
                    }
                });

                if (!response || !response.success) {
                    throw new Error((response && response.error) || 'Installatie mislukt');
                }

                const results = response.results || [];
                const failed = results.filter(function (r) { return r && r.ok === false; });
                if (failed.length) {
                    throw new Error(failed[0].error || 'Injectie mislukt');
                }
                if (!results.length) {
                    throw new Error('Addon opgeslagen, maar geen geopende Egodact-tab gevonden om in te laden. Herlaad de pagina.');
                }

                installResults[addon.id] = { ok: true };
            } catch (err) {
                installResults[addon.id] = { ok: false, error: err.message || String(err) };
                console.error('[Marketplace] ' + verb + ' mislukt:', err);
            } finally {
                delete busyState[addon.id];
            }

            await refreshInstalled();
            await renderAddons();
        }

        async function uninstallAddon(addonId) {
            busyState[addonId] = { label: 'Verwijderen...' };
            await renderAddons();
            try {
                const response = await bgMessage({ type: 'injector:uninstall', addonId: addonId });
                if (!response || !response.success) {
                    throw new Error((response && response.error) || 'Verwijderen mislukt');
                }
                delete installResults[addonId];
            } catch (err) {
                installResults[addonId] = { ok: false, error: err.message || String(err) };
            } finally {
                delete busyState[addonId];
            }
            await refreshInstalled();
            await renderAddons();
        }

        function openDiagnose() {
            bgMessage({ type: 'injector:diagnose' }).then(function (report) {
                const previous = document.getElementById('egodact-marketplace-diagnose');
                if (previous) previous.remove();

                const overlay = document.createElement('div');
                overlay.id = 'egodact-marketplace-diagnose';
                Object.assign(overlay.style, {
                    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                    backgroundColor: 'var(--egd-backdrop, rgba(0,0,0,0.65))', zIndex: '10000000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
                });

                const panel = document.createElement('div');
                Object.assign(panel.style, {
                    backgroundColor: 'var(--egd-modal, #424242)', color: 'var(--egd-tekst, #fff)',
                    width: 'min(760px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)',
                    borderRadius: '6px', padding: '20px', display: 'flex',
                    flexDirection: 'column', gap: '12px', boxSizing: 'border-box'
                });

                const panelHeader = document.createElement('div');
                Object.assign(panelHeader.style, { display: 'flex', alignItems: 'center', gap: '10px' });
                const panelTitle = document.createElement('h3');
                panelTitle.textContent = 'Injectie-diagnose';
                panelTitle.style.cssText = 'margin:0;font-size:16px;flex:1;';

                const copyBtn = document.createElement('button');
                copyBtn.type = 'button';
                copyBtn.textContent = 'Kopieer';
                styleButton(copyBtn, 'ghost');

                const closePanel = document.createElement('button');
                closePanel.type = 'button';
                closePanel.textContent = 'Sluiten';
                styleButton(closePanel, 'primary');
                closePanel.addEventListener('click', function () { overlay.remove(); });

                panelHeader.append(panelTitle, copyBtn, closePanel);
                panel.appendChild(panelHeader);

                const pre = document.createElement('pre');
                const text = JSON.stringify(report, null, 2);
                pre.textContent = text;
                pre.style.cssText = 'margin:0;padding:12px;background:var(--egd-veld, #383838);border:1px solid var(--egd-rand, #555);border-radius:4px;font-size:11px;line-height:1.5;overflow:auto;max-height:calc(100vh - 220px);white-space:pre-wrap;word-break:break-word;';
                panel.appendChild(pre);

                copyBtn.addEventListener('click', function () {
                    try {
                        navigator.clipboard.writeText(text).then(function () {
                            copyBtn.textContent = 'Gekopieerd';
                        }).catch(function () { copyBtn.textContent = 'Kopieer mislukt'; });
                    } catch (err) {
                        copyBtn.textContent = 'Kopieer mislukt';
                    }
                });

                overlay.appendChild(panel);
                overlay.addEventListener('click', function (event) { if (event.target === overlay) overlay.remove(); });
                document.body.appendChild(overlay);
            });
        }

        searchInput.addEventListener('input', function () { renderAddons(); });
        showBanner();
        loadAddons().catch(function (err) { console.error('[Marketplace] Laden mislukt:', err); });
    }

    window.EgodactMarketplace = {
        open: openMarketplace,
        fetchRegistry: fetchRegistry
    };

    if (window.EgodactAddons && typeof window.EgodactAddons.registerHamburger === 'function') {
        window.EgodactAddons.registerHamburger({
            id: 'egodact-marketplace',
            addonId: null,
            title: 'Marketplace',
            icon: ICON_CART,
            order: 99,
            keepInLearningMode: true,
            open: openMarketplace
        });
    }

    if (window.EgodactAddons && typeof window.EgodactAddons.registerMenu === 'function') {
        window.EgodactAddons.registerMenu({
            id: 'egodact-marketplace-menu',
            addonId: null,
            title: 'Addon Marketplace',
            icon: ICON_CART,
            open: openMarketplace
        });
    }
})();
