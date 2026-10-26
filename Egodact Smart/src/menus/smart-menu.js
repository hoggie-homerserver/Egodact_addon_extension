// ============================================================
// SMART MENU
// ============================================================

function openSMARTMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    if (document.getElementById('egodact-custom-modal-backdrop')) return;

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
        borderRadius: '6px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow:
            'var(--egd-schaduw)'
    });

    let currentModalPage = 0;

    const modalPagesData = [
        {
            title: "SMART methode",
            content: `
            <div style="
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        margin-top: 5px;
                    ">
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-s-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-s-letter);
                                min-width: 20px;
                                text-align: center;
                            ">S</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Specifiek
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Is het doel duidelijk en concreet omschreven?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-m-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-m-letter);
                                min-width: 20px;
                                text-align: center;
                            ">M</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Meetbaar
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Kun je achteraf bewijzen of meten dat het doel is gehaald?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-a-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-a-letter);
                                min-width: 20px;
                                text-align: center;
                            ">A</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Aantrekkelijk
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Is het doel motiverend, uitdagend en de moeite waard?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-r-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-r-letter);
                                min-width: 20px;
                                text-align: center;
                            ">R</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Realistisch
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Is het doel haalbaar en uitvoerbaar binnen jouw planning?
                                </div>
                            </div>
                        </div>
            
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            background: var(--egd-veld);
                            padding: 12px;
                            border-radius: 4px;
                            border-left: 5px solid var(--egd-t-streep);
                        ">
                            <span style="
                                font-size: 20px;
                                font-weight: bold;
                                color: var(--egd-t-letter);
                                min-width: 20px;
                                text-align: center;
                            ">T</span>
            
                            <div>
                                <div style="
                                    font-weight: bold;
                                    font-size: 15px;
                                ">
                                    Tijdsgebonden
                                </div>
            
                                <div style="
                                    font-size: 13px;
                                    color: var(--egd-tekst-zacht);
                                ">
                                    Wanneer, op welke datum of na hoeveel weken is het klaar?
                                </div>
                            </div>
                        </div>
            
                    </div>
            `
        },
        {
            title: "Geheugenpaleis",
            content: `
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
                    <p style="margin:0 0 4px; color:var(--egd-tekst-zacht); font-size:13px;">Onthoud informatie door die te koppelen aan een plek die je goed kent.</p>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-s-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-s-letter); min-width:20px;">1</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Kies een plek</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Bijvoorbeeld je huis of klaslokaal.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-m-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-m-letter); min-width:20px;">2</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Kies je route</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Loop in gedachten langs vaste plekken.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-a-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-a-letter); min-width:20px;">3</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Maak beelden</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Koppel elk punt aan iets opvallends en iets dat je moet onthouden.</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; background:var(--egd-veld); padding:12px; border-radius:4px; border-left:4px solid var(--egd-r-streep);">
                        <span style="font-size:18px; font-weight:bold; color:var(--egd-r-letter); min-width:20px;">4</span>
                        <div>
                            <div style="font-weight:bold; font-size:14px;">Oefen je route</div>
                            <div style="font-size:13px; color:var(--egd-tekst-zacht);">Loop hem in gedachten na om alles terug te halen.</div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "Ideeënbus",
            content: `
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
                    <p style="margin:0; color:var(--egd-tekst-zacht); font-size:13px; line-height:1.5;">Bewaar ideeën voor challenges die je later wilt uitwerken.</p>
                    <form id="egodact-ideeenbus-form" style="display:flex; flex-direction:column; gap:9px; padding:12px; background:var(--egd-veld); border:1px solid var(--egd-rand); border-radius:4px;">
                        <input id="egodact-idee-titel" type="text" maxlength="120" required placeholder="Titel van je idee" aria-label="Titel van je idee" style="box-sizing:border-box; width:100%; padding:10px; border:1px solid var(--egd-rand); border-radius:4px; background:var(--egd-modal); color:var(--egd-tekst); font:inherit; font-size:14px;">
                        <textarea id="egodact-idee-beschrijving" maxlength="5000" rows="3" required placeholder="Beschrijving van je idee" aria-label="Beschrijving van je idee" style="box-sizing:border-box; width:100%; padding:10px; border:1px solid var(--egd-rand); border-radius:4px; background:var(--egd-modal); color:var(--egd-tekst); font:inherit; font-size:14px; resize:vertical;"></textarea>
                        <div style="display:flex; justify-content:flex-end; gap:8px;">
                            <button id="egodact-idee-annuleren" type="button" style="display:none; padding:8px 12px; border:1px solid var(--egd-rand); border-radius:4px; background:transparent; color:var(--egd-tekst); cursor:pointer;">Annuleren</button>
                            <button id="egodact-idee-opslaan" type="submit" style="padding:8px 12px; border:none; border-radius:4px; background:var(--egd-accent); color:var(--egd-accent-tekst); font-weight:bold; cursor:pointer;">Idee toevoegen</button>
                        </div>
                    </form>
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                        <strong style="font-size:14px;">Opgeslagen ideeën</strong>
                        <span id="egodact-idee-aantal" style="font-size:12px; color:var(--egd-tekst-zacht);">0 ideeën</span>
                    </div>
                    <div id="egodact-ideeen-lijst" style="display:flex; flex-direction:column; gap:8px;"></div>
                </div>
            `
        }
    ];

    modal.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--egd-rand); padding-bottom:10px; margin-bottom:5px;">
            <h2 id="modal-title-text" style="margin:0; font-size:22px; font-weight:500;">${modalPagesData[currentModalPage].title}</h2>
            <div style="display:flex; align-items:center; gap:4px;">
                <button id="modal-prev-btn" type="button" aria-label="Vorige pagina" title="Vorige pagina" style="background-color:transparent; border:1px solid var(--egd-accent); border-radius:4px; color:var(--egd-accent); cursor:pointer; padding:3px 9px; font-size:18px; font-weight:600; line-height:1.2; transition:background-color 120ms ease, color 120ms ease;" onmouseenter="this.style.backgroundColor='var(--egd-accent)'; this.style.color='var(--egd-accent-tekst)';" onmouseleave="this.style.backgroundColor='transparent'; this.style.color='var(--egd-accent)';">‹</button>
                <span id="modal-page-indicator" aria-live="polite" style="min-width:28px; text-align:center; color:var(--egd-tekst-zacht); font-size:12px;">1 / 2</span>
                <button id="modal-next-btn" type="button" aria-label="Volgende pagina" title="Volgende pagina" style="background-color:transparent; border:1px solid var(--egd-accent); border-radius:4px; color:var(--egd-accent); cursor:pointer; padding:3px 9px; font-size:18px; font-weight:600; line-height:1.2; transition:background-color 120ms ease, color 120ms ease;" onmouseenter="this.style.backgroundColor='var(--egd-accent)'; this.style.color='var(--egd-accent-tekst)';" onmouseleave="this.style.backgroundColor='transparent'; this.style.color='var(--egd-accent)';">›</button>
            </div>
        </div>
        <div id="modal-dynamic-content" style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
            ${modalPagesData[currentModalPage].content}
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:15px;">
            <button id="egodact-modal-sluiten" style="background-color:var(--egd-accent); border:none; color:var(--egd-accent-tekst); cursor:pointer; padding:10px 20px; font-weight:bold; font-size:14px; text-transform:uppercase; border-radius:4px; box-shadow:0px 3px 1px -2px rgba(0,0,0,0.2);">Sluiten</button>
        </div>
    `;

    const modalTitle = modal.querySelector('#modal-title-text');
    const modalBody = modal.querySelector('#modal-dynamic-content');
    const prevButton = modal.querySelector('#modal-prev-btn');
    const nextButton = modal.querySelector('#modal-next-btn');
    const pageIndicator = modal.querySelector('#modal-page-indicator');

    function updateModalView() {
        modalTitle.textContent = modalPagesData[currentModalPage].title;
        modalBody.innerHTML = modalPagesData[currentModalPage].content;
        pageIndicator.textContent = `${currentModalPage + 1} / ${modalPagesData.length}`;
        prevButton.disabled = currentModalPage === 0;
        nextButton.disabled = currentModalPage === modalPagesData.length - 1;

        [prevButton, nextButton].forEach(button => {
            button.style.opacity = button.disabled ? '0.35' : '1';
            button.style.cursor = button.disabled ? 'default' : 'pointer';
            button.style.color = button.disabled ? 'var(--egd-uit)' : 'var(--egd-accent)';
            button.style.borderColor = button.disabled ? 'var(--egd-uit)' : 'var(--egd-accent)';
        });

        if (currentModalPage === 2) {
            initialiseerIdeeenbusPagina();
        }
    }

    function initialiseerIdeeenbusPagina() {
        const KEY = 'egodact_ideeenbus_v1';
        const form = modalBody.querySelector('#egodact-ideeenbus-form');
        const titelVeld = modalBody.querySelector('#egodact-idee-titel');
        const beschrijvingVeld = modalBody.querySelector('#egodact-idee-beschrijving');
        const opslaanKnop = modalBody.querySelector('#egodact-idee-opslaan');
        const annulerenKnop = modalBody.querySelector('#egodact-idee-annuleren');
        const lijst = modalBody.querySelector('#egodact-ideeen-lijst');
        const aantal = modalBody.querySelector('#egodact-idee-aantal');
        if (!form || !titelVeld || !beschrijvingVeld || !lijst || !aantal) return;

        let ideeën = [];
        let bewerkId = null;

        function laadIdeeën() {
            try {
                const data = JSON.parse(localStorage.getItem(KEY) || '[]');
                ideeën = Array.isArray(data) ? data.filter(item =>
                    item && typeof item.id === 'string' &&
                    typeof item.titel === 'string' &&
                    typeof item.beschrijving === 'string'
                ) : [];
            } catch (err) {
                ideeën = [];
            }
        }

        function bewaarIdeeën() {
            try {
                localStorage.setItem(KEY, JSON.stringify(ideeën));
                return true;
            } catch (err) {
                window.alert('Je ideeën konden niet lokaal worden opgeslagen. Controleer de browseropslag.');
                return false;
            }
        }

        function maakActie(tekst, gevaar, handler) {
            const knop = document.createElement('button');
            knop.type = 'button';
            knop.textContent = tekst;
            Object.assign(knop.style, {
                padding: '6px 9px',
                border: '1px solid var(--egd-rand)',
                borderRadius: '4px',
                background: 'transparent',
                color: gevaar ? 'var(--egd-gevaar)' : 'var(--egd-tekst)',
                cursor: 'pointer',
                fontSize: '12px'
            });
            knop.addEventListener('click', handler);
            return knop;
        }

        function resetFormulier() {
            bewerkId = null;
            form.reset();
            opslaanKnop.textContent = 'Idee toevoegen';
            annulerenKnop.style.display = 'none';
        }

        function render() {
            lijst.replaceChildren();
            aantal.textContent = ideeën.length + (ideeën.length === 1 ? ' idee' : ' ideeën');

            if (!ideeën.length) {
                const leeg = document.createElement('div');
                leeg.textContent = 'Je hebt nog geen ideeën opgeslagen. Voeg hierboven je eerste idee toe.';
                Object.assign(leeg.style, {
                    padding: '14px',
                    textAlign: 'center',
                    color: 'var(--egd-tekst-zacht)',
                    background: 'var(--egd-veld)',
                    border: '1px dashed var(--egd-rand)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    lineHeight: '1.5'
                });
                lijst.appendChild(leeg);
                return;
            }

            ideeën.forEach(idee => {
                const kaart = document.createElement('article');
                Object.assign(kaart.style, {
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                    background: 'var(--egd-veld)',
                    border: '1px solid var(--egd-rand)',
                    borderRadius: '4px'
                });

                const kaartTitel = document.createElement('strong');
                kaartTitel.textContent = idee.titel;
                Object.assign(kaartTitel.style, { fontSize: '14px', overflowWrap: 'anywhere' });

                const kaartBeschrijving = document.createElement('div');
                kaartBeschrijving.textContent = idee.beschrijving;
                Object.assign(kaartBeschrijving.style, {
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: 'var(--egd-tekst-zacht)',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere'
                });

                const acties = document.createElement('div');
                Object.assign(acties.style, { display: 'flex', justifyContent: 'flex-end', gap: '7px', flexWrap: 'wrap' });

                acties.appendChild(maakActie('Aanpassen', false, () => {
                    bewerkId = idee.id;
                    titelVeld.value = idee.titel;
                    beschrijvingVeld.value = idee.beschrijving;
                    opslaanKnop.textContent = 'Wijzigingen opslaan';
                    annulerenKnop.style.display = '';
                    titelVeld.focus();
                    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }));

                acties.appendChild(maakActie('Verwijderen', true, () => {
                    if (!window.confirm('Weet je zeker dat je dit idee wilt verwijderen?')) return;
                    const oud = ideeën;
                    ideeën = ideeën.filter(item => item.id !== idee.id);
                    if (!bewaarIdeeën()) {
                        ideeën = oud;
                        return;
                    }
                    if (bewerkId === idee.id) resetFormulier();
                    render();
                }));

                kaart.append(kaartTitel, kaartBeschrijving, acties);
                lijst.appendChild(kaart);
            });
        }

        annulerenKnop.addEventListener('click', resetFormulier);
        form.addEventListener('submit', event => {
            event.preventDefault();
            const titel = titelVeld.value.trim();
            const beschrijving = beschrijvingVeld.value.trim();
            if (!titel || !beschrijving) return;

            const oud = ideeën;
            if (bewerkId) {
                ideeën = ideeën.map(idee => idee.id === bewerkId
                    ? { ...idee, titel, beschrijving, bijgewerkt: Date.now() }
                    : idee
                );
            } else {
                const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
                    ? crypto.randomUUID()
                    : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
                ideeën = [{ id, titel, beschrijving, aangemaakt: Date.now() }, ...ideeën];
            }

            if (!bewaarIdeeën()) {
                ideeën = oud;
                return;
            }
            resetFormulier();
            render();
            titelVeld.focus();
        });

        laadIdeeën();
        render();
    }

    nextButton.addEventListener('click', () => {
        if (currentModalPage < modalPagesData.length - 1) {
            currentModalPage++;
            updateModalView();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentModalPage > 0) {
            currentModalPage--;
            updateModalView();
        }
    });

    updateModalView();


    const sluitMenu = () => backdrop.remove();

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    document
        .getElementById('egodact-modal-sluiten')
        .addEventListener('click', sluitMenu);

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            sluitMenu();
        }
    });
}


