// ============================================================
// TIJD: KLOK, TIMER, STOPWATCH EN WEKKER
// ============================================================
//
// Timer, stopwatch en wekker lopen door als het venster dicht is: de
// toestand staat hier in het geheugen en in localStorage, niet in het
// venster. Alle tijden worden berekend uit tijdstempels (Date.now()),
// dus ze blijven kloppen ook als de browser het tabblad vertraagt.
// Als een timer of wekker afgaat, verschijnt er een melding rechtsboven
// met geluid, ook als het Tijd-venster dicht is.

const EGODACT_TIJD_KEY = 'egodact_tijd_v1';

let egodactTijd = null;
let egodactTijdLaatsteTick = 0;
let egodactTijdTab = 'klok';
let egodactTijdVenster = null;   // { alarmsOpnieuw } zolang het venster open is
let egodactTijdAudio = null;
let egodactTijdPiepTimer = null;

// ------------------------------------------------------------
// Opslag
// ------------------------------------------------------------

function egodactTijdStandaard() {
    return {
        geluid: true,
        timer: {
            running: false,
            endTs: null,
            remainingMs: 0,
            totalMs: 0,
            label: ''
        },
        stopwatch: {
            running: false,
            startTs: null,
            accMs: 0,
            laps: []
        },
        alarms: []
    };
}

function egodactTijdLaad() {
    const standaard = egodactTijdStandaard();

    try {
        const ruw = localStorage.getItem(EGODACT_TIJD_KEY);
        if (!ruw) return standaard;

        const data = JSON.parse(ruw);
        const stopwatch = Object.assign(
            standaard.stopwatch,
            data.stopwatch || {}
        );
        if (!Array.isArray(stopwatch.laps)) stopwatch.laps = [];

        return {
            geluid: data.geluid !== false,
            timer: Object.assign(standaard.timer, data.timer || {}),
            stopwatch,
            alarms: Array.isArray(data.alarms)
                ? data.alarms.filter(
                    a => a && /^\d{2}:\d{2}$/.test(String(a.tijd))
                )
                : []
        };
    } catch (err) {
        return standaard;
    }
}

function egodactTijdBewaar() {
    try {
        localStorage.setItem(
            EGODACT_TIJD_KEY,
            JSON.stringify(egodactTijd)
        );
    } catch (err) {
        console.warn('Egodact tijd bewaren mislukt:', err);
    }
}

// ------------------------------------------------------------
// Hulpfuncties
// ------------------------------------------------------------

function egodactTijdPad(n) {
    return String(n).padStart(2, '0');
}

function egodactTijdFormat(ms, honderdsten) {
    ms = Math.max(0, Math.floor(ms));
    const totaalSec = Math.floor(ms / 1000);
    const uren = Math.floor(totaalSec / 3600);
    const min = Math.floor((totaalSec % 3600) / 60);
    const sec = totaalSec % 60;

    let tekst =
        (uren > 0
            ? uren + ':' + egodactTijdPad(min)
            : egodactTijdPad(min)) +
        ':' + egodactTijdPad(sec);

    if (honderdsten) {
        tekst += '.' + egodactTijdPad(Math.floor((ms % 1000) / 10));
    }
    return tekst;
}

function egodactTijdDagTekst(datum) {
    return (
        datum.getFullYear() + '-' +
        egodactTijdPad(datum.getMonth() + 1) + '-' +
        egodactTijdPad(datum.getDate())
    );
}

function egodactTijdTimerRest(nu) {
    const t = egodactTijd.timer;
    return t.running ? Math.max(0, t.endTs - nu) : t.remainingMs;
}

function egodactTijdStopwatchMs(nu) {
    const s = egodactTijd.stopwatch;
    return s.accMs + (s.running ? nu - s.startTs : 0);
}

// ------------------------------------------------------------
// Acties (werken ook zonder open venster)
// ------------------------------------------------------------

