// ============================================================
// OBSERVER
// ============================================================

const observer =
    new MutationObserver(
        () => {
            voegKnoppenToe();
        }
    );

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


// ============================================================
// EERSTE UITVOERING
// ============================================================

// Timer en wekkers moeten ook zonder open venster blijven lopen.
egodactTijdStart();

voegKnoppenToe();

if (window.EgodactAddons && typeof window.EgodactAddons.finalize === 'function') {
    window.EgodactAddons.finalize();
}


try { window.__egodactHostReady = true; document.dispatchEvent(new CustomEvent('egodact:host:ready')); } catch (err) {}

if (typeof egodactMisschienOnboarding === 'function') {
    egodactMisschienOnboarding();
}

// ============================================================
// OPRUIMEN ALS DE EXTENSIE WORDT UITGESCHAKELD
// ============================================================
// Een content script blijft soms nog even draaien nadat de extensie in de
// browser is uitgeschakeld. Zodra de extensie-context weg is, verwijderen
// we onze knoppen en thema-wijzigingen zodat de pagina weer normaal is.

(function () {
    function extensieNogActief() {
        let runtime = null;

        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                runtime = chrome.runtime;
            } else if (typeof browser !== 'undefined' && browser.runtime) {
                runtime = browser.runtime;
            }
        } catch (err) {
            return false;
        }

        // Geen extensie-omgeving (bijvoorbeeld een testpagina): niets doen.
        if (!runtime) return true;

        try {
            return !!runtime.id;
        } catch (err) {
            return false;
        }
    }

    const controle = setInterval(function () {
        if (extensieNogActief()) return;
        clearInterval(controle);
        try { observer.disconnect(); } catch (err) {}
        try {
            if (typeof egodactRuimExtensieOp === 'function') {
                egodactRuimExtensieOp();
            }
        } catch (err) {}
    }, 1000);
})();

window.addEventListener('resize', function () {
    if (typeof egodactUpdateHamburger === 'function') {
        try { egodactUpdateHamburger(); } catch (err) {}
    }
});
