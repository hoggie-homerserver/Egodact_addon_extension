// ============================================================
// EGODACT MARKETPLACE
// ============================================================

(function () {
    'use strict';

    const REGISTRY_URL = 'https://raw.githubusercontent.com/hoggie-homerserver/Egodact_addon_marketplace/main/registry.json';
    const MARKETPLACE_SITE = 'https://hoggie-homerserver.github.io/Egodact_addon_marketplace/';

    const ICON_CART = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    const ICON_PACKAGE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';

    let cachedRegistry = null;
    let cacheTime = 0;
    const CACHE_MS = 5 * 60 * 1000;

    async function fetchRegistry() {
        if (cachedRegistry && (Date.now() - cacheTime) < CACHE_MS) return cachedRegistry;
        try {
            const r = await fetch(REGISTRY_URL, { cache: 'no-store' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            cachedRegistry = await r.json();
            cacheTime = Date.now();
            return cachedRegistry;
        } catch (err) {
            console.warn('[Marketplace] Registry fetch failed:', err);
            return cachedRegistry || { addons: [], categories: [] };
        }
    }

    // Helper: send message to background script
    function bgMessage(msg) {
        return new Promise(function (resolve) {
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
                resolve({ success: false, error: 'No runtime' });
                return;
            }
            chrome.runtime.sendMessage(msg, function (response) {
                if (chrome.runtime.lastError) {
                    resolve({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    resolve(response || {});
                }
            });
        });
    }

    function openMarketplace(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        if (document.getElementById('egodact-custom-modal-backdrop')) return;

        const backdrop = document.createElement('div');
        backdrop.id = 'egodact-custom-modal-backdrop';
        Object.assign(backdrop.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: 'var(--egd-backdrop)', zIndex: '9999999',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Arial, sans-serif', overflow: 'auto', padding: '16px 0'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: 'var(--egd-modal)', color: 'var(--egd-tekst)',
            width: 'min(720px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)',
            boxSizing: 'border-box', overflow: 'auto', borderRadius: '6px',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: 'var(--egd-schaduw)'
        });

        const header = document.createElement('div');
        Object.assign(header.style, { display: 'flex', alignItems: 'center', gap: '12px' });
        const title = document.createElement('h2');
        title.innerHTML = ICON_CART + ' Addon Marketplace';
        title.style.cssText = 'margin:0;font-size:20px;flex:1;display:flex;align-items:center;gap:8px;';
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button'; closeBtn.textContent = 'Sluiten';
        Object.assign(closeBtn.style, { padding: '8px 14px', border: 'none', borderRadius: '4px', background: 'var(--egd-accent)', color: 'var(--egd-accent-tekst)', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' });
        closeBtn.addEventListener('click', function () { backdrop.remove(); });
        header.append(title, closeBtn);
        modal.appendChild(header);

        const searchWrap = document.createElement('div');
        Object.assign(searchWrap.style, { display: 'flex', gap: '8px' });
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Zoek addons...';
        Object.assign(searchInput.style, { flex: '1', padding: '8px 12px', border: '1px solid var(--egd-rand)', borderRadius: '4px', background: 'var(--egd-veld)', color: 'var(--egd-tekst)', fontSize: '13px' });
        searchWrap.appendChild(searchInput);
        modal.appendChild(searchWrap);

        const catWrap = document.createElement('div');
        Object.assign(catWrap.style, { display: 'flex', gap: '6px', flexWrap: 'wrap' });
        modal.appendChild(catWrap);

        const listContainer = document.createElement('div');
        Object.assign(listContainer.style, { display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px' });
        const loading = document.createElement('div');
        loading.textContent = 'Addons laden...';
        loading.style.cssText = 'padding:20px;text-align:center;color:var(--egd-tekst-zacht);';
        listContainer.appendChild(loading);
        modal.appendChild(listContainer);

        const footer = document.createElement('div');
        Object.assign(footer.style, { fontSize: '11px', color: 'var(--egd-tekst-zacht)', textAlign: 'center', borderTop: '1px solid var(--egd-rand)', paddingTop: '12px' });
        footer.innerHTML = 'Addons worden gevalideerd door de maintainer. <a href="' + MARKETPLACE_SITE + '" target="_blank" style="color:var(--egd-accent);">Bekijk op GitHub Pages ---</a>';
        modal.appendChild(footer);

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', function (e) { if (e.target === backdrop) backdrop.remove(); });

        let allAddons = [];
        let activeCategory = 'all';

        async function loadAddons() {
            const reg = await fetchRegistry();
            allAddons = (reg && reg.addons) || [];
            const cats = (reg && reg.categories) || [];
            renderCategories(cats);
            await renderAddons();
        }

        function renderCategories(cats) {
            catWrap.innerHTML = '';
            const allBtn = document.createElement('button');
            allBtn.type = 'button';
            allBtn.textContent = 'Alle';
            allBtn.style.cssText = 'padding:4px 10px;border:1px solid var(--egd-rand);border-radius:4px;background:var(--egd-veld);color:var(--egd-tekst);cursor:pointer;font-size:12px;';
            if (activeCategory === 'all') allBtn.style.background = 'var(--egd-accent)';
            allBtn.addEventListener('click', function () { activeCategory = 'all'; renderCategories(cats); renderAddons(); });
            catWrap.appendChild(allBtn);
            cats.forEach(function (cat) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = (cat.name || cat.id);
                Object.assign(btn.style, { padding: '4px 10px', border: '1px solid var(--egd-rand)', borderRadius: '4px', background: 'var(--egd-veld)', color: 'var(--egd-tekst)', cursor: 'pointer', fontSize: '12px' });
                if (activeCategory === cat.id) btn.style.background = 'var(--egd-accent)';
                btn.addEventListener('click', function () { activeCategory = cat.id; renderCategories(cats); renderAddons(); });
                catWrap.appendChild(btn);
            });
        }

        async function renderAddons() {
            const query = searchInput.value.trim().toLowerCase();
            let filtered = allAddons.slice();
            if (activeCategory !== 'all') filtered = filtered.filter(function (a) { return a.category === activeCategory; });
            if (query) filtered = filtered.filter(function (a) {
                return (a.name || '').toLowerCase().indexOf(query) !== -1 ||
                    (a.description || '').toLowerCase().indexOf(query) !== -1 ||
                    (a.tags || []).some(function (t) { return t.toLowerCase().indexOf(query) !== -1; });
            });

            // Check installed status for all addons
            const installedMap = {};
            await Promise.all(filtered.map(function (addon) {
                return bgMessage({ type: 'injector:isInstalled', addonId: addon.id }).then(function (res) {
                    installedMap[addon.id] = !!(res && res.installed);
                });
            }));

            listContainer.innerHTML = '';
            if (!filtered.length) {
                const empty = document.createElement('div');
                empty.textContent = 'Geen addons gevonden.';
                empty.style.cssText = 'padding:20px;text-align:center;color:var(--egd-tekst-zacht);';
                listContainer.appendChild(empty);
                return;
            }

            filtered.forEach(function (addon) {
                const card = document.createElement('div');
                Object.assign(card.style, { background: 'var(--egd-veld)', border: '1px solid var(--egd-rand)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' });

                const top = document.createElement('div');
                Object.assign(top.style, { display: 'flex', alignItems: 'center', gap: '10px' });
                const icon = document.createElement('div');
                icon.style.cssText = 'width:40px;height:40px;border-radius:8px;background:var(--egd-paneel);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--egd-tekst-zacht);';
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
                author.style.cssText = 'font-size:11px;color:var(--egd-tekst-zacht);';
                info.appendChild(author);
                top.appendChild(info);

                if (addon.verified) {
                    const badge = document.createElement('span');
                    badge.textContent = 'Official';
                    badge.style.cssText = 'font-size:10px;padding:2px 8px;border-radius:4px;background:#2e7d32;color:#fff;font-weight:bold;';
                    top.appendChild(badge);
                }
                card.appendChild(top);

                const desc = document.createElement('div');
                desc.textContent = addon.description || '';
                desc.style.cssText = 'font-size:12px;color:var(--egd-tekst-zacht);';
                card.appendChild(desc);

                if (addon.tags && addon.tags.length) {
                    const tagsWrap = document.createElement('div');
                    Object.assign(tagsWrap.style, { display: 'flex', gap: '6px', flexWrap: 'wrap' });
                    addon.tags.forEach(function (t) {
                        const tag = document.createElement('span');
                        tag.textContent = t;
                        tag.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:4px;background:var(--egd-paneel);color:var(--egd-tekst-zacht);';
                        tagsWrap.appendChild(tag);
                    });
                    card.appendChild(tagsWrap);
                }

                const actions = document.createElement('div');
                Object.assign(actions.style, { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' });

                const isInstalled = !!installedMap[addon.id];
                const installBtn = document.createElement('button');
                installBtn.type = 'button';
                installBtn.textContent = isInstalled ? 'Geinstalleerd' : 'Installeren';
                Object.assign(installBtn.style, { padding: '6px 14px', border: 'none', borderRadius: '4px', background: isInstalled ? '#2e7d32' : 'var(--egd-accent)', color: isInstalled ? '#fff' : 'var(--egd-accent-tekst)', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' });
                installBtn.disabled = isInstalled;
                if (!isInstalled) {
                    installBtn.addEventListener('click', function () {
                        installAddon(addon, installBtn);
                    });
                }
                actions.appendChild(installBtn);

                // Uninstall button (only if installed)
                if (isInstalled) {
                    const uninstallBtn = document.createElement('button');
                    uninstallBtn.type = 'button';
                    uninstallBtn.textContent = 'Verwijderen';
                    Object.assign(uninstallBtn.style, { padding: '6px 14px', border: '1px solid #c62828', borderRadius: '4px', background: 'transparent', color: '#c62828', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' });
                    uninstallBtn.addEventListener('click', function () {
                        uninstallAddon(addon, uninstallBtn, installBtn);
                    });
                    actions.appendChild(uninstallBtn);
                }

                if (addon.repo) {
                    const srcLink = document.createElement('a');
                    srcLink.href = addon.repo;
                    srcLink.target = '_blank';
                    srcLink.textContent = 'Broncode';
                    srcLink.style.cssText = 'font-size:11px;color:var(--egd-accent);text-decoration:none;';
                    actions.appendChild(srcLink);
                }

                card.appendChild(actions);
                listContainer.appendChild(card);
            });
        }

        async function installAddon(addon, btn) {
            btn.disabled = true;
            btn.textContent = 'Installeren...';
            try {
                const files = {};
                for (const f of (addon.files || [])) {
                    const url = addon.repo.replace('github.com', 'raw.githubusercontent.com') + '/main/' + f;
                    const r = await fetch(url);
                    if (!r.ok) throw new Error('Kan ' + f + ' niet laden');
                    files[f] = await r.text();
                }
                const res = await bgMessage({ type: 'injector:install', addonData: { id: addon.id, name: addon.name, version: addon.version, files: files, entryPoint: addon.entryPoint } });
                if (!res || !res.success) throw new Error((res && res.error) || 'Installatie mislukt');
                btn.textContent = 'Geinstalleerd';
                btn.style.background = '#2e7d32';
                btn.style.color = '#fff';
                // Re-render to show uninstall button
                await renderAddons();
            } catch (err) {
                btn.disabled = false;
                btn.textContent = 'Installeren';
                console.error('[Marketplace] Install failed:', err);
                alert('Installatie mislukt: ' + (err && err.message));
            }
        }

        async function uninstallAddon(addon, uninstallBtn, installBtn) {
            uninstallBtn.disabled = true;
            uninstallBtn.textContent = 'Verwijderen...';
            try {
                const res = await bgMessage({ type: 'injector:uninstall', addonId: addon.id });
                if (!res || !res.success) throw new Error((res && res.error) || 'Verwijderen mislukt');
                await renderAddons();
            } catch (err) {
                uninstallBtn.disabled = false;
                uninstallBtn.textContent = 'Verwijderen';
                console.error('[Marketplace] Uninstall failed:', err);
                alert('Verwijderen mislukt: ' + (err && err.message));
            }
        }

        searchInput.addEventListener('input', renderAddons);
        loadAddons().catch(function (err) { console.error('[Marketplace] Load failed:', err); });
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
