// ============================================================
// BETA FEATURES ALLEEN IN DE DEV BUILD
// ============================================================  
// De publieke versie toont geen Beta-knop. Een lokaal geladen
// testversie waarvan de naam in manifest.json "Dev" bevat 
// (bijvoorbeeld "Egodact Pantagora Dev Build") toont hem wel.
const EGODACT_BETA_ZICHTBAAR = (() => {
    try {
        return /\bdev\b/i.test(chrome.runtime.getManifest().name);
    } catch (err) {
        return false;
    }
})();

