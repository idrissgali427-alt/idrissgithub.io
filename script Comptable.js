// script Comptable.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialisation et variables globales ---
    const accountantNameInput = document.getElementById('accountantName');
    const currentDateTimeSpan = document.getElementById('current-datetime');
    const weatherInfoSpan = document.getElementById('weather-info'); // Pour l'intégration future de l'API météo

    const sidebarNavLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    const resetAppButton = document.getElementById('resetAppButton');

    // Données stockées localement (simulées pour l'exemple)
    let entreprises = JSON.parse(localStorage.getItem('entreprises')) || [];
    let versements = JSON.parse(localStorage.getItem('versements')) || [];

    // Références aux formulaires et tableaux
    const formulaireEntrepriseForm = document.getElementById('formulaireEntrepriseForm');
    const tableEntreprisesBody = document.querySelector('#table-formulaire-entreprise tbody');
    const entrepriseIdInput = document.getElementById('entrepriseId');
    const comptableFormInput = document.getElementById('comptableForm'); // Champ comptable formulaire entreprise
    const cancelEntrepriseEditButton = document.getElementById('cancelEntrepriseEdit');

    const versementMensuelForm = document.getElementById('versementMensuelForm');
    const tableVersementMensuelBody = document.querySelector('#table-versement-mensuel tbody');
    const versementIdInput = document.getElementById('versementId');
    const typeEntrepriseVersementSelect = document.getElementById('typeEntrepriseVersement');
    const rapportEntrepriseInput = document.getElementById('rapportEntreprise'); // Champ numéro de rapport
    const dgVersementInput = document.getElementById('dgVersement');
    const comptableVersementInput = document.getElementById('comptableVersement'); // Champ comptable formulaire versement
    const cancelVersementEditButton = document.getElementById('cancelVersementEdit');

    // Références pour les bilans et conseils
    const bilanTypeEntrepriseSelect = document.getElementById('bilanTypeEntreprise');
    const conseilTypeEntrepriseSelect = document.getElementById('conseilTypeEntreprise');

    // --- Fonctions utilitaires ---

    // Met à jour la date et l'heure
    function updateDateTime() {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentDateTimeSpan.textContent = `${now.toLocaleDateString('fr-FR', optionsDate)} ${now.toLocaleTimeString('fr-FR', optionsTime)}`;
    }

    // Affiche la section de contenu appropriée
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        sidebarNavLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    // Sauvegarde les données dans le localStorage
    function saveData() {
        localStorage.setItem('entreprises', JSON.stringify(entreprises));
        localStorage.setItem('versements', JSON.stringify(versements));
        localStorage.setItem('accountantName', accountantNameInput.value); // Sauvegarde le nom du comptable de l'en-tête
    }

    // Charge les données depuis le localStorage
    function loadData() {
        const savedAccountantName = localStorage.getItem('accountantName');
        if (savedAccountantName) {
            accountantNameInput.value = savedAccountantName;
        } else {
            // Si aucun nom n'est enregistré, définir une valeur par défaut
            accountantNameInput.value = "Nom du Comptable";
        }
        // Mettre à jour les champs de formulaire liés après le chargement
        updateComptableFormFields(accountantNameInput.value);
    }

    // Met à jour les champs de comptable dans les formulaires
    function updateComptableFormFields(name) {
        comptableFormInput.value = name;
        comptableVersementInput.value = name;
    }

    // Écouteur d'événements pour le champ du comptable en tête
    accountantNameInput.addEventListener('input', () => {
        updateComptableFormFields(accountantNameInput.value);
        saveData(); // Sauvegarder le nom du comptable à chaque modification
    });

    // Met à jour les sélecteurs d'entreprise dans les formulaires
    function updateEntrepriseSelects() {
        typeEntrepriseVersementSelect.innerHTML = '<option value="">Sélectionner un type</option>';
        bilanTypeEntrepriseSelect.innerHTML = '<option value="">Toutes les entreprises</option>';
        conseilTypeEntrepriseSelect.innerHTML = '<option value="">Toutes les entreprises</option>';

        entreprises.forEach(entreprise => {
            const option1 = document.createElement('option');
            option1.value = entreprise.id; // Utilisez l'ID de l'entreprise comme valeur
            option1.textContent = entreprise.typeEntreprise;
            typeEntrepriseVersementSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = entreprise.typeEntreprise;
            option2.textContent = entreprise.typeEntreprise;
            bilanTypeEntrepriseSelect.appendChild(option2);

            const option3 = document.createElement('option');
            option3.value = entreprise.typeEntreprise;
            option3.textContent = entreprise.typeEntreprise;
            conseilTypeEntrepriseSelect.appendChild(option3);
        });
    }

    // --- Gestion des Entreprises ---

    // Affiche toutes les entreprises dans le tableau
    function displayEntreprises() {
        tableEntreprisesBody.innerHTML = ''; // Nettoie le tableau
        entreprises.forEach((entreprise, index) => {
            const row = tableEntreprisesBody.insertRow();

            const numCell = row.insertCell(0);
            numCell.textContent = index + 1; // Numéro de ligne (1, 2, 3...)

            const typeCell = row.insertCell(1);
            typeCell.textContent = entreprise.typeEntreprise;

            const dgCell = row.insertCell(2);
            dgCell.textContent = entreprise.dg;

            const dateCell = row.insertCell(3);
            dateCell.textContent = entreprise.date;

            const comptableCell = row.insertCell(4);
            comptableCell.textContent = entreprise.comptable;

            const actionsCell = row.insertCell(5);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Modifier';
            editBtn.classList.add('btn', 'btn-edit');
            editBtn.onclick = () => editEntreprise(entreprise.id);
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.classList.add('btn', 'btn-delete');
            deleteBtn.onclick = () => deleteEntreprise(entreprise.id);
            actionsCell.appendChild(deleteBtn);
        });
        updateEntrepriseSelects(); // Met à jour les sélecteurs après affichage
    }

    // Gère la soumission du formulaire d'entreprise
    formulaireEntrepriseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEntreprise = {
            id: entrepriseIdInput.value ? parseInt(entrepriseIdInput.value) : Date.now(), // Utilise l'ID existant ou un nouvel ID
            typeEntreprise: document.getElementById('typeEntrepriseForm').value,
            dg: document.getElementById('dgForm').value,
            date: document.getElementById('dateForm').value,
            comptable: comptableFormInput.value // Prend la valeur du champ comptable bloqué
        };

        if (entrepriseIdInput.value) {
            // Modification
            entreprises = entreprises.map(emp => emp.id === newEntreprise.id ? newEntreprise : emp);
            entrepriseIdInput.value = ''; // Réinitialise l'ID pour les nouvelles entrées
            cancelEntrepriseEditButton.style.display = 'none';
        } else {
            // Nouvelle entreprise
            entreprises.push(newEntreprise);
        }

        formulaireEntrepriseForm.reset();
        updateComptableFormFields(accountantNameInput.value); // Réinitialise le champ comptable après soumission
        saveData();
        displayEntreprises();
    });

    // Remplit le formulaire pour modification
    function editEntreprise(id) {
        const entrepriseToEdit = entreprises.find(emp => emp.id === id);
        if (entrepriseToEdit) {
            document.getElementById('entrepriseId').value = entrepriseToEdit.id;
            document.getElementById('typeEntrepriseForm').value = entrepriseToEdit.typeEntreprise;
            document.getElementById('dgForm').value = entrepriseToEdit.dg;
            document.getElementById('dateForm').value = entrepriseToEdit.date;
            comptableFormInput.value = entrepriseToEdit.comptable; // Afficher le comptable actuel de l'entrée
            cancelEntrepriseEditButton.style.display = 'inline-block';
            showSection('formulaire-entreprise'); // S'assure que la section est visible
        }
    }

    // Annule la modification d'entreprise
    cancelEntrepriseEditButton.addEventListener('click', () => {
        formulaireEntrepriseForm.reset();
        entrepriseIdInput.value = '';
        updateComptableFormFields(accountantNameInput.value); // Réinitialise au nom du comptable global
        cancelEntrepriseEditButton.style.display = 'none';
    });

    // Supprime une entreprise
    function deleteEntreprise(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette entreprise et tous ses versements associés ?')) {
            entreprises = entreprises.filter(emp => emp.id !== id);
            // Supprimer également les versements associés à cette entreprise
            versements = versements.filter(vers => vers.entrepriseId !== id);
            saveData();
            displayEntreprises();
            displayVersements(); // Rafraîchit aussi la table des versements
        }
    }

    // --- Gestion des Versements Mensuels ---

    // Affiche tous les versements dans le tableau
    function displayVersements() {
        tableVersementMensuelBody.innerHTML = ''; // Nettoie le tableau
        versements.forEach((versement) => {
            const row = tableVersementMensuelBody.insertRow();
            // const entrepriseAssociee = entreprises.find(e => e.id === versement.entrepriseId); // Pas directement utilisé ici, mais utile pour le contexte

            row.insertCell(0).textContent = `R${String(versement.entrepriseId).padStart(3, '0')}`; // Format R001
            row.insertCell(1).textContent = versement.typeEntreprise;
            row.insertCell(2).textContent = versement.dg;
            row.insertCell(3).textContent = versement.comptable;
            row.insertCell(4).textContent = versement.dateVersement;
            row.insertCell(5).textContent = versement.caAchat.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(6).textContent = versement.caProduction.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(7).textContent = versement.montantDepot.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(8).textContent = versement.montantPointsVente.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(9).textContent = versement.caVente.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(10).textContent = versement.montantDepenses.toLocaleString('fr-FR') + ' XAF';

            const actionsCell = row.insertCell(11);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Modifier';
            editBtn.classList.add('btn', 'btn-edit');
            editBtn.onclick = () => editVersement(versement.id);
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.classList.add('btn', 'btn-delete');
            deleteBtn.onclick = () => deleteVersement(versement.id);
            actionsCell.appendChild(deleteBtn);
        });
        updateDashboardMetrics(); // Met à jour les totaux du tableau de bord
    }

    // Met à jour les champs DG et Comptable du formulaire de versement quand le type d'entreprise change
    typeEntrepriseVersementSelect.addEventListener('change', () => {
        const selectedEntrepriseId = parseInt(typeEntrepriseVersementSelect.value);
        const selectedEntreprise = entreprises.find(emp => emp.id === selectedEntrepriseId);

        if (selectedEntreprise) {
            dgVersementInput.value = selectedEntreprise.dg;
            rapportEntrepriseInput.value = `R${String(selectedEntreprise.id).padStart(3, '0')}`; // Format R001
        } else {
            dgVersementInput.value = '';
            rapportEntrepriseInput.value = '';
        }
    });

    // Gère la soumission du formulaire de versement
    versementMensuelForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedEntrepriseId = parseInt(typeEntrepriseVersementSelect.value);
        const selectedEntreprise = entreprises.find(emp => emp.id === selectedEntrepriseId);

        if (!selectedEntreprise) {
            alert("Veuillez sélectionner une entreprise valide.");
            return;
        }

        const newVersement = {
            id: versementIdInput.value ? parseInt(versementIdInput.value) : Date.now(),
            entrepriseId: selectedEntrepriseId, // Lie le versement à l'entreprise
            typeEntreprise: selectedEntreprise.typeEntreprise, // Pour un affichage facile
            dg: selectedEntreprise.dg, // Pour un affichage facile
            comptable: comptableVersementInput.value, // Prend la valeur du champ comptable bloqué
            dateVersement: document.getElementById('dateVersement').value,
            caAchat: parseFloat(document.getElementById('caAchat').value),
            caProduction: parseFloat(document.getElementById('caProduction').value),
            montantDepot: parseFloat(document.getElementById('montantDepot').value),
            montantPointsVente: parseFloat(document.getElementById('montantPointsVente').value),
            caVente: parseFloat(document.getElementById('caVente').value),
            montantDepenses: parseFloat(document.getElementById('montantDepenses').value)
        };

        if (versementIdInput.value) {
            // Modification
            versements = versements.map(vers => vers.id === newVersement.id ? newVersement : vers);
            versementIdInput.value = ''; // Réinitialise l'ID
            cancelVersementEditButton.style.display = 'none';
        } else {
            // Nouveau versement
            versements.push(newVersement);
        }

        versementMensuelForm.reset();
        updateComptableFormFields(accountantNameInput.value); // Réinitialise le comptable après soumission
        saveData();
        displayVersements();
        typeEntrepriseVersementSelect.value = ''; // Réinitialise le sélecteur
        dgVersementInput.value = ''; // Réinitialise le DG
        rapportEntrepriseInput.value = ''; // Réinitialise le numéro de rapport
    });

    // Remplit le formulaire de versement pour modification
    function editVersement(id) {
        const versementToEdit = versements.find(vers => vers.id === id);
        if (versementToEdit) {
            versementIdInput.value = versementToEdit.id;
            typeEntrepriseVersementSelect.value = versementToEdit.entrepriseId; // Sélectionnez l'entreprise via son ID
            // Déclenche l'événement change pour mettre à jour DG et rapportEntrepriseInput
            typeEntrepriseVersementSelect.dispatchEvent(new Event('change'));

            comptableVersementInput.value = versementToEdit.comptable; // Afficher le comptable actuel de l'entrée
            document.getElementById('dateVersement').value = versementToEdit.dateVersement;
            document.getElementById('caAchat').value = versementToEdit.caAchat;
            document.getElementById('caProduction').value = versementToEdit.caProduction;
            document.getElementById('montantDepot').value = versementToEdit.montantDepot;
            document.getElementById('montantPointsVente').value = versementToEdit.montantPointsVente;
            document.getElementById('caVente').value = versementToEdit.caVente;
            document.getElementById('montantDepenses').value = versementToEdit.montantDepenses;

            cancelVersementEditButton.style.display = 'inline-block';
            showSection('versement-mensuel'); // S'assure que la section est visible
        }
    }

    // Annule la modification de versement
    cancelVersementEditButton.addEventListener('click', () => {
        versementMensuelForm.reset();
        versementIdInput.value = '';
        cancelVersementEditButton.style.display = 'none';
        typeEntrepriseVersementSelect.value = '';
        dgVersementInput.value = '';
        rapportEntrepriseInput.value = '';
        updateComptableFormFields(accountantNameInput.value); // Réinitialise au nom du comptable global
    });

    // Supprime un versement
    function deleteVersement(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce versement ?')) {
            versements = versements.filter(vers => vers.id !== id);
            saveData();
            displayVersements();
        }
    }

    // --- Tableau de Bord Global ---
    function updateDashboardMetrics() {
        const totalAchats = versements.reduce((sum, v) => sum + v.caAchat, 0);
        const totalProduction = versements.reduce((sum, v) => sum + v.caProduction, 0);
        const totalDepot = versements.reduce((sum, v) => sum + v.montantDepot, 0);
        const totalMontantsVersesPV = versements.reduce((sum, v) => sum + v.montantPointsVente, 0);

        document.getElementById('totalAchats').textContent = totalAchats.toLocaleString('fr-FR') + ' XAF';
        document.getElementById('totalProduction').textContent = totalProduction.toLocaleString('fr-FR') + ' XAF';
        document.getElementById('totalDepot').textContent = totalDepot.toLocaleString('fr-FR') + ' XAF';
        document.getElementById('totalMontantsVersesPV').textContent = totalMontantsVersesPV.toLocaleString('fr-FR') + ' XAF';

        // Mettre à jour les graphiques (à implémenter avec Chart.js)
        updateMainDashboardChart();
        updateSummaryChart();
        updatePurchaseProductionChart();
        updateCompanyPerformanceChart();
        updateMonthlyProfitChart();
        updateProfitDistributionChart();
    }

    // --- Fonctions Chart.js (implémentation de base, à étendre) ---
    let mainDashboardChartInstance, summaryChartInstance, purchaseProductionChartInstance,
        companyPerformanceChartInstance, monthlyProfitChartInstance, profitDistributionChartInstance;

    function createChart(ctxId, type, data, options) {
        const ctx = document.getElementById(ctxId).getContext('2d');
        // Détruire l'instance existante si elle existe
        if (eval(`${ctxId}Instance`)) {
            eval(`${ctxId}Instance`).destroy();
        }
        // Créer une nouvelle instance
        return new Chart(ctx, { type, data, options });
    }

    function updateMainDashboardChart() {
        const labels = ['Achats', 'Production', 'Dépôt', 'Montants PV'];
        const data = [
            versements.reduce((sum, v) => sum + v.caAchat, 0),
            versements.reduce((sum, v) => sum + v.caProduction, 0),
            versements.reduce((sum, v) => sum + v.montantDepot, 0),
            versements.reduce((sum, v) => sum + v.montantPointsVente, 0)
        ];
        mainDashboardChartInstance = createChart('mainDashboardChart', 'bar', {
            labels: labels,
            datasets: [{
                label: 'Totaux Financiers',
                data: data,
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'],
                borderColor: ['#388E3C', '#1976D2', '#FFA000', '#7B1FA2'],
                borderWidth: 1
            }]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Vue d\'overview des Totaux Financiers' } }
        });
    }

    function updateSummaryChart() {
        // Exemple : CA Vente vs Dépenses
        const labels = Array.from(new Set(versements.map(v => v.dateVersement.substring(0, 7)))).sort(); // Mois-Année
        const caVenteData = labels.map(month =>
            versements.filter(v => v.dateVersement.startsWith(month))
                      .reduce((sum, v) => sum + v.caVente, 0)
        );
        const depensesData = labels.map(month =>
            versements.filter(v => v.dateVersement.startsWith(month))
                      .reduce((sum, v) => sum + v.montantDepenses, 0)
        );

        summaryChartInstance = createChart('summaryChart', 'line', {
            labels: labels,
            datasets: [
                {
                    label: 'Chiffre d\'Affaire de Vente',
                    data: caVenteData,
                    borderColor: '#00BCD4',
                    tension: 0.1
                },
                {
                    label: 'Dépenses Totales',
                    data: depensesData,
                    borderColor: '#F44336',
                    tension: 0.1
                }
            ]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Chiffre d\'Affaire de Vente vs Dépenses' } }
        });
    }

    function updatePurchaseProductionChart() {
        const labels = Array.from(new Set(entreprises.map(e => e.typeEntreprise))).sort(); // Utilise les types d'entreprise enregistrés
        const purchaseData = labels.map(type =>
            versements.filter(v => v.typeEntreprise === type)
                      .reduce((sum, v) => sum + v.caAchat, 0)
        );
        const productionData = labels.map(type =>
            versements.filter(v => v.typeEntreprise === type)
                      .reduce((sum, v) => sum + v.caProduction, 0)
        );

        purchaseProductionChartInstance = createChart('purchaseProductionChart', 'bar', {
            labels: labels,
            datasets: [
                {
                    label: 'Total Achats',
                    data: purchaseData,
                    backgroundColor: '#FF5722'
                },
                {
                    label: 'Total Production',
                    data: productionData,
                    backgroundColor: '#8BC34A'
                }
            ]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Analyse Achat vs Production par Type d\'Entreprise' } }
        });

        // Mettre à jour le pourcentage de production par rapport à l'achat
        const totalAchatsGlobal = versements.reduce((sum, v) => sum + v.caAchat, 0);
        const totalProductionGlobal = versements.reduce((sum, v) => sum + v.caProduction, 0);
        const percentage = totalAchatsGlobal > 0 ? ((totalProductionGlobal / totalAchatsGlobal) * 100).toFixed(2) : 0;
        document.getElementById('productionVsPurchasePercentage').textContent = `${percentage}%`;
    }

    function updateCompanyPerformanceChart() {
        const labels = Array.from(new Set(entreprises.map(e => e.typeEntreprise))).sort();
        const performanceData = labels.map(type =>
            versements.filter(v => v.typeEntreprise === type)
                      .reduce((sum, v) => (v.caVente - v.montantDepenses), 0) // Bénéfice simple
        );

        companyPerformanceChartInstance = createChart('companyPerformanceChart', 'bar', {
            labels: labels,
            datasets: [{
                label: 'Performance Nette (CA Vente - Dépenses)',
                data: performanceData,
                backgroundColor: performanceData.map(val => val >= 0 ? '#4CAF50' : '#F44336')
            }]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Performance Financière Globale par Entreprise' } }
        });
    }

    function updateMonthlyProfitChart() {
        const monthlyProfits = {}; // { 'YYYY-MM': { entrepriseType: profit } }
        versements.forEach(v => {
            const month = v.dateVersement.substring(0, 7);
            if (!monthlyProfits[month]) {
                monthlyProfits[month] = {};
            }
            if (!monthlyProfits[month][v.typeEntreprise]) {
                monthlyProfits[month][v.typeEntreprise] = 0;
            }
            monthlyProfits[month][v.typeEntreprise] += (v.caVente - v.montantDepenses);
        });

        const months = Object.keys(monthlyProfits).sort();
        const uniqueEntrepriseTypes = Array.from(new Set(entreprises.map(e => e.typeEntreprise))).sort();

        const datasets = uniqueEntrepriseTypes.map(type => ({
            label: type,
            data: months.map(month => monthlyProfits[month][type] || 0),
            fill: false,
            tension: 0.1,
            borderColor: getRandomColor() // Fonction utilitaire pour des couleurs aléatoires
        }));

        monthlyProfitChartInstance = createChart('monthlyProfitChart', 'line', {
            labels: months,
            datasets: datasets
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Bénéfices Mensuels par Entreprise' } }
        });
    }

    function updateProfitDistributionChart() {
        const profitBySource = {
            'Chiffre d\'Affaire Achat': versements.reduce((sum, v) => sum + v.caAchat, 0),
            'Chiffre d\'Affaire Production': versements.reduce((sum, v) => sum + v.caProduction, 0),
            'Montant Dépôt': versements.reduce((sum, v) => sum + v.montantDepot, 0),
            'Montant dans les PV': versements.reduce((sum, v) => sum + v.montantPointsVente, 0),
            'Chiffre d\'Affaire Vente': versements.reduce((sum, v) => sum + v.caVente, 0),
            'Montant Dépenses': versements.reduce((sum, v) => sum + v.montantDepenses, 0)
        };

        const labels = Object.keys(profitBySource);
        const data = Object.values(profitBySource);
        const backgroundColors = labels.map(() => getRandomColor()); // Couleurs aléatoires

        profitDistributionChartInstance = createChart('profitDistributionChart', 'doughnut', {
            labels: labels,
            datasets: [{
                label: 'Répartition des Flux Financiers',
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Répartition des Bénéfices et Flux Majeurs' } }
        });
    }

    // Génère une couleur aléatoire pour les graphiques
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // --- Bilan Mensuel ---
    document.getElementById('genererBilanBtn').addEventListener('click', () => {
        const month = document.getElementById('bilanMois').value;
        const year = document.getElementById('bilanAnnee').value;
        const typeEntreprise = document.getElementById('bilanTypeEntreprise').value;
        const bilanOutput = document.getElementById('bilanOutput');
        bilanOutput.innerHTML = ''; // Nettoie le contenu précédent

        let filteredVersements = versements.filter(v => {
            const vDate = new Date(v.dateVersement);
            const vMonth = vDate.getMonth() + 1; // getMonth() est 0-basé
            const vYear = vDate.getFullYear();
            return vMonth == month && vYear == year && (typeEntreprise === '' || v.typeEntreprise === typeEntreprise);
        });

        if (filteredVersements.length === 0) {
            bilanOutput.innerHTML = '<p>Aucune donnée de versement trouvée pour la période et/ou le type d\'entreprise sélectionnés.</p>';
            document.getElementById('printBilanBtn').style.display = 'none';
            return;
        }

        // Grouper par entreprise si 'Toutes les entreprises' est sélectionné
        const bilanParEntreprise = {};
        filteredVersements.forEach(v => {
            if (!bilanParEntreprise[v.typeEntreprise]) {
                bilanParEntreprise[v.typeEntreprise] = {
                    totalCA_Achat: 0,
                    totalCA_Production: 0,
                    totalMontantDepot: 0,
                    totalMontantPV: 0,
                    totalCA_Vente: 0,
                    totalDepenses: 0
                };
            }
            bilanParEntreprise[v.typeEntreprise].totalCA_Achat += v.caAchat;
            bilanParEntreprise[v.typeEntreprise].totalCA_Production += v.caProduction;
            bilanParEntreprise[v.typeEntreprise].totalMontantDepot += v.montantDepot;
            bilanParEntreprise[v.typeEntreprise].totalMontantPV += v.montantPointsVente;
            bilanParEntreprise[v.typeEntreprise].totalCA_Vente += v.caVente;
            bilanParEntreprise[v.typeEntreprise].totalDepenses += v.montantDepenses;
        });

        for (const type in bilanParEntreprise) {
            const data = bilanParEntreprise[type];
            const beneficeNet = data.totalCA_Vente - data.totalDepenses;
            const margeBrute = data.totalCA_Vente - data.totalCA_Achat;

            const bilanHtml = `
                <div class="bilan-entry card">
                    <h3>Bilan pour ${type} - ${new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                    <ul>
                        <li><strong>Total Achats:</strong> ${data.totalCA_Achat.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Production:</strong> ${data.totalCA_Production.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Dépôt:</strong> ${data.totalMontantDepot.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Montants en Points de Vente:</strong> ${data.totalMontantPV.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Ventes:</strong> ${data.totalCA_Vente.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Dépenses:</strong> ${data.totalDepenses.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Marge Brute:</strong> <span class="${margeBrute >= 0 ? 'profit-positive' : 'profit-negative'}">${margeBrute.toLocaleString('fr-FR')} XAF</span></li>
                        <li><strong>Bénéfice Net:</strong> <span class="${beneficeNet >= 0 ? 'profit-positive' : 'profit-negative'}">${beneficeNet.toLocaleString('fr-FR')} XAF</span></li>
                    </ul>
                </div>
            `;
            bilanOutput.insertAdjacentHTML('beforeend', bilanHtml);
        }
        document.getElementById('printBilanBtn').style.display = 'inline-block';
    });

    document.getElementById('printBilanBtn').addEventListener('click', () => {
        const contentToPrint = document.getElementById('bilanOutput').innerHTML;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = contentToPrint;
        window.print();
        document.body.innerHTML = originalBody;
        location.reload(); // Recharger pour restaurer l'interface complète
    });


    // --- Rapports ---
    document.getElementById('genererRapportBtn').addEventListener('click', () => {
        const rapportNumeroInput = document.getElementById('rapportNumero');
        const latestReportNum = localStorage.getItem('lastReportNumber') ? parseInt(localStorage.getItem('lastReportNumber')) : 0;
        const newReportNum = latestReportNum + 1;
        // Format R001, R002, etc.
        rapportNumeroInput.value = `R${String(newReportNum).padStart(3, '0')}`;
        localStorage.setItem('lastReportNumber', newReportNum);

        // Génération du contenu du rapport pour impression (simplifié ici)
        const reportContent = `
            <h1>Rapport Financier GaliBusiness</h1>
            <p>Numéro de Rapport: ${rapportNumeroInput.value}</p>
            <p>Date et Heure du Rapport: ${new Date().toLocaleString('fr-FR')}</p>
            <h2>Résumé des entreprises:</h2>
            ${document.querySelector('#table-formulaire-entreprise').outerHTML}
            <h2>Résumé des versements:</h2>
            ${document.querySelector('#table-versement-mensuel').outerHTML}
            `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Rapport Financier</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .profit-positive { color: green; font-weight: bold; }
            .profit-negative { color: red; font-weight: bold; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(reportContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    });


    // --- Conseils Personnalisés ---
    document.getElementById('genererConseilsBtn').addEventListener('click', () => {
        const conseilTypeEntreprise = document.getElementById('conseilTypeEntreprise').value;
        const conseilMois = document.getElementById('conseilMois').value;
        const conseilAnnee = document.getElementById('conseilAnnee').value;
        const conseilsOutput = document.getElementById('conseilsOutput');
        conseilsOutput.innerHTML = ''; // Nettoie le contenu précédent

        let relevantVersements = versements.filter(v => {
            const vDate = new Date(v.dateVersement);
            const vMonth = vDate.getMonth() + 1;
            const vYear = vDate.getFullYear();
            const matchesMonth = conseilMois === '' || vMonth == conseilMois;
            const matchesYear = vYear == conseilAnnee;
            const matchesType = conseilTypeEntreprise === '' || v.typeEntreprise === conseilTypeEntreprise;
            return matchesMonth && matchesYear && matchesType;
        });

        if (relevantVersements.length === 0) {
            conseilsOutput.innerHTML = '<p>Aucune donnée pertinente trouvée pour générer des conseils.</p>';
            document.getElementById('printConseilsBtn').style.display = 'none';
            return;
        }

        // Calculer les totaux pour les conseils
        const totalVentes = relevantVersements.reduce((sum, v) => sum + v.caVente, 0);
        const totalDepenses = relevantVersements.reduce((sum, v) => sum + v.montantDepenses, 0);
        const totalAchats = relevantVersements.reduce((sum, v) => sum + v.caAchat, 0);
        const totalProduction = relevantVersements.reduce((sum, v) => sum + v.caProduction, 0);
        const beneficeNet = totalVentes - totalDepenses;

        let conseilsHtml = `<h3>Conseils pour ${conseilTypeEntreprise || 'Toutes les entreprises'} - `;
        if (conseilMois !== '') {
            conseilsHtml += `${new Date(conseilAnnee, conseilMois - 1).toLocaleString('fr-FR', { month: 'long' })} `;
        }
        conseilsHtml += `${conseilAnnee}</h3><ul>`;

        if (beneficeNet < 0) {
            conseilsHtml += `<li>Votre entreprise est en déficit de ${beneficeNet.toLocaleString('fr-FR')} XAF. Analysez vos dépenses et vos prix de vente.</li>`;
        } else if (beneficeNet > 0) {
            conseilsHtml += `<li>Félicitations ! Votre bénéfice net est de ${beneficeNet.toLocaleString('fr-FR')} XAF. Envisagez de réinvestir une partie dans l'expansion ou la réduction des coûts.</li>`;
        } else {
            conseilsHtml += `<li>Votre bénéfice net est à zéro. Revoyez votre stratégie pour générer des profits.</li>`;
        }

        if (totalDepenses > totalVentes * 0.5) { // Exemple de seuil
            conseilsHtml += `<li>Vos dépenses (${totalDepenses.toLocaleString('fr-FR')} XAF) sont élevées par rapport à vos ventes. Identifiez les postes de dépenses à optimiser.</li>`;
        }

        if (totalProduction < totalAchats * 0.8) { // Exemple de seuil
            conseilsHtml += `<li>Votre production (${totalProduction.toLocaleString('fr-FR')} XAF) est faible comparée à vos achats (${totalAchats.toLocaleString('fr-FR')} XAF). Assurez-vous d'optimiser le cycle achat-production.</li>`;
        }

        conseilsHtml += `<li>N'oubliez pas de consulter régulièrement le "Bilan Mensuel" pour une analyse détaillée et le "Tableau de Bord Global" pour une vue d'ensemble.</li>`;
        conseilsHtml += `</ul>`;
        conseilsOutput.innerHTML = conseilsHtml;
        document.getElementById('printConseilsBtn').style.display = 'inline-block';
    });

    document.getElementById('printConseilsBtn').addEventListener('click', () => {
        const contentToPrint = document.getElementById('conseilsOutput').innerHTML;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = contentToPrint;
        window.print();
        document.body.innerHTML = originalBody;
        location.reload(); // Recharger pour restaurer l'interface complète
    });


    // --- Réinitialisation de l'Application ---
    
        

    // --- Événements de navigation de la barre latérale ---
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.target.dataset.section;
            showSection(sectionId);
        });
    });

    // --- Initialisation de l'application ---
    function initializeApp() {
        updateDateTime();
        setInterval(updateDateTime, 1000); // Met à jour l'heure chaque seconde

        loadData(); // Charge le nom du comptable et l'applique aux champs bloqués

        // Affiche les données existantes au démarrage
        displayEntreprises();
        displayVersements();

        // Afficher la section par défaut (tableau de bord)
        showSection('tableau-bord-dashboard');
    }

    initializeApp();
});