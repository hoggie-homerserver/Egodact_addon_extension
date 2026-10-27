// Persoonlijke gegevens horen bij één account en school. Oude, gedeelde
// sleutels worden nooit automatisch aan de huidige gebruiker toegewezen.
const EGODACT_ACCESS_TOKEN_KEY = 'pYfkT6ZWcUB98Sla76HppFpk4aYdTAp0_CACHE_0';
const EGODACT_MAX_IMPORT_BYTES = 2 * 1024 * 1024;

function egodactLeesSessie() {
    return {
        accessToken: localStorage.getItem(EGODACT_ACCESS_TOKEN_KEY),
        school: localStorage.getItem('selectedSchool') || ''
    };
}

function egodactSessieIsActief(sessie) {
    const huidig = egodactLeesSessie();
    return !!sessie.accessToken && huidig.accessToken === sessie.accessToken &&
        huidig.school === sessie.school;
}

async function egodactOpenPersoonlijkeOpslag() {
    const sessie = egodactLeesSessie();
    if (!sessie.accessToken) throw new Error('Log eerst in bij Egodact.');

    // JWT-claims dienen uitsluitend als lokale opslagnaam, nooit als
    // authenticatiebewijs. Tokenvernieuwing met dezelfde sub/iss behoudt data.
    // Bij opaque tokens is alleen isolatie per token/school mogelijk.
    let identiteit = ['token', sessie.accessToken, sessie.school];
    try {
        const delen = sessie.accessToken.split('.');
        if (delen.length === 3) {
            const basis = delen[1].replace(/-/g, '+').replace(/_/g, '/');
            const bytes = Uint8Array.from(atob(basis.padEnd(Math.ceil(basis.length / 4) * 4, '=')), c => c.charCodeAt(0));
            const claims = JSON.parse(new TextDecoder().decode(bytes));
            if (typeof claims.sub === 'string' && claims.sub &&
                typeof claims.iss === 'string' && claims.iss) {
                identiteit = ['account', claims.iss, claims.sub, sessie.school];
            }
        }
    } catch (error) {
        // Opaque of ongeldig JWT-formaat: de token zelf wordt niet opgeslagen.
    }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(identiteit)));
    const prefix = 'egodact_private_v1_' + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('') + ':';
    const controleer = () => {
        if (!egodactSessieIsActief(sessie)) throw new Error('Je login of school is gewijzigd. Open het menu opnieuw.');
    };
    controleer();
    return {
        actief: () => egodactSessieIsActief(sessie),
        getItem(key) { controleer(); return localStorage.getItem(prefix + key); },
        setItem(key, value) { controleer(); localStorage.setItem(prefix + key, value); },
        removeItem(key) { controleer(); localStorage.removeItem(prefix + key); }
    };
}

function egodactBewaakSessie(opslag, backdrop, sluitMenu) {
    const controller = new AbortController();
    const controleer = event => {
        if (!backdrop.isConnected) {
            clearInterval(timer);
            controller.abort();
        } else if (!opslag.actief()) {
            if (event && event.target instanceof Node && backdrop.contains(event.target)) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            clearInterval(timer);
            controller.abort();
            sluitMenu();
        }
    };
    const timer = setInterval(controleer, 250);
    for (const type of ['click', 'input', 'change', 'keydown', 'drop', 'submit']) {
        document.addEventListener(type, controleer, { capture: true, signal: controller.signal });
    }
    window.addEventListener('storage', controleer, { signal: controller.signal });
}

function egodactVeiligeKleur(kleur) {
    return typeof kleur === 'string' && /^#[0-9a-f]{6}$/i.test(kleur) ? kleur : null;
}

function egodactNormaliseerWeekBlok(blok) {
    if (!blok || typeof blok !== 'object' || Array.isArray(blok)) throw new Error('Ongeldig weekblok.');
    const leesTijd = waarde => {
        // Ook oudere clipboarddata met HH:MM blijft bruikbaar.
        if (typeof waarde === 'string' && /^\d{2}:\d{2}$/.test(waarde)) {
            const [uur, minuut] = waarde.split(':').map(Number);
            return uur <= 24 && minuut < 60 && (uur < 24 || minuut === 0) ? uur * 60 + minuut : NaN;
        }
        return typeof waarde === 'number' ? waarde : NaN;
    };
    const start = leesTijd(blok.start);
    const einde = leesTijd(blok.einde);
    const dag = blok.dag;
    const tekst = (waarde, maximum) => {
        if (waarde == null) return '';
        if (typeof waarde !== 'string' || waarde.length > maximum) throw new Error('Ongeldige bloktekst.');
        return waarde;
    };
    if (!Number.isInteger(dag) || dag < 0 || dag > 6 ||
        !Number.isFinite(start) || !Number.isFinite(einde) || start < 0 || einde > 1440 || einde <= start) {
        throw new Error('Ongeldige dag of bloktijden.');
    }
    const id = blok.id;
    if (id != null && !((typeof id === 'string' && id.length <= 200) ||
        (typeof id === 'number' && Number.isFinite(id)))) throw new Error('Ongeldig blok-id.');
    const challengeId = blok.challengeId;
    if (challengeId != null && !((typeof challengeId === 'string' && challengeId.length <= 200) ||
        (typeof challengeId === 'number' && Number.isFinite(challengeId)))) throw new Error('Ongeldig challenge-id.');
    return {
        id: id ?? crypto.randomUUID(), dag, start, einde,
        naam: tekst(blok.naam, 1000), beschrijving: tekst(blok.beschrijving, 20000),
        onderwerp: tekst(blok.onderwerp, 1000), challengeId: challengeId ?? null,
        kleur: egodactVeiligeKleur(blok.kleur)
    };
}

function egodactNormaliseerWeek(data) {
    if (!Array.isArray(data) || data.length > 1000) throw new Error('Ongeldige of te grote weekplanning.');
    return data.map(egodactNormaliseerWeekBlok);
}
