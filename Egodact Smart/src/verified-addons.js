// ============================================================
// VERIFIED ADDONS (alleen door de maintainer beheerd)
// ============================================================
// Deze lijst wordt meegeleverd met de extensie. Niemand anders kan
// wijzigen wat de officiële build als "Official" beschouwt.
// Voeg een addon toe door een entry op te nemen en een nieuwe
// host-versie uit te brengen. Alles wat hier niet (op id+versie)
// in staat, wordt als "Unverified / Local" getoond.
//
// Hash = SHA-256 over geselecteerde addon-bestanden (vastgelegd bij
// release). Als de geïnstalleerde versie afwijkt, telt de vermelding
// alleen als id+versie overeenkomen; onbekende installs blijven
// unverified.

(function (global) {
    'use strict';

    global.EGODACT_VERIFIED_ADDONS = {
        version: 1,
        official: [
            {
                id: 'egodact-learning-mode',
                name: 'Learning Mode',
                author: 'MaxiTaxi',
                source: 'https://github.com/hoggie-homerserver/Egodact_addon_Learning_Mode',
                version: '0.3.2',
                sha256: '2cf70faa4386f209b02eb5b79e99c6fb9c60e624fa328e79127e05c7ae41151b',
                dataUsage: 'Lokaal (browseropslag). Geen externe diensten.'
            },
            {
                id: 'example-addon',
                name: 'Example Addon',
                author: 'MaxiTaxi',
                source: 'https://github.com/hoggie-homerserver/Egodact_addon_extension_addons',
                version: '1.9.0',
                sha256: '499a010985b138a504c7e70666a9fa2a45d2e9399091dff3fc27479a19ee6731',
                dataUsage: 'Lokaal. Geen externe diensten.'
            },
            {
                id: 'egodact-chat',
                name: 'Egodact Chat',
                author: 'MaxiTaxi',
                source: 'https://github.com/hoggie-homerserver/Egodact_addon_chat',
                version: '1.0.7',
                sha256: 'a8f24d24d8bf60ffa8f5f6594852f9eec224ba62cbbc4eacaec9dd77dbac5ac6',
                dataUsage: 'Externe dienst: Firebase (chatberichten worden extern opgeslagen/verzonden).'
            },
            {
                id: 'tower-stack-addon',
                name: 'Tower Stack',
                author: 'MaxiTaxi',
                source: 'https://github.com/hoggie-homerserver/Egodact_addon_Tower_Stack',
                version: '0.1.1',
                sha256: '3c69e0954db6e12aae360d0079eee2c1854131d6b92b894e992c3c9ea32571c3',
                dataUsage: 'Lokaal (browseropslag). Geen externe diensten.'
            }
        ]
    };

    // Zoekt een officiële vermelding op addon-id (en optioneel versie).
    global.egodactZoekVerifiedAddon = function (addonId, addonVersion) {
        try {
            const reg = global.EGODACT_VERIFIED_ADDONS;
            const list = (reg && Array.isArray(reg.official)) ? reg.official : [];
            const byId = list.find(function (e) { return e && e.id === addonId; });
            if (!byId) return null;
            const reported = String(addonVersion == null ? '' : addonVersion);
            const unknownVersion = !reported || reported === '?' || reported === '0.0.0' || reported === 'unknown';
            if (!unknownVersion && byId.version && reported !== String(byId.version)) {
                return { entry: byId, versionMatch: false, versionUnknown: false };
            }
            return { entry: byId, versionMatch: true, versionUnknown: unknownVersion };
        } catch (err) {
            return null;
        }
    };
})(typeof window !== 'undefined' ? window : this);
