// intro.js - Animation d'introduction fluide et unique sans rechargement
window.addEventListener('load', () => {
    const splash = document.getElementById('intro-splash');
    if (!splash) return;

    // Récupérer la dernière couleur choisie (thème ou profil), sinon définir le bleu par défaut
    const savedTheme = localStorage.getItem('krizix_theme');
    let themeColor = '#3498db'; // Bleu par défaut

    if (savedTheme === 'green') {
        themeColor = '#2ecc71';
    } else if (savedTheme === 'blue') {
        themeColor = '#3498db';
    } else {
        // Vérifier si une autre couleur personnalisée a été enregistrée quelque part
        const activeUser = JSON.parse(localStorage.getItem('krizix_user') || '{}');
        if (activeUser && activeUser.id) {
            const customCol = localStorage.getItem(`krizix_profile_color_${activeUser.id}`);
            if (customCol) themeColor = customCol;
        }
    }

    // Appliquer dynamiquement la couleur aux bordures et aux effets de l'intro
    const splashLeft = splash.querySelector('.splash-left');
    const splashRight = splash.querySelector('.splash-right');
    const splashLogoContainer = splash.querySelector('.splash-logo-container');
    const splashTitle = splash.querySelector('h2');

    if (splashLeft) splashLeft.style.borderRightColor = themeColor;
    if (splashRight) splashRight.style.borderLeftColor = themeColor;
    if (splashLogoContainer) splashLogoContainer.style.borderColor = themeColor;
    if (splashTitle) splashTitle.style.textShadow = `0 0 20px ${themeColor}`;

    const hasPlayed = sessionStorage.getItem('krizix_intro_played');

    if (hasPlayed) {
        splash.style.display = 'none';
        splash.remove();
    } else {
        sessionStorage.setItem('krizix_intro_played', 'true');

        setTimeout(() => {
            const splashContent = document.querySelector('.splash-content');
            if (splashContent) splashContent.style.opacity = '0';
            
            splash.classList.add('splash-open');
            
            setTimeout(() => {
                splash.remove();
            }, 850);
        }, 1600);
    }
});