function egodactTijdTimerToggle(invoerMs, label) {
    const t = egodactTijd.timer;
    const nu = Date.now();

    if (t.running) {
        // Pauzeren
        t.remainingMs = Math.max(0, t.endTs - nu);
        t.endTs = null;
        t.running = false;
    } else {
        const hervatten = t.remainingMs > 0;
        const ms = hervatten ? t.remainingMs : invoerMs;
        if (!(ms > 0)) return;

        if (!hervatten) {
            t.totalMs = ms;
            t.label = label || '';
        }
        t.endTs = nu + ms;
        t.remainingMs = 0;
        t.running = true;
    }
    egodactTijdBewaar();
}

function egodactTijdTimerReset() {
    const t = egodactTijd.timer;
    t.running = false;
    t.endTs = null;
    t.remainingMs = 0;
    t.totalMs = 0;
    t.label = '';
    egodactTijdBewaar();
}

function egodactTijdStopwatchToggle() {
    const s = egodactTijd.stopwatch;
    const nu = Date.now();

    if (s.running) {
        s.accMs += nu - s.startTs;
        s.startTs = null;
        s.running = false;
    } else {
        s.startTs = nu;
        s.running = true;
    }
    egodactTijdBewaar();
}

function egodactTijdStopwatchRonde() {
    const s = egodactTijd.stopwatch;
    if (!s.running) return;
    s.laps.push(egodactTijdStopwatchMs(Date.now()));
    egodactTijdBewaar();
}

function egodactTijdStopwatchReset() {
    const s = egodactTijd.stopwatch;
    s.running = false;
    s.startTs = null;
    s.accMs = 0;
    s.laps = [];
    egodactTijdBewaar();
}

function egodactTijdWekkerToevoegen(tijd, label, herhaal) {
    if (!/^\d{2}:\d{2}$/.test(tijd)) return false;

    egodactTijd.alarms.push({
        id: Date.now() + '-' + Math.floor(Math.random() * 1000),
        tijd,
        label: label || '',
        aan: true,
        herhaal: !!herhaal,
        laatsAfgegaan: null
    });
    egodactTijdBewaar();
    return true;
}

// ------------------------------------------------------------
// Geluid en melding
// ------------------------------------------------------------

// Een browser laat pas geluid toe na een klik op de pagina. Dit wordt
// daarom aangeroepen bij het starten van een timer of wekker.
function egodactTijdAudioOntgrendel() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!egodactTijdAudio) egodactTijdAudio = new AudioCtx();
        if (egodactTijdAudio.state === 'suspended') {
            egodactTijdAudio.resume();
        }
    } catch (err) {
        // Geen geluid beschikbaar: de melding blijft gewoon werken.
    }
}

function egodactTijdPiep() {
    try {
        egodactTijdAudioOntgrendel();
        const ctx = egodactTijdAudio;
        if (!ctx) return;

        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + i * 0.35;

            osc.type = 'sine';
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.3);
        }
    } catch (err) {
        // Geluid mislukt: negeren.
    }
}

function egodactTijdMelding(titel, tekst) {
    const oud = document.getElementById('egodact-tijd-melding');
    if (oud) oud.remove();

    clearInterval(egodactTijdPiepTimer);
    egodactTijdPiepTimer = null;

    const el = document.createElement('div');
    el.id = 'egodact-tijd-melding';
    el.setAttribute('role', 'alert');
    Object.assign(el.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: '10000000',
        minWidth: '240px',
        maxWidth: 'calc(100vw - 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px 18px',
        borderRadius: '8px',
        border: '2px solid var(--egd-accent)',
        backgroundColor: 'var(--egd-modal)',
        color: 'var(--egd-tekst)',
        boxShadow: 'var(--egd-schaduw)',
        fontFamily: 'Arial, sans-serif'
    });

    const kop = document.createElement('div');
    kop.textContent = titel;
    kop.style.cssText = 'font-size:18px; font-weight:bold;';

    const regel = document.createElement('div');
    regel.textContent = tekst;
    regel.style.cssText =
        'font-size:14px; color:var(--egd-tekst-zacht); word-break:break-word;';

    const stop = document.createElement('button');
    stop.type = 'button';
    stop.textContent = 'Stop';
    stop.style.cssText = egodactTijdKnopStijl(true, false);

    const sluit = () => {
        clearInterval(egodactTijdPiepTimer);
        egodactTijdPiepTimer = null;
        el.remove();
    };
    stop.addEventListener('click', sluit);

    el.append(kop, regel, stop);
    document.body.appendChild(el);

    if (egodactTijd && egodactTijd.geluid) {
        let keren = 0;
        egodactTijdPiep();
        egodactTijdPiepTimer = setInterval(() => {
            keren++;
            if (keren >= 10) {
                clearInterval(egodactTijdPiepTimer);
                egodactTijdPiepTimer = null;
                return;
            }
            egodactTijdPiep();
        }, 2000);
    }
}

