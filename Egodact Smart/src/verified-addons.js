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
                source: 'https://github.com/MaxiTaxi/Egodact_addon_Learning_Mode',
                version: '0.3.1',
                sha256: 'bd200c433be391c64478a22e9b0c3cadaccb94cbd3999c7350ea71ca4945aec3',
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
                version: '1.0.0',
                sha256: '1d1676ca0c538f891b30bbca50b4673a2e3d9fa606c51486397ffeeb86b983eb',
                dataUsage: 'Externe dienst: Firebase (chatberichten worden extern opgeslagen/verzonden).'
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
