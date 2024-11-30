// Fonction pour récupérer les données des matchs via l'API
async function fetchMatchData() {
    try {
        const response = await fetch('http://localhost:3000/api/matches');
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const data = await response.json();
        console.log("Données récupérées :", data);  // Pour vérifier les données récupérées

        // Calculer les statistiques simples et générer les graphiques
        const supportCount = calculateSupportCount(data);
        updateSimpleStats(data, supportCount);
        generateCharts(data, supportCount); // Générer les graphiques après récupération des données
    } catch (error) {
        console.error("Erreur lors de la récupération des données via l'API :", error);
    }
}

// Fonction pour calculer les trois supports les plus joués
function calculateTop3Supports(matches) {
    const supportCount = {};

    // Compter le nombre de matchs joués pour chaque support
    matches.forEach(match => {
        match.match_data?.bot_lanes?.allied.forEach(player => {
            if (player.role === 'Support') {
                if (!supportCount[player.champion]) {
                    supportCount[player.champion] = 0;
                }
                supportCount[player.champion]++;
            }
        });
    });

    // Convertir l'objet en un tableau de paires [champion, count]
    const supportEntries = Object.entries(supportCount);

    // Trier les supports par nombre de matchs joués (ordre décroissant)
    supportEntries.sort((a, b) => b[1] - a[1]);

    // Retourner les trois premiers supports ou moins s'il y en a moins de trois
    return supportEntries.slice(0, 3);
}

// Fonction pour mettre à jour les statistiques sur la page
function updateSimpleStats(matches) {
    // Calculer le top 3 des supports les plus joués
    const top3Supports = calculateTop3Supports(matches);

    // Calculer l'ADC avec lequel il a le plus gagné
    const bestWinningADC = calculateBestWinningADC(matches);

    // Afficher les résultats dans le HTML
    const top3SupportsElement = document.getElementById("top3Supports");
    top3SupportsElement.innerHTML = top3Supports.map(([champion, count], index) =>
        `${index + 1}. ${champion} (${count} matchs)`
    ).join('<br>');

    document.getElementById("bestWinningADC").innerText = bestWinningADC;

    // Mettre à jour l'assistance moyenne pour le support le plus joué
    if (top3Supports.length > 0) {
        const averageAssistsMostPlayedSupport = calculateAverageAssistsMostPlayedSupport(matches, top3Supports[0][0]);
        document.getElementById("averageAssistsMostPlayedSupport").innerText = averageAssistsMostPlayedSupport;
    } else {
        document.getElementById("averageAssistsMostPlayedSupport").innerText = 'Non disponible';
    }
}

// Appeler les fonctions pour récupérer les données quand la page est chargée
document.addEventListener("DOMContentLoaded", fetchMatchData);


// Fonction pour compter les supports joués
function calculateSupportCount(matches) {
    let supportCount = {};
    matches.forEach(match => {
        match.match_data?.bot_lanes?.allied.forEach(player => {
            if (player.role === 'Support') {
                if (!supportCount[player.champion]) {
                    supportCount[player.champion] = 0;
                }
                supportCount[player.champion]++;
            }
        });
    });
    return supportCount;
}