// ------------------------------------------------------------
// Klok die op de achtergrond controleert (timer en wekkers)
// ------------------------------------------------------------

function egodactTijdTick() {
    if (!egodactTijd) return;

    const nu = Date.now();
    const vorige = egodactTijdLaatsteTick;
    egodactTijdLaatsteTick = nu;

    // Timer
    const t = egodactTijd.timer;
    if (t.running && nu >= t.endTs) {
        const label = t.label;
        t.running = false;
        t.endTs = null;
        t.remainingMs = 0;
        t.totalMs = 0;
        t.label = '';
        egodactTijdBewaar();
        egodactTijdMelding('Timer klaar', label || 'De tijd is om!');
    }

    // Wekkers: gaat af als de tijd tussen de vorige controle en nu valt.
    // Zo wordt er ook niet één gemist als de browser het tabblad vertraagt.
    const dag = egodactTijdDagTekst(new Date(nu));
    let gewijzigd = false;

    for (const wekker of egodactTijd.alarms) {
        if (!wekker.aan) continue;

        const [uur, minuut] = wekker.tijd.split(':').map(Number);
        const doel = new Date(nu);
        doel.setHours(uur, minuut, 0, 0);
        const doelTs = doel.getTime();

        if (
            doelTs > vorige &&
            doelTs <= nu &&
            wekker.laatsAfgegaan !== dag
        ) {
            wekker.laatsAfgegaan = dag;
            if (!wekker.herhaal) wekker.aan = false;
            gewijzigd = true;
            egodactTijdMelding(
                'Wekker ' + wekker.tijd,
                wekker.label || 'Tijd om op te staan!'
            );
        }
    }

    if (gewijzigd) {
        egodactTijdBewaar();
        if (egodactTijdVenster) egodactTijdVenster.alarmsOpnieuw();
    }
}

// Wordt één keer aangeroepen vanuit main.js.
function egodactTijdStart() {
    if (egodactTijd) return;

    egodactTijd = egodactTijdLaad();
    egodactTijdLaatsteTick = Date.now();
    setInterval(egodactTijdTick, 250);
}

// ------------------------------------------------------------
// Venster
// ------------------------------------------------------------

function egodactTijdKnopStijl(primair, klein) {
    const basis =
        'cursor:pointer; font-family:inherit; font-weight:bold; ' +
        'border-radius:4px; ' +
        'padding:' + (klein ? '6px 12px' : '10px 18px') + '; ' +
        'font-size:' + (klein ? '13' : '14') + 'px; ';

    return primair
        ? basis +
          'background-color:var(--egd-accent); ' +
          'color:var(--egd-accent-tekst); ' +
          'border:1px solid var(--egd-accent);'
        : basis +
          'background-color:transparent; ' +
          'color:var(--egd-accent); ' +
          'border:1px solid var(--egd-accent);';
}

const EGODACT_TIJD_INVOER_STIJL =
    'background-color:var(--egd-veld); color:var(--egd-tekst); ' +
    'border:1px solid var(--egd-rand); border-radius:4px; ' +
    'padding:8px 10px; font-size:14px; font-family:inherit; ' +
    'box-sizing:border-box;';

const EGODACT_TIJD_GROOT_STIJL =
    'text-align:center; font-size:56px; font-weight:300; ' +
    'font-variant-numeric:tabular-nums; letter-spacing:1px; ' +
    'line-height:1.1;';

