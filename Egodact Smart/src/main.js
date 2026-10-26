// ============================================================
// OBSERVER
// ============================================================

const observer =
    new MutationObserver(
        () => {
            voegKnoppenToe();
        }
    );

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


// ============================================================
// EERSTE UITVOERING
// ============================================================

// Timer en wekkers moeten ook zonder open venster blijven lopen.
egodactTijdStart();

voegKnoppenToe();
