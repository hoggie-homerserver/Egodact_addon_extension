// ============================================================
// IDEEËNBUS
// Bewaart ideeën lokaal in de browser; geen server nodig.
// ============================================================

function openIdeeenbusMenu(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Hergebruik geen bestaande modal en voorkom dubbele vensters.
    if (document.getElementById('egodact-custom-modal-backdrop')) return;
    if (document.getElementById('egodact-ideeenbus-backdrop')) return;

    const STORAGE_KEY = 'egodact_ideeenbus_v1';
    let ideeën = [];
    let bewerkId = null;

    try {
        const opgeslagen = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        ideeën = Array.isArray(opgeslagen) ? opgeslagen.filter(item =>
            item && typeof item.id === 'string' &&
            typeof item.titel === 'string' &&
            typeof item.beschrijving === 'string'
        ) : [];
    } catch (err) {
        ideeën = [];
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'egodact-ideeenbus-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box',
        padding: '18px',
        backgroundColor: 'var(--egd-backdrop)',
        zIndex: '10000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        backgroundColor: 'var(--egd-modal)',
        color: 'var(--egd-tekst)',
        width: 'min(560px, 100%)',
        maxHeight: 'min(760px, 90vh)',
        overflowY: 'auto',
        boxSizing: 'border-box',
        borderRadius: '8px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        boxShadow: 'var(--egd-schaduw)'
    });

    const kop = document.createElement('div');
    Object.assign(kop.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        borderBottom: '1px solid var(--egd-rand)',
        paddingBottom: '12px'
    });

    const titel = document.createElement('h2');
    titel.textContent = 'Ideeënbus';
    Object.assign(titel.style, { margin: '0', fontSize: '22px', fontWeight: '600' });

    const sluitKnop = document.createElement('button');
    sluitKnop.type = 'button';
    sluitKnop.textContent = '×';
    sluitKnop.setAttribute('aria-label', 'Sluiten');
    sluitKnop.title = 'Sluiten';
    Object.assign(sluitKnop.style, {
        background: 'transparent',
        border: 'none',
        color: 'var(--egd-tekst)',
        cursor: 'pointer',
        fontSize: '28px',
        lineHeight: '1',
        padding: '0 4px'
    });
    kop.append(titel, sluitKnop);

    const uitleg = document.createElement('p');
    uitleg.textContent = 'Bewaar ideeën voor challenges die je later wilt uitwerken.';
    Object.assign(uitleg.style, {
        margin: '0',
        color: 'var(--egd-tekst-zacht)',
        fontSize: '13px',
        lineHeight: '1.5'
    });

    const formulier = document.createElement('form');
    Object.assign(formulier.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
        padding: '13px',
        background: 'var(--egd-veld)',
        border: '1px solid var(--egd-rand)',
        borderRadius: '6px'
    });

    const veldTitel = document.createElement('input');
    veldTitel.type = 'text';
    veldTitel.maxLength = 120;
    veldTitel.required = true;
    veldTitel.placeholder = 'Titel van je idee';
    veldTitel.setAttribute('aria-label', 'Titel van je idee');

    const veldBeschrijving = document.createElement('textarea');
    veldBeschrijving.maxLength = 5000;
    veldBeschrijving.required = true;
    veldBeschrijving.rows = 3;
    veldBeschrijving.placeholder = 'Beschrijving van je idee';
    veldBeschrijving.setAttribute('aria-label', 'Beschrijving van je idee');
    veldBeschrijving.style.resize = 'vertical';

    [veldTitel, veldBeschrijving].forEach(veld => Object.assign(veld.style, {
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px',
        border: '1px solid var(--egd-rand)',
        borderRadius: '4px',
        background: 'var(--egd-modal)',
        color: 'var(--egd-tekst)',
        font: 'inherit',
        fontSize: '14px',
        outlineColor: 'var(--egd-accent)'
    }));

    const formulierKnoppen = document.createElement('div');
    Object.assign(formulierKnoppen.style, {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        flexWrap: 'wrap'
    });

    const annuleerKnop = document.createElement('button');
    annuleerKnop.type = 'button';
    annuleerKnop.textContent = 'Annuleren';
    const opslaanKnop = document.createElement('button');
    opslaanKnop.type = 'submit';
    opslaanKnop.textContent = 'Idee toevoegen';

    function stijlKnop(knop, primair) {
        Object.assign(knop.style, {
            border: primair ? 'none' : '1px solid var(--egd-rand)',
            borderRadius: '4px',
            padding: '9px 13px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: primair ? 'bold' : 'normal',
            background: primair ? 'var(--egd-accent)' : 'transparent',
            color: primair ? 'var(--egd-accent-tekst)' : 'var(--egd-tekst)'
        });
    }
    stijlKnop(annuleerKnop, false);
    stijlKnop(opslaanKnop, true);
    formulierKnoppen.append(annuleerKnop, opslaanKnop);
    formulier.append(veldTitel, veldBeschrijving, formulierKnoppen);

    const lijstKop = document.createElement('div');
    Object.assign(lijstKop.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: '8px'
    });
    const lijstTitel = document.createElement('h3');
    lijstTitel.textContent = 'Opgeslagen ideeën';
    Object.assign(lijstTitel.style, { margin: '2px 0 0', fontSize: '15px' });
    const aantal = document.createElement('span');
    Object.assign(aantal.style, { color: 'var(--egd-tekst-zacht)', fontSize: '12px' });
    lijstKop.append(lijstTitel, aantal);

    const lijst = document.createElement('div');
    Object.assign(lijst.style, { display: 'flex', flexDirection: 'column', gap: '9px' });

    function opslaanLokaal() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ideeën));
            return true;
        } catch (err) {
            window.alert('Je ideeën konden niet lokaal worden opgeslagen. Controleer of browseropslag beschikbaar is.');
            return false;
        }
    }

    function resetFormulier() {
        bewerkId = null;
        formulier.reset();
        opslaanKnop.textContent = 'Idee toevoegen';
        annuleerKnop.style.display = 'none';
    }

    function maakActieKnop(tekst, titelTekst, actie, gevaar = false) {
        const knop = document.createElement('button');
        knop.type = 'button';
        knop.textContent = tekst;
        knop.title = titelTekst;
        Object.assign(knop.style, {
            background: 'transparent',
            border: '1px solid var(--egd-rand)',
            borderRadius: '4px',
            color: gevaar ? '#e57373' : 'var(--egd-tekst)',
            cursor: 'pointer',
            padding: '6px 9px',
            fontSize: '12px'
        });
        knop.addEventListener('click', actie);
        return knop;
    }

    function renderLijst() {
        lijst.replaceChildren();
        aantal.textContent = String(ideeën.length) + (ideeën.length === 1 ? ' idee' : ' ideeën');

        if (!ideeën.length) {
            const leeg = document.createElement('div');
            leeg.textContent = 'Je hebt nog geen ideeën opgeslagen. Voeg hierboven je eerste idee toe.';
            Object.assign(leeg.style, {
                padding: '16px',
                textAlign: 'center',
                color: 'var(--egd-tekst-zacht)',
                background: 'var(--egd-veld)',
                border: '1px dashed var(--egd-rand)',
                borderRadius: '6px',
                fontSize: '13px',
                lineHeight: '1.5'
            });
            lijst.appendChild(leeg);
            return;
        }

        ideeën.forEach(idee => {
            const kaart = document.createElement('article');
            Object.assign(kaart.style, {
                background: 'var(--egd-veld)',
                border: '1px solid var(--egd-rand)',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            });

            const kaartTitel = document.createElement('h4');
            kaartTitel.textContent = idee.titel;
            Object.assign(kaartTitel.style, {
                margin: '0',
                fontSize: '15px',
                fontWeight: '600',
                overflowWrap: 'anywhere'
            });

            const kaartBeschrijving = document.createElement('p');
            kaartBeschrijving.textContent = idee.beschrijving;
            Object.assign(kaartBeschrijving.style, {
                margin: '0',
                fontSize: '13px',
                lineHeight: '1.5',
                color: 'var(--egd-tekst-zacht)',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere'
            });

            const acties = document.createElement('div');
            Object.assign(acties.style, {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '7px',
                flexWrap: 'wrap'
            });

            const wijzigKnop = maakActieKnop('Aanpassen', 'Idee aanpassen', () => {
                bewerkId = idee.id;
                veldTitel.value = idee.titel;
                veldBeschrijving.value = idee.beschrijving;
                opslaanKnop.textContent = 'Wijzigingen opslaan';
                annuleerKnop.style.display = '';
                veldTitel.focus();
                formulier.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });

            const verwijderKnop = maakActieKnop('Verwijderen', 'Idee verwijderen', () => {
                if (!window.confirm('Weet je zeker dat je dit idee wilt verwijderen?')) return;
                const oud = ideeën;
                ideeën = ideeën.filter(item => item.id !== idee.id);
                if (!opslaanLokaal()) {
                    ideeën = oud;
                    return;
                }
                if (bewerkId === idee.id) resetFormulier();
                renderLijst();
            }, true);

            acties.append(wijzigKnop, verwijderKnop);
            kaart.append(kaartTitel, kaartBeschrijving, acties);
            lijst.appendChild(kaart);
        });
    }

    annuleerKnop.style.display = 'none';
    annuleerKnop.addEventListener('click', () => {
        resetFormulier();
        veldTitel.focus();
    });

    formulier.addEventListener('submit', event => {
        event.preventDefault();
        const nieuweTitel = veldTitel.value.trim();
        const nieuweBeschrijving = veldBeschrijving.value.trim();
        if (!nieuweTitel || !nieuweBeschrijving) return;

        const oudeIdeeën = ideeën;
        if (bewerkId) {
            ideeën = ideeën.map(idee => idee.id === bewerkId
                ? { ...idee, titel: nieuweTitel, beschrijving: nieuweBeschrijving, bijgewerkt: Date.now() }
                : idee
            );
        } else {
            ideeën = [{
                id: (typeof crypto !== 'undefined' && crypto.randomUUID)
                    ? crypto.randomUUID()
                    : String(Date.now()) + '-' + Math.random().toString(36).slice(2),
                titel: nieuweTitel,
                beschrijving: nieuweBeschrijving,
                aangemaakt: Date.now()
            }, ...ideeën];
        }

        if (!opslaanLokaal()) {
            ideeën = oudeIdeeën;
            return;
        }
        resetFormulier();
        renderLijst();
    });

    const sluitMenu = () => {
        backdrop.remove();
        document.removeEventListener('keydown', escapeHandler, true);
    };
    const escapeHandler = event => {
        if (event.key === 'Escape') sluitMenu();
    };

    sluitKnop.addEventListener('click', sluitMenu);
    backdrop.addEventListener('click', event => {
        if (event.target === backdrop) sluitMenu();
    });
    document.addEventListener('keydown', escapeHandler, true);

    modal.append(kop, uitleg, formulier, lijstKop, lijst);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    renderLijst();
    veldTitel.focus();
}