function egodactTijdZetUit(knop, uit) {
    knop.disabled = uit;
    knop.style.opacity = uit ? '0.4' : '1';
    knop.style.cursor = uit ? 'default' : 'pointer';
}

function openTijdMenu(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (document.getElementById('egodact-custom-modal-backdrop')) return;

    egodactTijdStart();

    const backdrop = document.createElement('div');
    backdrop.id = 'egodact-custom-modal-backdrop';

    Object.assign(backdrop.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--egd-backdrop)',
        zIndex: '9999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
    });

    const modal = document.createElement('div');

    Object.assign(modal.style, {
        backgroundColor: 'var(--egd-modal)',
        color: 'var(--egd-tekst)',
        width: '520px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        boxSizing: 'border-box',
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--egd-schaduw)'
    });

    const primair = egodactTijdKnopStijl(true, false);
    const rand = egodactTijdKnopStijl(false, false);
    const labelStijl =
        'display:flex; align-items:center; gap:6px; font-size:13px; ' +
        'color:var(--egd-tekst-zacht); cursor:pointer;';

    modal.innerHTML = `
        <div style="
            display:flex; align-items:center; justify-content:space-between;
            gap:12px; flex-wrap:wrap;
            border-bottom:1px solid var(--egd-rand); padding-bottom:10px;
        ">
            <h2 style="margin:0; font-size:22px; font-weight:500;">Tijd</h2>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" data-tab="klok">Klok</button>
                <button type="button" data-tab="timer">Timer</button>
                <button type="button" data-tab="stopwatch">Stopwatch</button>
                <button type="button" data-tab="wekker">Wekker</button>
            </div>
        </div>

        <div data-paneel="klok"
             style="display:flex; flex-direction:column; gap:8px; padding:18px 0;">
            <div id="tijd-klok" style="${EGODACT_TIJD_GROOT_STIJL}">00:00:00</div>
            <div id="tijd-datum" style="
                text-align:center; font-size:15px;
                color:var(--egd-tekst-zacht);
            "></div>
        </div>

        <div data-paneel="timer"
             style="display:flex; flex-direction:column; gap:14px;">
            <div id="tijd-timer-display" style="${EGODACT_TIJD_GROOT_STIJL}">00:00</div>
            <div id="tijd-timer-presets"
                 style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
                <button type="button" data-min="1" style="${egodactTijdKnopStijl(false, true)}">1 min</button>
                <button type="button" data-min="5" style="${egodactTijdKnopStijl(false, true)}">5 min</button>
                <button type="button" data-min="10" style="${egodactTijdKnopStijl(false, true)}">10 min</button>
                <button type="button" data-min="25" style="${egodactTijdKnopStijl(false, true)}">25 min</button>
                <button type="button" data-min="45" style="${egodactTijdKnopStijl(false, true)}">45 min</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center; justify-content:center;">
                <input id="tijd-timer-min" type="number" min="0" max="999"
                       value="10" aria-label="Minuten"
                       style="${EGODACT_TIJD_INVOER_STIJL} width:80px;">
                <span style="color:var(--egd-tekst-zacht);">min</span>
                <input id="tijd-timer-sec" type="number" min="0" max="59"
                       value="0" aria-label="Seconden"
                       style="${EGODACT_TIJD_INVOER_STIJL} width:80px;">
                <span style="color:var(--egd-tekst-zacht);">sec</span>
            </div>
            <input id="tijd-timer-label" type="text" maxlength="60"
                   placeholder="Waar is de timer voor? (optioneel)"
                   style="${EGODACT_TIJD_INVOER_STIJL} width:100%;">
            <div style="display:flex; gap:10px; justify-content:center;">
                <button id="tijd-timer-start" type="button" style="${primair}">Start</button>
                <button id="tijd-timer-reset" type="button" style="${rand}">Reset</button>
            </div>
        </div>

        <div data-paneel="stopwatch"
             style="display:flex; flex-direction:column; gap:14px;">
            <div id="tijd-sw-display" style="${EGODACT_TIJD_GROOT_STIJL}">00:00.00</div>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button id="tijd-sw-start" type="button" style="${primair}">Start</button>
                <button id="tijd-sw-ronde" type="button" style="${rand}">Ronde</button>
                <button id="tijd-sw-reset" type="button" style="${rand}">Reset</button>
            </div>
            <div id="tijd-sw-rondes" style="
                display:flex; flex-direction:column; gap:6px;
                max-height:170px; overflow-y:auto;
            "></div>
        </div>

        <div data-paneel="wekker"
             style="display:flex; flex-direction:column; gap:14px;">
            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <input id="tijd-wekker-tijd" type="time" value="07:00"
                       aria-label="Tijd van de wekker"
                       style="${EGODACT_TIJD_INVOER_STIJL}">
                <input id="tijd-wekker-label" type="text" maxlength="60"
                       placeholder="Naam (optioneel)"
                       style="${EGODACT_TIJD_INVOER_STIJL} flex:1; min-width:120px;">
                <label style="${labelStijl}">
                    <input id="tijd-wekker-herhaal" type="checkbox"> Elke dag
                </label>
                <button id="tijd-wekker-voeg" type="button"
                        style="${egodactTijdKnopStijl(true, true)}">Toevoegen</button>
            </div>
            <div id="tijd-wekker-lijst" style="
                display:flex; flex-direction:column; gap:8px;
                max-height:240px; overflow-y:auto;
            "></div>
        </div>

        <div style="
            display:flex; align-items:center; justify-content:space-between;
            margin-top:5px;
        ">
            <label style="${labelStijl}">
                <input id="tijd-geluid" type="checkbox"> Geluid bij melding
            </label>
            <button id="egodact-tijd-modal-sluiten" type="button" style="
                background-color:var(--egd-accent); border:none;
                color:var(--egd-accent-tekst); cursor:pointer;
                padding:10px 20px; font-weight:bold; font-size:14px;
                text-transform:uppercase; border-radius:4px;
                box-shadow:0px 3px 1px -2px rgba(0,0,0,0.2);
            ">Sluiten</button>
        </div>
    `;

    const $ = selector => modal.querySelector(selector);

    const tabKnoppen = Array.from(modal.querySelectorAll('[data-tab]'));
    const panelen = Array.from(modal.querySelectorAll('[data-paneel]'));

    const klokEl = $('#tijd-klok');
    const datumEl = $('#tijd-datum');

    const timerDisplay = $('#tijd-timer-display');
    const timerMin = $('#tijd-timer-min');
    const timerSec = $('#tijd-timer-sec');
    const timerLabel = $('#tijd-timer-label');
    const timerStart = $('#tijd-timer-start');
    const timerReset = $('#tijd-timer-reset');
    const presetKnoppen = Array.from(
        modal.querySelectorAll('#tijd-timer-presets [data-min]')
    );

    const swDisplay = $('#tijd-sw-display');
    const swStart = $('#tijd-sw-start');
    const swRonde = $('#tijd-sw-ronde');
    const swReset = $('#tijd-sw-reset');
    const swRondes = $('#tijd-sw-rondes');

    const wekkerTijd = $('#tijd-wekker-tijd');
    const wekkerLabel = $('#tijd-wekker-label');
    const wekkerHerhaal = $('#tijd-wekker-herhaal');
    const wekkerVoeg = $('#tijd-wekker-voeg');
    const wekkerLijst = $('#tijd-wekker-lijst');

    const geluidVak = $('#tijd-geluid');

    // ---- Tabs ----

    function toonTab(naam) {
        egodactTijdTab = naam;

        for (const paneel of panelen) {
            paneel.style.display =
                paneel.dataset.paneel === naam ? 'flex' : 'none';
        }
        for (const knop of tabKnoppen) {
            knop.style.cssText = egodactTijdKnopStijl(
                knop.dataset.tab === naam,
                true
            );
        }
    }

    for (const knop of tabKnoppen) {
        knop.addEventListener('click', () => toonTab(knop.dataset.tab));
    }

    // ---- Timer ----

    function timerInvoerMs() {
        const min = Math.max(0, parseInt(timerMin.value, 10) || 0);
        const sec = Math.max(0, parseInt(timerSec.value, 10) || 0);
        return Math.min((min * 60 + sec) * 1000, 359999000);
    }

    for (const knop of presetKnoppen) {
        knop.addEventListener('click', () => {
            timerMin.value = knop.dataset.min;
            timerSec.value = '0';
            bijwerken();
        });
    }

    timerStart.addEventListener('click', () => {
        egodactTijdAudioOntgrendel();
        egodactTijdTimerToggle(timerInvoerMs(), timerLabel.value.trim());
        bijwerken();
    });

    timerReset.addEventListener('click', () => {
        egodactTijdTimerReset();
        bijwerken();
    });

    // ---- Stopwatch ----

    swStart.addEventListener('click', () => {
        egodactTijdStopwatchToggle();
        bijwerken();
    });

    swRonde.addEventListener('click', () => {
        egodactTijdStopwatchRonde();
        bijwerken();
    });

    swReset.addEventListener('click', () => {
        egodactTijdStopwatchReset();
        bijwerken();
    });

    let getoondeRondes = -1;

    function rondesOpnieuw() {
        const rondes = egodactTijd.stopwatch.laps;
        getoondeRondes = rondes.length;
        swRondes.textContent = '';

        for (let i = rondes.length - 1; i >= 0; i--) {
            const split = rondes[i] - (i > 0 ? rondes[i - 1] : 0);

            const rij = document.createElement('div');
            rij.style.cssText =
                'display:flex; justify-content:space-between; gap:12px; ' +
                'background:var(--egd-veld); padding:8px 12px; ' +
                'border-radius:4px; font-size:14px; ' +
                'font-variant-numeric:tabular-nums;';

            const naam = document.createElement('span');
            naam.textContent = 'Ronde ' + (i + 1);
            naam.style.color = 'var(--egd-tekst-zacht)';

            const tijden = document.createElement('span');
            tijden.textContent =
                egodactTijdFormat(split, true) +
                '  ·  ' +
                egodactTijdFormat(rondes[i], true);

            rij.append(naam, tijden);
            swRondes.appendChild(rij);
        }
    }

    // ---- Wekker ----

    function alarmsOpnieuw() {
        wekkerLijst.textContent = '';

        const wekkers = egodactTijd.alarms
            .slice()
            .sort((a, b) => a.tijd.localeCompare(b.tijd));

        if (wekkers.length === 0) {
            const leeg = document.createElement('div');
            leeg.textContent = 'Nog geen wekkers.';
            leeg.style.cssText =
                'text-align:center; padding:14px 0; font-size:13px; ' +
                'color:var(--egd-tekst-zacht);';
            wekkerLijst.appendChild(leeg);
            return;
        }

        for (const wekker of wekkers) {
            const rij = document.createElement('div');
            rij.style.cssText =
                'display:flex; align-items:center; gap:12px; ' +
                'background:var(--egd-veld); padding:10px 12px; ' +
                'border-radius:4px;';

            const aan = document.createElement('input');
            aan.type = 'checkbox';
            aan.checked = !!wekker.aan;
            aan.setAttribute('aria-label', 'Wekker ' + wekker.tijd + ' aan');
            aan.addEventListener('change', () => {
                wekker.aan = aan.checked;
                if (wekker.aan) {
                    wekker.laatsAfgegaan = null;
                    egodactTijdAudioOntgrendel();
                }
                egodactTijdBewaar();
            });

            const tijd = document.createElement('div');
            tijd.textContent = wekker.tijd;
            tijd.style.cssText =
                'font-size:24px; font-variant-numeric:tabular-nums;';

            const info = document.createElement('div');
            info.style.cssText =
                'flex:1; min-width:0; font-size:13px; ' +
                'color:var(--egd-tekst-zacht); word-break:break-word;';
            info.textContent =
                (wekker.label ? wekker.label + ' · ' : '') +
                (wekker.herhaal ? 'Elke dag' : 'Eenmalig');

            const weg = document.createElement('button');
            weg.type = 'button';
            weg.textContent = '✕';
            weg.setAttribute('aria-label', 'Verwijder wekker');
            weg.style.cssText =
                'background:transparent; border:none; cursor:pointer; ' +
                'color:var(--egd-tekst-zacht); font-size:16px; padding:4px 8px;';
            weg.addEventListener('click', () => {
                egodactTijd.alarms = egodactTijd.alarms.filter(
                    a => a !== wekker
                );
                egodactTijdBewaar();
                alarmsOpnieuw();
            });

            rij.append(aan, tijd, info, weg);
            wekkerLijst.appendChild(rij);
        }
    }

    wekkerVoeg.addEventListener('click', () => {
        egodactTijdAudioOntgrendel();
        const toegevoegd = egodactTijdWekkerToevoegen(
            wekkerTijd.value,
            wekkerLabel.value.trim(),
            wekkerHerhaal.checked
        );
        if (toegevoegd) {
            wekkerLabel.value = '';
            alarmsOpnieuw();
        }
    });

    // ---- Geluid ----

    geluidVak.checked = egodactTijd.geluid;
    geluidVak.addEventListener('change', () => {
        egodactTijd.geluid = geluidVak.checked;
        egodactTijdBewaar();
        if (geluidVak.checked) egodactTijdAudioOntgrendel();
    });

    // ---- Bijwerken (alleen tekst, zodat invoervelden hun focus houden) ----

    function bijwerken() {
        const nu = Date.now();
        const datum = new Date(nu);

        klokEl.textContent = datum.toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        datumEl.textContent = datum.toLocaleDateString('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Timer
        const t = egodactTijd.timer;
        const gepauzeerd = !t.running && t.remainingMs > 0;
        const bezig = t.running || gepauzeerd;

        if (bezig) {
            // Naar boven afronden: 00:01 blijft staan tot de tijd om is.
            const rest = egodactTijdTimerRest(nu);
            timerDisplay.textContent = egodactTijdFormat(
                Math.ceil(rest / 1000) * 1000,
                false
            );
        } else {
            timerDisplay.textContent = egodactTijdFormat(
                timerInvoerMs(),
                false
            );
        }

        timerStart.textContent = t.running
            ? 'Pauze'
            : gepauzeerd ? 'Hervat' : 'Start';

        for (const veld of [timerMin, timerSec, timerLabel]) {
            veld.disabled = bezig;
        }
        for (const knop of presetKnoppen) {
            egodactTijdZetUit(knop, bezig);
        }
        egodactTijdZetUit(timerReset, !bezig);

        // Stopwatch
        const s = egodactTijd.stopwatch;
        const verstreken = egodactTijdStopwatchMs(nu);

        swDisplay.textContent = egodactTijdFormat(verstreken, true);
        swStart.textContent = s.running
            ? 'Pauze'
            : s.accMs > 0 ? 'Hervat' : 'Start';
        egodactTijdZetUit(swRonde, !s.running);
        egodactTijdZetUit(swReset, !s.running && s.accMs === 0);

        if (s.laps.length !== getoondeRondes) rondesOpnieuw();
    }

    // ---- Sluiten (ook met Esc) ----

    // Esc sluit het venster. De listener wordt weer verwijderd zodra het
    // venster dicht is, zodat er geen losse listeners achterblijven.
    // "true" = capture: wij krijgen de toets eerst, en stopPropagation
    // voorkomt dat Egodact zelf ook op Esc reageert.
    function opEscape(event) {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        sluitMenu();
    }

    const verversTimer = setInterval(bijwerken, 100);

    const sluitMenu = () => {
        clearInterval(verversTimer);
        document.removeEventListener('keydown', opEscape, true);
        egodactTijdVenster = null;
        backdrop.remove();
    };

    document.addEventListener('keydown', opEscape, true);

    $('#egodact-tijd-modal-sluiten').addEventListener('click', sluitMenu);

    backdrop.addEventListener('click', event => {
        if (event.target === backdrop) sluitMenu();
    });

    egodactTijdVenster = { alarmsOpnieuw };

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    alarmsOpnieuw();
    toonTab(egodactTijdTab);
    bijwerken();
}
