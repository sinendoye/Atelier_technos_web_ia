/* ============================================
   Partie 3 : RÉSUMÉ DE TEXTE (simulé)
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

/* ============================================
    Partie 4: TRADUCTION (simulé)
   ============================================ */

// 1. On récupère la section qui va accueillir les éléments générés
const sectionTraduction = document.getElementById('traduction');

// 2. Création de la zone de saisie du texte à traduire
const champTraduction = document.createElement('textarea');
champTraduction.id = 'traduction-input';
champTraduction.placeholder = 'Saisissez le texte à traduire...';
champTraduction.rows = 6;

// 3. Création de la liste déroulante des langues
const selectLangue = document.createElement('select');
selectLangue.id = 'traduction-langue';

// On définit les langues disponibles dans un tableau,
// pour éviter de répéter le même code pour chaque <option>
const langues = [
    { valeur: 'en', texte: 'Anglais' },
    { valeur: 'es', texte: 'Espagnol' },
    { valeur: 'de', texte: 'Allemand' },
    { valeur: 'ar', texte: 'Arabe' }
];

// On crée une <option> pour chaque langue du tableau
langues.forEach(function (langue) {
    const option = document.createElement('option');
    option.value = langue.valeur;       // ce que le JS lira (ex: "en")
    option.textContent = langue.texte;  // ce que l'utilisateur voit (ex: "Anglais")
    selectLangue.appendChild(option);
});

// 4. Création du bouton "Traduire"
const boutonTraduction = document.createElement('button');
boutonTraduction.id = 'traduction-btn';
boutonTraduction.textContent = 'Traduire';

// 5. Création de la zone d'affichage du résultat
const zoneResultatTraduction = document.createElement('div');
zoneResultatTraduction.id = 'traduction-output';

// 6. Insertion de tous les éléments dans la section, dans l'ordre voulu
sectionTraduction.appendChild(champTraduction);
sectionTraduction.appendChild(selectLangue);
sectionTraduction.appendChild(boutonTraduction);
sectionTraduction.appendChild(zoneResultatTraduction);

// 7. Comportement au clic sur le bouton "Traduire"
boutonTraduction.addEventListener('click', function () {
    const texteSaisi = champTraduction.value.trim();
    const langueChoisie = selectLangue.value; // ex: "en"
    const texteLangue = selectLangue.options[selectLangue.selectedIndex].textContent; // ex: "Anglais"

    if (texteSaisi === '') {
        zoneResultatTraduction.textContent = 'Veuillez saisir un texte avant de traduire.';
        return;
    }

    // Simulation : on ne fait pas de vraie traduction,
    // on affiche juste le texte original + la langue cible choisie
    const traductionSimulee = '[' + texteLangue + '] ' + texteSaisi;

    zoneResultatTraduction.textContent = 'Traduction (simulée) : ' + traductionSimulee;
});

/* ============================================
   Partie 5 : CHAT IA (simulé)
   ============================================ */

// 1. On récupère la section qui va accueillir les éléments générés
const sectionChat = document.getElementById('chat');

// 2. Création de la zone d'affichage de la conversation (historique des messages)
const zoneMessagesChat = document.createElement('div');
zoneMessagesChat.id = 'chat-messages';

// 3. Création de la zone de saisie du message
const champChat = document.createElement('input');
champChat.type = 'text';
champChat.id = 'chat-input';
champChat.placeholder = 'Écrivez votre message...';

// 4. Création du bouton d'envoi
const boutonChat = document.createElement('button');
boutonChat.id = 'chat-btn';
boutonChat.textContent = 'Envoyer';

// 5. Insertion des éléments dans la section, dans l'ordre voulu
// (la zone de messages en premier, en haut, comme dans un vrai chat)
sectionChat.appendChild(zoneMessagesChat);
sectionChat.appendChild(champChat);
sectionChat.appendChild(boutonChat);

// 6. Fonction qui ajoute un message dans la zone de conversation
function ajouterMessage(texte, auteur) {
    // auteur peut valoir 'utilisateur' ou 'ia'
    const message = document.createElement('p');
    message.textContent = (auteur === 'utilisateur' ? 'Vous : ' : 'IA : ') + texte;
    message.className = 'message-' + auteur; // ex: "message-utilisateur" ou "message-ia"

    zoneMessagesChat.appendChild(message);

    // On fait défiler automatiquement vers le bas pour voir le dernier message
    zoneMessagesChat.scrollTop = zoneMessagesChat.scrollHeight;
}

// 7. Fonction qui gère l'envoi d'un message
function envoyerMessage() {
    const texteSaisi = champChat.value.trim();

    if (texteSaisi === '') {
        return; // on ne fait rien si le champ est vide, pas besoin de message d'erreur ici
    }

    // On affiche d'abord le message de l'utilisateur
    ajouterMessage(texteSaisi, 'utilisateur');

    // On vide le champ de saisie pour que l'utilisateur puisse taper un nouveau message
    champChat.value = '';

    // Simulation : réponse fictive de l'IA
    const reponseSimulee = 'Je suis une réponse simulée à votre message : "' + texteSaisi + '"';
    ajouterMessage(reponseSimulee, 'ia');
}

// 8. Déclenchement au clic sur le bouton
boutonChat.addEventListener('click', envoyerMessage);

// 9. Déclenchement également avec la touche "Entrée" du clavier
champChat.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        envoyerMessage();
    }
});