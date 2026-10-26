// ============================================================
// WEEKPLANNING MENU
// ============================================================

function openWeekplanning(e) {

    e.preventDefault();
    e.stopPropagation();

    if (
        document.getElementById(
            'egodact-custom-modal-backdrop'
        )
    ) {
        return;
    }

    // ========================================================
    // WEEK DATA
    // ========================================================

    const vandaag =
        new Date();

    function beginVanWeek(datum) {

        const d =
            new Date(datum);

        const dag =
            d.getDay();

        const verschil =
            dag === 0
                ? -6
                : 1 - dag;

        d.setDate(
            d.getDate() + verschil
        );

        d.setHours(
            0,
            0,
            0,
            0
        );

        return d;
    }

    let weekStart =
        beginVanWeek(vandaag);

    function datumKey(datum) {

        return datum
            .toISOString()
            .split("T")[0];
    }

    function weekStorageKey() {

        return (
            `egodact_weekplanning_${datumKey(
                weekStart
            )}`
        );
    }

    function laadWeek() {

        try {

            const opgeslagen =
                localStorage.getItem(
                    weekStorageKey()
                );

            if (!opgeslagen) {
                const standaardWeek = localStorage.getItem("egodact_weekplanning_template");
                if (standaardWeek) {
                    try {
                        const template = JSON.parse(standaardWeek);
                        if (Array.isArray(template) && template.length) {
                            const kopie = template.map(blok => ({
                                ...blok,
                                id: (typeof crypto !== "undefined" && crypto.randomUUID)
                                    ? crypto.randomUUID()
                                    : `weekblok-${Date.now()}-${Math.random().toString(16).slice(2)}`
                            }));
                            localStorage.setItem(weekStorageKey(), JSON.stringify(kopie));
                            return kopie;
                        }
                    } catch (error) {
                        console.error("Fout bij laden van standaard weekplanning:", error);
                    }
                }
                return [];
            }

            const data =
                JSON.parse(opgeslagen);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Fout bij laden weekplanning:",
                error
            );

            return [];
        }
    }

    function slaWeekOp(data) {

        localStorage.setItem(
            weekStorageKey(),
            JSON.stringify(data)
        );
    }

    let weekData =
        laadWeek();

    // Houdt het actieve drag-object bij.
    // Dit voorkomt problemen met dataTransfer.getData()
    // in sommige browsers.
    window.__egodactDraggedWeekBlock =
        null;

    // ========================================================
    // BACKDROP
    // ========================================================

    const backdrop =
        document.createElement("div");

    backdrop.id =
        "egodact-custom-modal-backdrop";

    Object.assign(
        backdrop.style,
        {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor:
                "var(--egd-backdrop)",
            zIndex: "9999999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily:
                "Arial, sans-serif"
        }
    );

    // ========================================================
    // MODAL
    // ========================================================

    const modal =
        document.createElement("div");

    Object.assign(
        modal.style,
        {
            backgroundColor: "var(--egd-modal)",
            color: "var(--egd-tekst)",
            width: "min(1400px, 96vw)",
            maxWidth: "96vw",
            maxHeight: "94vh",
            boxSizing: "border-box",
            minHeight: "0",
            overflow: "hidden",
            borderRadius: "6px",
            padding: "clamp(10px, 1.5vw, 20px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow:
                "var(--egd-schaduw)",
            position: "relative"
        }
    );

    // ========================================================
    // HEADER
    // ========================================================

    modal.innerHTML = `

        <div style="
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--egd-rand);
            padding-bottom: 12px;
            gap: 10px;
            min-width: 0;
        ">

            <h2 style="
                margin: 0;
                font-size: 22px;
                font-weight: 500;
                flex: 0 0 auto;
            ">
                Weekplanning
            </h2>

            <div style="
                display: flex;
                flex: 1 1 700px;
                min-width: 0;
                flex-wrap: wrap;
                justify-content: flex-end;
                align-items: center;
                gap: 8px;
            ">

                <button
                    id="egodact-vorige-week"
                    type="button"
                    style="
                        background: var(--egd-paneel);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 7px 12px;
                        cursor: pointer;
                        font-size: 16px;
                    "
                >
                    ‹
                </button>

                <button
                    id="egodact-vandaag-week"
                    type="button"
                    style="
                        background: var(--egd-paneel);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 7px 12px;
                        cursor: pointer;
                        font-size: 13px;
                    "
                >
                    Vandaag
                </button>

                <button
                    id="egodact-volgende-week"
                    type="button"
                    style="
                        background: var(--egd-paneel);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 7px 12px;
                        cursor: pointer;
                        font-size: 16px;
                    "
                >
                    ›
                </button>

                <input
                    id="egodact-week-zoek"
                    type="text"
                    placeholder="Zoek challenge of vak..."
                    autocomplete="off"
                    style="
                        background: var(--egd-veld);
                        color: var(--egd-tekst);
                        border: 1px solid var(--egd-rand);
                        border-radius: 4px;
                        padding: 8px 10px;
                        font-size: 13px;
                        width: 210px;
                        outline: none;
                        font-family: inherit;
                    "
                >

                <span
                    id="egodact-week-titel"
                    style="
                        min-width: 150px;
                        text-align: center;
                        font-size: 14px;
                        color: var(--egd-tekst);
                    "
                ></span>

                <button
                    id="egodact-week-sla-standaard-op"
                    type="button"
                    style="background:#ff9800;color:#fff;border:none;border-radius:4px;padding:9px 12px;cursor:pointer;font-weight:bold;font-size:13px;"
                >
                    Sla op als standaard week
                </button>

                <button
                    id="egodact-week-blok-toevoegen"
                    type="button"
                    style="
                        background: var(--egd-accent);
                        color: var(--egd-accent-tekst);
                        border: none;
                        border-radius: 4px;
                        padding: 9px 14px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                    "
                >
                    + Blok toevoegen
                </button>

            </div>

        </div>

        <div style="
            display:flex;
            flex-wrap:wrap;
            gap:8px;
            align-items:center;
            padding:8px 10px;
            background:var(--egd-paneel);
            border:1px solid var(--egd-rand);
            border-radius:4px;
        ">
            <button id="egodact-week-kopieer" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);border-radius:4px;padding:7px 10px;cursor:pointer;font-size:12px;">Kopieer week</button>
            <button id="egodact-week-plak-blok" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);border-radius:4px;padding:7px 10px;cursor:pointer;font-size:12px;">Plak blok</button>
            <button id="egodact-week-plak" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);border-radius:4px;padding:7px 10px;cursor:pointer;font-size:12px;">Plak week</button>
            <span style="width:1px;height:22px;background:var(--egd-rand);margin:0 2px;"></span>
            <button id="egodact-week-export" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);border-radius:4px;padding:7px 10px;cursor:pointer;font-size:12px;">Exporteer week</button>
            <button id="egodact-week-import-knop" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);border-radius:4px;padding:7px 10px;cursor:pointer;font-size:12px;">Importeer week</button>
            <input id="egodact-week-import-bestand" type="file" accept=".json,application/json" style="display:none;">
        </div>

        <div
            id="egodact-weekplanning-content"
            style="
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(190px, 230px);
                gap: 12px;
                min-height: 0;
                flex: 1 1 auto;
                overflow: hidden;
            "
        ></div>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 2px;
        ">

            <button
                id="egodact-weekplanning-sluiten"
                type="button"
                style="
                    background-color: var(--egd-accent);
                    border: none;
                    color: var(--egd-accent-tekst);
                    cursor: pointer;
                    padding: 10px 20px;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    border-radius: 4px;
                "
            >
                Sluiten
            </button>

        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // ========================================================
    // WEEK TITEL
    // ========================================================

    function updateWeekTitel() {

        const einde =
            new Date(weekStart);

        einde.setDate(
            einde.getDate() + 6
        );

        const beginTekst =
            weekStart.toLocaleDateString(
                "nl-NL",
                {
                    day: "numeric",
                    month: "short"
                }
            );

        const eindeTekst =
            einde.toLocaleDateString(
                "nl-NL",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

        document.getElementById(
            "egodact-week-titel"
        ).textContent =
            `${beginTekst} – ${eindeTekst}`;
    }

    // ========================================================
    // EDITOR
    // ========================================================

    function openBlokEditor(
        dag = 0,
        start = 9 * 60,
        einde = 10 * 60,
        onderwerp = "",
        bestaandBlok = null,
        challengeId = null
    ) {

        const isBewerken =
            bestaandBlok !== null;

        const gekoppeldeChallengeId =
            isBewerken
                ? bestaandBlok.challengeId || null
                : challengeId;

        const editorBackdrop =
            document.createElement("div");

        Object.assign(
            editorBackdrop.style,
            {
                position: "absolute",
                inset: "0",
                background:
                    "var(--egd-backdrop)",
                zIndex: "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }
        );

        const editor =
            document.createElement("div");

        Object.assign(
            editor.style,
            {
                background: "var(--egd-modal)",
                width: "420px",
                maxWidth: "90%",
                maxHeight:
                    "min(calc(100% - 24px), calc(100vh - 48px))",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "6px",
                padding: "0",
                boxShadow:
                    "0 10px 30px rgba(0,0,0,0.5)"
            }
        );

        const bestaandeNaam =
            isBewerken
                ? bestaandBlok.naam || ""
                : onderwerp || "";

        const bestaandeBeschrijving =
            isBewerken
                ? bestaandBlok.beschrijving || ""
                : "";

        editor.innerHTML = `

            <h3 style="
                margin: 0 0 18px 0;
                font-size: 19px;
                font-weight: 500;
            ">
                ${
                    isBewerken
                        ? "Blok bewerken"
                        : "Nieuw blok"
                }
            </h3>

            <label style="
                display: block;
                margin-bottom: 6px;
                font-size: 13px;
                color: var(--egd-tekst-zacht);
            ">
                Naam
            </label>

            <input
                id="egodact-blok-naam"
                type="text"
                placeholder="Bijvoorbeeld: Duits leren"
                value="${escapeHTML(
                    bestaandeNaam
                )}"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    background: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    border-radius: 4px;
                    padding: 9px;
                    margin-bottom: 14px;
                    outline: none;
                "
            >

            <label style="
                display: block;
                margin-bottom: 6px;
                font-size: 13px;
                color: var(--egd-tekst-zacht);
            ">
                Beschrijving
            </label>

            <textarea
                id="egodact-blok-beschrijving"
                placeholder="Wat moet je doen?"
                rows="4"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    resize: vertical;
                    background: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    border-radius: 4px;
                    padding: 9px;
                    margin-bottom: 14px;
                    outline: none;
                    font-family: inherit;
                "
            >${escapeHTML(
                bestaandeBeschrijving
            )}</textarea>

            <label style="
                display: block;
                margin-bottom: 6px;
                font-size: 13px;
                color: var(--egd-tekst-zacht);
            ">
                Dag
            </label>

            <select
                id="egodact-blok-dag"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    background: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    border-radius: 4px;
                    padding: 9px;
                    margin-bottom: 14px;
                "
            >
                <option value="0">Maandag</option>
                <option value="1">Dinsdag</option>
                <option value="2">Woensdag</option>
                <option value="3">Donderdag</option>
                <option value="4">Vrijdag</option>
                <option value="5">Zaterdag</option>
                <option value="6">Zondag</option>
            </select>

            <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 18px;
            ">

                <div>

                    <label style="
                        display: block;
                        margin-bottom: 6px;
                        font-size: 13px;
                        color: var(--egd-tekst-zacht);
                    ">
                        Van
                    </label>

                    <input
                        id="egodact-blok-start"
                        type="time"
                        value="${tijdAlsString(start)}"
                        style="
                            width: 100%;
                            box-sizing: border-box;
                            background: var(--egd-veld);
                            color: var(--egd-tekst);
                            border: 1px solid var(--egd-rand);
                            border-radius: 4px;
                            padding: 9px;
                        "
                    >

                </div>

                <div>

                    <label style="
                        display: block;
                        margin-bottom: 6px;
                        font-size: 13px;
                        color: var(--egd-tekst-zacht);
                    ">
                        Tot
                    </label>

                    <input
                        id="egodact-blok-einde"
                        type="time"
                        value="${tijdAlsString(einde)}"
                        style="
                            width: 100%;
                            box-sizing: border-box;
                            background: var(--egd-veld);
                            color: var(--egd-tekst);
                            border: 1px solid var(--egd-rand);
                            border-radius: 4px;
                            padding: 9px;
                        "
                    >

                </div>

            </div>

            <div style="
                display: flex;
                justify-content: space-between;
                gap: 8px;
            ">

                ${
                    isBewerken
                        ? `
                            <button
                                id="egodact-blok-verwijderen"
                                type="button"
                                style="
                                    background: #c62828;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    padding: 9px 15px;
                                    cursor: pointer;
                                    font-weight: bold;
                                "
                            >
                                Verwijderen
                            </button>
                        `
                        : `
                            <div></div>
                        `
                }

                <div style="
                    display: flex;
                    gap: 8px;
                ">

                    <button
                        id="egodact-blok-annuleren"
                        type="button"
                        style="
                            background: var(--egd-paneel);
                            color: var(--egd-tekst);
                            border: 1px solid var(--egd-rand);
                            border-radius: 4px;
                            padding: 9px 15px;
                            cursor: pointer;
                        "
                    >
                        Annuleren
                    </button>

                    <button
                        id="egodact-blok-opslaan"
                        type="button"
                        style="
                            background: var(--egd-accent);
                            color: var(--egd-accent-tekst);
                            border: none;
                            border-radius: 4px;
                            padding: 9px 15px;
                            cursor: pointer;
                            font-weight: bold;
                        "
                    >
                        Opslaan
                    </button>

                </div>

            </div>
        `;

        // ====================================================
        // CHALLENGE-INFO (standaard ingeklapt)
        // ====================================================

        const gekoppeldeChallenge =
            gekoppeldeChallengeId &&
            challengeLijst
                ? challengeLijst.find(
                    c =>
                        c.id ===
                        gekoppeldeChallengeId
                )
                : null;

        if (gekoppeldeChallenge) {

            const wrap =
                document.createElement("div");

            Object.assign(
                wrap.style,
                {
                    background: "var(--egd-info)",
                    borderRadius: "4px",
                    marginBottom: "14px"
                }
            );

            const kop =
                document.createElement("div");

            Object.assign(
                kop.style,
                {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    cursor: "pointer"
                }
            );

            const miniThumb =
                bordAfb.thumbs[
                    gekoppeldeChallenge.id
                ];

            if (miniThumb) {

                const img =
                    document.createElement("img");

                img.src =
                    miniThumb;

                img.alt =
                    "";

                Object.assign(
                    img.style,
                    {
                        width: "34px",
                        height: "34px",
                        objectFit: "cover",
                        borderRadius: "3px",
                        flexShrink: "0",
                        display: "none"
                    }
                );

                img.addEventListener(
                    "load",
                    () => {
                        img.style.display =
                            "block";
                    }
                );

                kop.appendChild(
                    img
                );
            }

            const kopTekst =
                document.createElement("div");

            kopTekst.style.flex =
                "1";

            kopTekst.style.minWidth =
                "0";

            const kopNaam =
                document.createElement("div");

            kopNaam.textContent =
                `Challenge: ${gekoppeldeChallenge.naam}`;

            Object.assign(
                kopNaam.style,
                {
                    fontSize: "12px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }
            );

            kopTekst.appendChild(
                kopNaam
            );

            const kopAvatars =
                document.createElement("div");

            Object.assign(
                kopAvatars.style,
                {
                    display: "flex",
                    gap: "2px",
                    marginTop: "3px"
                }
            );

            gekoppeldeChallenge.users
                .slice(0, 8)
                .forEach(
                    u => {

                        kopAvatars.appendChild(
                            egodactMaakAvatar(
                                u,
                                bordAfb.users[u.name],
                                16
                            )
                        );
                    }
                );

            kopTekst.appendChild(
                kopAvatars
            );

            kop.appendChild(
                kopTekst
            );

            const kopPijl =
                document.createElement("span");

            kopPijl.textContent =
                "▸";

            kopPijl.style.opacity =
                "0.7";

            kop.appendChild(
                kopPijl
            );

            const details =
                egodactMaakInfoBlok(
                    gekoppeldeChallenge,
                    bordAfb,
                    true
                );

            details.style.display =
                "none";

            details.style.borderRadius =
                "0 0 4px 4px";

            kop.addEventListener(
                "click",
                () => {

                    const open =
                        details.style.display ===
                        "none";

                    details.style.display =
                        open
                            ? "flex"
                            : "none";

                    kopPijl.textContent =
                        open
                            ? "▾"
                            : "▸";
                }
            );

            wrap.appendChild(
                kop
            );

            wrap.appendChild(
                details
            );

            editor.children[0].after(
                wrap
            );
        }

        // ====================================================
        // KLEUR
        // ====================================================

        let gekozenKleur =
            isBewerken
                ? bestaandBlok.kleur || null
                : (
                    gekoppeldeChallenge &&
                    gekoppeldeChallenge.kleur
                ) || null;

        const knoppenRij =
            editor.lastElementChild;

        const kleurSectie =
            document.createElement("div");

        kleurSectie.style.marginBottom =
            "16px";

        const kleurLabel =
            document.createElement("label");

        kleurLabel.textContent =
            "Kleur";

        Object.assign(
            kleurLabel.style,
            {
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                color: "var(--egd-tekst-zacht)"
            }
        );

        kleurSectie.appendChild(
            kleurLabel
        );

        const kleurRij =
            document.createElement("div");

        kleurRij.id =
            "egodact-blok-kleuren";

        Object.assign(
            kleurRij.style,
            {
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                alignItems: "center"
            }
        );

        const kleurKnoppen = [];

        const gelijk =
            (x, y) =>
                (x || null) === null
                    ? (y || null) === null
                    : (y || "").toLowerCase() ===
                      x.toLowerCase();

        const eigenKleur =
            document.createElement("input");

        function updateKleurKnoppen() {

            kleurKnoppen.forEach(
                ({ knop, kleur }) => {

                    const gekozen =
                        gelijk(
                            kleur,
                            gekozenKleur
                        );

                    knop.style.border =
                        gekozen
                            ? "3px solid var(--egd-tekst)"
                            : "2px solid var(--egd-rand)";

                    knop.dataset.gekozen =
                        gekozen
                            ? "ja"
                            : "nee";
                }
            );

            if (gekozenKleur) {

                eigenKleur.value =
                    gekozenKleur.toLowerCase();
            }
        }

        EGODACT_BLOK_KLEUREN.forEach(
            kleur => {

                const knop =
                    document.createElement("button");

                knop.type =
                    "button";

                knop.title =
                    kleur ||
                    "Standaard (blauw)";

                Object.assign(
                    knop.style,
                    {
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        padding: "0",
                        boxSizing: "border-box",
                        background:
                            kleur ||
                            EGODACT_STANDAARD_BLOKKLEUR
                    }
                );

                knop.addEventListener(
                    "click",
                    () => {

                        gekozenKleur =
                            kleur;

                        updateKleurKnoppen();
                    }
                );

                kleurKnoppen.push({
                    knop,
                    kleur
                });

                kleurRij.appendChild(
                    knop
                );
            }
        );

        eigenKleur.type =
            "color";

        eigenKleur.id =
            "egodact-blok-kleur-eigen";

        eigenKleur.title =
            "Eigen kleur kiezen";

        eigenKleur.value =
            (
                gekozenKleur ||
                EGODACT_STANDAARD_BLOKKLEUR
            ).toLowerCase();

        Object.assign(
            eigenKleur.style,
            {
                width: "30px",
                height: "28px",
                padding: "0",
                border: "none",
                background: "none",
                cursor: "pointer"
            }
        );

        eigenKleur.addEventListener(
            "input",
            () => {

                gekozenKleur =
                    eigenKleur.value;

                updateKleurKnoppen();
            }
        );

        kleurRij.appendChild(
            eigenKleur
        );

        kleurSectie.appendChild(
            kleurRij
        );

        editor.insertBefore(
            kleurSectie,
            knoppenRij
        );

        updateKleurKnoppen();

        // ====================================================
        // SCROLLBAAR MIDDENDEEL, KNOPPEN BLIJVEN ZICHTBAAR
        // ====================================================

        const inhoud =
            document.createElement("div");

        Object.assign(
            inhoud.style,
            {
                overflowY: "auto",
                minHeight: "0",
                flex: "1 1 auto",
                padding: "20px 20px 4px"
            }
        );

        while (
            editor.firstChild &&
            editor.firstChild !== knoppenRij
        ) {

            inhoud.appendChild(
                editor.firstChild
            );
        }

        editor.insertBefore(
            inhoud,
            knoppenRij
        );

        Object.assign(
            knoppenRij.style,
            {
                padding: "12px 20px 20px",
                borderTop: "1px solid var(--egd-rand)",
                flexShrink: "0"
            }
        );

        editorBackdrop.appendChild(
            editor
        );

        modal.appendChild(
            editorBackdrop
        );

        document.getElementById(
            "egodact-blok-dag"
        ).value =
            String(dag);

        // ====================================================
        // ANNULEREN
        // ====================================================

        document
            .getElementById(
                "egodact-blok-annuleren"
            )
            .addEventListener(
                "click",
                () => {
                    editorBackdrop.remove();
                }
            );

        // ====================================================
        // VERWIJDEREN
        // ====================================================

        if (isBewerken) {

            document
                .getElementById(
                    "egodact-blok-verwijderen"
                )
                .addEventListener(
                    "click",
                    () => {

                        const index =
                            weekData.findIndex(
                                blok =>
                                    String(
                                        blok.id
                                    ) ===
                                    String(
                                        bestaandBlok.id
                                    )
                            );

                        if (index !== -1) {

                            weekData.splice(
                                index,
                                1
                            );

                            slaWeekOp(
                                weekData
                            );

                            editorBackdrop.remove();

                            renderWeek();
                        }
                    }
                );
        }

        // ====================================================
        // OPSLAAN
        // ====================================================

        document
            .getElementById(
                "egodact-blok-opslaan"
            )
            .addEventListener(
                "click",
                () => {

                    const naam =
                        document.getElementById(
                            "egodact-blok-naam"
                        ).value.trim();

                    const beschrijving =
                        document.getElementById(
                            "egodact-blok-beschrijving"
                        ).value.trim();

                    const gekozenDag =
                        Number(
                            document.getElementById(
                                "egodact-blok-dag"
                            ).value
                        );

                    const startTijd =
                        document.getElementById(
                            "egodact-blok-start"
                        ).value;

                    const eindeTijd =
                        document.getElementById(
                            "egodact-blok-einde"
                        ).value;

                    if (!naam) {

                        alert(
                            "Geef het blok een naam."
                        );

                        return;
                    }

                    if (
                        !startTijd ||
                        !eindeTijd
                    ) {

                        alert(
                            "Kies een begin- en eindtijd."
                        );

                        return;
                    }

                    const startMinuten =
                        tijdNaarMinuten(
                            startTijd
                        );

                    const eindeMinuten =
                        tijdNaarMinuten(
                            eindeTijd
                        );

                    if (
                        eindeMinuten <=
                        startMinuten
                    ) {

                        alert(
                            "De eindtijd moet na de begintijd liggen."
                        );

                        return;
                    }

                    // ========================================
                    // BESTAAND BLOK BEWERKEN
                    // ========================================

                    if (isBewerken) {

                        const blok =
                            weekData.find(
                                b =>
                                    String(
                                        b.id
                                    ) ===
                                    String(
                                        bestaandBlok.id
                                    )
                            );

                        if (!blok) {
                            return;
                        }

                        blok.dag =
                            gekozenDag;

                        blok.start =
                            startMinuten;

                        blok.einde =
                            eindeMinuten;

                        blok.naam =
                            naam;

                        blok.beschrijving =
                            beschrijving;

                        blok.kleur =
                            gekozenKleur;

                        if (!blok.onderwerp) {

                            blok.onderwerp =
                                onderwerp;
                        }

                    }

                    // ========================================
                    // NIEUW BLOK
                    // ========================================

                    else {

                        weekData.push({

                            id:
                                Date.now() +
                                Math.random(),

                            dag:
                                gekozenDag,

                            start:
                                startMinuten,

                            einde:
                                eindeMinuten,

                            naam:
                                naam,

                            beschrijving:
                                beschrijving,

                            onderwerp:
                                onderwerp,

                            challengeId:
                                gekoppeldeChallengeId,

                            kleur:
                                gekozenKleur
                        });
                    }

                    slaWeekOp(
                        weekData
                    );

                    editorBackdrop.remove();

                    renderWeek();
                }
            );

        document
            .getElementById(
                "egodact-blok-naam"
            )
            .focus();
    }

    // ========================================================
    // TIJD HELPERS
    // ========================================================

    function tijdNaarMinuten(tijd) {

        const delen =
            tijd.split(":");

        return (
            Number(delen[0]) * 60 +
            Number(delen[1])
        );
    }

    function tijdAlsString(minuten) {

        const uren =
            Math.floor(
                minuten / 60
            );

        const minutenRest =
            minuten % 60;

        return (
            String(uren).padStart(
                2,
                "0"
            ) +
            ":" +
            String(minutenRest).padStart(
                2,
                "0"
            )
        );
    }

    function formatTijd(minuten) {

        return tijdAlsString(
            minuten
        );
    }

    // ========================================================
    // HTML VEILIG MAKEN
    // ========================================================

    function escapeHTML(tekst) {

        return String(tekst)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

    // ========================================================
    // ZIJBALK: CHALLENGES EN VAKKEN
    // ========================================================

    const vakNamen = [
        "Nederlands",
        "Engels",
        "Duits",
        "Wiskunde",
        "Biologie",
        "Geschiedenis",
        "Aardrijkskunde",
        "Natuurkunde",
        "Scheikunde",
        "Frans",
        "Economie",
        "Informatica"
    ];

    let challengeLijst = null;
    let challengeFout = null;
    let zoekTerm = "";
    let openChallengeId = null;
    let selectieOpruimen = null;
    let bordAfb = { thumbs: {}, users: {}, werelden: {} };

    // Leest thumbnails, foto's en wereld-icoontjes van het Egodact-bord
    // dat achter dit venster staat.
    function leesBord() {

        try {

            bordAfb =
                egodactSchraapBord(
                    challengeLijst.map(
                        c => c.raw
                    ),
                    backdrop
                );

        } catch (fout) {

            console.warn(
                "Egodact: afbeeldingen van het bord lezen mislukt",
                fout
            );
        }
    }

    function maakChallengeItem(c) {

        const wrapper =
            document.createElement("div");

        wrapper.style.marginBottom =
            "5px";

        const open =
            openChallengeId === c.id;

        const achtergrond =
            c.kleur || "#1976d2";

        const lichteTekst =
            !c.kleur ||
            egodactKleurIsDonker(
                c.kleur
            );

        const rij =
            document.createElement("div");

        rij.draggable =
            true;

        rij.title =
            "Klik voor details, sleep naar de kalender";

        Object.assign(
            rij.style,
            {
                background:
                    achtergrond,
                color:
                    lichteTekst
                        ? "#ffffff"
                        : "#212121",
                borderRadius:
                    open
                        ? "4px 4px 0 0"
                        : "4px",
                padding:
                    "6px 8px 6px 6px",
                cursor:
                    "grab",
                display:
                    "flex",
                alignItems:
                    "center",
                gap:
                    "8px",
                borderLeft:
                    "4px solid rgba(255,255,255,0.55)",
                userSelect:
                    "none",
                overflowWrap:
                    "anywhere"
            }
        );

        const thumbUrl =
            bordAfb.thumbs[c.id];

        if (thumbUrl) {

            const img =
                document.createElement("img");

            img.src =
                thumbUrl;

            img.alt =
                "";

            img.draggable =
                false;

            Object.assign(
                img.style,
                {
                    width: "36px",
                    height: "36px",
                    objectFit: "cover",
                    borderRadius: "3px",
                    flexShrink: "0",
                    background: "#fff",
                    display: "none"
                }
            );

            img.addEventListener(
                "load",
                () => {
                    img.style.display =
                        "block";
                }
            );

            rij.appendChild(
                img
            );
        }

        const tekstKolom =
            document.createElement("div");

        tekstKolom.style.minWidth =
            "0";

        tekstKolom.style.flex =
            "1";

        const naam =
            document.createElement("div");

        naam.textContent =
            c.naam;

        Object.assign(
            naam.style,
            {
                fontSize: "12px",
                fontWeight: "bold"
            }
        );

        tekstKolom.appendChild(
            naam
        );

        if (c.rij) {

            const sub =
                document.createElement("div");

            sub.textContent =
                c.rij;

            Object.assign(
                sub.style,
                {
                    fontSize: "10px",
                    opacity: "0.8"
                }
            );

            tekstKolom.appendChild(
                sub
            );
        }

        if (c.users.length) {

            const avatars =
                document.createElement("div");

            Object.assign(
                avatars.style,
                {
                    display: "flex",
                    gap: "2px",
                    marginTop: "3px",
                    alignItems: "center"
                }
            );

            c.users
                .slice(0, 6)
                .forEach(
                    u => {

                        avatars.appendChild(
                            egodactMaakAvatar(
                                u,
                                bordAfb.users[u.name],
                                16
                            )
                        );
                    }
                );

            if (c.users.length > 6) {

                const meer =
                    document.createElement("span");

                meer.textContent =
                    `+${c.users.length - 6}`;

                meer.style.fontSize =
                    "10px";

                avatars.appendChild(
                    meer
                );
            }

            tekstKolom.appendChild(
                avatars
            );
        }

        rij.appendChild(
            tekstKolom
        );

        const pijl =
            document.createElement("span");

        pijl.textContent =
            open
                ? "▾"
                : "▸";

        Object.assign(
            pijl.style,
            {
                fontSize: "11px",
                opacity: "0.7",
                flexShrink: "0"
            }
        );

        rij.appendChild(
            pijl
        );

        rij.addEventListener(
            "click",
            () => {

                openChallengeId =
                    open
                        ? null
                        : c.id;

                ververszijbalk();
            }
        );

        rij.addEventListener(
            "dragstart",
            event => {

                const dragData = {
                    type:
                        "subject",
                    subject:
                        c.naam,
                    challengeId:
                        c.id
                };

                event.dataTransfer.effectAllowed =
                    "copy";

                event.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify(
                        dragData
                    )
                );

                window.__egodactDraggedWeekBlock =
                    dragData;
            }
        );

        rij.addEventListener(
            "dragend",
            () => {

                window.__egodactDraggedWeekBlock =
                    null;
            }
        );

        wrapper.appendChild(
            rij
        );

        if (open) {

            const info =
                egodactMaakInfoBlok(
                    c,
                    bordAfb,
                    false
                );

            Object.assign(
                info.style,
                {
                    borderRadius:
                        "0 0 4px 4px",
                    borderLeft:
                        `4px solid ${achtergrond}`
                }
            );

            wrapper.appendChild(
                info
            );
        }

        return wrapper;
    }

    function maakSleepItem(
        tekst,
        subtekst,
        kleur
    ) {

        const item =
            document.createElement(
                "div"
            );

        item.draggable =
            true;

        const achtergrond =
            kleur || "#1976d2";

        Object.assign(
            item.style,
            {
                background:
                    achtergrond,
                color:
                    kleur &&
                    !egodactKleurIsDonker(kleur)
                        ? "#212121"
                        : "#ffffff",
                borderRadius:
                    "4px",
                padding:
                    "6px 8px",
                marginBottom:
                    "5px",
                cursor:
                    "grab",
                fontSize:
                    "12px",
                fontWeight:
                    "bold",
                borderLeft:
                    "4px solid rgba(255,255,255,0.55)",
                userSelect:
                    "none",
                overflowWrap:
                    "anywhere"
            }
        );

        const titel =
            document.createElement(
                "div"
            );

        titel.textContent =
            tekst;

        item.appendChild(
            titel
        );

        if (subtekst) {

            const sub =
                document.createElement(
                    "div"
                );

            sub.textContent =
                subtekst;

            Object.assign(
                sub.style,
                {
                    fontSize:
                        "10px",
                    fontWeight:
                        "normal",
                    opacity:
                        "0.8",
                    marginTop:
                        "1px"
                }
            );

            item.appendChild(
                sub
            );
        }

        item.addEventListener(
            "dragstart",
            event => {

                const dragData = {
                    type:
                        "subject",
                    subject:
                        tekst
                };

                event.dataTransfer.effectAllowed =
                    "copy";

                event.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify(
                        dragData
                    )
                );

                window.__egodactDraggedWeekBlock =
                    dragData;
            }
        );

        item.addEventListener(
            "dragend",
            () => {

                window.__egodactDraggedWeekBlock =
                    null;
            }
        );

        return item;
    }

    function maakZijbalkKop(
        tekst
    ) {

        const kop =
            document.createElement(
                "div"
            );

        kop.textContent =
            tekst;

        Object.assign(
            kop.style,
            {
                fontSize: "11px",
                fontWeight: "bold",
                color: "var(--egd-tekst-zacht)",
                textTransform:
                    "uppercase",
                letterSpacing:
                    "0.5px",
                margin:
                    "12px 0 6px"
            }
        );

        return kop;
    }

    function vulZijbalk(
        zijbalk
    ) {

        zijbalk.replaceChildren();

        const titel =
            document.createElement(
                "div"
            );

        titel.textContent =
            "Challenges & vakken";

        Object.assign(
            titel.style,
            {
                fontSize: "15px",
                fontWeight: "bold"
            }
        );

        const uitleg =
            document.createElement(
                "div"
            );

        uitleg.textContent =
            zoekTerm.trim()
                ? "Sleep naar de kalender"
                : "Sleep naar de kalender, of zoek hierboven";

        Object.assign(
            uitleg.style,
            {
                fontSize: "11px",
                color: "var(--egd-tekst-zacht)",
                marginTop: "3px"
            }
        );

        zijbalk.appendChild(
            titel
        );

        zijbalk.appendChild(
            uitleg
        );

        const inhoud =
            egodactZijbalkInhoud(
                challengeLijst,
                vakNamen,
                zoekTerm
            );

        // ---- Challenges ----

        if (challengeFout) {

            const fout =
                document.createElement(
                    "div"
                );

            fout.textContent =
                `Challenges laden mislukt: ${challengeFout}`;

            Object.assign(
                fout.style,
                {
                    fontSize: "11px",
                    color: "var(--egd-fout)",
                    marginTop: "10px"
                }
            );

            zijbalk.appendChild(
                fout
            );

        } else if (!challengeLijst) {

            const laden =
                document.createElement(
                    "div"
                );

            laden.textContent =
                "Challenges laden...";

            Object.assign(
                laden.style,
                {
                    fontSize: "12px",
                    color: "var(--egd-tekst-zacht)",
                    marginTop: "10px"
                }
            );

            zijbalk.appendChild(
                laden
            );

        } else {

            let huidigeFase =
                null;

            inhoud.challenges.forEach(
                c => {

                    if (
                        c.fase !==
                        huidigeFase
                    ) {

                        huidigeFase =
                            c.fase;

                        zijbalk.appendChild(
                            maakZijbalkKop(
                                EGODACT_FASE_NAAM[
                                    c.fase
                                ] || c.fase
                            )
                        );
                    }

                    zijbalk.appendChild(
                        maakChallengeItem(
                            c
                        )
                    );
                }
            );

            if (
                zoekTerm.trim() &&
                !inhoud.challenges.length
            ) {

                const leeg =
                    document.createElement(
                        "div"
                    );

                leeg.textContent =
                    "Geen challenges gevonden.";

                Object.assign(
                    leeg.style,
                    {
                        fontSize: "12px",
                        color: "var(--egd-tekst-zacht)",
                        marginTop: "10px"
                    }
                );

                zijbalk.appendChild(
                    leeg
                );
            }
        }

        // ---- Vakken ----

        if (inhoud.vakken.length) {

            zijbalk.appendChild(
                maakZijbalkKop(
                    "Vakken"
                )
            );

            inhoud.vakken.forEach(
                vak => {

                    zijbalk.appendChild(
                        maakSleepItem(
                            vak,
                            "",
                            null
                        )
                    );
                }
            );
        }
    }

    function ververszijbalk() {

        const zijbalk =
            document.getElementById(
                "egodact-vakken-zijbalk"
            );

        if (zijbalk) {

            vulZijbalk(
                zijbalk
            );
        }
    }

    // ========================================================
    // WEEK RENDEREN
    // ========================================================

    function renderWeek() {

        // Oude drag-status nooit meenemen naar
        // een opnieuw gerenderde kalender.
        window.__egodactDraggedWeekBlock =
            null;

        if (selectieOpruimen) {
            selectieOpruimen();
        }

        weekData =
            laadWeek();

        const content =
            document.getElementById(
                "egodact-weekplanning-content"
            );

        if (!content) {
            return;
        }

        content.innerHTML = "";

        updateWeekTitel();

        const calendar =
            document.createElement("div");

        Object.assign(
            calendar.style,
            {
                minWidth: "0",
                background: "var(--egd-veld)",
                border:
                    "1px solid var(--egd-rand)",
                borderRadius: "5px",
                overflow: "auto",
                maxHeight: "620px"
            }
        );

        // ====================================================
        // HEADER
        // ====================================================

        const header =
            document.createElement("div");

        Object.assign(
            header.style,
            {
                display: "grid",
                gridTemplateColumns:
                    "55px repeat(7, minmax(90px, 1fr))",
                minWidth: "685px",
                position: "sticky",
                top: "0",
                zIndex: "15",
                background: "var(--egd-paneel)",
                borderBottom:
                    "1px solid var(--egd-rand)"
            }
        );

        header.appendChild(
            document.createElement("div")
        );

        const dagen = [
            "MA",
            "DI",
            "WO",
            "DO",
            "VR",
            "ZA",
            "ZO"
        ];

        dagen.forEach(
            (dagNaam, index) => {

                const dag =
                    document.createElement(
                        "div"
                    );

                const datum =
                    new Date(
                        weekStart
                    );

                datum.setDate(
                    datum.getDate() +
                    index
                );

                const dagNummer =
                    datum.getDate();

                dag.innerHTML = `
                    <div style="
                        font-size: 11px;
                        color: var(--egd-tekst-zacht);
                    ">
                        ${dagNaam}
                    </div>

                    <div style="
                        font-size: 17px;
                        font-weight: bold;
                        margin-top: 3px;
                    ">
                        ${dagNummer}
                    </div>
                `;

                Object.assign(
                    dag.style,
                    {
                        textAlign: "center",
                        padding: "8px 3px",
                        borderLeft:
                            "1px solid var(--egd-lijn)"
                    }
                );

                header.appendChild(
                    dag
                );
            }
        );

        calendar.appendChild(
            header
        );

        // ====================================================
        // TIJDSLIJN
        // ====================================================

        const body =
            document.createElement("div");

        Object.assign(
            body.style,
            {
                display: "grid",
                gridTemplateColumns:
                    "55px repeat(7, minmax(90px, 1fr))",
                minWidth: "685px"
            }
        );

        const eersteUur = 7;
        const laatsteUur = 22;
        const hoogtePerUur = 60;

        // ====================================================
        // TIJDKOLOM
        // ====================================================

        const tijdKolom =
            document.createElement("div");

        for (
            let uur = eersteUur;
            uur < laatsteUur;
            uur++
        ) {

            const tijd =
                document.createElement("div");

            tijd.textContent =
                `${String(uur).padStart(
                    2,
                    "0"
                )}:00`;

            Object.assign(
                tijd.style,
                {
                    height:
                        `${hoogtePerUur}px`,
                    boxSizing:
                        "border-box",
                    padding:
                        "4px 5px",
                    color:
                        "var(--egd-tekst-zacht)",
                    fontSize:
                        "11px",
                    borderBottom:
                        "1px solid var(--egd-lijn)"
                }
            );

            tijdKolom.appendChild(
                tijd
            );
        }

        body.appendChild(
            tijdKolom
        );

        // ====================================================
        // DAGKOLOMMEN
        // ====================================================

        const alleDagKolommen = [];

        // Klikken en slepen in een dagkolom: de selectie werkt in cellen
        // van 30 minuten. Een enkele klik geeft (zoals altijd) het hele
        // uur; slepen geeft precies het gesleepte bereik.
        const CEL_MINUTEN = 30;

        const aantalCellen =
            (laatsteUur - eersteUur) *
            60 /
            CEL_MINUTEN;

        let actieveSelectie = null;
        let scrollTimer = null;

        function celBij(dagKolom, clientY) {

            const rect =
                dagKolom.getBoundingClientRect();

            const cel =
                Math.floor(
                    (clientY - rect.top) /
                    (
                        hoogtePerUur *
                        CEL_MINUTEN /
                        60
                    )
                );

            return Math.max(
                0,
                Math.min(
                    aantalCellen - 1,
                    cel
                )
            );
        }

        function selectieBereik(selectie) {

            // Klik zonder slepen: het hele uur.
            if (
                selectie.anker ===
                selectie.huidig
            ) {

                const uur =
                    eersteUur +
                    Math.floor(
                        selectie.anker *
                        CEL_MINUTEN /
                        60
                    );

                return {
                    start: uur * 60,
                    einde: (uur + 1) * 60
                };
            }

            const laagste =
                Math.min(
                    selectie.anker,
                    selectie.huidig
                );

            const hoogste =
                Math.max(
                    selectie.anker,
                    selectie.huidig
                );

            return {
                start:
                    eersteUur * 60 +
                    laagste * CEL_MINUTEN,
                einde:
                    eersteUur * 60 +
                    (hoogste + 1) * CEL_MINUTEN
            };
        }

        function toonSelectie(selectie) {

            selectie.dagKolom
                .querySelectorAll(
                    ".egodact-selectie"
                )
                .forEach(
                    el =>
                        el.remove()
                );

            const bereik =
                selectieBereik(
                    selectie
                );

            const el =
                document.createElement(
                    "div"
                );

            el.className =
                "egodact-selectie";

            Object.assign(
                el.style,
                {
                    position:
                        "absolute",
                    left: "3px",
                    right: "3px",
                    top:
                        `${(
                            bereik.start -
                            eersteUur * 60
                        ) /
                        60 *
                        hoogtePerUur}px`,
                    height:
                        `${(
                            bereik.einde -
                            bereik.start
                        ) /
                        60 *
                        hoogtePerUur}px`,
                    background:
                        "var(--egd-selectie)",
                    border:
                        "2px solid var(--egd-accent)",
                    borderRadius:
                        "4px",
                    boxSizing:
                        "border-box",
                    padding:
                        "3px 6px",
                    fontSize:
                        "11px",
                    fontWeight:
                        "bold",
                    color:
                        "var(--egd-tekst)",
                    pointerEvents:
                        "none",
                    zIndex: "4",
                    overflow:
                        "hidden"
                }
            );

            el.textContent =
                `${formatTijd(bereik.start)} - ${formatTijd(bereik.einde)}`;

            selectie.dagKolom.appendChild(
                el
            );
        }

        // Scrolt de kalender mee als je bij de rand sleept, zodat je
        // lange blokken kunt maken zonder los te laten.
        function startAutoScroll() {

            if (scrollTimer) {
                return;
            }

            scrollTimer =
                setInterval(
                    () => {

                        if (!actieveSelectie) {
                            return;
                        }

                        const rect =
                            calendar.getBoundingClientRect();

                        const y =
                            actieveSelectie.laatsteY;

                        // De dagkop blijft bovenaan staan.
                        const bovenGrens =
                            rect.top + 64;

                        const onderGrens =
                            rect.bottom - 40;

                        let delta = 0;

                        if (y < bovenGrens) {

                            delta =
                                -Math.min(
                                    25,
                                    (bovenGrens - y) / 3 + 4
                                );

                        } else if (y > onderGrens) {

                            delta =
                                Math.min(
                                    25,
                                    (y - onderGrens) / 3 + 4
                                );
                        }

                        if (!delta) {
                            return;
                        }

                        calendar.scrollTop += delta;

                        actieveSelectie.huidig =
                            celBij(
                                actieveSelectie.dagKolom,
                                y
                            );

                        toonSelectie(
                            actieveSelectie
                        );
                    },
                    30
                );
        }

        function stopSelectie(annuleer) {

            if (scrollTimer) {

                clearInterval(
                    scrollTimer
                );

                scrollTimer =
                    null;
            }

            const selectie =
                actieveSelectie;

            actieveSelectie =
                null;

            if (!selectie) {
                return;
            }

            selectie.dagKolom
                .querySelectorAll(
                    ".egodact-selectie"
                )
                .forEach(
                    el =>
                        el.remove()
                );

            try {

                selectie.dagKolom
                    .releasePointerCapture(
                        selectie.pointerId
                    );

            } catch (error) {}

            if (annuleer) {
                return;
            }

            const bereik =
                selectieBereik(
                    selectie
                );

            openBlokEditor(
                Number(
                    selectie.dagKolom
                        .dataset
                        .dag
                ),
                bereik.start,
                bereik.einde
            );
        }

        const selectiePointerUp =
            () =>
                stopSelectie(false);

        const selectiePointerCancel =
            () =>
                stopSelectie(true);

        document.addEventListener(
            "pointerup",
            selectiePointerUp
        );

        document.addEventListener(
            "pointercancel",
            selectiePointerCancel
        );

        // Bij het opnieuw tekenen of sluiten de oude listeners weghalen.
        selectieOpruimen =
            () => {

                if (scrollTimer) {

                    clearInterval(
                        scrollTimer
                    );

                    scrollTimer =
                        null;
                }

                actieveSelectie =
                    null;

                document.removeEventListener(
                    "pointerup",
                    selectiePointerUp
                );

                document.removeEventListener(
                    "pointercancel",
                    selectiePointerCancel
                );
            };

        for (
            let dagIndex = 0;
            dagIndex < 7;
            dagIndex++
        ) {

            const dagKolom =
                document.createElement("div");

            dagKolom.className =
                "egodact-dagkolom";

            dagKolom.dataset.dag =
                dagIndex;

            Object.assign(
                dagKolom.style,
                {
                    position: "relative",
                    borderLeft:
                        "1px solid var(--egd-lijn)",
                    height:
                        `${(
                            laatsteUur -
                            eersteUur
                        ) * hoogtePerUur}px`,
                    userSelect:
                        "none",
                    transition:
                        "background 0.1s ease"
                }
            );

            alleDagKolommen.push(
                dagKolom
            );

            // ================================================
            // UREN
            // ================================================

            for (
                let uur = eersteUur;
                uur < laatsteUur;
                uur++
            ) {

                const slot =
                    document.createElement(
                        "div"
                    );

                slot.className =
                    "egodact-tijdslot";

                slot.dataset.dag =
                    dagIndex;

                slot.dataset.uur =
                    uur;

                Object.assign(
                    slot.style,
                    {
                        height:
                            `${hoogtePerUur}px`,
                        boxSizing:
                            "border-box",
                        borderBottom:
                            "1px solid var(--egd-lijn)",
                        position:
                            "relative",
                        userSelect:
                            "none"
                    }
                );

                dagKolom.appendChild(
                    slot
                );
            }

            // ================================================
            // HALF UUR LIJNEN
            // ================================================

            for (
                let half = 0;
                half <
                (
                    laatsteUur -
                    eersteUur
                ) * 2;
                half++
            ) {

                if (
                    half % 2 === 1
                ) {

                    const lijn =
                        document.createElement(
                            "div"
                        );

                    Object.assign(
                        lijn.style,
                        {
                            position:
                                "absolute",
                            left: "0",
                            right: "0",
                            top:
                                `${half * 30}px`,
                            borderTop:
                                "1px dashed var(--egd-lijn-zacht)",
                            pointerEvents:
                                "none"
                        }
                    );

                    dagKolom.appendChild(
                        lijn
                    );
                }
            }

            // ================================================
            // SELECTIE (KLIKKEN EN SLEPEN)
            // ================================================

            dagKolom.addEventListener(
                "pointerdown",
                event => {

                    if (
                        event.button !== 0
                    ) {
                        return;
                    }

                    // Op een bestaand blok klikken/slepen werkt zoals
                    // eerst (bewerken of verplaatsen).
                    if (
                        event.target.closest(
                            "[data-id]"
                        )
                    ) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    const cel =
                        celBij(
                            dagKolom,
                            event.clientY
                        );

                    actieveSelectie = {
                        dagKolom,
                        anker: cel,
                        huidig: cel,
                        pointerId:
                            event.pointerId,
                        laatsteY:
                            event.clientY
                    };

                    try {

                        dagKolom.setPointerCapture(
                            event.pointerId
                        );

                    } catch (error) {}

                    toonSelectie(
                        actieveSelectie
                    );

                    startAutoScroll();
                }
            );

            dagKolom.addEventListener(
                "pointermove",
                event => {

                    if (
                        !actieveSelectie ||
                        actieveSelectie.dagKolom !==
                            dagKolom
                    ) {
                        return;
                    }

                    actieveSelectie.laatsteY =
                        event.clientY;

                    const cel =
                        celBij(
                            dagKolom,
                            event.clientY
                        );

                    if (
                        cel !==
                        actieveSelectie.huidig
                    ) {

                        actieveSelectie.huidig =
                            cel;

                        toonSelectie(
                            actieveSelectie
                        );
                    }
                }
            );

            body.appendChild(
                dagKolom
            );
        }

        // ====================================================
        // BESTAANDE BLOKKEN
        // ====================================================

        // Verdeel blokken die qua tijd overlappen over aparte banen,
        // zodat blokken en hun tekst niet boven op elkaar vallen.
        const blokLayout = new Map();
        const blokkenPerDag = Array.from({ length: 7 }, () => []);
        weekData.forEach(blok => {
            const dag = Number(blok.dag);
            if (dag >= 0 && dag < 7 && Number.isFinite(Number(blok.start)) && Number.isFinite(Number(blok.einde))) {
                blokkenPerDag[dag].push(blok);
            }
        });
        blokkenPerDag.forEach(dagBlokken => {
            dagBlokken.sort((a, b) => Number(a.start) - Number(b.start) || Number(a.einde) - Number(b.einde));
            const baanEindes = [];
            dagBlokken.forEach(blok => {
                let baan = baanEindes.findIndex(einde => einde <= Number(blok.start));
                if (baan === -1) {
                    baan = baanEindes.length;
                    baanEindes.push(Number(blok.einde));
                } else {
                    baanEindes[baan] = Number(blok.einde);
                }
                blokLayout.set(String(blok.id), { baan, aantalBanen: 0 });
            });
            const aantalBanen = Math.max(1, baanEindes.length);
            dagBlokken.forEach(blok => {
                const layout = blokLayout.get(String(blok.id));
                if (layout) layout.aantalBanen = aantalBanen;
            });
        });

        weekData.forEach(
            blok => {

                const dagKolom =
                    alleDagKolommen[
                        Number(blok.dag)
                    ];

                if (!dagKolom) {
                    return;
                }

                const blokElement =
                    document.createElement(
                        "div"
                    );

                blokElement.draggable =
                    true;

                blokElement.dataset.id =
                    String(blok.id);

                blokElement.style.userSelect =
                    "none";

                const top =
                    (
                        blok.start -
                        eersteUur * 60
                    ) /
                    60 *
                    hoogtePerUur;

                const hoogte =
                    (
                        blok.einde -
                        blok.start
                    ) /
                    60 *
                    hoogtePerUur;

                const layout = blokLayout.get(String(blok.id)) || { baan: 0, aantalBanen: 1 };
                const baanBreedte = 100 / layout.aantalBanen;
                const blokKleur =
                    blok.kleur ||
                    EGODACT_STANDAARD_BLOKKLEUR;

                const lichteTekst =
                    egodactKleurIsDonker(
                        blokKleur
                    );

                Object.assign(
                    blokElement.style,
                    {
                        position:
                            "absolute",
                        top:
                            `${top}px`,
                        left:
                            `calc(${layout.baan * baanBreedte}% + 3px)`,
                        right:
                            `calc(${(layout.aantalBanen - layout.baan - 1) * baanBreedte}% + 3px)`,
                        minWidth: "0",
                        height:
                            `${Math.max(
                                hoogte - 4,
                                35
                            )}px`,
                        background:
                            blokKleur,
                        color:
                            lichteTekst
                                ? "#ffffff"
                                : "#212121",
                        borderRadius:
                            "4px",
                        padding:
                            "6px 8px",
                        boxSizing:
                            "border-box",
                        overflow:
                            "hidden",
                        cursor:
                            "grab",
                        zIndex:
                            "10",
                        borderLeft:
                            blok.kleur
                                ? (
                                    lichteTekst
                                        ? "4px solid rgba(255,255,255,0.55)"
                                        : "4px solid rgba(0,0,0,0.35)"
                                )
                                : "4px solid var(--egd-accent)"
                    }
                );

                blokElement.innerHTML = `

                    <button type="button" class="egodact-week-blok-kopieer" title="Blok kopiëren" aria-label="Blok kopiëren" style="position:absolute;top:2px;right:2px;z-index:2;border:0;border-radius:3px;background:rgba(0,0,0,0.22);color:inherit;cursor:pointer;font-size:12px;line-height:16px;padding:0 4px;opacity:0.9;">⧉</button>

                    <div style="
                        font-weight: bold;
                        font-size: 11px;
                        line-height: 1.2;
                        white-space: normal;
                        overflow: hidden;
                        overflow-wrap: anywhere;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        pointer-events: none;
                    ">
                        ${escapeHTML(
                            blok.naam
                        )}
                    </div>

                    <div style="
                        font-size: 10px;
                        line-height: 1.15;
                        opacity: 0.85;
                        margin-top: 3px;
                        overflow-wrap: anywhere;
                        pointer-events: none;
                    ">
                        ${formatTijd(
                            blok.start
                        )}
                        -
                        ${formatTijd(
                            blok.einde
                        )}
                    </div>

                    ${
                        blok.beschrijving
                            ? `
                                <div style="
                                    font-size: 10px;
                                    line-height: 1.15;
                                    margin-top: 4px;
                                    opacity: 0.85;
                                    overflow: hidden;
                                    overflow-wrap: anywhere;
                                    max-height: 2.3em;
                                    pointer-events: none;
                                ">
                                    ${escapeHTML(
                                        blok.beschrijving
                                    )}
                                </div>
                            `
                            : ""
                    }
                `;

                // ============================================
                // INDIVIDUEEL BLOK KOPIËREN
                // ============================================

                const kopieerBlokKnop = blokElement.querySelector(".egodact-week-blok-kopieer");
                kopieerBlokKnop.addEventListener("mousedown", event => event.stopPropagation());
                kopieerBlokKnop.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopPropagation();
                    try {
                        const kopie = { ...blok };
                        delete kopie.id;
                        localStorage.setItem("egodact_weekplanning_block_clipboard_v1", JSON.stringify(kopie));
                        alert(`Blok "${blok.naam || "zonder naam"}" gekopieerd. Navigeer eventueel naar een andere week en klik op "Plak blok".`);
                    } catch (error) {
                        console.error("Fout bij kopiëren weekblok:", error);
                        alert("Het blok kon niet worden gekopieerd.");
                    }
                });

                // ============================================
                // KLIK = BEWERKEN
                // ============================================

                let blokWasGesleept =
                    false;

                blokElement.addEventListener(
                    "click",
                    event => {

                        if (
                            blokWasGesleept
                        ) {
                            event.stopPropagation();
                            return;
                        }

                        event.stopPropagation();

                        openBlokEditor(
                            blok.dag,
                            blok.start,
                            blok.einde,
                            blok.naam,
                            blok
                        );
                    }
                );

                // ============================================
                // DRAG BESTAAND BLOK
                // ============================================

                blokElement.addEventListener(
                    "dragstart",
                    event => {

                        event.stopPropagation();

                        blokWasGesleept =
                            true;

                        const dragData = {
                            type:
                                "existing",
                            id:
                                String(
                                    blok.id
                                )
                        };

                        window.__egodactDraggedWeekBlock =
                            dragData;

                        event.dataTransfer.effectAllowed =
                            "move";

                        event.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify(
                                dragData
                            )
                        );

                        blokElement.style.opacity =
                            "0.45";

                        blokElement.style.cursor =
                            "grabbing";

                        document.body.style.cursor =
                            "grabbing";
                    }
                );

                blokElement.addEventListener(
                    "dragend",
                    event => {

                        event.stopPropagation();

                        window.__egodactDraggedWeekBlock =
                            null;

                        blokElement.style.opacity =
                            "1";

                        blokElement.style.cursor =
                            "grab";

                        document.body.style.cursor =
                            "";

                        setTimeout(
                            () => {
                                blokWasGesleept =
                                    false;
                            },
                            0
                        );
                    }
                );

                dagKolom.appendChild(
                    blokElement
                );
            }
        );

        calendar.appendChild(
            body
        );

        // ====================================================
        // VAKKEN
        // ====================================================

        const vakken =
            document.createElement(
                "div"
            );

        vakken.id =
            "egodact-vakken-zijbalk";

        Object.assign(
            vakken.style,
            {
                background: "var(--egd-paneel)",
                border:
                    "1px solid var(--egd-rand)",
                borderRadius: "5px",
                padding: "12px",
                overflowY: "auto",
                maxHeight:
                    "calc(90vh - 190px)"
            }
        );

        vulZijbalk(
            vakken
        );

        content.appendChild(
            calendar
        );

        content.appendChild(
            vakken
        );

        // ====================================================
        // DROP OP DAGKOLOMMEN
        // ====================================================

        alleDagKolommen.forEach(
            dagKolom => {

                // ============================================
                // DRAGOVER
                // ============================================

                dagKolom.addEventListener(
                    "dragover",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        const dragData =
                            window.__egodactDraggedWeekBlock;

                        if (
                            dragData &&
                            dragData.type ===
                                "existing"
                        ) {

                            event.dataTransfer.dropEffect =
                                "move";

                        } else {

                            event.dataTransfer.dropEffect =
                                "copy";
                        }

                        dagKolom.style.background =
                            "var(--egd-hover)";
                    }
                );

                // ============================================
                // DRAGLEAVE
                // ============================================

                dagKolom.addEventListener(
                    "dragleave",
                    event => {

                        const target =
                            event.relatedTarget;

                        if (
                            target &&
                            dagKolom.contains(
                                target
                            )
                        ) {
                            return;
                        }

                        dagKolom.style.background =
                            "";
                    }
                );

                // ============================================
                // DROP
                // ============================================

                dagKolom.addEventListener(
                    "drop",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        dagKolom.style.background =
                            "";

                        let data =
                            window.__egodactDraggedWeekBlock;

                        // Fallback naar dataTransfer
                        if (!data) {

                            const gegevens =
                                event.dataTransfer.getData(
                                    "text/plain"
                                );

                            if (gegevens) {

                                try {

                                    data =
                                        JSON.parse(
                                            gegevens
                                        );

                                } catch (error) {

                                    console.error(
                                        "Ongeldige drag-data:",
                                        error
                                    );

                                    return;
                                }
                            }
                        }

                        if (!data) {
                            return;
                        }

                        // ====================================
                        // POSITIE IN DAG BEREKENEN
                        // ====================================

                        const rect =
                            dagKolom.getBoundingClientRect();

                        const y =
                            event.clientY -
                            rect.top;

                        const maximaleMinuten =
                            (
                                laatsteUur -
                                eersteUur
                            ) * 60;

                        let minutenVanafStart =
                            Math.floor(
                                (
                                    y /
                                    hoogtePerUur
                                ) * 60
                            );

                        minutenVanafStart =
                            Math.max(
                                0,
                                Math.min(
                                    maximaleMinuten,
                                    minutenVanafStart
                                )
                            );

                        const afgerondeMinuten =
                            Math.floor(
                                minutenVanafStart /
                                30
                            ) * 30;

                        const start =
                            eersteUur * 60 +
                            afgerondeMinuten;

                        const dag =
                            Number(
                                dagKolom.dataset.dag
                            );

                        // ====================================
                        // VAK NAAR KALENDER
                        // ====================================

                        if (
                            data.type ===
                            "subject"
                        ) {

                            window.__egodactDraggedWeekBlock =
                                null;

                            openBlokEditor(
                                dag,
                                start,
                                Math.min(
                                    start + 60,
                                    laatsteUur * 60
                                ),
                                data.subject,
                                null,
                                data.challengeId || null
                            );

                            return;
                        }

                        // ====================================
                        // BESTAAND BLOK VERPLAATSEN
                        // ====================================

                        if (
                            data.type !==
                            "existing"
                        ) {
                            return;
                        }

                        const blok =
                            weekData.find(
                                b =>
                                    String(
                                        b.id
                                    ) ===
                                    String(
                                        data.id
                                    )
                            );

                        if (!blok) {

                            console.warn(
                                "Kon gesleept blok niet vinden:",
                                data.id
                            );

                            return;
                        }

                        // Bewaar oorspronkelijke duur
                        const duur =
                            blok.einde -
                            blok.start;

                        // Nieuwe dag
                        blok.dag =
                            dag;

                        // Nieuwe begintijd
                        blok.start =
                            start;

                        // Zelfde duur behouden
                        blok.einde =
                            Math.min(
                                start + duur,
                                laatsteUur * 60
                            );

                        // Opslaan
                        slaWeekOp(
                            weekData
                        );

                        // Drag-status wissen
                        window.__egodactDraggedWeekBlock =
                            null;

                        // Kalender opnieuw tekenen
                        renderWeek();
                    }
                );
            }
        );
    }

    // ========================================================
    // SLUITEN / ESCAPE
    // ========================================================

    let gesloten = false;

    const sluitMenu =
        () => {

            if (gesloten) {
                return;
            }

            gesloten = true;

            window.__egodactDraggedWeekBlock =
                null;

            if (selectieOpruimen) {
                selectieOpruimen();
            }

            document.removeEventListener(
                "keydown",
                escapeHandler
            );

            backdrop.remove();
        };

    const escapeHandler =
        event => {

            if (
                event.key === "Escape"
            ) {

                sluitMenu();
            }
        };

    document.addEventListener(
        "keydown",
        escapeHandler
    );

    document
        .getElementById(
            "egodact-weekplanning-sluiten"
        )
        .addEventListener(
            "click",
            sluitMenu
        );

    backdrop.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                backdrop
            ) {

                sluitMenu();
            }
        }
    );

    // ========================================================
    // WEEK NAVIGATIE
    // ========================================================

    document
        .getElementById(
            "egodact-vorige-week"
        )
        .addEventListener(
            "click",
            () => {

                weekStart.setDate(
                    weekStart.getDate() -
                    7
                );

                weekData =
                    laadWeek();

                renderWeek();
            }
        );

    document
        .getElementById(
            "egodact-volgende-week"
        )
        .addEventListener(
            "click",
            () => {

                weekStart.setDate(
                    weekStart.getDate() +
                    7
                );

                weekData =
                    laadWeek();

                renderWeek();
            }
        );

    document
        .getElementById(
            "egodact-vandaag-week"
        )
        .addEventListener(
            "click",
            () => {

                weekStart =
                    beginVanWeek(
                        new Date()
                    );

                weekData =
                    laadWeek();

                renderWeek();
            }
        );

    // ========================================================
    // STANDAARD WEEK OPSLAAN
    // ========================================================
    document.getElementById("egodact-week-sla-standaard-op").addEventListener("click", () => {
        const actueleWeek = laadWeek();
        if (!actueleWeek.length) {
            alert("Voeg eerst een aantal blokken toe voordat je deze week als standaard opslaat.");
            return;
        }
        try {
            const template = actueleWeek.map(blok => {
                const kopie = { ...blok };
                delete kopie.id;
                delete kopie.challengeId;
                return kopie;
            });
            localStorage.setItem("egodact_weekplanning_template", JSON.stringify(template));
            alert("Deze week is opgeslagen als jouw standaard week. Nieuwe lege weken krijgen deze planning automatisch.");
        } catch (error) {
            console.error("Fout bij opslaan van standaard weekplanning:", error);
            alert("Er ging iets mis bij het opslaan van de standaard week.");
        }
    });

    // ========================================================
    // + BLOK TOEVOEGEN
    // ========================================================

    document
        .getElementById(
            "egodact-week-blok-toevoegen"
        )
        .addEventListener(
            "click",
            () => {

                openBlokEditor(
                    0,
                    9 * 60,
                    10 * 60
                );
            }
        );

    // ========================================================
    // ZOEKEN IN CHALLENGES EN VAKKEN
    // ========================================================

    document
        .getElementById(
            "egodact-week-zoek"
        )
        .addEventListener(
            "input",
            event => {

                // Geheim: "games" in de zoekbalk opent het gamesmenu.
                if (
                    event.target.value
                        .trim()
                        .toLowerCase() === "games"
                ) {
                    event.target.value = "";
                    sluitMenu();
                    openGamesMenu();
                    return;
                }

                zoekTerm =
                    event.target.value;

                ververszijbalk();
            }
        );


    // ========================================================
    // KOPIËREN, PLAKKEN, EXPORTEREN EN IMPORTEREN
    // ========================================================
    const weekKopieerKnop = document.getElementById("egodact-week-kopieer");
    const weekPlakKnop = document.getElementById("egodact-week-plak");
    const weekExportKnop = document.getElementById("egodact-week-export");
    const weekImportKnop = document.getElementById("egodact-week-import-knop");
    const weekImportBestand = document.getElementById("egodact-week-import-bestand");
    const weekClipboardKey = "egodact_weekplanning_clipboard_v1";
    const weekBlokClipboardKey = "egodact_weekplanning_block_clipboard_v1";

    document.getElementById("egodact-week-plak-blok").addEventListener("click", () => {
        const opgeslagen = localStorage.getItem(weekBlokClipboardKey);
        if (!opgeslagen) {
            alert("Er is nog geen blok gekopieerd. Klik op het ⧉-icoon op een blok om het te kopiëren.");
            return;
        }

        let blok;
        try {
            blok = JSON.parse(opgeslagen);
            if (!blok || typeof blok !== "object" || Array.isArray(blok)) throw new Error("Ongeldig blok");
        } catch (error) {
            alert("Het gekopieerde blok is ongeldig of beschadigd.");
            return;
        }

        const nieuwBlok = maakNieuwWeekBlok(blok);
        weekData.push(nieuwBlok);
        slaWeekOp(weekData);
        renderWeek();
        alert(`Blok "${nieuwBlok.naam || "zonder naam"}" geplakt. Je kunt het verslepen of openen om dag en tijd aan te passen.`);
    });

    function maakWeekExport(data) {
        const start = datumKey(weekStart);
        const einde = new Date(weekStart);
        einde.setDate(einde.getDate() + 6);
        return {
            format: "egodact-weekplanning",
            version: 1,
            exportedAt: new Date().toISOString(),
            weekStart: start,
            weekEnd: datumKey(einde),
            data
        };
    }

    function downloadJSON(bestandsnaam, inhoud) {
        const blob = new Blob([JSON.stringify(inhoud, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = bestandsnaam;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function maakNieuwWeekBlok(blok) {
        const kopie = { ...blok };
        kopie.id = (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : `weekblok-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        return kopie;
    }

    weekKopieerKnop.addEventListener("click", () => {
        try {
            localStorage.setItem(weekClipboardKey, JSON.stringify(weekData));
            alert(`Week gekopieerd (${weekData.length} blokken). Ga naar een andere week en klik op "Plak week".`);
        } catch (error) {
            console.error("Fout bij kopiëren weekplanning:", error);
            alert("De week kon niet worden gekopieerd.");
        }
    });

    weekPlakKnop.addEventListener("click", () => {
        const opgeslagen = localStorage.getItem(weekClipboardKey);
        if (!opgeslagen) {
            alert("Er is nog geen week gekopieerd.");
            return;
        }
        let kopie;
        try {
            kopie = JSON.parse(opgeslagen);
            if (!Array.isArray(kopie) || !kopie.every(blok => blok && typeof blok === "object")) {
                throw new Error("Ongeldige weekgegevens");
            }
        } catch (error) {
            alert("De gekopieerde week is ongeldig of beschadigd.");
            return;
        }
        if (!confirm("De huidige week vervangen door de gekopieerde week?")) return;
        weekData = kopie.map(maakNieuwWeekBlok);
        slaWeekOp(weekData);
        renderWeek();
        alert("De gekopieerde week is geplakt.");
    });

    weekExportKnop.addEventListener("click", () => {
        slaWeekOp(weekData);
        downloadJSON(`egodact-weekplanning-${datumKey(weekStart)}.json`, maakWeekExport(weekData));
    });

    weekImportKnop.addEventListener("click", () => weekImportBestand.click());

    weekImportBestand.addEventListener("change", async event => {
        const bestand = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!bestand) return;
        try {
            const inhoud = JSON.parse(await bestand.text());
            const gegevens = Array.isArray(inhoud) ? inhoud : inhoud && inhoud.format === "egodact-weekplanning" ? inhoud.data : null;
            if (!Array.isArray(gegevens) || !gegevens.every(blok => blok && typeof blok === "object" && !Array.isArray(blok))) {
                throw new Error("Dit is geen geldig weekplanningbestand.");
            }
            if (!confirm(`Importeer ${gegevens.length} blokken naar de week ${datumKey(weekStart)} t/m ${(() => { const e = new Date(weekStart); e.setDate(e.getDate()+6); return datumKey(e); })()}? De huidige week wordt vervangen.`)) return;
            weekData = gegevens.map(maakNieuwWeekBlok);
            slaWeekOp(weekData);
            renderWeek();
            alert("Weekplanning geïmporteerd.");
        } catch (error) {
            console.error("Fout bij importeren weekplanning:", error);
            alert("Importeren mislukt. Kies een geldig Egodact-weekplanning JSON-bestand.");
        }
    });

    // ========================================================
    // START
    // ========================================================

    renderWeek();

    egodactLaadChallenges()
        .then(
            lijst => {

                challengeLijst =
                    lijst;

                leesBord();

                ververszijbalk();

                // Het bord kan nog bezig zijn met laden.
                if (
                    !Object.keys(
                        bordAfb.thumbs
                    ).length
                ) {

                    setTimeout(
                        () => {

                            if (gesloten) {
                                return;
                            }

                            leesBord();

                            ververszijbalk();
                        },
                        1500
                    );
                }
            }
        )
        .catch(
            fout => {

                console.error(
                    "Challenges laden mislukt:",
                    fout
                );

                challengeFout =
                    fout && fout.message
                        ? fout.message
                        : String(fout);

                ververszijbalk();
            }
        );
}


