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

// ============================================================
// TEST FEATURES ALLEEN IN DE DEV BUILD
// ============================================================
// Zelfde regel als de Beta-knop: alleen zichtbaar in een build
// waarvan de naam in manifest.json "Dev" bevat.
const EGODACT_TEST_ZICHTBAAR = EGODACT_BETA_ZICHTBAAR;

