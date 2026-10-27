// ============================================================
// FLEXIBELE DAGPLANNER MET TEMPLATE-SYSTEM & HISTORIE
// ============================================================

async function openTakenMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    let opslag;
    try {
        opslag = await egodactOpenPersoonlijkeOpslag();
    } catch (error) {
        alert(error.message);
        return;
    }

    if (document.getElementById("egodact-custom-modal-backdrop")) return;

    const vandaag = new Date().toLocaleDateString("sv-SE");
    let geselecteerdeDatum = vandaag;

    const backdrop = document.createElement("div");
    backdrop.id = "egodact-custom-modal-backdrop";

    Object.assign(backdrop.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--egd-backdrop)",
        zIndex: "9999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
    });

    const modal = document.createElement("div");

    Object.assign(modal.style, {
        backgroundColor: "var(--egd-modal)",
        color: "var(--egd-tekst)",
        width: "580px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        borderRadius: "6px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow:
            "var(--egd-schaduw)"
    });

    modal.innerHTML = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--egd-rand);
            padding-bottom: 10px;
        ">
            <h2 style="
                margin: 0;
                font-size: 22px;
                font-weight: 500;
            ">
                Dagplanning
            </h2>

            <input
                type="text"
                id="egodact-planner-search"
                placeholder="Search.."
                style="background:var(--egd-veld);color:var(--egd-tekst);border:1px solid var(--egd-rand);padding:4px 8px;border-radius:4px;font-family:inherit;width:150px;"
            >
            <input
                type="date"
                id="egodact-planner-datum"
                value="${vandaag}"
                style="
                    background-color: var(--egd-veld);
                    color: var(--egd-tekst);
                    border: 1px solid var(--egd-rand);
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: inherit;
                "
            >
        </div>

        <div style="
            display: flex;
            gap: 10px;
            justify-content: space-between;
            align-items: center;
            background: var(--egd-paneel);
            padding: 8px 12px;
            border-radius: 4px;
        ">
            <button
                id="egodact-voeg-blok-toe"
                style="
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 6px 12px;
                    font-weight: bold;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                + Blok Toevoegen
            </button>

            <button
                id="egodact-sla-standaard-op"
                style="
                    background-color: #ff9800;
                    border: none;
                    color: white;
                    padding: 6px 12px;
                    font-weight: bold;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                Sla op als Standaard
            </button>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
            <button id="egodact-dag-kopieer" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);padding:7px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Kopieer dag</button>
            <button id="egodact-dag-plak" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);padding:7px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Plak dag</button>
            <button id="egodact-dag-export" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);padding:7px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Exporteer dag</button>
            <button id="egodact-dag-import-knop" type="button" style="background:var(--egd-paneel);color:var(--egd-tekst);border:1px solid var(--egd-rand);padding:7px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Importeer dag</button>
            <input id="egodact-dag-import-bestand" type="file" accept=".json,application/json" style="display:none;">
        </div>

        <div
            id="egodact-uren-container"
            style="
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-height: 380px;
                overflow-y: auto;
                padding-right: 5px;
            "
        ></div>

        <div style="
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
        ">
            <button
                id="egodact-taken-sluiten"
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

    function renderPlanner(datum) {

        const container =
            document.getElementById(
                "egodact-uren-container"
            );

        if (!container) return;

        container.innerHTML = "";

        let dagData =
            opslag.getItem(
                `egodact_flex_planner_${datum}`
            );

        if (!dagData) {

            const standaardTemplate =
                opslag.getItem(
                    "egodact_planner_template"
                );

            if (standaardTemplate) {

                try {

                    const templateTaken =
                        JSON.parse(
                            standaardTemplate
                        );

                    const gekopieerdeTaken =
                        templateTaken.map(
                            taak => ({
                                tijd:
                                    taak.tijd || "",

                                tekst:
                                    taak.tekst || "",

                                gedaan:
                                    false
                            })
                        );

                    opslag.setItem(
                        `egodact_flex_planner_${datum}`,
                        JSON.stringify(
                            gekopieerdeTaken
                        )
                    );

                    dagData =
                        JSON.stringify(
                            gekopieerdeTaken
                        );

                } catch (error) {

                    console.error(
                        "Fout bij laden van standaard template:",
                        error
                    );
                }
            }
        }

        let takenLijst = [];

        if (dagData) {

            try {

                takenLijst =
                    JSON.parse(dagData);

                if (!Array.isArray(takenLijst)) {
                    takenLijst = [];
                }

            } catch (error) {

                console.error(
                    "Fout bij laden van planner:",
                    error
                );

                takenLijst = [];
            }
        }

        takenLijst.forEach(
            (taak, index) => {

                const rij =
                    document.createElement("div");

                Object.assign(
                    rij.style,
                    {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "var(--egd-veld)",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        borderLeft:
                            "4px solid var(--egd-accent)"
                    }
                );

                const tijdInput =
                    document.createElement("input");

                tijdInput.type = "text";
                tijdInput.value =
                    taak.tijd || "";
                tijdInput.placeholder =
                    "Tijd";

                Object.assign(
                    tijdInput.style,
                    {
                        width: "90px",
                        background: "var(--egd-veld)",
                        border: "1px solid var(--egd-lijn)",
                        color: "var(--egd-accent)",
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        outline: "none",
                        textAlign: "center"
                    }
                );

                const checkbox =
                    document.createElement("input");

                checkbox.type = "checkbox";
                checkbox.checked =
                    Boolean(taak.gedaan);

                Object.assign(
                    checkbox.style,
                    {
                        width: "18px",
                        height: "18px",
                        cursor: "pointer"
                    }
                );

                const taakInput =
                    document.createElement("input");

                taakInput.type = "text";
                taakInput.value =
                    taak.tekst || "";

                taakInput.placeholder =
                    "Typ hier je taak of focus...";

                Object.assign(
                    taakInput.style,
                    {
                        flex: "1",
                        background: "none",
                        border: "none",
                        color: "var(--egd-tekst)",
                        fontSize: "15px",
                        outline: "none",
                        fontFamily: "inherit"
                    }
                );

                if (taak.gedaan) {

                    taakInput.style.textDecoration =
                        "line-through";

                    taakInput.style.opacity =
                        "0.5";
                }

                const verwijderBtn =
                    document.createElement("button");

                verwijderBtn.innerHTML =
                    "&#x2715;";

                Object.assign(
                    verwijderBtn.style,
                    {
                        background: "none",
                        border: "none",
                        color: "var(--egd-gevaar)",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "0 6px",
                        fontWeight: "bold"
                    }
                );

                verwijderBtn.title =
                    "Blok verwijderen";

                const updateEnSlaOp =
                    () => {

                        const actueleLijst = [];

                        const alleRijen =
                            container.children;

                        for (
                            const r
                            of alleRijen
                        ) {

                            const inputs =
                                r.querySelectorAll(
                                    "input"
                                );

                            if (inputs.length >= 3) {

                                actueleLijst.push({
                                    tijd:
                                        inputs[0].value,

                                    gedaan:
                                        inputs[1].checked,

                                    tekst:
                                        inputs[2].value
                                });
                            }
                        }

                        opslag.setItem(
                            `egodact_flex_planner_${datum}`,
                            JSON.stringify(
                                actueleLijst
                            )
                        );
                    };

                tijdInput.addEventListener(
                    "input",
                    updateEnSlaOp
                );

                taakInput.addEventListener(
                    "input",
                    updateEnSlaOp
                );

                checkbox.addEventListener(
                    "change",
                    () => {

                        if (checkbox.checked) {

                            taakInput.style.textDecoration =
                                "line-through";

                            taakInput.style.opacity =
                                "0.5";

                        } else {

                            taakInput.style.textDecoration =
                                "none";

                            taakInput.style.opacity =
                                "1";
                        }

                        updateEnSlaOp();
                    }
                );

                verwijderBtn.addEventListener(
                    "click",
                    () => {

                        rij.remove();

                        updateEnSlaOp();
                    }
                );

                rij.appendChild(
                    tijdInput
                );

                rij.appendChild(
                    checkbox
                );

                rij.appendChild(
                    taakInput
                );

                rij.appendChild(
                    verwijderBtn
                );

                container.appendChild(
                    rij
                );
            }
        );

        filterPlannerRows();
    }

    function filterPlannerRows() {
        const searchInput = document.getElementById("egodact-planner-search");
        const container = document.getElementById("egodact-uren-container");
        if (!searchInput || !container) return;
        const query = searchInput.value.trim().toLowerCase();
        Array.from(container.children).forEach(row => {
            const text = Array.from(row.querySelectorAll("input"))
                .map(input => input.type === "checkbox" ? "" : input.value)
                .join(" ")
                .toLowerCase();
            row.style.display = text.includes(query) ? "" : "none";
        });
    }

    document
        .getElementById("egodact-planner-search")
        .addEventListener("input", filterPlannerRows);

    document
        .getElementById(
            "egodact-voeg-blok-toe"
        )
        .addEventListener(
            "click",
            () => {

                const huidigeData =
                    opslag.getItem(
                        `egodact_flex_planner_${geselecteerdeDatum}`
                    );

                let lijst = [];

                if (huidigeData) {

                    try {

                        lijst =
                            JSON.parse(
                                huidigeData
                            );

                        if (
                            !Array.isArray(
                                lijst
                            )
                        ) {
                            lijst = [];
                        }

                    } catch (error) {

                        lijst = [];
                    }
                }

                lijst.push({
                    tijd: "",
                    tekst: "",
                    gedaan: false
                });

                opslag.setItem(
                    `egodact_flex_planner_${geselecteerdeDatum}`,
                    JSON.stringify(lijst)
                );

                renderPlanner(
                    geselecteerdeDatum
                );
            }
        );

    document
        .getElementById(
            "egodact-sla-standaard-op"
        )
        .addEventListener(
            "click",
            () => {

                const huidigeDagData =
                    opslag.getItem(
                        `egodact_flex_planner_${geselecteerdeDatum}`
                    );

                if (!huidigeDagData) {

                    alert(
                        "Voeg eerst een aantal tijdsblokken toe voordat je deze als standaard opslaat."
                    );

                    return;
                }

                try {

                    const taken =
                        JSON.parse(
                            huidigeDagData
                        );

                    if (
                        !Array.isArray(taken) ||
                        taken.length === 0
                    ) {

                        alert(
                            "Voeg eerst een aantal tijdsblokken toe voordat je deze als standaard opslaat."
                        );

                        return;
                    }

                    const template =
                        taken.map(
                            taak => ({
                                tijd:
                                    taak.tijd || "",

                                tekst:
                                    taak.tekst || "",

                                gedaan:
                                    false
                            })
                        );

                    opslag.setItem(
                        "egodact_planner_template",
                        JSON.stringify(
                            template
                        )
                    );

                    alert(
                        "Succes! Deze tijdsblokken en basistaken zijn opgeslagen als jouw standaard."
                    );

                } catch (error) {

                    console.error(
                        "Fout bij opslaan van template:",
                        error
                    );

                    alert(
                        "Er ging iets mis bij het opslaan van de standaard."
                    );
                }
            }
        );


    // ============================================================
    // KOPIËREN, PLAKKEN, EXPORTEREN EN IMPORTEREN VAN DAGPLANNING
    // ============================================================
    const dagKopieerKnop = document.getElementById("egodact-dag-kopieer");
    const dagPlakKnop = document.getElementById("egodact-dag-plak");
    const dagExportKnop = document.getElementById("egodact-dag-export");
    const dagImportKnop = document.getElementById("egodact-dag-import-knop");
    const dagImportBestand = document.getElementById("egodact-dag-import-bestand");
    const dagClipboardKey = "egodact_dagplanning_clipboard_v1";

    function leesDagData(datum) {
        try {
            const data = JSON.parse(opslag.getItem(`egodact_flex_planner_${datum}`) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (_) {
            return [];
        }
    }

    function downloadDagJSON(bestandsnaam, inhoud) {
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

    function normaliseerDagData(data) {
        if (!Array.isArray(data) || !data.every(item => item && typeof item === "object" && !Array.isArray(item))) {
            throw new Error("Ongeldige dagplanning");
        }
        return data.map(item => ({
            tijd: typeof item.tijd === "string" ? item.tijd : "",
            tekst: typeof item.tekst === "string" ? item.tekst : "",
            gedaan: Boolean(item.gedaan)
        }));
    }

    dagKopieerKnop.addEventListener("click", () => {
        try {
            opslag.setItem(dagClipboardKey, JSON.stringify(leesDagData(geselecteerdeDatum)));
            alert(`Dagplanning van ${geselecteerdeDatum} gekopieerd. Kies een andere datum en klik op "Plak dag".`);
        } catch (error) {
            console.error("Fout bij kopiëren dagplanning:", error);
            alert("De dagplanning kon niet worden gekopieerd.");
        }
    });

    dagPlakKnop.addEventListener("click", () => {
        const opgeslagen = opslag.getItem(dagClipboardKey);
        if (!opgeslagen) {
            alert("Er is nog geen dagplanning gekopieerd.");
            return;
        }
        try {
            const gegevens = normaliseerDagData(JSON.parse(opgeslagen)).map(item => ({ ...item, gedaan: false }));
            if (!confirm(`De dagplanning van ${geselecteerdeDatum} vervangen door de gekopieerde dag?`)) return;
            opslag.setItem(`egodact_flex_planner_${geselecteerdeDatum}`, JSON.stringify(gegevens));
            renderPlanner(geselecteerdeDatum);
            alert("Dagplanning geplakt. Taken zijn weer niet afgevinkt.");
        } catch (error) {
            alert("De gekopieerde dagplanning is ongeldig of beschadigd.");
        }
    });

    dagExportKnop.addEventListener("click", () => {
        const gegevens = leesDagData(geselecteerdeDatum);
        downloadDagJSON(`egodact-dagplanning-${geselecteerdeDatum}.json`, {
            format: "egodact-dagplanning",
            version: 1,
            exportedAt: new Date().toISOString(),
            date: geselecteerdeDatum,
            data: gegevens
        });
    });

    dagImportKnop.addEventListener("click", () => dagImportBestand.click());

    dagImportBestand.addEventListener("change", async event => {
        const bestand = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!bestand) return;
        const doelDatum = geselecteerdeDatum;
        try {
            if (bestand.size > EGODACT_MAX_IMPORT_BYTES) throw new Error("Het bestand is te groot.");
            const inhoud = JSON.parse(await bestand.text());
            if (!opslag.actief() || doelDatum !== geselecteerdeDatum) throw new Error("De login, school of datum is gewijzigd.");
            const gegevens = Array.isArray(inhoud) ? inhoud : inhoud && inhoud.format === "egodact-dagplanning" ? inhoud.data : null;
            const genormaliseerd = normaliseerDagData(gegevens);
            if (!confirm(`Importeer ${genormaliseerd.length} taken naar ${geselecteerdeDatum}? De huidige dagplanning wordt vervangen.`)) return;
            opslag.setItem(`egodact_flex_planner_${geselecteerdeDatum}`, JSON.stringify(genormaliseerd));
            renderPlanner(geselecteerdeDatum);
            alert("Dagplanning geïmporteerd.");
        } catch (error) {
            console.error("Fout bij importeren dagplanning:", error);
            alert("Importeren mislukt. Kies een geldig Egodact-dagplanning JSON-bestand.");
        }
    });

    document
        .getElementById(
            "egodact-planner-datum"
        )
        .addEventListener(
            "change",
            e => {

                if (!e.target.value) {
                    return;
                }

                geselecteerdeDatum =
                    e.target.value;

                renderPlanner(
                    geselecteerdeDatum
                );
            }
        );

    const sluitMenu = () => {
        backdrop.remove();
        document.removeEventListener("keydown", escapeHandler);
    };

    document
        .getElementById(
            "egodact-taken-sluiten"
        )
        .addEventListener(
            "click",
            sluitMenu
        );

    backdrop.addEventListener(
        "click",
        e => {

            if (
                e.target === backdrop
            ) {
                sluitMenu();
            }
        }
    );

    const escapeHandler =
        e => {

            if (
                e.key === "Escape"
            ) {

                sluitMenu();

                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );
            }
        };

    document.addEventListener(
        "keydown",
        escapeHandler
    );

    egodactBewaakSessie(opslag, backdrop, sluitMenu);

    renderPlanner(
        geselecteerdeDatum
    );
}


