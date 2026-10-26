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