function updateSimpleStats(matches) {
    let supportCount = {};

    matches.forEach(match => {
        // Compter les supports joués
        match.match_data?.bot_lanes?.allied.forEach(player => {
            if (player.role === 'Support') {
                if (!supportCount[player.champion]) {
                    supportCount[player.champion] = 0;
                }
                supportCount[player.champion]++;
            }
        });
    });

    // Trouver les trois supports les plus joués
    const topSupports = Object.entries(supportCount)
        .sort((a, b) => b[1] - a[1]) // Trier par nombre de matchs joués, du plus grand au plus petit
        .slice(0, 3); // Récupérer les trois premiers

    // Mettre à jour le HTML avec les nouvelles statistiques
    const topSupportsElement = document.getElementById("mostPlayedSupport");
    if (topSupportsElement) {
        topSupportsElement.innerHTML = topSupports
            .map(([champion], index) => `${index + 1}. ${champion}`)
            .join('<br>');
    }

    // Calculer l'ADC avec lequel il a le plus gagné
    const bestWinningADC = calculateBestWinningADC(matches);
    const bestWinningADCElement = document.getElementById("bestWinningADC");
    if (bestWinningADCElement) {
        bestWinningADCElement.innerText = bestWinningADC;
    }

    // Calculer l'assistance moyenne du support le plus joué
    if (topSupports.length > 0) {
        const averageAssistsMostPlayedSupport = calculateAverageAssistsMostPlayedSupport(matches, topSupports[0][0]);
        const averageAssistsElement = document.getElementById("averageAssistsMostPlayedSupport");
        if (averageAssistsElement) {
            averageAssistsElement.innerText = averageAssistsMostPlayedSupport;
        }
    }
}


// Fonction pour calculer l'ADC avec lequel il a remporté le plus de matchs
function calculateBestWinningADC(matches) {
    const adcWins = {};

    matches.forEach(match => {
        match.match_data?.bot_lanes?.allied.forEach(player => {
            if (player.role === 'ADC' && match.match_data?.win) {
                if (!adcWins[player.champion]) {
                    adcWins[player.champion] = 0;
                }
                adcWins[player.champion]++;
            }
        });
    });

    let bestWinningADC = 'Aucun';
    let maxWins = 0;
    for (const [champion, wins] of Object.entries(adcWins)) {
        if (wins > maxWins) {
            bestWinningADC = champion;
            maxWins = wins;
        }
    }

    return bestWinningADC;
}

// Fonction pour calculer le nombre moyen d'assistances du support le plus joué
function calculateAverageAssistsMostPlayedSupport(matches, mostPlayedSupport) {
    let totalAssists = 0;
    let matchCount = 0;

    matches.forEach(match => {
        match.match_data?.bot_lanes?.allied.forEach(player => {
            if (player.role === 'Support' && player.champion === mostPlayedSupport) {
                totalAssists += player.assists ?? 0;
                matchCount++;
            }
        });
    });

    if (matchCount === 0) {
        return 'Non disponible';
    }

    return (totalAssists / matchCount).toFixed(2);
}

// Fonction pour générer les graphiques avec Chart.js
function generateCharts(matches, supportCount) {
    // Ratio victoire/défaite
    const winCount = matches.filter(match => match.match_data?.win).length;
    const lossCount = matches.length - winCount;

    const winLossChartCtx = document.getElementById('winLossChart').getContext('2d');
    new Chart(winLossChartCtx, {
        type: 'pie',
        data: {
            labels: ['Victoires', 'Défaites'],
            datasets: [{
                data: [winCount, lossCount],
                backgroundColor: ['#28a745', '#dc3545'], // Vert pour les victoires, rouge pour les défaites
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Garder le ratio d'aspect pour éviter l'agrandissement vertical
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff' // Couleur du texte de la légende
                    }
                },
                title: {
                    display: true,
                    text: 'Ratio Victoire/Défaite',
                    color: '#ffffff'
                }
            }
        }
    });

    // Support le plus joué
    const supportNames = Object.keys(supportCount);
    const supportCounts = Object.values(supportCount);

    const supportChartCtx = document.getElementById('supportChart').getContext('2d');
    new Chart(supportChartCtx, {
        type: 'bar',
        data: {
            labels: supportNames,
            datasets: [{
                label: 'Support le plus joué',
                data: supportCounts,
                backgroundColor: '#007bff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Garder le ratio d'aspect pour éviter l'agrandissement vertical
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Support le plus joué',
                    color: '#ffffff'
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}


// Appeler les fonctions pour récupérer les données quand la page est chargée
document.addEventListener("DOMContentLoaded", fetchMatchData);
