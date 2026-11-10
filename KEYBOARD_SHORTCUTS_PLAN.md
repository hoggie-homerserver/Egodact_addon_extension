# Keyboard Shortcuts + Learning Mode — Ontwerp

## Doel
Een centraal toetsenbord-shortcutsysteem in de hoofdextensie dat:
- werkt voor ingebouwde functies en addons (via een nieuwe lib-functie),
- een instellingenmenu in de hamburger-balk heeft,
- cross-platform is (macOS / Windows / Linux),
- samenwerkt met een "Leermodus" die alle addon-knoppen uitschakelt behalve het compact-mode-menu.

## 1. Architectuur: Shortcut-registry (main extension)

### 1.1 Module: src/shortcuts.js (nieuw)
Centrale registry met map id -> { keys, title, scope, action, source, enabled }.

- registerShortcut(meta): id, keys (string of array), title, scope ('global' | 'weekplanning' | 'challenges' | ...), action, source ('core' | addonId), platform override.
- unregisterShortcut(id)
- setShortcutKeys(id, keys)
- getShortcuts()
- handleKeydown(e): globale listener (capture phase), normaliseert modifier (Cmd op Mac, Ctrl elders), respecteert inputs/textareas/contenteditable.

### 1.2 Platform-detectie
const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
const modKey = isMac ? 'Meta' : 'Control';
const modLabel = isMac ? 'Cmd' : 'Ctrl';

Display: Cmd+K (Mac) vs Ctrl+K (Win/Linux). Opslag: canonical 'mod+k' (lowercase), platform-onafhankelijk.

### 1.3 Standaard-shortcuts (core)
| ID | Keys | Actie |
|---|---|---|
| core.weekplanning | mod+shift+w | open weekplanning |
| core.challenges | mod+shift+c | open challenges |
| core.addons | mod+shift+a | open addons-menu |
| core.search | mod+k | focus zoekbalk |
| core.theme | mod+shift+t | thema wisselen |
| core.closeModal | Escape | modal sluiten |
| core.help | mod+/ | toon shortcut-overzicht |

Alle configureerbaar; Escape niet aanpasbaar (veiligheid).

Opmerking: mod+w (sluit tab) en mod+k (Chrome omnibox) zijn browser-shortcuts en worden vermeden door Shift toe te voegen.

### 1.4 Addon-API (nieuwe lib-functie)
In EgodactAddonLib:
shortcuts: {
  add: function (meta) { // { addonId, id, title, keys, scope? }
     client.registerShortcut({ addonId, id, title, keys, scope });
     client.onShortcut(id, function () { /* addon voert eigen actie uit */ });
  },
  remove: function (id) { client.unregisterShortcut(id); }
}
Host (addon-api.js) registreert shortcut-metadata in de centrale registry met een callback die egodact:addon:shortcut dispatcht met { id }. Addon luistert en voert actie uit. Geen functies in CustomEvent.detail.

### 1.5 Conflict-afhandeling
Bij registratie: check of keys al in gebruik. Zo ja, dispatch egodact:shortcut:conflict event met { id, conflictingId, keys }. UI toont waarschuwing.

### 1.6 Scope & input-veiligheid
- handleKeydown negeert events als e.target een input/textarea/contenteditable is, behalve globale modifiers met expliciete opt-in (allowInInput: true).
- Scope-check: als scope !== 'global', alleen triggeren als de bijbehorende view open is.
- e.preventDefault() alleen bij match.

## 2. Instellingen-UI (hamburger-balk)

### 2.1 Menu-item
Hamburger krijgt een vast item "Sneltoetsen" (id core.shortcuts.settings) dat altijd zichtbaar is (ook zonder addons), mits er shortcuts zijn. Opent een modal met:
- Lijst van alle shortcuts (core + addons), gegroepeerd per bron.
- Per rij: titel, huidige toetscombinatie, knop "Wijzig".
- Wijzig-flow: capture next keypress, toon live, bevestig/annuleer, conflict-waarschuwing.
- "Herstel standaard" per shortcut en globaal.
- Toggle "Shortcuts ingeschakeld" (master switch).
- Platform-hint: "Op Mac gebruik je Cmd, op Windows/Linux Ctrl."

### 2.2 Opslag
localStorage key egodact_shortcuts_v1: { [id]: keysString, enabled: bool }.
Geen chrome.storage-permissie nodig (consistent met bestaande builds).

## 3. Leermodus (Learning Mode)

### 3.1 Concept
Een toggle (in hamburger-menu of instellingen) die alle addon-knoppen en addon-menu-items verbergt/uitschakelt, behalve een optioneel "compact mode"-menu.

### 3.2 Implementatie
- Globale flag window.__egodactLearningMode + localStorage egodact_learning_mode.
- In voegKnoppenToe() / egodactUpdateHamburger(): als learning mode aan, filter addon-knoppen/menus uit, behalve items met id === 'compact-mode' (of marker keepInLearningMode: true).
- Hergebruik bestaande disable-mechanisme: egodactSetButtonEnabled(key, false) voor alle addon-buttons; bij uitschakelen learning mode alles herstellen.
- Visuele indicator: badge "Leermodus" in de topbar.

### 3.3 "Compact mode menu" uitzondering
- Addons kunnen een menu registreren met keepInLearningMode: true in meta.
- Host respecteert deze flag in registerHamburger/registerMenu.
- Default: Learning Mode addon zelf en compact-mode-menu blijven zichtbaar.

## 4. Cross-platform details
- Modifier: Mac -> Meta (Cmd), Win/Linux -> Control.
- Alt/Option en Shift zijn platform-onafhankelijk.
- Display-labels: Cmd, Ctrl, Alt, Shift.
- Keys zoals ArrowUp, Enter, Escape, Space, Tab normaliseren naar leesbare namen.
- Geen OS-specifieke keycodes; gebruik e.key (lowercase) + modifier flags.

## 5. Implementatiestappen (voorstel)

| # | Stap | Bestanden |
|---|---|---|
| 1 | Maak src/shortcuts.js met registry + keydown-handler + platform-detectie | nieuw |
| 2 | Registreer core-shortcuts bij init | main.js |
| 3 | Voeg egodactUpdateShortcuts() toe aan de refresh-loop | main.js, buttons.js |
| 4 | Hamburger: vast "Sneltoetsen"-item + modal-UI | buttons.js |
| 5 | localStorage persistentie + conflict-detectie | shortcuts.js |
| 6 | Addon-API: registerShortcut / unregisterShortcut / dispatch | addon-api.js |
| 7 | Lib: L.shortcuts.add/remove + docs | lib.js (addons repo) |
| 8 | Leermodus toggle + filtering in knoppen/hamburger | buttons.js, addon-api.js |
| 9 | Tests: handmatig in Chrome (Mac/Win/Linux) + console-checks | - |
| 10 | README's updaten (host + addons) | README's |

## 6. Risico's / open vragen
- Browser-shortcuts: mod+w (sluit tab) en mod+k (Chrome omnibox) zijn al browser-shortcuts. We vermijden die door Shift toe te voegen (mod+shift+...).
- Input-velden: voorkom kapen tijdens typen.
- Addon-acties: acties blijven in addon-wereld; host dispatcht alleen { id }. Geen functies in detail.
- Geen storage-permissie: alles in localStorage; werkt per origin (app.egodact.com).
- Learning mode scope: alleen addon-knoppen/menus, niet core-UI.

## 7. Aanbeveling
Start met stap 1-5 (core shortcuts + hamburger-UI) in een feature-branch, test op Windows, dan pas addon-API (stap 6-7) en leermodus (stap 8). Wil je dat ik stap 1-5 implementeer?
