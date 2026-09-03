/* ============================================
   NAVIGATION ENTRE SECTIONS
   Affiche uniquement la section correspondant
   au lien cliqué dans la sidebar
   ============================================ */

// On récupère tous les liens du menu et toutes les sections
const liensMenu = document.querySelectorAll('#sidebar nav a');
const sections = document.querySelectorAll('main section');

// Fonction qui masque toutes les sections sauf celle demandée
function afficherSection(idSection) {
    sections.forEach(function (section) {
        if (section.id === idSection) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Au clic sur un lien du menu, on affiche la bonne section
liensMenu.forEach(function (lien) {
    lien.addEventListener('click', function (event) {
        event.preventDefault(); // empêche le lien de recharger la page

        const texteLien = lien.textContent.trim();

        // On associe le texte du lien à l'id de la section correspondante
        const correspondances = {
            'Tableau de bord': 'tableau-de-bord',
            'Chat': 'chat',
            'Résumé de texte': 'resume',
            'Classification': 'classification',
            'Traduction': 'traduction',
            'Historique': 'historique'
        };

        const idSection = correspondances[texteLien];
        afficherSection(idSection);
    });
});

// Au chargement de la page, on affiche uniquement le tableau de bord
afficherSection('tableau-de-bord');


   /* ============================================
   ETAPE 1 de la partie 7: GESTION DE L'HISTORIQUE (localStorage)
   Fonctions de base réutilisées par tous les modules
   ============================================ */

const CLE_STOCKAGE = 'ai-workspace-historique';

// Récupère l'historique complet depuis le localStorage
function recupererHistorique() {
    const donnees = localStorage.getItem(CLE_STOCKAGE);
    // Si rien n'est encore enregistré, on retourne un tableau vide plutôt que "null"
    return donnees ? JSON.parse(donnees) : [];
}

// Ajoute une nouvelle entrée dans l'historique et la sauvegarde
function ajouterAHistorique(service, contenu) {
    const historique = recupererHistorique();

    const nouvelleEntree = {
        id: Date.now(),
        service: service,
        contenu: contenu,
        date: new Date().toLocaleString('fr-FR')
    };

    historique.push(nouvelleEntree);
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(historique));
    afficherHistorique();
    actualiserTableauDeBord(); // ← ligne ajoutée
}

// Supprime une entrée précise à partir de son id
function supprimerEntreeHistorique(id) {
    let historique = recupererHistorique();
    historique = historique.filter(function (entree) {
        return entree.id !== id;
    });
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(historique));
    afficherHistorique();
    actualiserTableauDeBord(); // ← ligne ajoutée
}

// Vide complètement l'historique
function viderHistorique() {
    localStorage.removeItem(CLE_STOCKAGE);
    afficherHistorique();
    actualiserTableauDeBord(); // ← ligne ajoutée
}

/* ============================================
   TABLEAU DE BORD DYNAMIQUE (Bonus 1)
   ============================================ */

let graphiqueRequetes = null;
let graphiqueServices = null;

function actualiserTableauDeBord() {
    const historique = recupererHistorique();

    // --- 1. Chiffres simples ---
    document.getElementById('stat-nb-requetes').textContent = historique.length;
    document.getElementById('stat-nb-taches').textContent = historique.length;

    // --- 2. Répartition par service (pour le camembert) ---
    const repartitionParService = {};
    historique.forEach(function (entree) {
        const service = entree.service;
        repartitionParService[service] = (repartitionParService[service] || 0) + 1;
    });

    const labelsServices = Object.keys(repartitionParService);
    const valeursServices = Object.values(repartitionParService);

    // --- 3. Requêtes par jour, sur les 7 derniers jours ---
    const labelsJours = [];
    const valeursJours = [];

    for (let i = 6; i >= 0; i--) {
        const jour = new Date();
        jour.setDate(jour.getDate() - i);
        const jourFormate = jour.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

        // On compte combien d'entrées de l'historique ont été créées ce jour-là
        const nbRequetesCeJour = historique.filter(function (entree) {
            const dateEntree = new Date(entree.id).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            return dateEntree === jourFormate;
        }).length;

        labelsJours.push(jourFormate);
        valeursJours.push(nbRequetesCeJour);
    }

    // --- 4. Mise à jour du graphique en courbe ---
    // Si un graphique existe déjà, on le détruit avant d'en recréer un
    // (sinon Chart.js empile les anciens graphiques par-dessus)
    if (graphiqueRequetes) {
        graphiqueRequetes.destroy();
    }
    const ctxRequetes = document.getElementById('chart-requetes').getContext('2d');
    graphiqueRequetes = new Chart(ctxRequetes, {
        type: 'line',
        data: {
            labels: labelsJours,
            datasets: [{
                label: 'Requêtes',
                data: valeursJours,
                borderColor: '#1a2332',
                backgroundColor: 'rgba(26, 35, 50, 0.08)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // --- 5. Mise à jour du graphique en anneau (camembert) ---
    if (graphiqueServices) {
        graphiqueServices.destroy();
    }
    const ctxServices = document.getElementById('chart-services').getContext('2d');
    graphiqueServices = new Chart(ctxServices, {
        type: 'doughnut',
        data: {
            labels: labelsServices,
            datasets: [{
                data: valeursServices,
                backgroundColor: ['#1a2332', '#27ae60', '#8e44ad', '#e67e22', '#3498db']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'right' } }
        }
    });

    // --- 6. Mise à jour du tableau "Activité récente" ---
    const corpsTableau = document.querySelector('#table-activite-recente tbody');
    corpsTableau.innerHTML = '';

    // On prend les 5 dernières entrées, dans l'ordre du plus récent au plus ancien
    const dernieresEntrees = historique.slice(-5).reverse();

    if (dernieresEntrees.length === 0) {
        corpsTableau.innerHTML = '<tr><td colspan="3">Aucune activité pour le moment.</td></tr>';
        return;
    }

    dernieresEntrees.forEach(function (entree) {
        const ligne = document.createElement('tr');
        ligne.innerHTML = `
            <td>${entree.service}</td>
            <td>${entree.contenu.substring(0, 40)}${entree.contenu.length > 40 ? '...' : ''}</td>
            <td>${entree.date}</td>
        `;
        corpsTableau.appendChild(ligne);
    });
}



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

    ajouterAHistorique('Résumé de texte', texteSaisi);

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

    ajouterAHistorique('Traduction', texteSaisi + ' → ' + texteLangue);
    zoneResultatTraduction.textContent = 'Traduction (simulée) : ' + traductionSimulee;
});

/* ============================================
   Partie 5 : CHAT (simulé)
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
    ajouterAHistorique('Chat', texteSaisi);

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

/* ============================================
   Partie 6 : Prédictionn (simulée)
   ============================================ */

// 1. On récupère la section qui va accueillir les éléments générés
const sectionPrediction = document.getElementById('classification');

// 2. Création du champ "Âge"
const champAge = document.createElement('input');
champAge.type = 'number';
champAge.id = 'prediction-age';
champAge.placeholder = 'Âge';

// 3. Création du champ "Revenu"
const champRevenu = document.createElement('input');
champRevenu.type = 'number';
champRevenu.id = 'prediction-revenu';
champRevenu.placeholder = 'Revenu mensuel';

// 4. Création du champ "Ville"
const champVille = document.createElement('input');
champVille.type = 'text';
champVille.id = 'prediction-ville';
champVille.placeholder = 'Ville';

// 5. Création du bouton "Prédire"
const boutonPrediction = document.createElement('button');
boutonPrediction.id = 'prediction-btn';
boutonPrediction.textContent = 'Prédire';

// 6. Création de la zone d'affichage du résultat
const zoneResultatPrediction = document.createElement('div');
zoneResultatPrediction.id = 'prediction-output';

// 7. Insertion des éléments dans la section, dans l'ordre voulu
sectionPrediction.appendChild(champAge);
sectionPrediction.appendChild(champRevenu);
sectionPrediction.appendChild(champVille);
sectionPrediction.appendChild(boutonPrediction);
sectionPrediction.appendChild(zoneResultatPrediction);

// 8. Comportement au clic sur le bouton "Prédire"
boutonPrediction.addEventListener('click', function () {
    const age = champAge.value.trim();
    const revenu = champRevenu.value.trim();
    const ville = champVille.value.trim();

    // Vérification : les 3 champs doivent être remplis
    if (age === '' || revenu === '' || ville === '') {
        zoneResultatPrediction.textContent = 'Veuillez remplir les trois champs avant de prédire.';
        return;
    }

    // Simulation : on fait varier le résultat fictif selon le revenu saisi
    // (juste pour rendre la simulation un peu plus crédible qu'un résultat toujours identique)
    let categorie;
    if (revenu < 1500) {
        categorie = 'Profil économique';
    } else if (revenu < 3500) {
        categorie = 'Profil intermédiaire';
    } else {
        categorie = 'Profil premium';
    }

    const predictionSimulee = `À ${age} ans, résidant à ${ville}, avec un revenu de ${revenu}€ : ${categorie} (prédiction simulée).`;

    ajouterAHistorique('Prédiction', `Âge: ${age}, Revenu: ${revenu}, Ville: ${ville}`);
    zoneResultatPrediction.textContent = predictionSimulee;
});

/* ============================================
   Partie 7 : HISTORIQUE
   ============================================ */

const sectionHistorique = document.getElementById('historique');

// 1. Champ de recherche
const champRecherche = document.createElement('input');
champRecherche.type = 'text';
champRecherche.id = 'historique-recherche';
champRecherche.placeholder = 'Rechercher dans l\'historique...';

// 2. Bouton "Tout vider"
const boutonVider = document.createElement('button');
boutonVider.id = 'historique-vider';
boutonVider.textContent = 'Tout vider';

// 3. Conteneur qui accueillera la liste des entrées
const listeHistorique = document.createElement('div');
listeHistorique.id = 'historique-liste';

// 4. Insertion dans la section
sectionHistorique.appendChild(champRecherche);
sectionHistorique.appendChild(boutonVider);
sectionHistorique.appendChild(listeHistorique);

// 5. Fonction qui affiche (ou rafraîchit) la liste de l'historique
function afficherHistorique(filtre = '') {
    const historique = recupererHistorique();

    // On repart de zéro à chaque affichage pour éviter les doublons
    listeHistorique.innerHTML = '';

    // On filtre les entrées si l'utilisateur a tapé quelque chose dans la recherche
    const historiqueFiltre = historique.filter(function (entree) {
        const texteComplet = (entree.service + ' ' + entree.contenu).toLowerCase();
        return texteComplet.includes(filtre.toLowerCase());
    });

    if (historiqueFiltre.length === 0) {
        listeHistorique.textContent = 'Aucune entrée à afficher.';
        return;
    }

    // On crée un bloc pour chaque entrée filtrée
    historiqueFiltre.forEach(function (entree) {
        const blocEntree = document.createElement('div');
        blocEntree.className = 'historique-entree';

        const texteEntree = document.createElement('p');
        texteEntree.textContent = `[${entree.date}] ${entree.service} : ${entree.contenu}`;

        const boutonSupprimer = document.createElement('button');
        boutonSupprimer.textContent = 'Supprimer';
        boutonSupprimer.addEventListener('click', function () {
            supprimerEntreeHistorique(entree.id);
        });

        blocEntree.appendChild(texteEntree);
        blocEntree.appendChild(boutonSupprimer);
        listeHistorique.appendChild(blocEntree);
    });
}

// 6. Recherche en direct : à chaque frappe dans le champ de recherche
champRecherche.addEventListener('input', function () {
    afficherHistorique(champRecherche.value);
});

// 7. Clic sur "Tout vider"
boutonVider.addEventListener('click', function () {
    viderHistorique();
});

// 8. Premier affichage au chargement de la page
afficherHistorique();





