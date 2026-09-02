/* ============================================
   MODULE : RÉSUMÉ DE TEXTE (simulé)
   Tous les éléments (zone de saisie, bouton,
   zone de résultat) sont générés dynamiquement
   en JavaScript et injectés dans la section #resume
   ============================================ */

// 1. On récupère la section qui va accueillir les éléments générés
const sectionResume = document.getElementById('resume');

// 2. Création de la zone de saisie (textarea)
const champResume = document.createElement('textarea');
champResume.id = 'resume-input';
champResume.placeholder = 'Collez ou saisissez votre texte ici...';
champResume.rows = 6;

// 3. Création du bouton "Résumer"
const boutonResume = document.createElement('button');
boutonResume.id = 'resume-btn';
boutonResume.textContent = 'Resumer'; // texte affiché sur le bouton

// 4. Création de la zone d'affichage du résultat
const zoneResultatResume = document.createElement('div');
zoneResultatResume.id = 'resume-output';

// 5. On insère les 3 éléments créés dans la section, dans l'ordre voulu
sectionResume.appendChild(champResume);
sectionResume.appendChild(boutonResume);
sectionResume.appendChild(zoneResultatResume);

// 6. Comportement au clic sur le bouton (logique de simulation)
boutonResume.addEventListener('click', function () {
    const texteSaisi = champResume.value.trim();

    if (texteSaisi === '') {
        zoneResultatResume.textContent = 'Veuillez saisir un texte avant de le résumer.';
        return;
    }

    const mots = texteSaisi.split(' ');
    const resumeSimule = mots.slice(0, 15).join(' ') + '...';

    zoneResultatResume.textContent = 'Résumé (simulé) : ' + resumeSimule;
});