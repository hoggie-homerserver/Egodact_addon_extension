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
                version: '0.3.0',
                sha256: '3aa085d00bdcf22a85e6980d8822f12afedd5436d5343551a3cf593b425c9550'
            },
            {
                id: 'example-addon',
                name: 'Example Addon',
                author: 'MaxiTaxi',
                source: 'https://github.com/hoggie-homerserver/Egodact_addon_extension_addons',
                version: '1.7.0',
                sha256: '902f3c6037351e06c71edcf91c3ac676322f10f8893bb5ae4bb7c3e4bfaa90d9'
            },
            {
                id: 'egodact-chat',
                name: 'Egodact Chat',
                author: 'MaxiTaxi',
                source: 'https://github.com/hoggie-homerserver/Egodact_addon_chat',
                version: '1.0.0',
                sha256: '1d1676ca0c538f891b30bbca50b4673a2e3d9fa606c51486397ffeeb86b983eb'
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
