// ============================================================
// ONBOARDING (alleen bij eerste installatie / eerste gebruik)
// ============================================================
// Korte, overslaanbare uitleg van de hoofdonderdelen van Egodact
// Smart. Niet voor addons — alleen voor de host/extensie zelf.

(function () {
    'use strict';

    const STORAGE_KEY = 'egodact_onboarding_host_v1_seen';

    function alGezien() {
        try { return localStorage.getItem(STORAGE_KEY) === '1'; }
        catch (err) { return true; }
    }

    function markeerGezien() {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (err) {}
    }

    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'style' && attrs[k] && typeof attrs[k] === 'object') {
                    Object.assign(node.style, attrs[k]);
                } else if (k === 'className') {
                    node.className = attrs[k];
                } else if (k === 'text') {
                    node.textContent = attrs[k];
                } else if (k === 'html') {
                    node.innerHTML = attrs[k];
                } else {
                    node.setAttribute(k, attrs[k]);
                }
            });
        }
        (children || []).forEach(function (c) {
            if (c != null) node.appendChild(c);
        });
        return node;
    }

    function item(titel, beschrijving) {
        return el('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                padding: '10px 12px',
                background: 'var(--egd-veld)',
                border: '1px solid var(--egd-rand)',
                borderRadius: '6px'
            }
        }, [
            el('strong', { text: titel, style: { fontSize: '14px', color: 'var(--egd-tekst)' } }),
            el('span', { text: beschrijving, style: { fontSize: '12px', color: 'var(--egd-tekst-zacht)', lineHeight: '1.4' } })
        ]);
    }

    function toonOnboarding() {
        if (alGezien()) return;
        if (document.getElementById('egodact-onboarding-backdrop')) return;

        const sluit = function () {
            markeerGezien();
            const b = document.getElementById('egodact-onboarding-backdrop');
            if (b) b.remove();
        };

        const backdrop = el('div', {
            id: 'egodact-onboarding-backdrop',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'var(--egd-backdrop, rgba(0,0,0,0.65))',
                zIndex: '2147483640',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Arial, sans-serif',
                padding: '16px',
                boxSizing: 'border-box'
            }
        });

        const modal = el('div', {
            style: {
                backgroundColor: 'var(--egd-modal, #424242)',
                color: 'var(--egd-tekst, #fff)',
                width: 'min(560px, 100%)',
                maxHeight: 'calc(100vh - 32px)',
                boxSizing: 'border-box',
                overflow: 'hidden',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: 'var(--egd-schaduw, 0 8px 24px rgba(0,0,0,.4))'
            }
        });

        const kop = el('div', {
            style: {
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                borderBottom: '1px solid var(--egd-rand, #555)',
                paddingBottom: '10px'
            }
        }, [
            el('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } }, [
                el('h2', { text: 'Welkom bij Egodact Smart', style: { margin: '0', fontSize: '20px', fontWeight: '600' } }),
                el('span', { text: 'Korte uitleg van de hoofdonderdelen. Je kunt dit altijd overslaan.', style: { fontSize: '12px', color: 'var(--egd-tekst-zacht)' } })
            ])
        ]);

        const lijst = el('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflowY: 'auto',
                minHeight: '0',
                paddingRight: '4px'
            }
        }, [
            item('Smart Methode', 'Opent het Smart-menu met informatie en handige tips.'),
            item('Taken', 'Bekijk en beheer je taken.'),
            item('Weekplanning', 'Open je weekplanning en plan je werk.'),
            item('Tijd', 'Klok, timer, stopwatch en wekker (zichtbaar wanneer ingeschakeld in je build).'),
            item('Addons', 'Beheer geinstalleerde addons: in-/uitschakelen en de addon-bibliotheek openen.'),
            item('Hamburger-menu', 'Verschijnt naast je naam zodra een addon een menu-item registreert. Open het voor snelle addon-acties.'),
            item('Knoppen verplaatsen/ordenen', 'Sommige addon-knoppen kunnen zweven of een vaste plek hebben; de host houdt de hoofdknoppen overzichtelijk bij elkaar.')
        ]);

        const acties = el('div', {
            style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid var(--egd-rand, #555)',
                paddingTop: '12px'
            }
        });

        const overslaan = el('button', {
            type: 'button',
            text: 'Overslaan',
            style: {
                border: '1px solid var(--egd-rand, #555)',
                background: 'transparent',
                color: 'var(--egd-tekst, #fff)',
                cursor: 'pointer',
                padding: '8px 14px',
                fontWeight: 'bold',
                fontSize: '13px',
                borderRadius: '4px'
            }
        });
        overslaan.addEventListener('click', sluit);

        const klaar = el('button', {
            type: 'button',
            text: 'Begrepen',
            style: {
                border: 'none',
                background: 'var(--egd-accent, #90caf9)',
                color: 'var(--egd-accent-tekst, #0d47a1)',
                cursor: 'pointer',
                padding: '8px 14px',
                fontWeight: 'bold',
                fontSize: '13px',
                borderRadius: '4px'
            }
        });
        klaar.addEventListener('click', sluit);

        acties.append(overslaan, klaar);
        modal.append(kop, lijst, acties);
        backdrop.appendChild(modal);

        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) sluit();
        });

        document.body.appendChild(backdrop);
    }

    window.egodactToonOnboarding = toonOnboarding;
    window.egodactMisschienOnboarding = function () {
        try {
            if (alGezien()) return;
            // Wacht even tot de host-knoppen er staan, zodat de uitleg
            // klopt met wat de gebruiker ziet.
            setTimeout(toonOnboarding, 900);
        } catch (err) {}
    };
})();
